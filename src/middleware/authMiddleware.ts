import { NextFunction, Request, Response } from "express";
import { ACCESS_COOKIE_NAME, parseCookies } from "../lib/cookie.js";
import { verifyAuthToken } from "../modules/auth/auth.service.js";
import { AppErrors } from "../shared/erors/app.errors.js";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authorization = req.get("authorization");
  const bearerToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  const token = bearerToken ?? parseCookies(req)[ACCESS_COOKIE_NAME];

  if (!token) {
    return next(AppErrors.unauthorized());
  }

  try {
    const payload = verifyAuthToken(token);
    if (payload.tokenType !== "access") {
      return next(AppErrors.unauthorized("অ্যাক্সেস টোকেনটি সঠিক নয়"));
    }

    req.user = { userId: payload.userId };
    return next();
  } catch (error) {
    return next(error);
  }
};
