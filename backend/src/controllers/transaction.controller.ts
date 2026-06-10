import { Request, Response } from 'express';
import * as transactionService from '../services/transaction.service';
import { z } from 'zod';

const createTransactionSchema = z.object({
  category_id: z.number().int().positive('category_id must be a positive integer'),
  amount: z.number().positive('amount must be greater than 0'),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
  description: z.string().max(500).optional(),
});

const updateTransactionSchema = createTransactionSchema.partial();

export const createTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const validatedData = createTransactionSchema.parse(req.body);

    const transaction = await transactionService.createTransaction(userId, validatedData);
    res.status(201).json({ status: 'success', data: transaction });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: error.errors });
      return;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Transaction] createTransaction error:', message);
    res.status(500).json({ status: 'error', message });
  }
};

export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const filters = {
      category_id: req.query.category_id as string | undefined,
      type: req.query.type as string | undefined,
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
    };
    const transactions = await transactionService.getTransactions(userId, filters);
    res.json({ status: 'success', data: transactions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Transaction] getTransactions error:', message);
    res.status(500).json({ status: 'error', message });
  }
};

export const getTransactionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const id = req.params.id as string;
    const transaction = await transactionService.getTransactionById(userId, id);

    if (!transaction) {
      res.status(404).json({ status: 'error', message: 'Transaction not found' });
      return;
    }
    res.json({ status: 'success', data: transaction });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Transaction] getTransactionById error:', message);
    res.status(500).json({ status: 'error', message });
  }
};

export const updateTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const id = req.params.id as string;
    const validatedData = updateTransactionSchema.parse(req.body);

    const transaction = await transactionService.updateTransaction(userId, id, validatedData);
    res.json({ status: 'success', data: transaction });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ status: 'error', message: error.errors });
      return;
    }
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'Transaction not found') {
      res.status(404).json({ status: 'error', message });
      return;
    }
    console.error('[Transaction] updateTransaction error:', message);
    res.status(500).json({ status: 'error', message });
  }
};

export const deleteTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const id = req.params.id as string;

    await transactionService.deleteTransaction(userId, id);
    res.json({ status: 'success', message: 'Transaction deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'Transaction not found') {
      res.status(404).json({ status: 'error', message });
      return;
    }
    console.error('[Transaction] deleteTransaction error:', message);
    res.status(500).json({ status: 'error', message });
  }
};

export const getSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const month = req.query.month ? Number(req.query.month) : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;

    const summary = await transactionService.getSummary(userId, month, year);
    res.json({ status: 'success', data: summary });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Transaction] getSummary error:', message);
    res.status(500).json({ status: 'error', message });
  }
};

export const importFromCsv = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const { csvData } = req.body;

    if (!csvData || typeof csvData !== 'string') {
      res.status(400).json({ status: 'error', message: 'csvData must be a non-empty string' });
      return;
    }

    const result = await transactionService.importFromCsv(userId, csvData);
    res.json({
      status: 'success',
      message: `Successfully imported ${result.importedCount} transactions`,
      data: {
        importedCount: result.importedCount,
        errors: result.errors,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Transaction] importFromCsv error:', message);
    res.status(500).json({ status: 'error', message });
  }
};
