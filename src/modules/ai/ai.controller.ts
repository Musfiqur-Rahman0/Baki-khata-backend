import type { RequestHandler } from "express";
import { requireShopOwnerId } from "../../shared/utils/requireShopOwnerId.js";
import { sendSuccess } from "../../shared/utils/sendResponse.js";
import { confirmTransactionsRequestSchema, parseTransactionRequestSchema } from "./ai.validation.js";
import * as aiService from "./ai.service.js";

export const parseTransaction: RequestHandler = async (req, res) => {
  const { text } = parseTransactionRequestSchema.parse(req.body);
  const draft = await aiService.parseNaturalLanguageTransaction(requireShopOwnerId(req), text);
  return sendSuccess(res, draft);
};

export const confirmTransactions: RequestHandler = async (req, res) => {
  const input = confirmTransactionsRequestSchema.parse(req.body);
  const result = await aiService.confirmAndSaveTransactions(requireShopOwnerId(req), input);
  return sendSuccess(res, result, 201);
};
