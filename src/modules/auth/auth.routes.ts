import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AppErrors } from "../../shared/erors/app.errors.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import * as authController from "./auth.controller.js";
import { authenticate } from "../../middleware/authMiddleware.js";

const router = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(AppErrors.tooManyRequests("অনেকবার লগইন চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।"));
  },
});

router.post("/register", asyncHandler(authController.register));
router.post("/login", loginLimiter, asyncHandler(authController.login));
router.post("/refresh", asyncHandler(authController.refresh));
router.get("/me", authenticate, asyncHandler(authController.me));
router.post("/logout", authController.logout);

export default router;
