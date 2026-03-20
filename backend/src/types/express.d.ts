// backend/src/types/express.d.ts
// Extiende el tipo Request de Express globalmente
// Así todos los controllers pueden usar req.userId sin "as any"

import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}
