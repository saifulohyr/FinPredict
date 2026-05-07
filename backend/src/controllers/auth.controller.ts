import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { supabase } from '../config/supabase';

const prisma = new PrismaClient();

/**
 * POST /api/auth/register
 * Manual registration via email & password.
 * Wraps Supabase signUp — the backend handles Supabase communication
 * so the frontend only needs to send { email, password, full_name }.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, full_name } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        status: 'error',
        message: 'Email and password are required.',
      });
      return;
    }

    // Register user via Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: full_name || null }, // Stored in user_metadata
      },
    });

    if (error) {
      res.status(400).json({
        status: 'error',
        message: error.message,
      });
      return;
    }

    if (!data.user) {
      res.status(400).json({
        status: 'error',
        message: 'Registration failed. Please try again.',
      });
      return;
    }

    // Create profile in our database (linked by Supabase UUID)
    const profile = await prisma.profile.create({
      data: {
        id: data.user.id,
        full_name: full_name || null,
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Registration successful.',
      data: {
        user: profile,
        access_token: data.session?.access_token || null,
        refresh_token: data.session?.refresh_token || null,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ register error:', message);
    res.status(500).json({ status: 'error', message });
  }
};

/**
 * POST /api/auth/login
 * Manual login via email & password.
 * Wraps Supabase signInWithPassword — returns access_token and profile data.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        status: 'error',
        message: 'Email and password are required.',
      });
      return;
    }

    // Authenticate via Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      res.status(401).json({
        status: 'error',
        message: error.message,
      });
      return;
    }

    // Sync profile: find or create in our database
    let profile = await prisma.profile.findUnique({
      where: { id: data.user.id },
    });

    if (!profile) {
      const metadata = data.user.user_metadata;
      profile = await prisma.profile.create({
        data: {
          id: data.user.id,
          full_name: metadata?.full_name || metadata?.name || null,
          avatar_url: metadata?.avatar_url || null,
        },
      });
    }

    res.json({
      status: 'success',
      message: 'Login successful.',
      data: {
        user: profile,
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ login error:', message);
    res.status(500).json({ status: 'error', message });
  }
};

/**
 * GET /api/auth/me
 * Retrieves the authenticated user's profile.
 * If the profile does not exist yet in our database, it is automatically
 * created (synced) using the metadata embedded in the Supabase JWT.
 * Used by both Google Login and Manual Login flows.
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const userId = user.sub;

    // Try to find existing profile
    let profile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    // Auto-sync: create profile on first access
    if (!profile) {
      const metadata = user.user_metadata;
      const fullName = metadata?.full_name || metadata?.name || null;
      const avatarUrl = metadata?.avatar_url || null;

      profile = await prisma.profile.create({
        data: {
          id: userId,
          full_name: fullName,
          avatar_url: avatarUrl,
        },
      });
    }

    res.json({
      status: 'success',
      data: profile,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ getMe error:', message);
    res.status(500).json({ status: 'error', message });
  }
};

/**
 * PUT /api/auth/profile
 * Updates the authenticated user's profile fields (full_name, avatar_url).
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const { full_name, avatar_url } = req.body;

    // Ensure user has a profile first
    const existing = await prisma.profile.findUnique({ where: { id: userId } });
    if (!existing) {
      res.status(404).json({
        status: 'error',
        message: 'Profile not found. Call GET /api/auth/me first to sync your profile.',
      });
      return;
    }

    const updated = await prisma.profile.update({
      where: { id: userId },
      data: {
        ...(full_name !== undefined && { full_name }),
        ...(avatar_url !== undefined && { avatar_url }),
      },
    });

    res.json({
      status: 'success',
      data: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ updateProfile error:', message);
    res.status(500).json({ status: 'error', message });
  }
};
