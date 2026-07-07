import { pgTable, serial, text, integer, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const epinStatusEnum = pgEnum("epin_status", ["unused", "used", "transferred"]);
export const epinRequestStatusEnum = pgEnum("epin_request_status", ["pending", "approved", "rejected"]);
export const epinUsageTypeEnum = pgEnum(
  "epin_usage_type",
  [
    "registration",
    "repurchase"
  ]
);

export const epinsTable = pgTable("epins", {
  id: serial("id").primaryKey(),
  pin: text("pin").notNull().unique(),
  package: text("package").notNull(),
  packagePrice: integer("package_price").notNull(),
  bv: numeric("bv", { precision: 10, scale: 2 })
  .notNull()
  .default("0"),
  status: epinStatusEnum("status").notNull().default("unused"),
  generatedById: integer("generated_by_id"),
  assignedToId: integer("assigned_to_id"),
  transferredToId: integer("transferred_to_id"),
usedByUserId: integer("used_by_user_id"),

usageType: epinUsageTypeEnum("usage_type")
.notNull()
.default("registration"),

createdAt: timestamp("created_at")
.notNull()
.defaultNow(),
  usedAt: timestamp("used_at"),
});

export const epinRequestsTable = pgTable("epin_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  package: text("package").notNull(),
  quantity: integer("quantity").notNull(),
  paymentReference: text("payment_reference").notNull(),
  totalAmount: integer("total_amount").notNull(),
  status: epinRequestStatusEnum("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  processedById: integer("processed_by_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const insertEpinSchema = createInsertSchema(epinsTable).omit({ id: true, createdAt: true });
export const insertEpinRequestSchema = createInsertSchema(epinRequestsTable).omit({ id: true, createdAt: true });
export type InsertEpin = z.infer<typeof insertEpinSchema>;
export type InsertEpinRequest = z.infer<typeof insertEpinRequestSchema>;
export type Epin = typeof epinsTable.$inferSelect;
export type EpinRequest = typeof epinRequestsTable.$inferSelect;
