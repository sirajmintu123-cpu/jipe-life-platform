import { Router } from "express";
import { db } from "@workspace/db";
import { walletsTable, transactionsTable, withdrawalRequestsTable, usersTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { GetTransactionsQueryParams, RequestWithdrawalBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { calculateWithdrawal } from "../lib/epin";

const router = Router();

router.get("/wallet", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, user.id));

  res.json({
    balance: parseFloat(wallet?.balance ?? "0"),
    totalEarned: parseFloat(wallet?.totalEarned ?? "0"),
    totalWithdrawn: parseFloat(wallet?.totalWithdrawn ?? "0"),
    pendingWithdrawal: parseFloat(wallet?.pendingWithdrawal ?? "0"),
    bankAccount: user.bankAccount ?? null,
    upiId: user.upiId ?? null,
  });
});

router.get("/wallet/transactions", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const params = GetTransactionsQueryParams.safeParse(req.query);
  const page = params.success ? (params.data.page ?? 1) : 1;
  const limit = params.success ? (params.data.limit ?? 20) : 20;
  const offset = (page - 1) * limit;

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(transactionsTable).where(eq(transactionsTable.userId, user.id));
  const txns = await db.select().from(transactionsTable)
    .where(eq(transactionsTable.userId, user.id))
    .orderBy(desc(transactionsTable.createdAt))
    .limit(limit).offset(offset);

  res.json({
    data: txns.map(t => ({
      id: t.id,
      type: t.type,
      amount: parseFloat(t.amount),
      description: t.description,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
    })),
    total: Number(count),
    page,
    limit,
  });
});

router.post("/wallet/withdraw", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const body = RequestWithdrawalBody.safeParse(req.body);
  if (!body.success) return void res.status(400).json({ error: "Validation error" });

  const { amount, method } = body.data;
  const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, user.id));
  if (!wallet) return void res.status(400).json({ error: "Wallet not found" });

  const balance = parseFloat(wallet.balance);
  if (amount > balance) return void res.status(400).json({ error: "Insufficient balance" });
  if (amount < 500) return void res.status(400).json({ error: "Minimum withdrawal is ₹500" });

  const { gross, deduction, net } = calculateWithdrawal(amount);

  const [withdrawal] = await db.insert(withdrawalRequestsTable).values({
    userId: user.id,
    grossAmount: gross.toFixed(2),
    deductionAmount: deduction.toFixed(2),
    netAmount: net.toFixed(2),
    method,
    status: "pending",
  }).returning();

  // Hold amount from balance
  const newBalance = balance - amount;
  const newPending = parseFloat(wallet.pendingWithdrawal) + amount;
  await db.update(walletsTable).set({
    balance: newBalance.toFixed(2),
    pendingWithdrawal: newPending.toFixed(2),
    updatedAt: new Date(),
  }).where(eq(walletsTable.userId, user.id));

  res.status(201).json({
    id: withdrawal.id,
    amount,
    grossAmount: gross,
    deductionAmount: deduction,
    netAmount: net,
    status: "pending",
    method,
    rejectionReason: null,
    createdAt: withdrawal.createdAt.toISOString(),
    processedAt: null,
  });
});

router.get("/wallet/withdrawals", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const withdrawals = await db.select().from(withdrawalRequestsTable)
    .where(eq(withdrawalRequestsTable.userId, user.id))
    .orderBy(desc(withdrawalRequestsTable.createdAt));

  res.json(withdrawals.map(w => ({
    id: w.id,
    amount: parseFloat(w.grossAmount),
    grossAmount: parseFloat(w.grossAmount),
    deductionAmount: parseFloat(w.deductionAmount),
    netAmount: parseFloat(w.netAmount),
    status: w.status,
    method: w.method,
    rejectionReason: w.rejectionReason ?? null,
    createdAt: w.createdAt.toISOString(),
    processedAt: w.processedAt?.toISOString() ?? null,
  })));
});

export default router;
