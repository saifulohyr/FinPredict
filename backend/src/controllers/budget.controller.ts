import { Request, Response } from 'express';
import * as budgetService from '../services/budget.service';
import { z } from 'zod';

const upsertBudgetSchema = z.object({
  category_id: z.number().int().positive('category_id must be a positive integer'),
  monthly_limit: z.number().min(0, 'monthly_limit must be >= 0'),
  month_year: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
});

export const getBudgets = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const { month_year } = req.query;
    
    let targetDate: Date | undefined;
    if (month_year) {
      targetDate = new Date(month_year as string);
    }

    const budgets = await budgetService.getBudgets(userId, targetDate);
    res.json({
      status: 'success',
      data: budgets,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Budget] getBudgets error:', message);
    res.status(500).json({ status: 'error', message });
  }
};

export const upsertBudget = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const validatedData = upsertBudgetSchema.parse(req.body);

    const budget = await budgetService.upsertBudget(
      userId,
      validatedData.category_id,
      validatedData.monthly_limit,
      new Date(validatedData.month_year)
    );

    res.status(201).json({
      status: 'success',
      data: budget,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: error.errors });
      return;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('not found')) {
      res.status(404).json({ status: 'error', message });
      return;
    }
    console.error('[Budget] upsertBudget error:', message);
    res.status(500).json({ status: 'error', message });
  }
};

export const getBudgetStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const { month_year } = req.query;

    let targetDate: Date | undefined;
    if (month_year) {
      targetDate = new Date(month_year as string);
    }

    const status = await budgetService.getBudgetStatus(userId, targetDate);
    res.json({
      status: 'success',
      data: status,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Budget] getBudgetStatus error:', message);
    res.status(500).json({ status: 'error', message });
  }
};
