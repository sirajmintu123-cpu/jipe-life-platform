import { Router } from "express";
import { db } from "@workspace/db";
import { kycTable, usersTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth";

const router = Router();

function formatKyc(k: any) {
  return {
    id: k.id,
    userId: k.userId,
    aadhaarNumber: k.aadhaarNumber ?? null,
    aadhaarFrontUrl: k.aadhaarFrontUrl ?? null,
    aadhaarBackUrl: k.aadhaarBackUrl ?? null,
    panNumber: k.panNumber ?? null,
    panPhotoUrl: k.panPhotoUrl ?? null,
    bankName: k.bankName ?? null,
    holderName: k.holderName ?? null,
    accountNumber: k.accountNumber ?? null,
    ifscCode: k.ifscCode ?? null,
    upiId: k.upiId ?? null,
    status: k.status,
    rejectionReason: k.rejectionReason ?? null,
    submittedAt: k.submittedAt?.toISOString() ?? null,
    reviewedAt: k.reviewedAt?.toISOString() ?? null,
    createdAt: k.createdAt.toISOString(),
  };
}

router.get("/kyc", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const [kyc] = await db.select().from(kycTable).where(eq(kycTable.userId, user.id));
  if (!kyc) {
    return void res.json({ status: "not_submitted", id: null });
  }
  res.json(formatKyc(kyc));
});

router.put("/kyc", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const body = req.body;

  const [existing] = await db.select().from(kycTable).where(eq(kycTable.userId, user.id));

  if (existing && (existing.status === "approved" || existing.status === "pending")) {
    return void res.status(400).json({ error: "KYC is already submitted and cannot be changed" });
  }

  const kycData = {
    aadhaarNumber: body.aadhaarNumber ?? null,
    aadhaarFrontUrl: body.aadhaarFrontUrl ?? null,
    aadhaarBackUrl: body.aadhaarBackUrl ?? null,
    panNumber: body.panNumber ?? null,
    panPhotoUrl: body.panPhotoUrl ?? null,
    bankName: body.bankName ?? null,
    holderName: body.holderName ?? null,
    accountNumber: body.accountNumber ?? null,
    ifscCode: body.ifscCode ?? null,
    upiId: body.upiId ?? null,
    status: "pending" as const,
    submittedAt: new Date(),
    updatedAt: new Date(),
  };

  let result;
  if (existing) {
    [result] = await db.update(kycTable).set(kycData).where(eq(kycTable.id, existing.id)).returning();
  } else {
    [result] = await db.insert(kycTable).values({ userId: user.id, ...kycData }).returning();
  }

  res.json(formatKyc(result));
});

// Admin: list all KYC submissions
router.get("/admin/kyc", requireAdmin, async (req, res) => {
  const page = parseInt(req.query.page as string ?? "1", 10);
  const status = req.query.status as string | undefined;
  const limit = 20;
  const offset = (page - 1) * limit;

  const rows = await db
    .select({
      kyc: kycTable,
      memberName: usersTable.name,
      memberId: usersTable.memberId,
    })
    .from(kycTable)
    .leftJoin(usersTable, eq(kycTable.userId, usersTable.id))
    .orderBy(desc(kycTable.createdAt))
    .limit(limit)
    .offset(offset);

  const filtered = status ? rows.filter(r => r.kyc.status === status) : rows;

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(kycTable);

  res.json({
    data: filtered.map(r => ({
      ...formatKyc(r.kyc),
      memberName: r.memberName,
      memberId: r.memberId,
    })),
    total: Number(count),
    page,
    limit,
  });
});

// Admin: update KYC status
router.patch("/admin/kyc/:kycId/status", requireAdmin, async (req, res) => {
  const admin = (req as any).user;
  const kycId = parseInt(req.params.kycId, 10);
  const { status, rejectionReason } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return void res.status(400).json({ error: "Status must be approved or rejected" });
  }
  if (status === "rejected" && !rejectionReason?.trim()) {
    return void res.status(400).json({ error: "Rejection reason required" });
  }

  const [kyc] = await db.select().from(kycTable).where(eq(kycTable.id, kycId));
  if (!kyc) return void res.status(404).json({ error: "KYC record not found" });

  const [updated] = await db.update(kycTable).set({
    status,
    rejectionReason: status === "rejected" ? rejectionReason : null,
    reviewedById: admin.id,
    reviewedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(kycTable.id, kycId)).returning();

  res.json(formatKyc(updated));
});

export default router;
