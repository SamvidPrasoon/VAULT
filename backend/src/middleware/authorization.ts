import { Response, NextFunction } from "express";
import { authRequest } from "./authenticate";

export const authorize = (...roles: string[]) => {
  return (req: authRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    next();
  };
};
