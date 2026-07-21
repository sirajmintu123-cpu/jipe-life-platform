import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, walletsTable, transactionsTable, binaryMatchingLogsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { UpdateUserProfileBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router = Router();

router.get("/users/dashboard", requireAuth, async (req, res) => {
  const user = (req as any).user;

  const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, user.id));

  const today = new Date().toISOString().split("T")[0];
  const [todayLog] = await db.select().from(binaryMatchingLogsTable)
    .where(eq(binaryMatchingLogsTable.userId, user.id))
    .where(eq(binaryMatchingLogsTable.matchDate, today));

  // Count team size (all downlines)
  const teamResult = await db.execute(
    sql`WITH RECURSIVE tree AS (
      SELECT id FROM users WHERE sponsor_id = ${user.id}
      UNION ALL
      SELECT u.id FROM users u INNER JOIN tree t ON u.sponsor_id = t.id
    ) SELECT COUNT(*) as count FROM tree`
  );
  const totalTeamSize = Number((teamResult.rows[0] as any)?.count ?? 0);

  const recentTransactions = await db.select().from(transactionsTable)
    .where(eq(transactionsTable.userId, user.id))
    .orderBy(desc(transactionsTable.createdAt))
    .limit(5);

   console.log("******** DASHBOARD ROUTE EXECUTED ********");
console.log({
  memberId: user.memberId,
  userId: user.id,
  todayLogUserId: todayLog?.userId,
  todayLog,
  todayPairs: todayLog?.pairsMatched ?? 0,
  todayEarning: todayLog ? parseFloat(todayLog.netAmount) : 0,
});

  res.json({
    availableBalance: parseFloat(wallet?.balance ?? "0"),
    todayEarning: todayLog ? parseFloat(todayLog.netAmount) : 0,
    totalTeamSize,
    leftBv: user.leftBv,
    rightBv: user.rightBv,
    totalPairs: user.lifetimePairs,
    todayPairs: todayLog?.pairsMatched ?? 0,
    package: user.package,
    ctoActive: user.ctoActive,
    ctoEarned: parseFloat(user.ctoTotalReceived ?? "0"),
    packageCost: user.packageCost,
    recentTransactions: recentTransactions.map(t => ({
      id: t.id,
      type: t.type,
      amount: parseFloat(t.amount),
      description: t.description,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
    })),
  });
});

router.get("/users/binary-tree", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const depth = parseInt(req.query.depth as string ?? "3", 10);

  async function buildTree(userId: number | null, position: string, currentDepth: number): Promise<any> {
    if (!userId || currentDepth <= 0) return null;
    const [node] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!node) return null;
    return {
      id: node.id,
      memberId: node.memberId,
      name: node.name,
      package: node.package,
      bv: node.bv,
      position,
      left: await buildTree(node.leftChildId, "left", currentDepth - 1),
      right: await buildTree(node.rightChildId, "right", currentDepth - 1),
    };
  }

  const tree = await buildTree(user.id, "root", depth);
  res.json(tree);
});

router.get("/users/profile", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const { passwordHash: _, ...userPublic } = user;
  res.json(userPublic);
});

router.patch("/users/profile", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const body = UpdateUserProfileBody.safeParse(req.body);
  if (!body.success) return void res.status(400).json({ error: "Validation error" });
  const [updated] = await db.update(usersTable)
    .set({ ...body.data, updatedAt: new Date() })
    .where(eq(usersTable.id, user.id))
    .returning();
  const { passwordHash: _, ...userPublic } = updated;
  res.json(userPublic);
});

export default router;
