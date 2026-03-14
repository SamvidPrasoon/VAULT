import jwt, { SignOptions } from "jsonwebtoken";
import "dotenv/config";
import { getEnv } from "../utility/env.js";
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

const JWT_SECRET = getEnv("JWT_SECRET");
const JWT_REFRESH_SECRET = getEnv("JWT_REFRESH_SECRET");

const ACCESS_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ??
  "15m") as SignOptions["expiresIn"];

const REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN ??
  "7d") as SignOptions["expiresIn"];

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
  });
};


export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
};


export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};


export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
};
