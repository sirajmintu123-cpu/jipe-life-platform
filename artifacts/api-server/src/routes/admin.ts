import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, epinsTable, withdrawalRequestsTable, walletsTable, transactionsTable, epinRequestsTable ,rewardLedgerTable,ctoMonthlyPoolsTable,} from "@workspace/db";
import { eq, desc, ilike, sql, and, inArray } from "drizzle-orm";
import bcrypt from "bcryptjs";
import {
  AdminGenerateEpinsBody,
  AdminListEpinsQueryParams,
  AdminListUsersQueryParams,
  AdminGetUserParams,
  AdminUpdateUserStatusBody,
  AdminListWithdrawalsQueryParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/auth";
import { generateEpin, PACKAGES } from "../lib/epin";
import { runBinaryMatchingForUser } from "./binary";
import {
  getPendingRewards,
  getApprovedRewards,
  getDeliveredRewards,
   approveReward,
  deliverReward,
} from "../services/rewards/adminRewards";

const router = Router();

router.get("/admin/dashboard", requireAdmin, async (req, res) => {
  const [{ total }] = await db.select({ total: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.role, "member"));
  const [{ active }] = await db.select({ active: sql<number>`count(*)` }).from(usersTable).where(and(eq(usersTable.status, "active"), eq(usersTable.role, "member")));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [{ todayReg }] = await db.select({ todayReg: sql<number>`count(*)` }).from(usersTable).where(sql`created_at >= ${today.toISOString()} AND role = 'member'`);

  const [{ pending }] = await db.select({ pending: sql<number>`count(*)` }).from(withdrawalRequestsTable).where(eq(withdrawalRequestsTable.status, "pending"));
  const [{ totalWith }] = await db.select({ totalWith: sql<number>`coalesce(sum(gross_amount), 0)` }).from(withdrawalRequestsTable).where(eq(withdrawalRequestsTable.status, "approved"));
  const [{ adminFee }] = await db.select({ adminFee: sql<number>`coalesce(sum(deduction_amount), 0)` }).from(withdrawalRequestsTable).where(eq(withdrawalRequestsTable.status, "approved"));

  const [{ starterCount }] = await db.select({ starterCount: sql<number>`count(*)` }).from(usersTable).where(and(eq(usersTable.package, "starter"), eq(usersTable.role, "member")));
  const [{ smartCount }] = await db.select({ smartCount: sql<number>`count(*)` }).from(usersTable).where(and(eq(usersTable.package, "smart"), eq(usersTable.role, "member")));
  const [{ silverCount }] = await db.select({ silverCount: sql<number>`count(*)` }).from(usersTable).where(and(eq(usersTable.package, "silver"), eq(usersTable.role, "member")));
  const [{ goldCount }] = await db.select({ goldCount: sql<number>`count(*)` }).from(usersTable).where(and(eq(usersTable.package, "gold"), eq(usersTable.role, "member")));

  const recentRegistrations = await db.select().from(usersTable)
    .where(eq(usersTable.role, "member"))
    .orderBy(desc(usersTable.createdAt))
    .limit(5);

  // Turnover = sum of all active member package costs
  const [{ turnover }] = await db.select({ turnover: sql<number>`coalesce(sum(package_cost), 0)` }).from(usersTable).where(and(eq(usersTable.status, "active"), eq(usersTable.role, "member")));

const [{ pendingRewards }] = await db
  .select({
    pendingRewards: sql<number>`count(*)`
  })
  .from(rewardLedgerTable)
  .where(eq(rewardLedgerTable.status, "claimed"));

const [{ approvedRewards }] = await db
  .select({
    approvedRewards: sql<number>`count(*)`
  })
  .from(rewardLedgerTable)
  .where(eq(rewardLedgerTable.status, "approved"));

const [{ deliveredRewards }] = await db
  .select({
    deliveredRewards: sql<number>`count(*)`
  })
  .from(rewardLedgerTable)
  .where(eq(rewardLedgerTable.status, "delivered"));

const [{ rewardCashPaid }] = await db
  .select({
    rewardCashPaid:
      sql<number>`coalesce(sum(cash_value),0)`
  })
  .from(rewardLedgerTable)
  .where(eq(rewardLedgerTable.status, "delivered"));

  const [{ totalLifetimePairs }] = await db
  .select({
    totalLifetimePairs:
      sql<number>`coalesce(sum(lifetime_pairs),0)`
  })
  .from(usersTable);

const latestPool = await db.query.ctoMonthlyPoolsTable.findFirst({
  orderBy: (pool, { desc }) => [desc(pool.createdAt)],
});
  
  res.json({
    rewardSummary: {
  pending: Number(pendingRewards),
  approved: Number(approvedRewards),
  delivered: Number(deliveredRewards),
  cashPaid: Number(rewardCashPaid),
},

binarySummary: {
  lifetimePairs: Number(totalLifetimePairs),
},

ctoSummary: {
  starterPool: Number(latestPool?.starterPool ?? 0),
  smartPool: Number(latestPool?.smartPool ?? 0),
  silverPool: Number(latestPool?.silverPool ?? 0),
  goldPool: Number(latestPool?.goldPool ?? 0),
},
    totalMembers: Number(total),
    activeMembers: Number(active),
    todayRegistrations: Number(todayReg),
    totalTurnover: Number(turnover),
    pendingWithdrawals: Number(pending),
    totalWithdrawals: Number(totalWith),
    adminFeeCollected: Number(adminFee),
    packageBreakdown: {
      starter: Number(starterCount),
      smart: Number(smartCount),
      silver: Number(silverCount),
      gold: Number(goldCount),
    },
    recentRegistrations: recentRegistrations.map(u => {
      const { passwordHash: _, ...pub } = u;
      return pub;
    }),
  });
});

router.post("/admin/epins/generate", requireAdmin, async (req, res) => {
  const admin = (req as any).user;
  const body = AdminGenerateEpinsBody.safeParse(req.body);
  if (!body.success) return void res.status(400).json({ error: "Validation error" });

  const { package: pkg, quantity } = body.data;
  const pkgInfo = PACKAGES[pkg.toLowerCase() as unknown as keyof typeof PACKAGES];

  const pins = [];
  for (let i = 0; i < Math.min(quantity, 500); i++) {
    let pin: string;
    let unique = false;
    do {
      pin = generateEpin(12);
      const [existing] = await db.select({ id: epinsTable.id }).from(epinsTable).where(eq(epinsTable.pin, pin));
      unique = !existing;
    } while (!unique);

    const [created] = await db.insert(epinsTable).values({
      pin,
      package: pkg,
      packagePrice: pkgInfo.price,
      bv: pkgInfo.bv,
      status: "unused",
      generatedById: admin.id,
    }).returning();

    pins.push({
      id: created.id,
      pin: created.pin,
      package: created.package,
      packagePrice: created.packagePrice,
      bv: created.bv,
      status: created.status,
      assignedToId: null,
      assignedToName: null,
      transferredToId: null,
      createdAt: created.createdAt.toISOString(),
      usedAt: null,
    });
  }

  res.status(201).json(pins);
});

router.get("/admin/epins", requireAdmin, async (req, res) => {
  const params = AdminListEpinsQueryParams.safeParse(req.query);
  const page = params.success ? (params.data.page ?? 1) : 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions: any[] = [];
  if (params.success && params.data.status) conditions.push(eq(epinsTable.status, params.data.status as any));
  if (params.success && params.data.package) conditions.push(eq(epinsTable.package, params.data.package));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(epinsTable).where(whereClause);
  const pins = await db.select().from(epinsTable).where(whereClause).orderBy(desc(epinsTable.createdAt)).limit(limit).offset(offset);

  res.json({
    data: pins.map(p => ({
      id: p.id,
      pin: p.pin,
      package: p.package,
      packagePrice: p.packagePrice,
      bv: p.bv,
      status: p.status,
      assignedToId: p.assignedToId,
      assignedToName: null,
      transferredToId: p.transferredToId,
      createdAt: p.createdAt.toISOString(),
      usedAt: p.usedAt?.toISOString() ?? null,
    })),
    total: Number(count),
    page,
    limit,
  });
});

router.post("/admin/epins/assign", requireAdmin, async (req, res) => {
  const body = req.body;
  if (!body.pinIds || !body.memberId) return void res.status(400).json({ error: "pinIds and memberId required" });

  // Accept alphanumeric memberId (text), not numeric id
  const [user] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.memberId, String(body.memberId)));
  if (!user) return void res.status(404).json({ error: "User not found — check the Member ID" });

  await db.update(epinsTable).set({ assignedToId: user.id }).where(inArray(epinsTable.id, body.pinIds));
  res.json({ success: true });
});

router.get("/admin/users", requireAdmin, async (req, res) => {
  const params = AdminListUsersQueryParams.safeParse(req.query);
  const page = params.success ? (params.data.page ?? 1) : 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  const search = params.success ? params.data.search : undefined;
  const status = params.success ? params.data.status : undefined;

  const conditions: any[] = [eq(usersTable.role, "member")];
  if (status) conditions.push(eq(usersTable.status, status as any));

  const query = db.select().from(usersTable).where(and(...conditions));
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(usersTable).where(and(...conditions));
  const users = await query.orderBy(desc(usersTable.createdAt)).limit(limit).offset(offset);

  res.json({
    data: users.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.memberId.includes(search)).map(u => {
      const { passwordHash: _, ...pub } = u;
      return pub;
    }),
    total: Number(count),
    page,
    limit,
  });
});

router.get("/admin/users/:userId", requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(userId)) return void res.status(400).json({ error: "Invalid user ID" });

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) return void res.status(404).json({ error: "User not found" });

  const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, userId));
const ctoTotalReceived =
  parseFloat(user.ctoTotalReceived ?? "0");

let ctoCap = 0;

switch (user.package?.toLowerCase()) {
  case "starter":
    ctoCap = 1100;
    break;

  case "smart":
    ctoCap = 2100;
    break;

  case "silver":
    ctoCap = 5100;
    break;

  case "gold":
    ctoCap = 10100;
    break;

  default:
    ctoCap = 0;
}

const remainingCtoLimit =
  Math.max(0, ctoCap - ctoTotalReceived);

const ctoActive =
  remainingCtoLimit > 0;

  const { passwordHash: _, ...userPublic } = user;
  res.json({
    user: userPublic,
    wallet: {
      balance: parseFloat(wallet?.balance ?? "0"),
      totalEarned: parseFloat(wallet?.totalEarned ?? "0"),
      totalWithdrawn: parseFloat(wallet?.totalWithdrawn ?? "0"),
      pendingWithdrawal: parseFloat(wallet?.pendingWithdrawal ?? "0"),
      bankAccount: user.bankAccount ?? null,
      upiId: user.upiId ?? null,
    },
    binaryStats: {
      leftBv: user.leftBv,
      rightBv: user.rightBv,
      todayPairs: 0,
      todayEarning: 0,
      isCapped: false,
      isJackpot: false,
      carryForwardBv: user.carryForwardBv,
      lifetimePairs: user.lifetimePairs,
    },
    ctoStatus: {
  ctoActive,
  ctoTotalReceived,
  ctoCap,
  remainingCtoLimit,
},
  });
});

router.patch("/admin/users/:userId/status", requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const body = AdminUpdateUserStatusBody.safeParse(req.body);
  if (!body.success) return void res.status(400).json({ error: "Validation error" });

  await db.update(usersTable).set({ status: body.data.status, updatedAt: new Date() }).where(eq(usersTable.id, userId));
  res.json({ success: true });
});

// Edit user details (name, email, phone, password, bank details)
router.patch("/admin/users/:userId", requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) return void res.status(404).json({ error: "User not found" });

  const allowed: Record<string, any> = {};
  const { name, email, phone, password, bankName, bankAccount, ifscCode, upiId } = req.body;
  if (name) allowed.name = name;
  if (email) allowed.email = email;
  if (phone) allowed.phone = phone;
  if (bankName !== undefined) allowed.bankName = bankName;
  if (bankAccount !== undefined) allowed.bankAccount = bankAccount;
  if (ifscCode !== undefined) allowed.ifscCode = ifscCode;
  if (upiId !== undefined) allowed.upiId = upiId;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    allowed.passwordHash = await bcrypt.hash(password, salt);
  }
  allowed.updatedAt = new Date();

  const [updated] = await db.update(usersTable).set(allowed).where(eq(usersTable.id, userId)).returning();
  const { passwordHash: _, ...pub } = updated;
  res.json(pub);
});

// Add/Deduct wallet balance (admin override)
router.post("/admin/users/:userId/adjust-balance", requireAdmin, async (req, res) => {
  const admin = (req as any).user;
  const userId = parseInt(req.params.userId, 10);
  const { amount, note } = req.body;
  if (typeof amount !== "number" || amount === 0) return void res.status(400).json({ error: "Non-zero amount required" });

  const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, userId));
  if (!wallet) return void res.status(404).json({ error: "Wallet not found" });

  const newBalance = Math.max(0, parseFloat(wallet.balance) + amount);
  const newTotalEarned = amount > 0 ? parseFloat(wallet.totalEarned) + amount : parseFloat(wallet.totalEarned);

  await db.update(walletsTable).set({
    balance: newBalance.toFixed(2),
    totalEarned: newTotalEarned.toFixed(2),
    updatedAt: new Date(),
  }).where(eq(walletsTable.userId, userId));

  await db.insert(transactionsTable).values({
    userId,
    type: amount > 0 ? "admin_credit" : "admin_debit",
    amount: Math.abs(amount).toFixed(2),
    description: note ?? (amount > 0 ? `Admin credit: ₹${amount}` : `Admin debit: ₹${Math.abs(amount)}`),
    status: "completed",
  });

  res.json({ success: true, newBalance });
});

router.get("/admin/withdrawals", requireAdmin, async (req, res) => {
  const params = AdminListWithdrawalsQueryParams.safeParse(req.query);
  const page = params.success ? (params.data.page ?? 1) : 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  const status = params.success ? params.data.status : undefined;

  const conditions = status ? [eq(withdrawalRequestsTable.status, status as any)] : [];
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(withdrawalRequestsTable).where(whereClause);

  const items = await db
    .select({
      w: withdrawalRequestsTable,
      userName: usersTable.name,
      userMemberId: usersTable.memberId,
      bankName: usersTable.bankName,
      bankAccount: usersTable.bankAccount,
      ifscCode: usersTable.ifscCode,
      upiId: usersTable.upiId,
    })
    .from(withdrawalRequestsTable)
    .leftJoin(usersTable, eq(withdrawalRequestsTable.userId, usersTable.id))
    .where(whereClause)
    .orderBy(desc(withdrawalRequestsTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json({
    data: items.map(({ w, userName, userMemberId, bankName, bankAccount, ifscCode, upiId }) => ({
      id: w.id,
      userId: w.userId,
      userName: userName ?? null,
      userMemberId: userMemberId ?? null,
      amount: parseFloat(w.grossAmount),
      grossAmount: parseFloat(w.grossAmount),
      deductionAmount: parseFloat(w.deductionAmount),
      netAmount: parseFloat(w.netAmount),
      status: w.status,
      method: w.method,
      rejectionReason: w.rejectionReason ?? null,
      bankName: bankName ?? null,
      bankAccount: bankAccount ?? null,
      ifscCode: ifscCode ?? null,
      upiId: upiId ?? null,
      createdAt: w.createdAt.toISOString(),
      processedAt: w.processedAt?.toISOString() ?? null,
    })),
    total: Number(count),
    page,
    limit,
  });
});

router.post("/admin/withdrawals/:withdrawalId/approve", requireAdmin, async (req, res) => {
  const admin = (req as any).user;
  const withdrawalId = parseInt(req.params.withdrawalId, 10);

  const [w] = await db.select().from(withdrawalRequestsTable).where(eq(withdrawalRequestsTable.id, withdrawalId));
  if (!w || w.status !== "pending") return void res.status(400).json({ error: "Not found or not pending" });

  await db.update(withdrawalRequestsTable).set({
    status: "approved",
    processedById: admin.id,
    processedAt: new Date(),
  }).where(eq(withdrawalRequestsTable.id, withdrawalId));

  const gross = parseFloat(w.grossAmount);
  const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, w.userId));
  if (wallet) {
    const newPending = Math.max(0, parseFloat(wallet.pendingWithdrawal) - gross);
    const newTotalWithdrawn = parseFloat(wallet.totalWithdrawn) + parseFloat(w.netAmount);
    await db.update(walletsTable).set({
      pendingWithdrawal: newPending.toFixed(2),
      totalWithdrawn: newTotalWithdrawn.toFixed(2),
      updatedAt: new Date(),
    }).where(eq(walletsTable.userId, w.userId));

    await db.insert(transactionsTable).values({
      userId: w.userId,
      type: "withdrawal",
      amount: parseFloat(w.netAmount).toFixed(2),
      description: `Withdrawal approved — net ₹${w.netAmount} (after 15% deduction)`,
      status: "completed",
    });
  }

  res.json({ success: true });
});

router.post("/admin/withdrawals/:withdrawalId/reject", requireAdmin, async (req, res) => {
  const admin = (req as any).user;
  const withdrawalId = parseInt(req.params.withdrawalId, 10);
  const reason = req.body?.reason;
  if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
    return void res.status(400).json({ error: "Reason required" });
  }
  const body = { success: true, data: { reason } };

  const [w] = await db.select().from(withdrawalRequestsTable).where(eq(withdrawalRequestsTable.id, withdrawalId));
  if (!w || w.status !== "pending") return void res.status(400).json({ error: "Not found or not pending" });

  await db.update(withdrawalRequestsTable).set({
    status: "rejected",
    rejectionReason: body.data.reason,
    processedById: admin.id,
    processedAt: new Date(),
  }).where(eq(withdrawalRequestsTable.id, withdrawalId));

  // Refund balance
  const gross = parseFloat(w.grossAmount);
  const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, w.userId));
  if (wallet) {
    const newBalance = parseFloat(wallet.balance) + gross;
    const newPending = Math.max(0, parseFloat(wallet.pendingWithdrawal) - gross);
    await db.update(walletsTable).set({
      balance: newBalance.toFixed(2),
      pendingWithdrawal: newPending.toFixed(2),
      updatedAt: new Date(),
    }).where(eq(walletsTable.userId, w.userId));
  }

  res.json({ success: true });
});

// ── E-PIN REQUESTS ────────────────────────────────────────────────────────────

router.get("/admin/epin-requests", requireAdmin, async (req, res) => {
  const page = parseInt(req.query.page as string ?? "1", 10);
  const status = req.query.status as string | undefined;
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions = status ? [eq(epinRequestsTable.status, status as any)] : [];
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(epinRequestsTable).where(whereClause);

  const rows = await db
    .select({
      req: epinRequestsTable,
      userName: usersTable.name,
      memberId: usersTable.memberId,
    })
    .from(epinRequestsTable)
    .leftJoin(usersTable, eq(epinRequestsTable.userId, usersTable.id))
    .where(whereClause)
    .orderBy(desc(epinRequestsTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json({
    data: rows.map(({ req: r, userName, memberId }) => ({
      id: r.id,
      userId: r.userId,
      userName: userName ?? null,
      memberId: memberId ?? null,
      package: r.package,
      quantity: r.quantity,
      paymentReference: r.paymentReference,
      totalAmount: r.totalAmount,
      status: r.status,
      rejectionReason: r.rejectionReason ?? null,
      createdAt: r.createdAt.toISOString(),
      processedAt: r.processedAt?.toISOString() ?? null,
    })),
    total: Number(count),
    page,
    limit,
  });
});

router.post("/admin/epin-requests/:requestId/approve", requireAdmin, async (req, res) => {
  const admin = (req as any).user;
  const requestId = parseInt(req.params.requestId, 10);

  const [pinReq] = await db.select().from(epinRequestsTable).where(eq(epinRequestsTable.id, requestId));
  if (!pinReq || pinReq.status !== "pending") return void res.status(400).json({ error: "Request not found or not pending" });

  const { generateEpin, PACKAGES } = await import("../lib/epin");
  const pkgInfo = PACKAGES[pinReq.package.toLowerCase() as keyof typeof PACKAGES];
  const pins = [];

  for (let i = 0; i < pinReq.quantity; i++) {
    let pin: string;
    let unique = false;
    do {
      pin = generateEpin(12);
      const [existing] = await db.select({ id: epinsTable.id }).from(epinsTable).where(eq(epinsTable.pin, pin));
      unique = !existing;
    } while (!unique);

    const [created] = await db.insert(epinsTable).values({
      pin,
      package: pinReq.package,
      packagePrice: pkgInfo.price,
      bv: pkgInfo.bv,
      status: "unused",
      generatedById: admin.id,
      assignedToId: pinReq.userId,
    }).returning();
    pins.push(created);
  }

  await db.update(epinRequestsTable).set({
    status: "approved",
    processedById: admin.id,
    processedAt: new Date(),
  }).where(eq(epinRequestsTable.id, requestId));

  res.json({ success: true, pinsGenerated: pins.length });
});

router.post("/admin/epin-requests/:requestId/reject", requireAdmin, async (req, res) => {
  const admin = (req as any).user;
  const requestId = parseInt(req.params.requestId, 10);
  const { reason } = req.body;
  if (!reason?.trim()) return void res.status(400).json({ error: "Rejection reason required" });

  const [pinReq] = await db.select().from(epinRequestsTable).where(eq(epinRequestsTable.id, requestId));
  if (!pinReq || pinReq.status !== "pending") return void res.status(400).json({ error: "Request not found or not pending" });

  await db.update(epinRequestsTable).set({
    status: "rejected",
    rejectionReason: reason,
    processedById: admin.id,
    processedAt: new Date(),
  }).where(eq(epinRequestsTable.id, requestId));

  res.json({ success: true });
});

// ── CRON ─────────────────────────────────────────────────────────────────────
router.get(
  "/admin/binary/dashboard",
  requireAdmin,
  async (_req, res) => {

    const [{ activeMembers }] =
      await db.select({
        activeMembers: sql<number>`count(*)`
      })
      .from(usersTable)
      .where(eq(usersTable.status, "active"));

    const latestRun = await db.query.binaryRunHistoryTable.findFirst({
      orderBy: (t, { desc }) => [desc(t.createdAt)]
    });

    const latestPool =
      await db.query.ctoMonthlyPoolsTable.findFirst({
        orderBy: (t, { desc }) => [desc(t.createdAt)]
      });

    res.json({
      activeMembers,

      todayPairs:
        Number(latestRun?.pairsGenerated ?? 0),

      matchingIncome:
        Number(latestRun?.matchingIncome ?? 0),

      jackpotBonus:
        Number(latestRun?.jackpotBonus ?? 0),

      netPayout:
        Number(latestRun?.walletCredit ?? 0),

      membersWithPairs:
        Number(latestRun?.membersProcessed ?? 0),

      membersWithoutPairs:
        Math.max(
          0,
          Number(activeMembers) -
          Number(latestRun?.membersProcessed ?? 0)
        ),

      rewardAchievements: 0,

      ctoStarter:
        Number(latestPool?.starterPool ?? 0),

      ctoSmart:
        Number(latestPool?.smartPool ?? 0),

      ctoSilver:
        Number(latestPool?.silverPool ?? 0),

      ctoGold:
        Number(latestPool?.goldPool ?? 0),
    });
  }
);

router.get(
  "/admin/binary/history",
  requireAdmin,
  async (req, res) => {

    const limit =
      Number(req.query.limit ?? 10);

    const rows =
      await db.query.binaryRunHistoryTable.findMany({
        orderBy: (t, { desc }) => [desc(t.createdAt)],
        limit,
      });

    res.json({
      data: rows.map(r => ({
        id: r.id,
        date: r.runDate,
        members: r.membersProcessed,
        pairs: r.pairsGenerated,
        matchingIncome: Number(r.matchingIncome),
        jackpotMembers: r.jackpotMembers,
        status: r.status,
      }))
    });
  }
);

router.get(
  "/admin/binary/engine-status",
  requireAdmin,
  async (_req, res) => {

    const latest =
      await db.query.binaryRunHistoryTable.findFirst({
        orderBy: (t, { desc }) => [desc(t.createdAt)]
      });

    res.json({
      status:
        latest?.status ?? "pending",

      lastRunDate:
        latest?.runDate ?? null,

      nextScheduledRun:
        "Daily 11:59 PM"
    });
  }
);

router.post(
  "/admin/cron/run-binary",
  requireAdmin,
  async (req, res) => {

    const startTime = Date.now();

    const allActiveUsers = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.status, "active"));

    let processedCount = 0;
    let pairsGenerated = 0;
    let matchingIncome = 0;
    let jackpotMembers = 0;
    let jackpotBonus = 0;
    let totalWalletCredit = 0;
    let flushCount = 0;

    for (const u of allActiveUsers) {

      const result =
        await runBinaryMatchingForUser(u.id);

      if (result.pairsMatched > 0) {
        processedCount++;
      }

      pairsGenerated +=
        Number(result.pairsMatched ?? 0);

      matchingIncome +=
        Number(result.grossAmount ?? 0);

      totalWalletCredit +=
        Number(result.netAmount ?? 0);

      flushCount +=
        Number(result.flushedPairs ?? 0);

      if (result.isJackpot) {
        jackpotMembers++;
        jackpotBonus += 1800;
      }
    }

    const timeTaken =
      `${((Date.now() - startTime) / 1000).toFixed(2)} sec`;

    res.json({
      success: true,

      message:
        `Daily binary matching completed for ${allActiveUsers.length} users`,

      processedCount,
      pairsGenerated,
      matchingIncome,
      jackpotMembers,
      jackpotBonus,
      totalWalletCredit,
      totalDeduction: 0,
      flushCount,
      timeTaken,
    });
  }
);
// ─────────────────────────────────────────────────────────────
// CTO MODULE (NEW VERSION - UNDER DEVELOPMENT)
// ─────────────────────────────────────────────────────────────

router.post("/admin/cron/run-cto", requireAdmin, async (req, res) => {
  return res.json({
    success: true,
    message: "New CTO module is under development.",
  });
});

router.get("/admin/rewards/pending", requireAdmin, async (_req, res) => {
  try {
    const rewards = await getPendingRewards();

    res.json({
      success: true,
      count: rewards.length,
      data: rewards,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/admin/rewards/approved", requireAdmin, async (_req, res) => {
  try {
    const rewards = await getApprovedRewards();

    res.json({
      success: true,
      count: rewards.length,
      data: rewards,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/admin/rewards/delivered", requireAdmin, async (_req, res) => {
  try {
    const rewards = await getDeliveredRewards();

    res.json({
      success: true,
      count: rewards.length,
      data: rewards,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post(
  "/admin/rewards/:rewardId/approve",
  requireAdmin,
  async (req, res) => {
    try {
      const result = await approveReward(
        Number(req.params.rewardId)
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

router.post(
  "/admin/rewards/:rewardId/deliver",
  requireAdmin,
  async (req, res) => {
    try {
      const rewardId = Number(req.params.rewardId);
      const { remarks } = req.body;

      const result = await deliverReward(
        rewardId,
        remarks
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

export default router;
