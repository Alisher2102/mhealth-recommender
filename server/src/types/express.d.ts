import { type AuthPayload } from "../middleware/authGuard.ts";

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}
export {};
