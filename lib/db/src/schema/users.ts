import { pgTable, serial, text, integer, boolean, timestamp, decimal, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const packageEnum = pgEnum("package_type", [
  "starter",
  "smart",
  "silver",
  "gold"
]);
export const userStatusEnum = pgEnum("user_status", ["active", "blocked", "inactive"]);
export const userRoleEnum = pgEnum("user_role", ["member", "admin"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  memberId: text("member_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  passwordHash: text("password_hash").notNull(),
  package: packageEnum("package").notNull().default("smart"),
  bv: numeric("bv", { precision: 10, scale: 2 })
  .notNull()
  .default("0"),
  role: userRoleEnum("role").notNull().default("member"),
  status: userStatusEnum("status").notNull().default("active"),
  sponsorId: integer("sponsor_id"),
  leftChildId: integer("left_child_id"),
  rightChildId: integer("right_child_id"),
  // CTO pool tracking
  // CTO pool tracking
ctoActive: boolean("cto_active")
  .notNull()
  .default(true),

ctoLocked: boolean("cto_locked")
  .notNull()
  .default(false),

ctoTotalReceived: decimal("cto_total_received", {
  precision: 12,
  scale: 2,
})
.notNull()
.default("0"),

packageCost: integer("package_cost")
.notNull()
.default(2100),
// Banking
  bankAccount: text("bank_account"),
  bankName: text("bank_name"),
  ifscCode: text("ifsc_code"),
  upiId: text("upi_id"),
  // Pair tracking
  lifetimePairs: integer("lifetime_pairs").notNull().default(0),
// Reward tracking
rewardLevel: integer("reward_level")
  .notNull()
  .default(0),

rewardPairCounter: integer("reward_pair_counter")
  .notNull()
  .default(0),
  leftBv: numeric("left_bv", { precision: 10, scale: 2 })
  .notNull()
  .default("0"),

rightBv: numeric("right_bv", { precision: 10, scale: 2 })
  .notNull()
  .default("0"),

carryForwardBv: numeric("carry_forward_bv", { precision: 10, scale: 2 })
  .notNull()
  .default("0"),

carryForwardLeftBv: numeric("carry_forward_left_bv", { precision: 10, scale: 2 })
  .notNull()
  .default("0"),

carryForwardRightBv: numeric("carry_forward_right_bv", { precision: 10, scale: 2 })
  .notNull()
  .default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
updatedAt: timestamp("updated_at").notNull().defaultNow(),

});
export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;