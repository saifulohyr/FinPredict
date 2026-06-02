import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { supabase } from '../config/supabase';

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
        user: { ...profile, email: data.user.email },
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
        user: { ...profile, email: data.user.email },
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
      data: { ...profile, email: user.email },
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

/**
 * PUT /api/auth/credentials
 * Updates the user's email or password.
 * Requires verification of current password.
 */
export const updateCredentials = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, current_password, new_password } = req.body;
    const authHeader = req.headers.authorization;
    const userEmail = req.user?.email;

    if (!authHeader) {
      res.status(401).json({ status: 'error', message: 'Missing token' });
      return;
    }

    // Verify current password first if updating password
    if (new_password) {
      if (!current_password) {
        res.status(400).json({ status: 'error', message: 'Current password is required to set a new password.' });
        return;
      }
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail as string,
        password: current_password,
      });

      if (signInError) {
        res.status(400).json({ status: 'error', message: 'Current password is incorrect.' });
        return;
      }
    }

    // Create a user-scoped client
    const { createClient } = require('@supabase/supabase-js');
    const userClient = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '', {
      global: { headers: { Authorization: authHeader } }
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
      message: email && email !== userEmail ? 'Pembaruan berhasil. Silakan periksa email Anda (lama & baru) untuk verifikasi.' : 'Password berhasil diperbarui.',
      data: data.user
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ updateCredentials error:', message);
    res.status(500).json({ status: 'error', message });
  }
};

/**
 * POST /api/auth/avatar
 * Uploads an avatar image to Supabase Storage and updates the user's profile.
 */
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

    const { createClient } = require('@supabase/supabase-js');
    const userClient = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_ANON_KEY || '', {
      global: { headers: { Authorization: authHeader } }
    });

    // Extract extension
    const ext = file.originalname.split('.').pop() || 'png';
    const filename = `${userId}-${Date.now()}.${ext}`;

    const { data, error } = await userClient.storage
      .from('avatars')
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) {
      console.error('Supabase upload error:', error);
      res.status(400).json({ status: 'error', message: 'Gagal upload ke Supabase: ' + error.message });
      return;
    }

    // Get public URL
    const { data: { publicUrl } } = userClient.storage.from('avatars').getPublicUrl(filename);

    // Update Profile DB
    const updated = await prisma.profile.update({
      where: { id: userId },
      data: { avatar_url: publicUrl },
    });

    res.json({
      status: 'success',
      message: 'Avatar uploaded successfully',
      data: updated
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ uploadAvatar error:', message);
    res.status(500).json({ status: 'error', message });
  }
};
