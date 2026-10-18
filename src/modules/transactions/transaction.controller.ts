import type { RequestHandler } from "express";
import { requireShopOwnerId } from "../../shared/utils/requireShopOwnerId.js";
import { sendSuccess } from "../../shared/utils/sendResponse.js";
import * as transactionService from "./transaction.service.js";
import {
  createTransactionSchema,
  customerLedgerParamsSchema,
  transactionIdParamsSchema,
  transactionListQuerySchema,
} from "./transaction.validation.js";

export const create: RequestHandler = async (req, res) => {
  const transaction = await transactionService.createTransaction(
    requireShopOwnerId(req),
    createTransactionSchema.parse(req.body),
  );
  return sendSuccess(res, transaction, 201);
};

export const list: RequestHandler = async (req, res) => {
  const result = await transactionService.listTransactions(
    requireShopOwnerId(req),
    transactionListQuerySchema.parse(req.query),
  );
  return sendSuccess(res, result.transactions, 200, {
    pagination: result.pagination,
  });
};

export const get: RequestHandler = async (req, res) => {
  const { transactionId } = transactionIdParamsSchema.parse(req.params);
  const transaction = await transactionService.getTransaction(
    requireShopOwnerId(req),
    transactionId,
  );
  return sendSuccess(res, transaction);
};

export const customerLedger: RequestHandler = async (req, res) => {
  const { customerId } = customerLedgerParamsSchema.parse(req.params);
  const { page, limit } = transactionListQuerySchema.parse(req.query);
  const result = await transactionService.getCustomerLedger(
    requireShopOwnerId(req),
    customerId,
    page,
    limit,
  );
  return sendSuccess(res, result, 200, {
    pagination: result.pagination,
  });
};