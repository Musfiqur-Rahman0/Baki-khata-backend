import type { Request, Response } from "express";

export const ACCESS_COOKIE_NAME = "access_token";
export const REFRESH_COOKIE_NAME = "refresh_token";

export const parseCookies = (req: Request): Record<string, string> => {
  const raw = req.headers.cookie ?? "";
  const cookies: Record<string, string> = {};

  raw.split(";").forEach((part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) return;
    cookies[key] = decodeURIComponent(rest.join("=") ?? "");
  });

  return cookies;
};

export const attachTokensToCookie = (res: Response, accessToken: string, refreshToken: string) => {
  const accessCookie = serializeCookie(ACCESS_COOKIE_NAME, accessToken, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 60 * 60 , // 1h
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  const refreshCookie = serializeCookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  res.setHeader("Set-Cookie", [accessCookie, refreshCookie]);
};

export const clearTokensFromCookie = (res: Response) => {
  const accessCookie = serializeCookie(ACCESS_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    expires: new Date(0),
  });

  const refreshCookie = serializeCookie(REFRESH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    expires: new Date(0),
  });

  res.setHeader("Set-Cookie", [accessCookie, refreshCookie]);
};

function serializeCookie(
  name: string,
  value: string,
  options: {
    httpOnly?: boolean;
    sameSite?: "lax" | "strict" | "none";
    maxAge?: number;
    path?: string;
    secure?: boolean;
    expires?: Date;
  },
) {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (options.httpOnly) parts.push("HttpOnly");
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.secure) parts.push("Secure");
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);

  return parts.join(";");
}