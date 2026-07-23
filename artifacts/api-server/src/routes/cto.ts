import { Router } from "express";
import { db } from "@workspace/db";

import {
  usersTable,
  ctoMonthlyPoolsTable,
  ctoHistoryTable,
} from "@workspace/db";

import {
  calculateMonthlyRevenue,
} from "../services/cto/ctoRevenue";

import {
  calculatePools,
  saveMonthlyPools,
} from "../services/cto/ctoPools";

import {
  distributeMonthlyCTO,
} from "../services/cto/ctoDistribution";

import {
  processRepurchase,
} from "../services/cto/ctoRepurchase";

import {
  requireAdmin,
} from "../lib/auth";

import {
  eq,
  and,
} from "drizzle-orm";

const router = Router();

/* ============================================================
   GET CTO STATUS
============================================================ */

router.get(
  "/cto/status",
  requireAdmin,
  async (_, res) => {
    try {

      const users =
        await db.select().from(usersTable);

      const activeMembers =
        users.filter(
          (u) =>
            u.ctoActive === true &&
            u.ctoLocked === false,
        ).length;

      const lockedMembers =
        users.filter(
          (u) =>
            u.ctoLocked === true,
        ).length;

      res.json({
        success: true,
        activeMembers,
        lockedMembers,
      });

    } catch (error: any) {

      res.status(500).json({
        success: false,
        message: error.message,
      });

    }
  },
);


/* ============================================================
   GET CTO CURRENT (Admin Dashboard)
============================================================ */

router.get(
  "/cto/current",
  requireAdmin,
  async (_req, res) => {
    res.json({
      success: true,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),

      registrationRevenue: 0,
      repurchaseRevenue: 0,
      totalTurnover: 0,

      starterPool: 0,
      smartPool: 0,
      silverPool: 0,
      goldPool: 0,

      starterActiveUsers: 0,
      smartActiveUsers: 0,
      silverActiveUsers: 0,
      goldActiveUsers: 0,

      starterPerShare: 0,
      smartPerShare: 0,
      silverPerShare: 0,
      goldPerShare: 0,

      distributionStatus: "pending",
      distributionDate: null,

      totalActiveMembers: 0,
      topEarners: [],
    });
  },
);

/* ============================================================
   GET CTO HISTORY (Admin)
============================================================ */

router.get(
  "/cto/history",
  requireAdmin,
  async (_req, res) => {
    try {

      res.json({
        success: true,
        data: [],
      });

    } catch (error: any) {

      res.status(500).json({
        success: false,
        message: error.message,
      });

    }
  },
);


/* ============================================================
   GET CTO RECOVERY STATUS (Admin)
============================================================ */

router.get(
  "/cto/recovery-status",
  requireAdmin,
  async (req, res) => {
    try {
      const user = (req as any).user;

      const packageCostMap: Record<string, number> = {
        starter: 1100,
        smart: 2100,
        silver: 5100,
        gold: 10100,
      };

      const packageName = (user.package ?? "").toLowerCase();

      const packageCost = packageCostMap[packageName] ?? 0;

      const totalReceived = Number(user.ctoTotalReceived ?? 0);

      const remainingForRecovery = Math.max(
        0,
        packageCost - totalReceived,
      );

      const recoveryPercent =
        packageCost > 0
          ? Number(
              ((totalReceived / packageCost) * 100).toFixed(2),
            )
          : 0;

      res.json({
        packageCost,
        totalReceived,
        remainingForRecovery,
        recoveryPercent,
        isRecovered: !user.ctoActive,
        ctoActive: user.ctoActive,
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

/* ============================================================
   POST RUN CTO
============================================================ */

router.post(
  "/cto/run",
  requireAdmin,
  async (req, res) => {

    try {

      const month =
        Number(req.body.month);

      const year =
        Number(req.body.year);

      if (!month || !year) {
        return res.status(400).json({
          success: false,
          message:
            "month and year required",
        });
      }

      const revenue =
        await calculateMonthlyRevenue(
          month,
          year,
        );

      const pools =
        calculatePools(
          revenue.registrationRevenue,
          revenue.repurchaseRevenue,
        );

      await saveMonthlyPools(
        month,
        year,
        pools,
      );

      const result =
        await distributeMonthlyCTO(
          month,
          year,
        );

      res.json({
        success: true,
        revenue,
        pools,

        month: result.month,
        year: result.year,
        treasuryReturned: result.treasuryReturned,

        starter: result.starter,
        smart: result.smart,
        silver: result.silver,
        gold: result.gold,
      });

    } catch (error: any) {

      res.status(500).json({
        success: false,
        message: error.message,
      });

    }

  },
);

/* ============================================================
   POST REPURCHASE
============================================================ */

router.post(
  "/cto/repurchase",
  requireAdmin,
  async (req, res) => {

    try {

      const {
        memberId,
        epin,
      } = req.body;

      if (!memberId || !epin) {

        return res.status(400).json({
          success: false,
          message:
            "memberId and epin required",
        });

      }

      const result =
        await processRepurchase({
          memberId,
          epin,
        });

      res.json(result);

    } catch (error: any) {

      res.status(500).json({
        success: false,
        message: error.message,
      });

    }

  },
);

/* ============================================================
   GET MEMBER CTO HISTORY
============================================================ */

router.get(
  "/cto/history/:memberId",
  requireAdmin,
  async (req, res) => {

    try {

      const memberId =
        req.params.memberId;

      const [user] = await db
        .select()
        .from(usersTable)
        .where(
          eq(
            usersTable.memberId,
            memberId,
          ),
        );

      if (!user) {

        return res.status(404).json({
          success: false,
          message:
            "Member not found",
        });

      }

      const history = await db
        .select()
        .from(ctoHistoryTable)
        .where(
          eq(
            ctoHistoryTable.userId,
            user.id,
          ),
        );

      res.json({
        success: true,
        memberId,
        history,
      });

    } catch (error: any) {

      res.status(500).json({
        success: false,
        message: error.message,
      });

    }

  },
);

/* ============================================================
   GET MONTHLY CTO REPORT
============================================================ */

router.get(
  "/cto/month/:year/:month",
  requireAdmin,
  async (req, res) => {

    try {

      const year =
        Number(req.params.year);

      const month =
        Number(req.params.month);

      const [report] = await db
        .select()
        .from(ctoMonthlyPoolsTable)
        .where(
          and(
            eq(
              ctoMonthlyPoolsTable.year,
              year,
            ),
            eq(
              ctoMonthlyPoolsTable.month,
              month,
            ),
          ),
        );

      if (!report) {

        return res.status(404).json({
          success: false,
          message:
            "Monthly report not found",
        });

      }

      res.json({
        success: true,
        report,
      });

    } catch (error: any) {

      res.status(500).json({
        success: false,
        message: error.message,
      });

    }

  },
);

export default router;