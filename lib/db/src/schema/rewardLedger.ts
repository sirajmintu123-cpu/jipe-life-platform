import {
  pgTable,
  serial,
  integer,
  varchar,
  numeric,
  timestamp,
  text,
} from "drizzle-orm/pg-core";

import { usersTable } from "./users";
export const rewardLedgerTable = pgTable("reward_ledger", {
  id: serial("id").primaryKey(),

  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id),

  tier: integer("tier").notNull(),

  requiredPairs: integer("required_pairs").notNull(),

  rewardName: varchar("reward_name", { length: 255 }).notNull(),

  cashValue: numeric("cash_value", {
    precision: 12,
    scale: 2,
  }).notNull(),

  rewardType: varchar("reward_type", {
    length: 20,
  }),

  status: varchar("status", {
    length: 20,
  })
    .default("pending")
    .notNull(),

  achievedAt: timestamp("achieved_at")
    .defaultNow()
    .notNull(),

  approvedAt: timestamp("approved_at"),

  deliveredAt: timestamp("delivered_at"),

  remarks: text("remarks"),
});