import { pgTable, serial, integer, decimal, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const withdrawalStatusEnum = pgEnum("withdrawal_status", ["pending", "approved", "rejected"]);

export const walletsTable = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  balance: decimal("balance", { precision: 14, scale: 2 }).notNull().default("0"),
  totalEarned: decimal("total_earned", { precision: 14, scale: 2 }).notNull().default("0"),
  totalWithdrawn: decimal("total_withdrawn", { precision: 14, scale: 2 }).notNull().default("0"),
  pendingWithdrawal: decimal("pending_withdrawal", { precision: 14, scale: 2 }).notNull().default("0"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // binary_income | cto_royalty | withdrawal | reward_cash | jackpot_bonus
  amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("completed"), // completed | pending | failed
  referenceId: integer("reference_id"), // FK to matching record, withdrawal, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const withdrawalRequestsTable = pgTable("withdrawal_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  grossAmount: decimal("gross_amount", { precision: 14, scale: 2 }).notNull(),
  deductionAmount: decimal("deduction_amount", { precision: 14, scale: 2 }).notNull(),
  netAmount: decimal("net_amount", { precision: 14, scale: 2 }).notNull(),
  method: text("method").notNull(), // bank | upi
  status: withdrawalStatusEnum("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  processedById: integer("processed_by_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const insertWalletSchema = createInsertSchema(walletsTable).omit({ id: true, updatedAt: true });
export const insertTransactionSchema = createInsertSchema(transactionsTable).omit({ id: true, createdAt: true });
export const insertWithdrawalSchema = createInsertSchema(withdrawalRequestsTable).omit({ id: true, createdAt: true });

export type Wallet = typeof walletsTable.$inferSelect;
export type Transaction = typeof transactionsTable.$inferSelect;
export type WithdrawalRequest = typeof withdrawalRequestsTable.$inferSelect;
