import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

// Shape of the decoded Supabase JWT payload stored in req.user
export interface SupabaseJwtPayload {
  sub: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    name?: string;
    [key: string]: unknown;
  };
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: SupabaseJwtPayload;
    }
  }
}

// Validates the Supabase JWT from the Authorization header.
// On success, attaches the user payload to req.user.
export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      console.error('[Auth] Token validation failed:', error?.message);
      res.status(401).json({ status: 'error', message: 'Invalid token.' });
      return;
    }

    req.user = {
      sub: data.user.id,
      email: data.user.email,
      user_metadata: data.user.user_metadata,
    };

    next();
  } catch (error: unknown) {
    console.error('[Auth] Middleware error:', error);
    res.status(500).json({ status: 'error', message: 'Authentication failed.' });
  }
};
