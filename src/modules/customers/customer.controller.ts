import type { RequestHandler } from "express";
import { sendSuccess } from "../../shared/utils/sendResponse.js";
import { requireShopOwnerId } from "../../shared/utils/requireShopOwnerId.js";
import * as customerService from "./customer.service.js";
import {
  createCustomerSchema,
  customerIdParamsSchema,
  customerListQuerySchema,
  updateCustomerSchema,
} from "./customer.validation.js";

export const create: RequestHandler = async (req, res) => {
  const customer = await customerService.createCustomer(
    requireShopOwnerId(req),
    createCustomerSchema.parse(req.body),
  );
  return sendSuccess(res, customer, 201);
};

export const list: RequestHandler = async (req, res) => {
  const result = await customerService.listCustomers(
    requireShopOwnerId(req),
    customerListQuerySchema.parse(req.query),
  );
  return sendSuccess(res, result.customers, 200, {
    pagination: result.pagination,
  });
};

export const get: RequestHandler = async (req, res) => {
  const { customerId } = customerIdParamsSchema.parse(req.params);
  const customer = await customerService.getCustomer(
    requireShopOwnerId(req),
    customerId,
  );
  return sendSuccess(res, customer);
};

export const update: RequestHandler = async (req, res) => {
  const { customerId } = customerIdParamsSchema.parse(req.params);
  const customer = await customerService.updateCustomer(
    requireShopOwnerId(req),
    customerId,
    updateCustomerSchema.parse(req.body),
  );
  return sendSuccess(res, customer);
};

export const archive: RequestHandler = async (req, res) => {
  const { customerId } = customerIdParamsSchema.parse(req.params);
  const result = await customerService.archiveCustomer(
    requireShopOwnerId(req),
    customerId,
  );
  return sendSuccess(res, result);
};

export const restore: RequestHandler = async (req, res) => {
  const { customerId } = customerIdParamsSchema.parse(req.params);
  const result = await customerService.restoreCustomer(
    requireShopOwnerId(req),
    customerId,
  );
  return sendSuccess(res, result);
};