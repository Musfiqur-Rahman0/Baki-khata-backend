import type { Request } from "express";
import { AppErrors } from "../erors/app.errors.js";

export function requireShopOwnerId(req: Request): string {
  if (!req.user) throw AppErrors.unauthorized();
  return req.user.userId;
}
