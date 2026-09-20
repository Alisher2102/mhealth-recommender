import { Router, type Request, type Response } from "express";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { authGuard } from "../middleware/authGuard.js";

export const authRouter = Router();

authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body ?? {};
    if (typeof email !== "string" || typeof password !== "string") {
      return res
        .status(400)
        .json({ error: { message: "Email and password are required" } });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    const passwordOk = admin
      ? await bcrypt.compare(password, admin.passwordHash)
      : false;

    if (!admin || !passwordOk) {
      return res
        .status(401)
        .json({ error: { message: "Invalid email or password" } });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not set");
      return res
        .status(500)
        .json({ error: { message: "Server auth is misconfigured" } });
    }

    const signOptions: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN ??
        "2h") as SignOptions["expiresIn"],
    };

    const token = jwt.sign(
      { sub: admin.id, email: admin.email },
      secret,
      signOptions,
    );
    return res.json({ token });
  } catch (err) {
    console.error("Login failed", err);
    return res.status(500).json({ error: { message: "Login failed" } });
  }
});
authRouter.get("/me", authGuard, (req: Request, res: Response) => {
  res.json({ auth: req.auth });
});
