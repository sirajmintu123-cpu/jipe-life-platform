import {
  pgTable,
  serial,
  integer,
  decimal,
  boolean,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

//
// Monthly Pool
//

export const ctoMonthlyPoolsTable = pgTable(
  "cto_monthly_pools",
  {

    id: serial("id").primaryKey(),

    month: integer("month").notNull(),

    year: integer("year").notNull(),

 registrationRevenue: decimal("registration_revenue", {
  precision: 16,
  scale: 2,
})
.notNull(),

repurchaseRevenue: decimal("repurchase_revenue", {
  precision: 16,
  scale: 2,
})
.notNull(),

totalRevenue: decimal("total_revenue", {
  precision: 16,
  scale: 2,
})
.notNull(),

    starterPool: decimal("starter_pool", {
      precision: 16,
      scale: 2,
    }).notNull(),

    smartPool: decimal("smart_pool", {
      precision: 16,
      scale: 2,
    }).notNull(),

    silverPool: decimal("silver_pool", {
      precision: 16,
      scale: 2,
    }).notNull(),

    goldPool: decimal("gold_pool", {
      precision: 16,
      scale: 2,
    }).notNull(),

    treasuryReturned: decimal("treasury_returned", {
      precision: 16,
      scale: 2,
    })
      .notNull()
      .default("0"),

    distributed: boolean("distributed")
      .notNull()
      .default(false),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    distributedAt: timestamp("distributed_at"),
  }
);

//
// Distribution Log
//

export const ctoDistributionLogsTable = pgTable(
  "cto_distribution_logs",
  {

    id: serial("id").primaryKey(),

    monthlyPoolId: integer("monthly_pool_id")
      .notNull(),

    userId: integer("user_id")
      .notNull(),

    package: text("package")
      .notNull(),

    amount: decimal("amount", {
      precision: 14,
      scale: 2,
    }).notNull(),

    beforeReceived: decimal("before_received", {
      precision: 14,
      scale: 2,
    }).notNull(),

    afterReceived: decimal("after_received", {
      precision: 14,
      scale: 2,
    }).notNull(),

    lockedAfterPayment: boolean("locked_after_payment")
      .notNull()
      .default(false),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

      remainingLimit: decimal("remaining_limit", {
  precision: 14,
  scale: 2,
})
.notNull()
.default("0"),

shareAmount: decimal("share_amount", {
  precision: 14,
  scale: 2,
})
.notNull()
.default("0"),

paymentType: text("payment_type")
.notNull()
.default("full"),
  }
);

//
// Recovery History
//

export const ctoHistoryTable = pgTable(
  "cto_history",
  {

    id: serial("id").primaryKey(),

    userId: integer("user_id")
      .notNull(),

    cycleNo: integer("cycle_no")
      .notNull(),

    package: text("package")
      .notNull(),

    packageCost: integer("package_cost")
      .notNull(),

    totalReceived: decimal("total_received", {
      precision: 14,
      scale: 2,
    })
      .notNull()
      .default("0"),

    completed: boolean("completed")
      .notNull()
      .default(false),

    startedAt: timestamp("started_at")
      .defaultNow()
      .notNull(),

    completedAt: timestamp("completed_at"),
  }
);