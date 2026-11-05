import type { RequestHandler } from "express";
import { sendSuccess } from "../../shared/utils/sendResponse.js";
import { requireShopOwnerId } from "../../shared/utils/requireShopOwnerId.js";
import * as pushService from "./push.service.js";
import {
  subscribePushSchema,
  unsubscribePushSchema,
} from "./push.validation.js";

export const subscribe: RequestHandler = async (req, res) => {
  const result = await pushService.savePushSubscription(
    requireShopOwnerId(req),
    subscribePushSchema.parse(req.body),
  );
  return sendSuccess(res, result, 201);
};

export const unsubscribe: RequestHandler = async (req, res) => {
  const { endpoint } = unsubscribePushSchema.parse(req.body);
  const result = await pushService.removePushSubscription(
    requireShopOwnerId(req),
    endpoint,
  );
  return sendSuccess(res, result);
};