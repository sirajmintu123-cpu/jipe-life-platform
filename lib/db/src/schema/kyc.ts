import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const kycStatusEnum = pgEnum("kyc_status", ["not_submitted", "pending", "approved", "rejected"]);

export const kycTable = pgTable("kyc", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  aadhaarNumber: text("aadhaar_number"),
  aadhaarFrontUrl: text("aadhaar_front_url"),
  aadhaarBackUrl: text("aadhaar_back_url"),
  panNumber: text("pan_number"),
  panPhotoUrl: text("pan_photo_url"),
  bankName: text("bank_name"),
  holderName: text("holder_name"),
  accountNumber: text("account_number"),
  ifscCode: text("ifsc_code"),
  upiId: text("upi_id"),
  status: kycStatusEnum("status").notNull().default("not_submitted"),
  rejectionReason: text("rejection_reason"),
  reviewedById: integer("reviewed_by_id"),
  submittedAt: timestamp("submitted_at"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertKycSchema = createInsertSchema(kycTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertKyc = z.infer<typeof insertKycSchema>;
export type Kyc = typeof kycTable.$inferSelect;
