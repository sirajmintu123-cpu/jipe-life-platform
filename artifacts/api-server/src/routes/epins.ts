import { Router } from "express";
import { db } from "@workspace/db";
import { epinsTable, usersTable, epinRequestsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { ListMyEpinsQueryParams, TransferEpinBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { PACKAGES } from "../lib/epin";

const router = Router();

router.get("/epins", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const params = ListMyEpinsQueryParams.safeParse(req.query);
  const status = params.success ? params.data.status : undefined;

  const conditions = [eq(epinsTable.assignedToId, user.id)];
  if (status) conditions.push(eq(epinsTable.status, status as any));

  const pins = await db.select().from(epinsTable).where(and(...conditions));

  const result = await Promise.all(pins.map(async (pin) => {
    let assignedToName: string | null = null;
    let transferredToName: string | null = null;
    if (pin.assignedToId) {
      const [u] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, pin.assignedToId));
      assignedToName = u?.name ?? null;
    }
    if (pin.transferredToId) {
      const [u] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, pin.transferredToId));
      transferredToName = u?.name ?? null;
    }
    return {
      id: pin.id,
      pin: pin.pin,
      package: pin.package,
      packagePrice: pin.packagePrice,
      bv: pin.bv,
      status: pin.status,
      assignedToId: pin.assignedToId,
      assignedToName,
      transferredToId: pin.transferredToId,
      createdAt: pin.createdAt.toISOString(),
      usedAt: pin.usedAt?.toISOString() ?? null,
    };
  }));

  res.json(result);
});

router.post("/epins/transfer", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const body = TransferEpinBody.safeParse(req.body);
  if (!body.success) return void res.status(400).json({ error: "Validation error" });

  const { pinId, recipientMemberId } = body.data;

  const [pin] = await db.select().from(epinsTable).where(and(eq(epinsTable.id, pinId), eq(epinsTable.assignedToId, user.id), eq(epinsTable.status, "unused")));
  if (!pin) return void res.status(400).json({ error: "Pin not found or not transferable" });

  const [recipient] = await db.select().from(usersTable).where(and(eq(usersTable.memberId, recipientMemberId), eq(usersTable.status, "active")));
  if (!recipient) return void res.status(400).json({ error: "Recipient not found" });

  // Simplified: skip OTP for now, transfer directly
  await db.update(epinsTable).set({
    assignedToId: recipient.id,
    transferredToId: recipient.id,
    status: "transferred",
  }).where(eq(epinsTable.id, pinId));

  res.json({ success: true, message: "E-Pin transferred successfully" });
});

router.get("/epins/history", requireAuth, async (req, res) => {
  const user = (req as any).user;

  const pins = await db.select().from(epinsTable)
    .where(eq(epinsTable.usedByUserId, user.id));

  const history = pins.map(pin => ({
    id: pin.id,
    pin: pin.pin,
    package: pin.package,
    action: pin.status === "used" ? "Used for Registration" : pin.status === "transferred" ? "Transferred" : "Received",
    fromName: null,
    toName: null,
    date: (pin.usedAt ?? pin.createdAt).toISOString(),
  }));

  res.json(history);
});

// ── USER E-PIN REQUESTS ──────────────────────────────────────────────────────

router.post("/epins/request", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { package: pkg, quantity, paymentReference } = req.body;

  if (!pkg || !["starter", "smart", "silver", "gold"].includes(pkg)) {
    return void res.status(400).json({ error: "Invalid package" });
  }
  if (!quantity || quantity < 1 || quantity > 100) {
    return void res.status(400).json({ error: "Quantity must be between 1 and 100" });
  }
  if (!paymentReference?.trim()) {
    return void res.status(400).json({ error: "Payment reference is required" });
  }

  const pkgInfo = PACKAGES[pkg as keyof typeof PACKAGES];
  const totalAmount = pkgInfo.price * quantity;

  const [created] = await db.insert(epinRequestsTable).values({
    userId: user.id,
    package: pkg,
    quantity,
    paymentReference: paymentReference.trim(),
    totalAmount,
    status: "pending",
  }).returning();

  res.status(201).json({
    id: created.id,
    package: created.package,
    quantity: created.quantity,
    paymentReference: created.paymentReference,
    totalAmount: created.totalAmount,
    status: created.status,
    createdAt: created.createdAt.toISOString(),
  });
});

router.get("/epins/my-requests", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const requests = await db.select().from(epinRequestsTable)
    .where(eq(epinRequestsTable.userId, user.id))
    .orderBy(desc(epinRequestsTable.createdAt));

  res.json(requests.map(r => ({
    id: r.id,
    package: r.package,
    quantity: r.quantity,
    paymentReference: r.paymentReference,
    totalAmount: r.totalAmount,
    status: r.status,
    rejectionReason: r.rejectionReason ?? null,
    createdAt: r.createdAt.toISOString(),
    processedAt: r.processedAt?.toISOString() ?? null,
  })));
});

export default router;
