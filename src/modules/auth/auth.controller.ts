import type { RequestHandler, Response } from "express";
import {
  REFRESH_COOKIE_NAME,
  attachTokensToCookie,
  clearTokensFromCookie,
  parseCookies,
} from "../../lib/cookie.js";
import { AppErrors } from "../../shared/erors/app.errors.js";
import { sendSuccess } from "../../shared/utils/sendResponse.js";
import { loginSchema, registerSchema } from "./auth.validation.js";
import * as authService from "./auth.service.js";
import type { AuthTokens } from "./auth.interface.js";

function setAuthCookies(
  res: Response,
  tokens: AuthTokens,
): void {
  attachTokensToCookie(res, tokens.accessToken, tokens.refreshToken);
}

export const register: RequestHandler = async (req, res) => {
  const input = registerSchema.parse(req.body);
  const result = await authService.register(input);
  setAuthCookies(res, result.tokens);
  return sendSuccess(
    res,
    { user: result.user, accessToken: result.tokens.accessToken },
    201,
  );
};

export const login: RequestHandler = async (req, res) => {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input);
  setAuthCookies(res, result.tokens);
  return sendSuccess(res, {
    user: result.user,
    accessToken: result.tokens.accessToken,
  });
};

export const refresh: RequestHandler = async (req, res) => {
  const refreshToken = parseCookies(req)[REFRESH_COOKIE_NAME];
  if (!refreshToken) {
    throw AppErrors.unauthorized("পুনরায় প্রবেশের জন্য সেশন কুকি প্রয়োজন");
  }

  const result = await authService.refresh(refreshToken);
  setAuthCookies(res, result.tokens);
  return sendSuccess(res, {
    user: result.user,
    accessToken: result.tokens.accessToken,
  });
};

export const me: RequestHandler = async (req, res) => {
  if (!req.user) {
    throw AppErrors.unauthorized();
  }
  const user = await authService.getUserById(req.user.userId);
  return sendSuccess(res, { user });
};

export const logout: RequestHandler = (_req, res) => {
  clearTokensFromCookie(res);
  return sendSuccess(res, { message: "সফলভাবে লগআউট হয়েছে" });
};