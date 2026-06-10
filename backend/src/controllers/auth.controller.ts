import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '../config/prisma';
import { supabase } from '../config/supabase';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

// POST /api/auth/register
// Creates a new user via Supabase Auth and syncs a profile to our DB.
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, full_name } = req.body;

    if (!email || !password) {
      res.status(400).json({
        status: 'error',
        message: 'Email and password are required.',
      });
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: full_name || null },
      },
    });

    if (error) {
      res.status(400).json({ status: 'error', message: error.message });
      return;
    }

    if (!data.user) {
      res.status(400).json({ status: 'error', message: 'Registration failed. Please try again.' });
      return;
    }

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
        user: { ...profile, email: data.user.email },
        access_token: data.session?.access_token || null,
        refresh_token: data.session?.refresh_token || null,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Auth] register error:', message);
    res.status(500).json({ status: 'error', message });
  }
};

// POST /api/auth/login
// Authenticates via Supabase and returns tokens + profile data.
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ status: 'error', message: 'Email and password are required.' });
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      res.status(401).json({ status: 'error', message: error.message });
      return;
    }

    // Find or create profile in our DB
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
        user: { ...profile, email: data.user.email },
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Auth] login error:', message);
    res.status(500).json({ status: 'error', message });
  }
};

// GET /api/auth/me
// Returns the current user's profile. Auto-creates if missing.
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const userId = user.sub;

    let profile = await prisma.profile.findUnique({
      where: { id: userId },
    });

    // Auto-create profile on first access
    if (!profile) {
      const metadata = user.user_metadata;
      profile = await prisma.profile.create({
        data: {
          id: userId,
          full_name: metadata?.full_name || metadata?.name || null,
          avatar_url: metadata?.avatar_url || null,
        },
      });
    }

    res.json({
      status: 'success',
      data: { ...profile, email: user.email },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Auth] getMe error:', message);
    res.status(500).json({ status: 'error', message });
  }
};

// PUT /api/auth/profile
// Updates full_name and/or avatar_url.
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const { full_name, avatar_url } = req.body;

    const existing = await prisma.profile.findUnique({ where: { id: userId } });
    if (!existing) {
      res.status(404).json({ status: 'error', message: 'Profile not found.' });
      return;
    }

    const updated = await prisma.profile.update({
      where: { id: userId },
      data: {
        ...(full_name !== undefined && { full_name }),
        ...(avatar_url !== undefined && { avatar_url }),
      },
    });

    res.json({ status: 'success', data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Auth] updateProfile error:', message);
    res.status(500).json({ status: 'error', message });
  }
};

// PUT /api/auth/credentials
// Updates email or password. Verifies current password before changing.
export const updateCredentials = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, current_password, new_password } = req.body;
    const authHeader = req.headers.authorization;
    const userEmail = req.user?.email;

    if (!authHeader) {
      res.status(401).json({ status: 'error', message: 'Missing token' });
      return;
    }

    if (new_password) {
      if (!current_password) {
        res.status(400).json({ status: 'error', message: 'Current password is required to set a new password.' });
        return;
      }

      // Disposable client to verify password without polluting shared state
      const verifyClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false }
      });

      const { error: signInError } = await verifyClient.auth.signInWithPassword({
        email: userEmail as string,
        password: current_password,
      });

      if (signInError) {
        res.status(400).json({ status: 'error', message: 'Current password is incorrect.' });
        return;
      }
    }

    // User-scoped client for the actual update
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const updates: any = {};
    if (email && email !== userEmail) updates.email = email;
    if (new_password) updates.password = new_password;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ status: 'error', message: 'No changes provided.' });
      return;
    }

    const { data, error } = await userClient.auth.updateUser(updates);

    if (error) {
      res.status(400).json({ status: 'error', message: error.message });
      return;
    }

    res.json({
      status: 'success',
      message: email && email !== userEmail
        ? 'Pembaruan berhasil. Silakan periksa email Anda (lama & baru) untuk verifikasi.'
        : 'Password berhasil diperbarui.',
      data: data.user
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Auth] updateCredentials error:', message);
    res.status(500).json({ status: 'error', message });
  }
};

// POST /api/auth/avatar
// Uploads avatar to Supabase Storage and updates the profile.
export const uploadAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = (req as any).file;
    const userId = req.user!.sub;
    const authHeader = req.headers.authorization;

    if (!file) {
      res.status(400).json({ status: 'error', message: 'No file provided.' });
      return;
    }

    if (!authHeader) {
      res.status(401).json({ status: 'error', message: 'Missing token' });
      return;
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const ext = file.originalname.split('.').pop() || 'png';
    const filename = `${userId}-${Date.now()}.${ext}`;

    const { data, error } = await userClient.storage
      .from('avatars')
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) {
      console.error('[Auth] Avatar upload failed:', error);
      res.status(400).json({ status: 'error', message: 'Upload failed: ' + error.message });
      return;
    }

    const { data: { publicUrl } } = userClient.storage.from('avatars').getPublicUrl(filename);

    const updated = await prisma.profile.update({
      where: { id: userId },
      data: { avatar_url: publicUrl },
    });

    res.json({ status: 'success', message: 'Avatar uploaded successfully', data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Auth] uploadAvatar error:', message);
    res.status(500).json({ status: 'error', message });
  }
};

// GET /api/auth/settings
export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: {
        ai_enabled: true,
        notif_high_spending: true,
        notif_low_balance: true,
      },
    });

    if (!profile) {
      res.status(404).json({ status: 'error', message: 'Profile not found.' });
      return;
    }

    res.json({ status: 'success', data: profile });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Auth] getSettings error:', message);
    res.status(500).json({ status: 'error', message });
  }
};

// PUT /api/auth/settings
export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const { ai_enabled, notif_high_spending, notif_low_balance } = req.body;

    const existing = await prisma.profile.findUnique({ where: { id: userId } });
    if (!existing) {
      res.status(404).json({ status: 'error', message: 'Profile not found.' });
      return;
    }

    const updated = await prisma.profile.update({
      where: { id: userId },
      data: {
        ...(ai_enabled !== undefined && { ai_enabled: Boolean(ai_enabled) }),
        ...(notif_high_spending !== undefined && { notif_high_spending: Boolean(notif_high_spending) }),
        ...(notif_low_balance !== undefined && { notif_low_balance: Boolean(notif_low_balance) }),
      },
      select: {
        ai_enabled: true,
        notif_high_spending: true,
        notif_low_balance: true,
      },
    });

    res.json({ status: 'success', data: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Auth] updateSettings error:', message);
    res.status(500).json({ status: 'error', message });
  }
};

// POST /api/auth/refresh
// Uses a refresh_token to get new access + refresh tokens.
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      res.status(400).json({ status: 'error', message: 'refresh_token is required.' });
      return;
    }

    // Disposable client to avoid polluting shared state
    const refreshClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data, error } = await refreshClient.auth.refreshSession({ refresh_token });

    if (error || !data.session) {
      res.status(401).json({ status: 'error', message: error?.message || 'Failed to refresh session.' });
      return;
    }

    // Sync profile if needed
    let profile = await prisma.profile.findUnique({
      where: { id: data.user!.id },
    });

    if (!profile) {
      const metadata = data.user!.user_metadata;
      profile = await prisma.profile.create({
        data: {
          id: data.user!.id,
          full_name: metadata?.full_name || metadata?.name || null,
          avatar_url: metadata?.avatar_url || null,
        },
      });
    }

    res.json({
      status: 'success',
      message: 'Token refreshed successfully.',
      data: {
        user: { ...profile, email: data.user!.email },
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Auth] refreshToken error:', message);
    res.status(500).json({ status: 'error', message });
  }
};
