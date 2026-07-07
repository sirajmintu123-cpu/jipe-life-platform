import { db } from "@workspace/db";
import { epinsTable } from "@workspace/db";
import { sql, and, eq } from "drizzle-orm";

export interface MonthlyRevenue {

  registrationRevenue: number;

  repurchaseRevenue: number;

  totalRevenue: number;

}

export async function calculateMonthlyRevenue(
  month: number,
  year: number,
): Promise<MonthlyRevenue> {

  const registration = await db
    .select({
      total: sql<number>`
        COALESCE(SUM(${epinsTable.packagePrice}),0)
      `,
    })
    .from(epinsTable)
    .where(
      and(
        eq(epinsTable.status, "used"),
        eq(epinsTable.usageType, "registration"),
        sql`EXTRACT(MONTH FROM ${epinsTable.usedAt}) = ${month}`,
        sql`EXTRACT(YEAR FROM ${epinsTable.usedAt}) = ${year}`,
      ),
    );

  const repurchase = await db
    .select({
      total: sql<number>`
        COALESCE(SUM(${epinsTable.packagePrice}),0)
      `,
    })
    .from(epinsTable)
    .where(
      and(
        eq(epinsTable.status, "used"),
        eq(epinsTable.usageType, "repurchase"),
        sql`EXTRACT(MONTH FROM ${epinsTable.usedAt}) = ${month}`,
        sql`EXTRACT(YEAR FROM ${epinsTable.usedAt}) = ${year}`,
      ),
    );

  const registrationRevenue =
    Number(registration[0]?.total ?? 0);

  const repurchaseRevenue =
    Number(repurchase[0]?.total ?? 0);

  return {

    registrationRevenue,

    repurchaseRevenue,

    totalRevenue:
      registrationRevenue +
      repurchaseRevenue,

  };
}