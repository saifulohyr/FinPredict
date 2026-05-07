import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Shape of the decoded Supabase JWT payload stored in req.user.
 */
export interface SupabaseJwtPayload {
  /** Supabase user UUID */
  sub: string;
  email?: string;
  /** user_metadata from Supabase (contains full_name, avatar_url, etc.) */
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    name?: string;
    [key: string]: unknown;
  };
  iat?: number;
  exp?: number;
}

// Extend Express Request to include user payload
declare global {
  namespace Express {
    interface Request {
      user?: SupabaseJwtPayload;
    }
  }
}

const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET || '';

/**
 * Middleware that validates the Supabase JWT from the Authorization header.
 * On success it attaches the decoded payload to `req.user`.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: 'error',
        message: 'Missing or invalid Authorization header. Expected: Bearer <token>',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!SUPABASE_JWT_SECRET) {
      console.error('❌ SUPABASE_JWT_SECRET is not configured in environment variables.');
      res.status(500).json({
        status: 'error',
        message: 'Server authentication is not configured.',
      });
      return;
    }

    const decoded = jwt.verify(token, SUPABASE_JWT_SECRET) as SupabaseJwtPayload;

    req.user = decoded;
    next();
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ status: 'error', message: 'Token has expired.' });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ status: 'error', message: 'Invalid token.' });
      return;
    }

    res.status(500).json({ status: 'error', message: 'Authentication failed.' });
  }
};
