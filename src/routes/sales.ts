import { Router } from "express";
import SalesController from "../controllers/sales.controllers";

const router = Router();

router.get("/:id", SalesController.get);

router.get("/:id/pdf", SalesController.getPDF);

router.post("/", SalesController.create);

export default router;
