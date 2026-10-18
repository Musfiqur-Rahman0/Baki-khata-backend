import { Router } from "express";
import { authenticate } from "../../middleware/authMiddleware.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import * as customerController from "./customer.controller.js";

const router = Router();

router.use(authenticate);
router
  .route("/")
  .post(asyncHandler(customerController.create))
  .get(asyncHandler(customerController.list));
router
  .route("/:customerId")
  .get(asyncHandler(customerController.get))
  .patch(asyncHandler(customerController.update))
  .delete(asyncHandler(customerController.archive));
router.post("/:customerId/restore", asyncHandler(customerController.restore));

export default router;