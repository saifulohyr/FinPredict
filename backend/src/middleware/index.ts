import { Request, Response, NextFunction } from "express";

// 404 Not Found Handler
export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
};

// Global Error Handler
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("❌ Error:", err.message);

  res.status(500).json({
    status: "error",
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
};
