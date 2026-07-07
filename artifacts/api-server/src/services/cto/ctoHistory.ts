import { db } from "@workspace/db";
import {
  ctoHistoryTable,
} from "@workspace/db";

import {
  eq,
  and,
  desc,
} from "drizzle-orm";

/* ============================================================
   Types
============================================================ */

export interface CreateHistoryInput {
  userId: number;
  package: string;
  packageCost: number;
}

export interface UpdateHistoryInput {
  historyId: number;
  totalReceived: number;
}

export interface CompleteHistoryInput {
  historyId: number;
  totalReceived: number;
}

/* ============================================================
   Get Next Cycle Number
============================================================ */

export async function getNextCycleNo(
  userId: number,
): Promise<number> {

  const rows = await db
    .select()
    .from(ctoHistoryTable)
    .where(
      eq(
        ctoHistoryTable.userId,
        userId,
      ),
    )
    .orderBy(
      desc(
        ctoHistoryTable.cycleNo,
      ),
    )
    .limit(1);

  if (rows.length === 0) {
    return 1;
  }

  return rows[0].cycleNo + 1;
}

/* ============================================================
   Get Active Cycle
============================================================ */

export async function getActiveCycle(
  userId: number,
) {

  const [history] = await db
    .select()
    .from(ctoHistoryTable)
    .where(
      and(
        eq(
          ctoHistoryTable.userId,
          userId,
        ),
        eq(
          ctoHistoryTable.completed,
          false,
        ),
      ),
    )
    .orderBy(
      desc(
        ctoHistoryTable.cycleNo,
      ),
    )
    .limit(1);

  return history ?? null;
}

/* ============================================================
   Create New CTO Cycle
============================================================ */

export async function createHistory(
  input: CreateHistoryInput,
) {

  const cycleNo =
    await getNextCycleNo(
      input.userId,
    );

  const [history] = await db
    .insert(ctoHistoryTable)
    .values({

      userId:
        input.userId,

      cycleNo,

      package:
        input.package,

      packageCost:
        input.packageCost,

      totalReceived: "0",

      completed: false,

      startedAt:
        new Date(),

    })
    .returning();

  return history;
}

/* ============================================================
   Update Running CTO Cycle
============================================================ */

export async function updateHistory(
  input: UpdateHistoryInput,
) {

  const [history] = await db
    .update(ctoHistoryTable)
    .set({

      totalReceived:
        input.totalReceived.toFixed(2),

    })
    .where(
      eq(
        ctoHistoryTable.id,
        input.historyId,
      ),
    )
    .returning();

  return history;
}

/* ============================================================
   Complete CTO Cycle
============================================================ */

export async function completeHistory(
  input: CompleteHistoryInput,
) {

  const [history] = await db
    .update(ctoHistoryTable)
    .set({

      totalReceived:
        input.totalReceived.toFixed(2),

      completed: true,

      completedAt:
        new Date(),

    })
    .where(
      eq(
        ctoHistoryTable.id,
        input.historyId,
      ),
    )
    .returning();

  return history;
}
