// cspell: disable
import { Router } from "express";
import salesRouter from "./sales";
const router = Router();

router.use("/sales", salesRouter);

export default router;
