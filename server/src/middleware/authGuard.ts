import { captureRejectionSymbol } from "events";
import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthPayload {
  sub: string;
  email: string;
}

export function authGuard(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({
        error: { message: "Missing or malformed Authorization header" },
      });
  }
  const token = header.slice("Bearer ".length);

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("JWT_SECRET is not set");
    return res
      .status(500)
      .json({ error: { message: "Server auth is misconfigured" } });
  }
  try {
    const payload = jwt.verify(token, secret) as AuthPayload;
    req.auth = payload;
    next();
  } catch {
    return res
      .status(401)
      .json({ error: { message: "Invalid or expired token" } });
  }
}
