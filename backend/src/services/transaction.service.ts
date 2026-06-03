import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import { createNotification } from './notification.service';
// --- Type definitions ---
interface CreateTransactionInput {
  category_id: number;
  amount: number;
  transaction_date: string;
  description?: string;
}

interface UpdateTransactionInput {
  category_id?: number;
  amount?: number;
  transaction_date?: string;
  description?: string;
}

interface TransactionFilters {
  category_id?: string;
  type?: string;
  from?: string;
  to?: string;
}

// --- Service functions ---

export const createTransaction = async (userId: string, data: CreateTransactionInput) => {
  const transaction = await prisma.transaction.create({
    data: {
      user_id: userId,
      category_id: data.category_id,
      amount: data.amount,
      transaction_date: new Date(data.transaction_date),
      description: data.description || null,
    },
    include: {
      category: true,
    },
  });

  if (transaction.category.type === 'EXPENSE' && data.amount > 500000) {
    await createNotification(
      userId,
      'Pengeluaran Besar Terdeteksi',
      `Anda baru saja mencatat pengeluaran sebesar Rp ${data.amount.toLocaleString('id-ID')} untuk kategori ${transaction.category.name}.`,
      'WARNING'
    );
  }

  return transaction;
};

export const getTransactions = async (userId: string, filters: TransactionFilters = {}) => {
  const where: Prisma.TransactionWhereInput = { user_id: userId };

  if (filters.category_id) {
    where.category_id = Number(filters.category_id);
  }
  
  if (filters.type) {
    where.category = {
      type: filters.type as Prisma.EnumCategoryTypeFilter['equals'],
    };
  }

  if (filters.from || filters.to) {
    where.transaction_date = {};
    if (filters.from) where.transaction_date.gte = new Date(filters.from);
    if (filters.to) where.transaction_date.lte = new Date(filters.to);
  }

  return await prisma.transaction.findMany({
    where,
    include: {
      category: true,
    },
    orderBy: {
      transaction_date: 'desc',
    },
  });
};

export const getTransactionById = async (userId: string, id: string) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!transaction || transaction.user_id !== userId) {
    return null;
  }

  return transaction;
};

export const updateTransaction = async (userId: string, id: string, data: UpdateTransactionInput) => {
  const existing = await getTransactionById(userId, id);
  if (!existing) throw new Error('Transaction not found');

  const updateData: Prisma.TransactionUpdateInput = {};
  if (data.category_id !== undefined) updateData.category = { connect: { id: data.category_id } };
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.transaction_date !== undefined) updateData.transaction_date = new Date(data.transaction_date);
  if (data.description !== undefined) updateData.description = data.description;

  return await prisma.transaction.update({
    where: { id },
    data: updateData,
    include: { category: true },
  });
};

export const deleteTransaction = async (userId: string, id: string) => {
  const existing = await getTransactionById(userId, id);
  if (!existing) throw new Error('Transaction not found');

  await prisma.transaction.delete({
    where: { id },
  });
  return true;
};

export const getSummary = async (userId: string, month?: number, year?: number) => {
  const now = new Date();
  const targetMonth = month !== undefined ? month : now.getMonth() + 1;
  const targetYear = year !== undefined ? year : now.getFullYear();

  const startDate = new Date(targetYear, targetMonth - 1, 1);
  const endDate = new Date(targetYear, targetMonth, 0); // Last day of month

  const transactions = await prisma.transaction.findMany({
    where: {
      user_id: userId,
      transaction_date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      category: true,
    },
  });

  let totalIncome = 0;
  let totalExpense = 0;
  const expenseByCategory: Record<string, number> = {};
  const incomeByCategory: Record<string, number> = {};

  transactions.forEach((t) => {
    const amount = Number(t.amount);
    if (t.category.type === 'INCOME') {
      totalIncome += amount;
      incomeByCategory[t.category.name] = (incomeByCategory[t.category.name] || 0) + amount;
    } else {
      totalExpense += amount;
      expenseByCategory[t.category.name] = (expenseByCategory[t.category.name] || 0) + amount;
    }
  });

  return {
    month: targetMonth,
    year: targetYear,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    transactionCount: transactions.length,
    expenseByCategory,
    incomeByCategory,
  };
};

export const importFromCsv = async (userId: string, csvString: string) => {
  const records = parse(csvString, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  // Validate CSV has records
  if (!records || records.length === 0) {
    throw new Error('CSV file is empty or has no valid records');
  }

  // Expected CSV columns: date (YYYY-MM-DD), category_id, amount, description
  const errors: string[] = [];
  const validRecords: Array<{ date: string; category_id: number; amount: number; description: string | null }> = [];

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    if (!record.date || !record.category_id || !record.amount) {
      errors.push(`Row ${i + 1}: Missing required fields (date, category_id, amount)`);
      continue;
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(record.date)) {
      errors.push(`Row ${i + 1}: Invalid date format. Expected YYYY-MM-DD`);
      continue;
    }

    if (isNaN(Number(record.amount)) || Number(record.amount) < 0) {
      errors.push(`Row ${i + 1}: Invalid amount`);
      continue;
    }

    validRecords.push({
      date: record.date,
      category_id: Number(record.category_id),
      amount: Number(record.amount),
      description: record.description || null,
    });
  }

  // Use a transaction to batch insert for atomicity
  let importedCount = 0;
  if (validRecords.length > 0) {
    await prisma.$transaction(async (tx) => {
      for (const record of validRecords) {
        await tx.transaction.create({
          data: {
            user_id: userId,
            transaction_date: new Date(record.date),
            category_id: record.category_id,
            amount: record.amount,
            description: record.description,
          },
        });
        importedCount++;
      }
    });
  }

  return { importedCount, errors };
};
