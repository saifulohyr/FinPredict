import { prisma } from '../config/prisma';
import { createNotification } from './notification.service';
import { getBudgets } from './budget.service';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const getLatestPredictions = async (userId: string) => {
  return await prisma.aiPrediction.findMany({
    where: { user_id: userId },
    orderBy: { forecast_date: 'asc' },
  });
};

export const generatePrediction = async (userId: string) => {
  // TODO: Replace mock with actual FastAPI call when AI service is ready.
  // Example of the real implementation:
  //
  // const transactions = await prisma.transaction.findMany({
  //   where: { user_id: userId },
  //   orderBy: { transaction_date: 'asc' },
  // });
  //
  // const response = await fetch(`${AI_SERVICE_URL}/predict`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ transactions }),
  // });
  //
  // const aiResult = await response.json();

  // Get historical data to base mock on actual spending patterns
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const recentExpenses = await prisma.transaction.aggregate({
    _avg: { amount: true },
    where: {
      user_id: userId,
      transaction_date: { gte: thirtyDaysAgo, lte: now },
      category: { type: 'EXPENSE' },
    },
  });

  const baseAmount = Number(recentExpenses._avg.amount || 50000);

  // Clear old predictions (use transaction for atomicity)
  await prisma.$transaction(async (tx) => {
    await tx.aiPrediction.deleteMany({
      where: { user_id: userId },
    });

    const predictions = [];
    for (let i = 1; i <= 30; i++) {
      const forecastDate = new Date(now);
      forecastDate.setDate(now.getDate() + i);

      // Mock fluctuation based on day of week (weekends tend to have higher spending)
      const dayOfWeek = forecastDate.getDay();
      const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1.0;
      const fluctuation = (Math.random() - 0.5) * baseAmount * 0.4;
      const predictedAmount = Math.max(0, baseAmount * weekendMultiplier + fluctuation);

      predictions.push({
        user_id: userId,
        forecast_date: forecastDate,
        predicted_amount: Math.round(predictedAmount * 100) / 100,
        confidence_score: 0.85 + Math.random() * 0.1,
      });
    }

    await tx.aiPrediction.createMany({ data: predictions });
  });

  // Check for early warnings after generating predictions
  await checkEarlyWarning(userId);

  return await getLatestPredictions(userId);
};

export const checkEarlyWarning = async (userId: string) => {
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const budgets = await getBudgets(userId, currentMonth);
  if (budgets.length === 0) return null;

  const predictions = await getLatestPredictions(userId);
  
  // Sum predicted expenses that fall in the current month
  let totalPredictedExpense = 0;
  predictions.forEach(p => {
    const forecastDate = new Date(p.forecast_date);
    if (forecastDate.getMonth() === now.getMonth() && forecastDate.getFullYear() === now.getFullYear()) {
      totalPredictedExpense += Number(p.predicted_amount);
    }
  });

  // Get current actual expenses for this month
  const actualExpensesAggr = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: {
      user_id: userId,
      transaction_date: {
        gte: currentMonth,
        lte: endOfMonth,
      },
      category: { type: 'EXPENSE' },
    },
  });
  const actualExpense = Number(actualExpensesAggr._sum.amount || 0);

  // Sum total budget limit
  const totalBudget = budgets.reduce((acc, b) => acc + Number(b.monthly_limit), 0);

  const projectedTotal = actualExpense + totalPredictedExpense;

  if (totalBudget > 0 && projectedTotal > totalBudget) {
    const overagePercentage = Math.round(((projectedTotal - totalBudget) / totalBudget) * 100);

    // Prevent duplicate spam: check if we already sent a warning today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existingWarning = await prisma.notification.findFirst({
      where: {
        user_id: userId,
        title: '⚠️ Early Warning: Potensi Overspending!',
        created_at: { gte: startOfDay },
      }
    });

    if (!existingWarning) {
      await createNotification(
        userId,
        '⚠️ Early Warning: Potensi Overspending!',
        `Prediksi total pengeluaran bulan ini sebesar Rp ${projectedTotal.toLocaleString('id-ID')} (${overagePercentage}% melebihi anggaran Rp ${totalBudget.toLocaleString('id-ID')}). Segera evaluasi pola pengeluaran Anda.`,
        'WARNING'
      );
    }
  }

  return {
    actualExpense,
    predictedExpense: totalPredictedExpense,
    projectedTotal,
    totalBudget,
    isOverBudget: projectedTotal > totalBudget,
  };
};
