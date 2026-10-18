import { Prisma } from "../../generated/client/client.js";
import { ZodError } from "zod";
import { AppError, ErrorCode } from "./app.errors.js";

export interface NormalizedError {
  statusCode: number;
  code: ErrorCode;
  message: string;
  details?: unknown;
  isOperational: boolean;
}

function formatZodDetails(error: ZodError): Record<string, string[]> {
  const details: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.length > 0 ? issue.path.join(".") : "_root";
    if (!details[path]) details[path] = [];
    details[path].push(issue.message);
  }
  return details;
}

function normalizePrismaError(
  error: Prisma.PrismaClientKnownRequestError,
): NormalizedError {
  switch (error.code) {
    case "P2002": {
      const fields =
        (error.meta?.target as string[] | undefined)?.join(", ") ?? "field";
      return {
        statusCode: 409,
        code: "CONFLICT",
        message: `A record with this ${fields} already exists`,
        details: { fields: error.meta?.target },
        isOperational: true,
      };
    }
    case "P2003":
      return {
        statusCode: 400,
        code: "DATABASE_ERROR",
        message: "Related record not found",
        details: { field: error.meta?.field_name },
        isOperational: true,
      };
    case "P2025":
      return {
        statusCode: 404,
        code: "NOT_FOUND",
        message: "Record not found",
        isOperational: true,
      };
    default:
      return {
        statusCode: 500,
        code: "DATABASE_ERROR",
        message: "Database operation failed",
        details:
          process.env.NODE_ENV === "development"
            ? { prismaCode: error.code }
            : undefined,
        isOperational: true,
      };
  }
}

function normalizePrismaValidationError(
  error: Prisma.PrismaClientValidationError,
): NormalizedError {
  return {
    statusCode: 400,
    code: "VALIDATION_ERROR",
    message: "Invalid data sent to database",
    details:
      process.env.NODE_ENV === "development"
        ? { hint: error.message.split("\n").slice(-1)[0] }
        : undefined,
    isOperational: true,
  };
}

/** Map any thrown value to a safe, client-ready error shape. */
export function normalizeError(err: unknown): NormalizedError {
  if (err instanceof AppError) {
    return {
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
      details: err.details,
      isOperational: err.isOperational,
    };
  }

  if (err instanceof ZodError) {
    return {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      message: "Invalid input",
      details: formatZodDetails(err),
      isOperational: true,
    };
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return normalizePrismaError(err);
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return normalizePrismaValidationError(err);
  }

  if (err instanceof SyntaxError && err.message.includes("JSON")) {
    return {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      message: "Invalid JSON in request body",
      isOperational: true,
    };
  }

  if (err instanceof Error) {
    return {
      statusCode: 500,
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
      details:
        process.env.NODE_ENV === "development"
          ? { name: err.name, stack: err.stack }
          : undefined,
      isOperational: false,
    };
  }

  return {
    statusCode: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
    isOperational: false,
  };
}
