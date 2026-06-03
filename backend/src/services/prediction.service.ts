import { prisma } from '../config/prisma';
import { createNotification } from './notification.service';
import { getBudgets } from './budget.service';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// ============================================================================
// QUERY HELPERS
// ============================================================================

export const getLatestPredictions = async (userId: string) => {
  const predictions = await prisma.aiPrediction.findMany({
    where: { user_id: userId },
    orderBy: { forecast_date: 'asc' },
  });
  return predictions;
};

export const getLastGeneratedAt = async (userId: string) => {
  const latest = await prisma.aiPrediction.findFirst({
    where: { user_id: userId },
    orderBy: { generated_at: 'desc' },
    select: { generated_at: true },
  });
  return latest?.generated_at || null;
};

export const getLatestAiAnalysisResult = async (userId: string) => {
  return await prisma.aiAnalysisResult.findFirst({
    where: { user_id: userId },
    orderBy: { generated_at: 'desc' },
  });
};

// ============================================================================
// FEATURE ENGINEERING — Hitung 37 fitur LSTM dari transaksi historis
// ============================================================================

interface DailyData {
  date: Date;
  expense: number;
  income: number;
}

function buildDailyTimeSeries(
  rawTransactions: Array<{ transaction_date: Date; amount: any; category: { type: string } }>,
  startDate: Date,
  numDays: number
): DailyData[] {
  const series: DailyData[] = [];
  for (let i = 0; i < numDays; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    
    const dayTxns = rawTransactions.filter(
      t => t.transaction_date.toDateString() === d.toDateString()
    );
    const expense = dayTxns
      .filter(t => t.category.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const income = dayTxns
      .filter(t => t.category.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    series.push({ date: d, expense, income });
  }
  return series;
}

function rollingMean(values: number[], windowSize: number, idx: number): number {
  const start = Math.max(0, idx - windowSize + 1);
  const window = values.slice(start, idx + 1);
  if (window.length === 0) return 0;
  return window.reduce((a, b) => a + b, 0) / window.length;
}

function rollingStd(values: number[], windowSize: number, idx: number): number {
  const start = Math.max(0, idx - windowSize + 1);
  const window = values.slice(start, idx + 1);
  if (window.length <= 1) return 0;
  const mean = window.reduce((a, b) => a + b, 0) / window.length;
  const variance = window.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / window.length;
  return Math.sqrt(variance);
}

function rollingMax(values: number[], windowSize: number, idx: number): number {
  const start = Math.max(0, idx - windowSize + 1);
  const window = values.slice(start, idx + 1);
  if (window.length === 0) return 0;
  return Math.max(...window);
}

function isHarbolnas(date: Date): boolean {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  // Harbolnas: 1/1, 2/2, 3/3, ..., 12/12
  return m === d && m >= 1 && m <= 12;
}

function faseBulan(day: number): number {
  if (day <= 10) return 0; // awal
  if (day <= 20) return 1; // tengah
  return 2; // akhir
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Build full 37-feature sequence for LSTM from daily time series.
 * Each row = 1 day, each column = 1 feature.
 */
function buildFeatureSequence(dailySeries: DailyData[]): Array<Record<string, number>> {
  const expenses = dailySeries.map(d => d.expense);
  const incomes = dailySeries.map(d => d.income);
  
  // Running balance
  let saldoBerjalan = 0;
  const balances: number[] = [];
  for (let i = 0; i < dailySeries.length; i++) {
    saldoBerjalan += incomes[i] - expenses[i];
    balances.push(saldoBerjalan);
  }

  const features: Array<Record<string, number>> = [];

  for (let i = 0; i < dailySeries.length; i++) {
    const d = dailySeries[i].date;
    const expense = expenses[i];
    const income = incomes[i];
    
    const rm7 = rollingMean(expenses, 7, i);
    const rm14 = rollingMean(expenses, 14, i);
    const rm30 = rollingMean(expenses, 30, i);
    const rs7 = rollingStd(expenses, 7, i);
    const rmax7 = rollingMax(expenses, 7, i);
    
    // Wants heuristic: ~60% of expense (MVP approximation)
    const totalWants = expense * 0.6;
    const rasioWants = expense > 0 ? totalWants / expense : 0;
    const rollingWants7 = rollingMean(expenses.map(e => e * 0.6), 7, i);
    
    // Doom spending: expense > 2x rolling mean
    const isDoomSpending = rm7 > 0 && expense > rm7 * 2 ? 1 : 0;
    const doomSpending = isDoomSpending ? expense - rm7 * 2 : 0;
    
    // Financial shock: expense > 3x rolling mean
    const isFinancialShock = rm7 > 0 && expense > rm7 * 3 ? 1 : 0;
    const shockHarian = isFinancialShock ? expense - rm7 * 3 : 0;
    
    // Food spending heuristic: ~30% of expense
    const pengeluaranMakanan = expense * 0.3;
    const rasioMakanan = expense > 0 ? pengeluaranMakanan / expense : 0;
    
    // Days to ruin
    const daysToRuin = rm7 > 0 ? Math.min(999, balances[i] / rm7) : 999;
    
    // Cyclical features
    const doy = getDayOfYear(d);
    const dom = d.getDate();
    const sinDoy = Math.sin(2 * Math.PI * doy / 365);
    const cosDoy = Math.cos(2 * Math.PI * doy / 365);
    const sinDom = Math.sin(2 * Math.PI * dom / 31);
    const cosDom = Math.cos(2 * Math.PI * dom / 31);
    
    // Kebiasaan boros
    const kebiasaanBoros = rm30 > 0 ? rm7 / rm30 : 1;
    
    // Interaksi hedon muda
    const isWeekend = (d.getDay() === 0 || d.getDay() === 6) ? 1 : 0;
    const interaksiHedon = rasioWants * (1 - isWeekend);
    
    features.push({
      total_pengeluaran_harian: expense,
      total_pemasukan_harian: income,
      saldo_berjalan: balances[i],
      saldo_bersih_harian: income - expense,
      total_wants_harian: totalWants,
      rasio_wants: rasioWants,
      doom_spending_harian: doomSpending,
      shock_harian: shockHarian,
      pengeluaran_makanan: pengeluaranMakanan,
      rasio_makanan: rasioMakanan,
      hari_dalam_bulan: dom,
      hari_dalam_minggu: d.getDay(),
      bulan: d.getMonth() + 1,
      is_weekend: isWeekend,
      is_harbolnas: isHarbolnas(d) ? 1 : 0,
      fase_bulan_encoded: faseBulan(dom),
      sin_doy: sinDoy,
      cos_doy: cosDoy,
      sin_dom: sinDom,
      cos_dom: cosDom,
      pengeluaran_lag_1d: i >= 1 ? expenses[i - 1] : 0,
      pengeluaran_lag_3d: i >= 3 ? expenses[i - 3] : 0,
      pengeluaran_lag_7d: i >= 7 ? expenses[i - 7] : 0,
      saldo_lag_1d: i >= 1 ? balances[i - 1] : 0,
      wants_lag_3d: i >= 3 ? expenses[i - 3] * 0.6 : 0,
      doom_lag_7d: i >= 7 ? (expenses[i - 7] > rollingMean(expenses, 7, i - 7) * 2 ? expenses[i - 7] : 0) : 0,
      rolling_mean_7d: rm7,
      rolling_mean_14d: rm14,
      rolling_mean_30d: rm30,
      rolling_std_7d: rs7,
      rolling_max_7d: rmax7,
      rolling_wants_7d: rollingWants7,
      days_to_ruin: daysToRuin,
      interaksi_hedon_muda: interaksiHedon,
      kebiasaan_boros_harian: kebiasaanBoros,
      is_doom_spending: isDoomSpending,
      is_financial_shock: isFinancialShock,
      usia: 22,
      tipe_user_encoded: 0,
    });
  }

  return features;
}

// ============================================================================
// MAIN GENERATE PREDICTION — Uses real feature engineering + AI service
// ============================================================================

export const generatePrediction = async (userId: string) => {
  const now = new Date();
  const sixtyDaysAgo = new Date(now);
  sixtyDaysAgo.setDate(now.getDate() - 60);

  // 1. Fetch historical transactions (60 days for lag/rolling context)
  const rawTransactions = await prisma.transaction.findMany({
    where: { 
      user_id: userId,
      transaction_date: { gte: sixtyDaysAgo, lte: now }
    },
    include: { category: true },
    orderBy: { transaction_date: 'asc' },
  });

  // 2. Build daily time series (last 60 days for rolling calculations, send last 30 to AI)
  const dailySeries = buildDailyTimeSeries(rawTransactions, sixtyDaysAgo, 60);

  // 3. Build full 37-feature sequence
  const fullFeatures = buildFeatureSequence(dailySeries);
  
  // Take last 30 days (LSTM sequence_length = 30)
  const aiTransactions = fullFeatures.slice(-30);

  // 4. Call AI Service via API
  let aiResult: any = null;
  try {
    const response = await fetch(`${AI_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        user_id: userId,
        transactions: aiTransactions 
      }),
    });
    
    if (response.ok) {
      aiResult = await response.json();
      console.log('✅ AI Service Prediction:', JSON.stringify({
        prediksi_besok: aiResult.prediksi_besok,
        probabilitas: aiResult.probabilitas,
        status_warning: aiResult.status_warning,
        rekomendasi: aiResult.rekomendasi,
      }));
    } else {
      const errorText = await response.text();
      console.error('❌ AI Service Error:', errorText);
    }
  } catch (error) {
    console.error('⚠️ Failed to call AI Service. Is the server running?', error);
  }

  // 5. Save AI Analysis Result to database
  const aiStatus = aiResult?.error === false
    ? aiResult.status_warning   // "AMAN" or "BAHAYA"
    : aiResult?.status_warning === 'INSUFFICIENT_DATA'
    ? 'INSUFFICIENT_DATA'
    : 'UNAVAILABLE';
  
  const riskProbability = aiResult?.probabilitas ?? -1; // -1 means no data
  const rekomendasi = aiResult?.rekomendasi ?? 'AI service tidak tersedia. Pastikan server AI berjalan.';

  await prisma.aiAnalysisResult.create({
    data: {
      user_id: userId,
      ai_status: aiStatus,
      risk_probability: riskProbability,
      rekomendasi: rekomendasi,
      model_digunakan: aiResult?.model_digunakan ?? 'LSTM',
    },
  });

  // 6. Generate chart data: Weighted Moving Average (deterministic, not random)
  const expenses = dailySeries.map(d => d.expense);
  const last7Expenses = expenses.slice(-7);
  const last30Expenses = expenses.slice(-30);
  
  const avg7 = last7Expenses.length > 0 
    ? last7Expenses.reduce((a, b) => a + b, 0) / last7Expenses.length 
    : 50000;
  const avg30 = last30Expenses.length > 0 
    ? last30Expenses.reduce((a, b) => a + b, 0) / last30Expenses.length 
    : 50000;
  
  // Trend: is spending increasing or decreasing?
  const trend = avg30 > 0 ? (avg7 - avg30) / avg30 : 0; // positive = increasing
  
  // Day-of-week weights from actual data
  const dayWeights: Record<number, { total: number; count: number }> = {};
  for (let i = 0; i < dailySeries.length; i++) {
    const day = dailySeries[i].date.getDay();
    if (!dayWeights[day]) dayWeights[day] = { total: 0, count: 0 };
    dayWeights[day].total += expenses[i];
    dayWeights[day].count += 1;
  }
  const overallAvg = avg30 || 1;
  const dayMultipliers: Record<number, number> = {};
  for (let d = 0; d < 7; d++) {
    if (dayWeights[d] && dayWeights[d].count > 0) {
      dayMultipliers[d] = (dayWeights[d].total / dayWeights[d].count) / overallAvg;
    } else {
      dayMultipliers[d] = 1.0;
    }
  }

  // Clear old predictions and create new ones
  await prisma.$transaction(async (tx) => {
    await tx.aiPrediction.deleteMany({
      where: { user_id: userId },
    });

    const predictions = [];
    for (let i = 1; i <= 30; i++) {
      const forecastDate = new Date(now);
      forecastDate.setDate(now.getDate() + i);

      const dayOfWeek = forecastDate.getDay();
      const dayMultiplier = dayMultipliers[dayOfWeek] || 1.0;
      
      // Weighted Moving Average: base * day_pattern * (1 + trend * decay)
      const trendDecay = Math.pow(0.95, i); // trend effect diminishes over time
      const predictedAmount = Math.max(0, avg7 * dayMultiplier * (1 + trend * trendDecay));

      predictions.push({
        user_id: userId,
        forecast_date: forecastDate,
        predicted_amount: Math.round(predictedAmount * 100) / 100,
        confidence_score: riskProbability >= 0 ? riskProbability : null,
      });
    }

    await tx.aiPrediction.createMany({ data: predictions });
  });

  // 7. Early Warning from AI Service
  if (aiResult && aiResult.prediksi_besok === 1) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existingWarning = await prisma.notification.findFirst({
      where: {
        user_id: userId,
        title: '⚠️ AI Peringatan: Risiko Overspending',
        created_at: { gte: startOfDay },
      }
    });

    if (!existingWarning) {
      await createNotification(
        userId,
        '⚠️ AI Peringatan: Risiko Overspending',
        aiResult.rekomendasi || `AI mendeteksi kemungkinan besar Anda akan melakukan overspending besok. Harap rem pengeluaran Anda!`,
        'DANGER'
      );
    }
  }

  // Also create notification for AMAN status (so user gets feedback)
  if (aiResult && aiResult.prediksi_besok === 0) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existingInfo = await prisma.notification.findFirst({
      where: {
        user_id: userId,
        title: '✅ AI Analisis: Keuangan Aman',
        created_at: { gte: startOfDay },
      }
    });

    if (!existingInfo) {
      await createNotification(
        userId,
        '✅ AI Analisis: Keuangan Aman',
        aiResult.rekomendasi || 'AI memprediksi keuangan Anda aman untuk besok. Pertahankan pola ini!',
        'INFO'
      );
    }
  }

  // Budget-based early warning (tetap jalan)
  await checkEarlyWarning(userId);

  return await getLatestPredictions(userId);
};

// ============================================================================
// BUDGET-BASED EARLY WARNING (unchanged logic)
// ============================================================================

export const checkEarlyWarning = async (userId: string) => {
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const budgets = await getBudgets(userId, currentMonth);
  if (budgets.length === 0) return null;

  const predictions = await getLatestPredictions(userId);
  
  let totalPredictedExpense = 0;
  predictions.forEach(p => {
    const forecastDate = new Date(p.forecast_date);
    if (forecastDate.getMonth() === now.getMonth() && forecastDate.getFullYear() === now.getFullYear()) {
      totalPredictedExpense += Number(p.predicted_amount);
    }
  });

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

  const totalBudget = budgets.reduce((acc, b) => acc + Number(b.monthly_limit), 0);

  const projectedTotal = actualExpense + totalPredictedExpense;

  if (totalBudget > 0 && projectedTotal > totalBudget) {
    const overagePercentage = Math.round(((projectedTotal - totalBudget) / totalBudget) * 100);

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
