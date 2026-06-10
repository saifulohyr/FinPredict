import { Request, Response } from 'express';
import * as categoryService from '../services/category.service';

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({
      status: 'success',
      data: categories,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Category] getAllCategories error:', message);
    res.status(500).json({ status: 'error', message });
  }
};
