import { Response } from "express";
import { ErrorCode } from "../erors/app.errors";
import { ApiErrorResponse } from "./api.interface";

export function sendError(
  res: Response,
  statusCode: number,
  code: ErrorCode,
  message: string,
  details?: unknown,
): Response {
  const body: ApiErrorResponse = {
    success: false,
    error: { code, message, ...(details !== undefined && { details }) },
  };
  return res.status(statusCode).json(body);
}
