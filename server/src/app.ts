import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { appsRouter } from "./routes/apps.js";
import { authRouter } from "./routes/auth.js";
import { surveyRouter } from "./routes/survey.js";
/**
 * Builds and configures the Express application.
 * Kept separate from server startup so it can be imported in tests later.
 */
export function createApp(): Express {
  const app = express();

  // Security headers
  app.use(helmet());

  // Allow the frontend dev server to call the API
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    }),
  );

  // Parse JSON request bodies
  app.use(express.json());

  app.use("/api/apps", appsRouter);
  app.use("/api/auth", authRouter);
  app.use("/api", surveyRouter);
  // Health check — used to confirm the server is up.
  app.get("/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      service: "mhealth-recommender-server",
      timestamp: new Date().toISOString(),
    });
  });

  // Root — friendly landing response.
  app.get("/", (_req: Request, res: Response) => {
    res.json({
      message: "mHealth Recommender API",
      docs: "See /health for a status check.",
    });
  });

  return app;
}
