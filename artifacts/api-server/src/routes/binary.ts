import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, binaryMatchingLogsTable, walletsTable, transactionsTable } from "@workspace/db";
import { eq, desc, sql, and } from "drizzle-orm";
import { GetBinaryHistoryQueryParams } from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../lib/auth";
import { logger } from "../lib/logger";
import { processRewardPairs } from "../services/rewardService";

const router = Router();

const BASE_PAYOUT_PER_PAIR = 1000;
const STANDARD_CAP_PAIRS = 4;
const JACKPOT_PAIRS = 10;
const JACKPOT_BONUS = 1800;
const INFINITE_LOOP_PER_PAIR = 200;

router.get("/binary/stats", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const today = new Date().toISOString().split("T")[0];

  const [todayLog] = await db.select().from(binaryMatchingLogsTable)
    .where(and(eq(binaryMatchingLogsTable.userId, user.id), eq(binaryMatchingLogsTable.matchDate, today)));

  res.json({
    leftBv: user.leftBv,
    rightBv: user.rightBv,
    todayPairs: todayLog?.pairsMatched ?? 0,
    todayEarning: todayLog ? parseFloat(todayLog.netAmount) : 0,
    isCapped: (todayLog?.pairsMatched ?? 0) >= STANDARD_CAP_PAIRS,
    isJackpot: todayLog?.isJackpot ?? false,
    carryForwardLeftBv: user.carryForwardLeftBv,
carryForwardRightBv: user.carryForwardRightBv,
    lifetimePairs: user.lifetimePairs,
  });
});

router.get("/binary/history", requireAuth, async (req, res) => {
  const user = (req as any).user;
  const params = GetBinaryHistoryQueryParams.safeParse(req.query);
  const page = params.success ? (params.data.page ?? 1) : 1;
  const limit = params.success ? (params.data.limit ?? 20) : 20;
  const offset = (page - 1) * limit;

  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(binaryMatchingLogsTable).where(eq(binaryMatchingLogsTable.userId, user.id));
  const logs = await db.select().from(binaryMatchingLogsTable)
    .where(eq(binaryMatchingLogsTable.userId, user.id))
    .orderBy(desc(binaryMatchingLogsTable.matchDate))
    .limit(limit).offset(offset);

  res.json({
    data: logs.map(l => ({
      id: l.id,
      date: l.matchDate,
      pairsMatched: l.pairsMatched,
      grossAmount: parseFloat(l.grossAmount),
      netAmount: parseFloat(l.netAmount),
      isJackpot: l.isJackpot,
      flushedPairs: l.flushedPairs,
    })),
    total: Number(count),
    page,
    limit,
  });
});

// Core binary matching engine
export async function runBinaryMatchingForUser(userId: number): Promise<{ pairsMatched: number; grossAmount: number; netAmount: number; isJackpot: boolean; flushedPairs: number }> {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user || user.status !== "active") return { pairsMatched: 0, grossAmount: 0, netAmount: 0, isJackpot: false, flushedPairs: 0 };

  const leftBv =
  Number(user.leftBv ?? 0) +
  Number(user.carryForwardLeftBv ?? 0);

const rightBv =
  Number(user.rightBv ?? 0) +
  Number(user.carryForwardRightBv ?? 0);
  
  const matchablePairs = Math.floor(
Math.min(leftBv, rightBv)
);

  if (matchablePairs === 0) return { pairsMatched: 0, grossAmount: 0, netAmount: 0, isJackpot: false, flushedPairs: 0 };

  let gross = 0;
let paidPairs = matchablePairs;
let flushedPairs = 0;
let isJackpot = false;

// Pair 1-4 = ₹1000 each
const standardPairs = Math.min(matchablePairs, STANDARD_CAP_PAIRS);
gross += standardPairs * BASE_PAYOUT_PER_PAIR;

// Pair 5+ = ₹200 each
if (matchablePairs > STANDARD_CAP_PAIRS) {
const extraPairs = matchablePairs - STANDARD_CAP_PAIRS;
gross += extraPairs * INFINITE_LOOP_PER_PAIR;
}

// Family Bonus when 10+ pairs occur in the same cycle
if (matchablePairs >= JACKPOT_PAIRS) {
isJackpot = true;
gross += JACKPOT_BONUS;
}


  // 100% payout — deduction happens only at withdrawal
  const net = gross;
  const bvConsumed = matchablePairs;

  let remainingLeft = 0;
let remainingRight = 0;

if (matchablePairs < STANDARD_CAP_PAIRS) {
  remainingLeft = Math.max(0, leftBv - matchablePairs);
  remainingRight = Math.max(0, rightBv - matchablePairs);
} else {
  remainingLeft = 0;
  remainingRight = 0;

  flushedPairs =
    Math.max(leftBv, rightBv) - matchablePairs;
}


await db.update(usersTable).set({
  lifetimePairs: user.lifetimePairs + paidPairs,
  leftBv: 0,
  rightBv: 0,

  carryForwardLeftBv: remainingLeft,
  carryForwardRightBv: remainingRight,

  updatedAt: new Date(),
}).where(eq(usersTable.id, userId));

await processRewardPairs(
  userId,
  paidPairs
);
  const today = new Date().toISOString().split("T")[0];
  await db.insert(binaryMatchingLogsTable).values({
    userId,
    matchDate: today,
    pairsMatched: paidPairs,
    flushedPairs,
    grossAmount: gross.toFixed(2),
    netAmount: net.toFixed(2),
    isJackpot,
    isInfiniteLoop: matchablePairs > STANDARD_CAP_PAIRS,
    leftBvConsumed: Math.min(leftBv, bvConsumed),
    rightBvConsumed: Math.min(rightBv, bvConsumed),
  });

  // Credit wallet
  const [wallet] = await db.select().from(walletsTable).where(eq(walletsTable.userId, userId));
  if (wallet && net > 0) {
    const newBalance = parseFloat(wallet.balance) + net;
    const newTotalEarned = parseFloat(wallet.totalEarned) + net;
    await db.update(walletsTable).set({
      balance: newBalance.toFixed(2),
      totalEarned: newTotalEarned.toFixed(2),
      updatedAt: new Date(),
    }).where(eq(walletsTable.userId, userId));

    await db.insert(transactionsTable).values({
      userId,
      type: isJackpot ? "jackpot_bonus" : "binary_income",
      amount: net.toFixed(2),
      description: isJackpot
        ? `Jackpot! ${paidPairs} pairs matched — ₹${gross.toFixed(0)} credited (15% deducted on withdrawal)`
        : `${paidPairs} pair(s) matched — ₹${gross.toFixed(0)} credited to wallet`,
      status: "completed",
    });
  }

  return { pairsMatched: paidPairs, grossAmount: gross, netAmount: net, isJackpot, flushedPairs };
}

export default router;
