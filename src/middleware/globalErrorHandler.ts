import type { NextFunction, Request, Response } from "express";
import { normalizeError } from "../shared/erors/normalize.error";
import { sendError } from "../shared/utils/sendError";



export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  const normalized = normalizeError(err);

  if (!normalized.isOperational) {
    console.error("[Unhandled error]", err);
  } else if (normalized.statusCode >= 500) {
    console.error(
      "[Server error]",
      normalized.code,
      normalized.message,
      normalized.details,
    );
  }

  return sendError(
    res,
    normalized.statusCode,
    normalized.code,
    normalized.message,
    normalized.details,
  );
}