import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import epinsRouter from "./epins";
import binaryRouter from "./binary";
import walletRouter from "./wallet";
import ctoRouter from "./cto";
import rewardsRouter from "./rewards";
import adminRouter from "./admin";
import kycRouter from "./kyc";

const router: IRouter = Router();

router.get("/cto/test", (_, res) => {
  res.json({
    success: true,
    message: "CTO Route Working"
  });
});

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(epinsRouter);
router.use(binaryRouter);
router.use(walletRouter);
router.use(ctoRouter);
router.use(rewardsRouter);
router.use(adminRouter);
router.use(kycRouter);


export default router;