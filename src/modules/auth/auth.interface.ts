import type { BusinessType } from "../../generated/client/enums.js";

export interface AuthUser {
  id: string;
  name: string;
  shopName: string;
  businessType: BusinessType;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthTokenPayload {
  userId: string;
  tokenType: "access" | "refresh";
}

export type { BusinessType };
