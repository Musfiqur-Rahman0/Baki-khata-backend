import { Router } from "express";
import { authenticate } from "../../middleware/authMiddleware.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import * as aiController from "./ai.controller.js";

const router = Router();
router.use(authenticate);
router.post("/parse-transaction", asyncHandler(aiController.parseTransaction));
router.post("/confirm-transaction", asyncHandler(aiController.confirmTransactions));

export default router;
