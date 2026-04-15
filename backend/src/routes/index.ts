import { Router, Request, Response } from "express";

const router = Router();

// Health check
router.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "FinPredict API is running",
    timestamp: new Date().toISOString(),
  });
});

export { router };
