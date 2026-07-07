import cron from "node-cron";

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

export function startCTOCron() {

  //
  // Last day of month at 11:59 PM
  //
  cron.schedule(
    "59 23 28-31 * *",
    async () => {

      try {

        const now = new Date();

        const tomorrow = new Date(now);

        tomorrow.setDate(
          now.getDate() + 1,
        );

        //
        // Execute only on
        // actual last day of month
        //
        if (
          tomorrow.getDate() !== 1
        ) {
          return;
        }

        const month =
          now.getMonth() + 1;

        const year =
          now.getFullYear();

        console.log(
          `[CTO] Starting monthly distribution for ${month}/${year}`
        );

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

        console.log(
          "[CTO] Distribution completed",
          result,
        );

      } catch (error) {

        console.error(
          "[CTO] Distribution failed",
          error,
        );

      }

    },
    {
      timezone: "Asia/Kolkata",
    },
  );


}