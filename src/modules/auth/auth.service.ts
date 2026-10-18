import bcrypt from "bcrypt";
import jwt, { JsonWebTokenError, type JwtPayload } from "jsonwebtoken";
import { Prisma } from "../../generated/client/client.js";
import config from "../../config/index.js";
import { prisma } from "../../lib/prisma.js";
import { AppErrors } from "../../shared/erors/app.errors.js";
import type { LoginInput, RegisterInput } from "./auth.validation.js";
import type { AuthTokenPayload, AuthTokens, AuthUser } from "./auth.interface.js";

const ACCESS_TOKEN_SECONDS = 60 * 60;
const REFRESH_TOKEN_SECONDS = 60 * 60 * 24 * 7;
const JWT_ISSUER = "baki-khata-api";

function getJwtSecret(): string {
  if (!config.JWT_SECRET) {
    throw new Error("JWT_SECRET কনফিগার করা নেই");
  }
  return config.JWT_SECRET;
}

function signToken(
  user: Pick<AuthUser, "id">,
  tokenType: AuthTokenPayload["tokenType"],
  expiresIn: number,
): string {
  return jwt.sign(
    { userId: user.id, tokenType },
    getJwtSecret(),
    { algorithm: "HS256", expiresIn, issuer: JWT_ISSUER },
  );
}

export function createAuthTokens(
  user: Pick<AuthUser, "id">,
): AuthTokens {
  return {
    accessToken: signToken(user, "access", ACCESS_TOKEN_SECONDS),
    refreshToken: signToken(user, "refresh", REFRESH_TOKEN_SECONDS),
  };
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  let decoded: JwtPayload & Partial<AuthTokenPayload>;
  try {
    decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
    }) as JwtPayload & Partial<AuthTokenPayload>;
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw AppErrors.unauthorized("সেশনটির মেয়াদ শেষ হয়েছে অথবা টোকেনটি সঠিক নয়");
    }
    throw error;
  }

  if (
    typeof decoded.userId !== "string" ||
    (decoded.tokenType !== "access" && decoded.tokenType !== "refresh")
  ) {
    throw AppErrors.unauthorized("টোকেনটি সঠিক নয়");
  }

  return {
    userId: decoded.userId,
    tokenType: decoded.tokenType,
  };
}

export async function register(input: RegisterInput): Promise<{
  user: AuthUser;
  tokens: AuthTokens;
}> {
  const pinHash = await bcrypt.hash(input.pin, 12);

  try {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        shopName: input.shopName,
        businessType: input.businessType,
        phone: input.phone,
        pinHash,
      },
      select: {
        id: true,
        name: true,
        shopName: true,
        businessType: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { user, tokens: createAuthTokens(user) };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw AppErrors.conflict("এই মোবাইল নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট খোলা হয়েছে");
    }
    throw error;
  }
}

export async function login(input: LoginInput): Promise<{
  user: AuthUser;
  tokens: AuthTokens;
}> {
  const user = await prisma.user.findUnique({
    where: { phone: input.phone },
    select: {
      id: true,
      name: true,
      shopName: true,
      businessType: true,
      phone: true,
      pinHash: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user?.pinHash || !(await bcrypt.compare(input.pin, user.pinHash))) {
    throw AppErrors.unauthorized("মোবাইল নম্বর অথবা পিন সঠিক নয়");
  }

  const { pinHash: _pinHash, ...safeUser } = user;
  return { user: safeUser, tokens: createAuthTokens(user) };
}

export async function refresh(
  token: string,
): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  const payload = verifyAuthToken(token);
  if (payload.tokenType !== "refresh") {
    throw AppErrors.unauthorized("রিফ্রেশ টোকেনটি সঠিক নয়");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      shopName: true,
      businessType: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw AppErrors.unauthorized("রিফ্রেশ টোকেনটি সঠিক নয়");
  }

  return { user, tokens: createAuthTokens(user) };
}

export async function getUserById(userId: string): Promise<AuthUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      shopName: true,
      businessType: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw AppErrors.unauthorized("এই ব্যবহারকারীর অ্যাকাউন্টটি আর নেই");
  }
  return user;
}
