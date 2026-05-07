import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, full_name } = req.body;
    
    // In this basic setup, we use Profile for users since Transaction/Budget use user_id (UUID)
    // For a real app, you'd have a User model. Let's assume Profile is the user for now.
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if profile exists (using email as a proxy if we had it, but let's just create)
    const profile = await prisma.profile.create({
      data: {
        id: crypto.randomUUID(),
        full_name,
        // Since we don't have email in Profile, this is a placeholder logic
        // Ideally Profile and User are separate.
      },
    });

    const token = jwt.sign({ id: profile.id }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ user: profile, token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { id } = req.body; // Simple login by ID for now to test connection
    
    const profile = await prisma.profile.findUnique({
      where: { id },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const token = jwt.sign({ id: profile.id }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ user: profile, token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  // Placeholder for authenticated user
  res.json({ message: 'Auth working' });
};
