import { Router, Request, Response } from "express";
import authRoutes from "./auth.routes";

const router = Router();

// Auth routes
router.use("/auth", authRoutes);

// Health check
router.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "FinPredict API is running",
    timestamp: new Date().toISOString(),
  });
});

export { router };
