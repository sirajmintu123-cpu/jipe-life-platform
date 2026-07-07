import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const rewardLedgerTable = pgTable("reward_ledger", {
  id: serial("id").primaryKey(),

  userId: integer("user_id").notNull(),

  tier: integer("tier").notNull(),

  requiredPairs: integer("required_pairs").notNull(),

  rewardName: text("reward_name").notNull(),

  cashValue: integer("cash_value").notNull(),

  rewardType: text("reward_type"),

  status: text("status")
    .notNull()
    .default("pending"),

  achievedAt: timestamp("achieved_at")
    .notNull()
    .defaultNow(),

  approvedAt: timestamp("approved_at"),

  deliveredAt: timestamp("delivered_at"),

  remarks: text("remarks"),
});

export const insertRewardLedgerSchema =
  createInsertSchema(rewardLedgerTable)
    .omit({
      id: true,
      achievedAt: true,
    });

export type InsertRewardLedger =
  z.infer<typeof insertRewardLedgerSchema>;

export type RewardLedger =
  typeof rewardLedgerTable.$inferSelect;