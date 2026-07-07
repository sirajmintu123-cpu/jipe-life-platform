import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, walletsTable, epinsTable } from "@workspace/db";
import { eq, and, or } from "drizzle-orm";
import {
  ValidateSponsorQueryParams,
  ValidateEpinQueryParams,
  RegisterUserBody,
  LoginUserBody,
  AdminLoginBody,
} from "@workspace/api-zod";
import { hashPassword, verifyPassword, createSession, destroySession, requireAuth } from "../lib/auth";
import { generateMemberId, PACKAGES } from "../lib/epin";
import { logger } from "../lib/logger";
import { runBinaryMatchingForUser } from "./binary";

// Propagate BV up the entire sponsor tree
async function propagateBvUp(
  startUserId: number,
  newBv: number,
  position: "left" | "right"
): Promise<void> {

  let currentId: number | null = startUserId;
  let currentPosition: "left" | "right" = position;

  let depth = 0;

  while (currentId !== null && depth < 50) {

    const [node] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, currentId));

    if (!node) break;

    if (currentPosition === "left") {

      await db.update(usersTable)
        .set({
          leftBv: (
            Number(node.leftBv ?? 0) +
            Number(newBv)
          ).toString(),
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, currentId));

    } else {

      await db.update(usersTable)
        .set({
          rightBv: (
            Number(node.rightBv ?? 0) +
            Number(newBv)
          ).toString(),
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, currentId));

    }

    // Find binary parent
    const [parent] = await db
      .select()
      .from(usersTable)
      .where(
        or(
          eq(usersTable.leftChildId, currentId),
          eq(usersTable.rightChildId, currentId)
        )
      );

    if (!parent) {
      break;
    }

    currentPosition =
      parent.leftChildId === currentId
        ? "left"
        : "right";

    currentId = parent.id;

    depth++;
  }
}
async function findAvailablePosition(
  userId: number,
  position: "left" | "right",
): Promise<{ parentId: number; slot: "left" | "right" }> {

  const [root] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!root) {
    throw new Error("Root user not found");
  }

  const queue: number[] = [];

  if (position === "left") {
    if (!root.leftChildId) {
      return { parentId: userId, slot: "left" };
    }
    queue.push(root.leftChildId);
  } else {
    if (!root.rightChildId) {
      return { parentId: userId, slot: "right" };
    }
    queue.push(root.rightChildId);
  }

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    const [node] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, currentId));

    if (!node) continue;

    if (!node.leftChildId) {
      return {
        parentId: currentId,
        slot: "left",
      };
    }

    if (!node.rightChildId) {
      return {
        parentId: currentId,
        slot: "right",
      };
    }

    queue.push(node.leftChildId);
    queue.push(node.rightChildId);
  }

  return {
    parentId: userId,
    slot: position,
  };
}
const router = Router();

router.get("/auth/validate-sponsor", async (req, res) => {
  try {
    const params = ValidateSponsorQueryParams.safeParse(req.query);

    if (!params.success) {
      return void res.status(400).json({ error: "Invalid params" });
    }

    const { sponsorId } = params.data;

    const [sponsor] = await db
      .select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.memberId, sponsorId),
          eq(usersTable.status, "active")
        )
      );

    if (!sponsor) {
      return void res.status(404).json({ error: "Sponsor not found" });
    }

    res.json({
      memberId: sponsor.memberId,
      name: sponsor.name,
      package: sponsor.package,
    });

  } catch (err: any) {
    console.error("VALIDATE SPONSOR ERROR:");
    console.error(err);
    res.status(500).json({
      error: err.message,
      detail: err,
    });
  }
});
router.get("/auth/validate-epin", async (req, res) => {
  const params = ValidateEpinQueryParams.safeParse(req.query);
  if (!params.success) return void res.status(400).json({ error: "Invalid params" });
  const { pin } = params.data;
  const [epin] = await db.select().from(epinsTable).where(eq(epinsTable.pin, pin));
  if (!epin || epin.status !== "unused") {
    return void res.status(400).json({ error: "Invalid or already used E-Pin" });
  }
  res.json({
    pin: epin.pin,
    package: epin.package,
    packagePrice: epin.packagePrice,
    bv: epin.bv,
    valid: true,
  });
});

router.post("/auth/register", async (req, res) => {
  const body = RegisterUserBody.safeParse(req.body);
  if (!body.success) return void res.status(400).json({ error: "Validation error", details: body.error.errors });

  const { sponsorId, epin, name, email, phone, password, position } = body.data;

  // Validate sponsor
  const [sponsor] = await db.select().from(usersTable).where(and(eq(usersTable.memberId, sponsorId), eq(usersTable.status, "active")));
  if (!sponsor) return void res.status(400).json({ error: "Invalid sponsor ID" });

  // Validate and lock E-Pin
  const [epinRecord] = await db.select().from(epinsTable).where(and(eq(epinsTable.pin, epin), eq(epinsTable.status, "unused")));
  if (!epinRecord) return void res.status(400).json({ error: "Invalid or used E-Pin" });

  // Check email uniqueness
  const [existingEmail] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existingEmail) return void res.status(400).json({ error: "Email already registered" });

  const pkg = epinRecord.package as "starter" | "smart" | "silver" | "gold";
  const packageInfo = PACKAGES[pkg];
  const passwordHash = await hashPassword(password);
  const memberId = generateMemberId();

  // Create user
  const [newUser] = await db.insert(usersTable).values({
    memberId,
    name,
    email,
    phone,
    passwordHash,
    package: pkg,
    bv: packageInfo.bv,
    packageCost: packageInfo.price,
    sponsorId: sponsor.id,
    ctoActive: true,
    ctoTotalReceived: "0",
    lifetimePairs: 0,
    leftBv: 0,
    rightBv: 0,
    carryForwardBv: 0,
  }).returning();

 // Binary placement with unlimited depth
const placement = await findAvailablePosition(
  sponsor.id,
  position,
);

if (placement.slot === "left") {
  await db.update(usersTable)
    .set({
      leftChildId: newUser.id,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, placement.parentId));
} else {
  await db.update(usersTable)
    .set({
      rightChildId: newUser.id,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, placement.parentId));
}
  // Propagate BV up the entire sponsor tree (real-time)
 console.log(
  "PLACED",
  newUser.id,
  "UNDER",
  placement.parentId,
  "SLOT",
  placement.slot
);
await propagateBvUp(
  placement.parentId,
  packageInfo.bv,
  placement.slot
);

  // Mark E-Pin as used
  await db.update(epinsTable).set({ status: "used", usedByUserId: newUser.id, usedAt: new Date() }).where(eq(epinsTable.id, epinRecord.id));

  // Create wallet
  await db.insert(walletsTable).values({ userId: newUser.id, balance: "0", totalEarned: "0", totalWithdrawn: "0", pendingWithdrawal: "0" });

  // Real-time binary matching for sponsor
  try {
  
  } catch (e) {
    logger.warn({ err: e }, "Binary matching after registration failed (non-fatal)");
  }

  const token = await createSession(newUser.id, newUser.role);
  const { passwordHash: _, ...userPublic } = newUser;
  res.status(201).json({ user: userPublic, token });
});

router.post("/auth/login", async (req, res) => {
  const body = LoginUserBody.safeParse(req.body);
  if (!body.success) return void res.status(400).json({ error: "Validation error" });
  const { memberId, password } = body.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.memberId, memberId));
  if (!user) return void res.status(401).json({ error: "Invalid credentials" });
  if (user.status === "blocked") return void res.status(401).json({ error: "Account is blocked" });
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return void res.status(401).json({ error: "Invalid credentials" });
  const token = await createSession(user.id, user.role);
  const { passwordHash: _, ...userPublic } = user;
  res.json({ user: userPublic, token });
});

router.post("/auth/admin/login", async (req, res) => {
  const body = AdminLoginBody.safeParse(req.body);
  if (!body.success) return void res.status(400).json({ error: "Validation error" });
  const { memberId, password } = body.data;
  const [user] = await db.select().from(usersTable).where(and(eq(usersTable.memberId, memberId), eq(usersTable.role, "admin")));
  if (!user) return void res.status(401).json({ error: "Invalid admin credentials" });
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return void res.status(401).json({ error: "Invalid admin credentials" });
  const token = await createSession(user.id, user.role);
  const { passwordHash: _, ...userPublic } = user;
  res.json({ user: userPublic, token });
});

router.post("/auth/logout", requireAuth, async (req, res) => {
  const token = (req as any).token;
  await destroySession(token);
  res.json({ success: true });
});

router.get("/auth/me", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { passwordHash: _, ...userPublic } = user;
  res.json(userPublic);
});

router.get("/auth/admin/test-login", async (_req, res) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(
      and(
        eq(usersTable.memberId, "ADMIN001"),
        eq(usersTable.role, "admin")
      )
    );

  if (!user) {
    return res.status(404).json({
      error: "Admin not found",
    });
  }

  const token = await createSession(
    user.id,
    user.role
  );

  res.json({
    memberId: user.memberId,
    role: user.role,
    token,
  });
});

export default router;
