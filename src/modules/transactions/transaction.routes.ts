import { Router } from "express";
import { authenticate } from "../../middleware/authMiddleware.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import * as transactionController from "./transaction.controller.js";

const router = Router();

router.use(authenticate);
router
  .route("/")
  .post(asyncHandler(transactionController.create))
  .get(asyncHandler(transactionController.list));
router.get(
  "/customer/:customerId",
  asyncHandler(transactionController.customerLedger),
);
router.get("/:transactionId", asyncHandler(transactionController.get));

export default router;