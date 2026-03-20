import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Token no proporcionado" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    // ✅ req.userId tipado globalmente — sin "as any"
    req.userId = decoded.userId;
    next();
  } catch (e) {
    res.status(401).json({ message: "Token inválido o expirado" });
  }
};

export default authMiddleware;
