import { pgTable, serial, integer, decimal, numeric, boolean, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const binaryMatchingLogsTable = pgTable("binary_matching_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  matchDate: date("match_date").notNull(),
  pairsMatched: integer("pairs_matched").notNull().default(0),
  flushedPairs: numeric("flushed_pairs", {
precision: 10,
scale: 2,
})
.notNull()
.default("0"),

  grossAmount: decimal("gross_amount", { precision: 14, scale: 2 }).notNull().default("0"),
  netAmount: decimal("net_amount", { precision: 14, scale: 2 }).notNull().default("0"),
  isJackpot: boolean("is_jackpot").notNull().default(false),
  isInfiniteLoop: boolean("is_infinite_loop").notNull().default(false),
leftBvConsumed: numeric("left_bv_consumed", {
  precision: 10,
  scale: 2,
})
  .notNull()
  .default("0"),

rightBvConsumed: numeric("right_bv_consumed", {
  precision: 10,
  scale: 2,
})
  .notNull()
  .default("0"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertBinaryLogSchema = createInsertSchema(binaryMatchingLogsTable).omit({ id: true, createdAt: true });
export type InsertBinaryLog = z.infer<typeof insertBinaryLogSchema>;
export type BinaryMatchingLog = typeof binaryMatchingLogsTable.$inferSelect;
