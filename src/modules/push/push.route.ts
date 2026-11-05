import { Router } from "express";
import { authenticate } from "../../middleware/authMiddleware.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import * as pushController from "./push.controller.js";

const router = Router();

router.use(authenticate);
router.post("/subscribe", asyncHandler(pushController.subscribe));
router.post("/unsubscribe", asyncHandler(pushController.unsubscribe));

export default router;