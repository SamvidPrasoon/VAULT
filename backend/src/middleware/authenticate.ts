import { Request, Response, NextFunction } from "express";
import { TokenPayload, verifyAccessToken } from "../services/tokenService.js";
export type authRequest = Request & { user?: TokenPayload };
export const authenticate = (
  req: authRequest,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "No token provided" });
    return;
  }
  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
