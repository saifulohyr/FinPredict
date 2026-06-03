import { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { BrainCircuit, TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, ArrowRight, Wallet, RefreshCw } from 'lucide-react';
import { usePredictions } from '../hooks/usePredictions';
import { useNotifications } from '../hooks/useNotifications';
import { useTransactions } from '../hooks/useTransactions';
import { useNavigate } from 'react-router-dom';

export function AIAnalyticsPage() {
  const navigate = useNavigate();
  const { usePredictionsQuery, useGeneratePredictionMutation, useWarningStatusQuery, useAiAnalysisResultQuery } = usePredictions();
  const { data: aiResult } = useAiAnalysisResultQuery();
  const { data: predictionsData } = usePredictionsQuery();
  const predictions = predictionsData?.predictions || predictionsData || [];
  const lastGeneratedAt = predictionsData?.lastGeneratedAt || null;
  const generateMutation = useGeneratePredictionMutation();
  const [generateSuccess, setGenerateSuccess] = useState(false);

  const { useNotificationsQuery } = useNotifications();
  const { data: notifications = [] } = useNotificationsQuery();
  
  const { useTransactionSummaryQuery, useTransactionsQuery } = useTransactions();
  const { data: summary } = useTransactionSummaryQuery();
  const { data: allTransactions = [] } = useTransactionsQuery();
  
  const { data: warningStatus } = useWarningStatusQuery();

  // Sort warnings (from notifications) including DANGER from AI
  const warnings = notifications.filter((n: any) => n.type === 'WARNING' || n.type === 'DANGER').sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const latestWarning = warnings[0];

  // Summary data
  const totalIncome = summary?.totalIncome || 0;
  const totalExpense = summary?.totalExpense || 0;
  const balance = summary?.balance || (totalIncome - totalExpense);
  const expenseByCategory = summary?.expenseByCategory || {};
  const topCategory = Object.entries(expenseByCategory).sort(([,a], [,b]) => Number(b) - Number(a))[0];
  const topCatName = topCategory ? topCategory[0] : null;

  // --- Chart Data: Combine ACTUAL historical + PREDICTED ---
  // 1. Aggregate actual daily expenses from transactions (last 30 days)
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const dailyActual: Record<string, number> = {};
  allTransactions.forEach((t: any) => {
    const d = new Date(t.transaction_date);
    if (d >= thirtyDaysAgo && d <= now && t.category.type === 'EXPENSE') {
      const key = d.toISOString().split('T')[0];
      dailyActual[key] = (dailyActual[key] || 0) + Number(t.amount);
    }
  });

  // 2. Build historical chart data
  const historicalData = Object.entries(dailyActual)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateStr, amount]) => {
      const d = new Date(dateStr);
      return {
        name: `${d.getDate()} ${d.toLocaleString('id-ID', { month: 'short' }).toUpperCase()}`,
        aktual: amount,
        prediksi: null as number | null,
      };
    });

  // 3. Build prediction chart data
  const predictionData = (Array.isArray(predictions) ? predictions : []).map((p: any) => {
    const d = new Date(p.forecast_date);
    return {
      name: `${d.getDate()} ${d.toLocaleString('id-ID', { month: 'short' }).toUpperCase()}`,
      aktual: null as number | null,
      prediksi: Number(p.predicted_amount),
    };
  });

  // 4. Combine: last 15 days of historical + first 15 days of predictions for a clear chart
  const chartData = [...historicalData.slice(-15), ...predictionData.slice(0, 15)];

  // --- Category Bar Chart ---
  const categoryBarData = Object.entries(expenseByCategory)
    .sort(([,a], [,b]) => Number(b) - Number(a))
    .slice(0, 6)
    .map(([name, amount]) => ({ name, amount: Number(amount) }));

  const barColors = ['#FF6B6B', '#FFB6C1', '#A85CF9', '#D4FF00', '#4ade80', '#D9D9D9'];

  // --- Last Generated Display ---
  const formatLastGenerated = (dateStr: string | null) => {
    if (!dateStr) return 'Belum pernah';
    const d = new Date(dateStr);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
  };

  // Handle generate
  const handleGenerate = () => {
    setGenerateSuccess(false);
    generateMutation.mutate(undefined, {
      onSuccess: () => {
        setGenerateSuccess(true);
        setTimeout(() => setGenerateSuccess(false), 5000);
      },
    });
  };

  return (
    <div className="bg-[#F0F0F0] min-h-screen font-sans text-black p-4 md:p-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6 text-left">
        <div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2 italic leading-none">Analisis AI</h1>
          <div className="flex flex-wrap gap-2">
            <span className="bg-[#4ade80] text-black px-3 py-1 text-[10px] md:text-xs font-black border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              MODEL: LSTM-V3
            </span>
            <span className="bg-white text-black px-3 py-1 text-[10px] md:text-xs font-black border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
              Generate Terakhir: {formatLastGenerated(lastGeneratedAt)}
            </span>
          </div>
        </div>
        <div className="bg-black text-white p-4 border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(74,222,128,1)] self-start md:self-auto flex items-center gap-4">
          <div>
            <p className="text-[10px] font-black uppercase text-[#4ade80]">Status AI</p>
            <p className={`text-2xl md:text-3xl font-black italic ${aiResult?.ai_status === 'BAHAYA' ? 'text-[#FF6B6B]' : ''}`}>{aiResult?.ai_status || 'UNAVAILABLE'}</p>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="ml-4 bg-[#4ade80] text-black border-2 border-white px-4 py-2 font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] disabled:opacity-50 flex items-center gap-2 rounded-xl"
          >
            <RefreshCw size={14} className={generateMutation.isPending ? 'animate-spin' : ''} />
            {generateMutation.isPending ? 'Memproses...' : 'Generate AI'}
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {generateSuccess && (
        <div className="mb-6 bg-[#80FF80] border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 animate-pulse">
          <ShieldCheck size={24} />
          <p className="font-black text-sm uppercase">✅ Prediksi AI berhasil di-generate! Data telah diperbarui.</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#80FF80] border-4 border-black rounded-2xl p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
          <div className="bg-white border-2 border-black rounded-xl p-2 shrink-0">
            <TrendingUp size={20} className="text-[#1A4D2E]" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase">Pemasukan Bulan Ini</p>
            <p className="text-lg md:text-xl font-black leading-tight">Rp{totalIncome.toLocaleString('id-ID')}</p>
          </div>
        </div>

        <div className="bg-[#FFB6C1] border-4 border-black rounded-2xl p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3">
          <div className="bg-white border-2 border-black rounded-xl p-2 shrink-0">
            <TrendingDown size={20} className="text-[#B22222]" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase">Pengeluaran Bulan Ini</p>
            <p className="text-lg md:text-xl font-black leading-tight">Rp{totalExpense.toLocaleString('id-ID')}</p>
          </div>
        </div>

        <div className={`${balance >= 0 ? 'bg-[#D4FF00]' : 'bg-[#FF6B6B]'} border-4 border-black rounded-2xl p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3`}>
          <div className="bg-white border-2 border-black rounded-xl p-2 shrink-0">
            <Wallet size={20} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase">Saldo Bersih</p>
            <p className="text-lg md:text-xl font-black leading-tight">
              {balance >= 0 ? '' : '-'}Rp{Math.abs(balance).toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      {/* AI Risk Assessment Primary Section */}
      <div className="bg-black border-4 border-black rounded-2xl p-6 md:p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-white mb-8 text-left">
        <h2 className="text-xl md:text-2xl font-black uppercase mb-6 flex items-center gap-2 text-[#4ade80]">
          <BrainCircuit size={28} /> Hasil Analisis Model LSTM
        </h2>
        
        {aiResult ? (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="text-[10px] md:text-xs font-black uppercase mb-2 text-slate-400">Prediksi Risiko</div>
              <div className={`inline-block border-4 rounded-2xl px-6 py-4 text-2xl md:text-4xl font-black uppercase italic shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] mb-6 ${aiResult.ai_status === 'BAHAYA' ? 'border-[#FF6B6B] text-[#FF6B6B] bg-[#FF6B6B]/10' : 'border-[#4ade80] text-[#4ade80] bg-[#4ade80]/10'}`}>
                {aiResult.ai_status === 'BAHAYA' ? '⚠️ BAHAYA' : '✅ AMAN'}
              </div>
              <div className="text-[10px] md:text-xs font-black uppercase mb-1 text-slate-400">
                Model: {aiResult.model_digunakan} | Threshold: 0.55
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-end mb-2">
                <div className="text-[10px] md:text-xs font-black uppercase text-[#4ade80]">Probabilitas Risiko</div>
                <div className="text-xl font-black">{aiResult.risk_probability >= 0 ? `${Math.round(aiResult.risk_probability * 100)}%` : 'N/A'}</div>
              </div>
              <div className="w-full h-6 bg-white/20 border-2 border-white rounded mb-6 relative overflow-hidden">
                <div 
                  className={`h-full ${aiResult.ai_status === 'BAHAYA' ? 'bg-[#FF6B6B]' : 'bg-[#4ade80]'}`}
                  style={{ width: `${aiResult.risk_probability >= 0 ? Math.round(aiResult.risk_probability * 100) : 0}%` }}
                ></div>
              </div>
              
              <div className="bg-white/10 border-l-4 border-[#4ade80] p-4 rounded-r-xl">
                <p className="font-bold text-sm md:text-base italic">
                  "{aiResult.rekomendasi}"
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="font-bold mb-4">Data analisis AI belum tersedia.</p>
            <button 
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              className="bg-[#4ade80] text-black border-2 border-white px-6 py-3 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] disabled:opacity-50 rounded-xl inline-flex items-center gap-2"
            >
              <RefreshCw size={16} className={generateMutation.isPending ? 'animate-spin' : ''} />
              {generateMutation.isPending ? 'Memproses...' : 'Generate AI Sekarang'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 text-left">
        
        {/* MAIN CHART: Cash Flow Projection */}
        <div className="col-span-1 md:col-span-12 bg-white border-4 border-black rounded-2xl p-4 md:p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] outline outline-4 outline-black outline-offset-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <h2 className="text-xl md:text-2xl font-black uppercase flex items-center gap-2">
              <BrainCircuit size={28} className="shrink-0" /> Proyeksi Arus Kas
            </h2>
            <div className="flex flex-wrap gap-4 text-[9px] md:text-[10px] font-black uppercase">
              <div className="flex items-center gap-1"><div className="w-6 h-1 bg-black rounded"></div> Data Riil</div>
              <div className="flex items-center gap-1"><div className="w-6 h-1 bg-[#4ade80] rounded" style={{backgroundImage: 'repeating-linear-gradient(90deg, #4ade80 0, #4ade80 4px, transparent 4px, transparent 8px)'}}></div> Prediksi AI</div>
            </div>
          </div>
          
          <div className="h-[250px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.length > 0 ? chartData : [{ name: 'No Data', prediksi: 0, aktual: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
                <XAxis dataKey="name" axisLine={{ strokeWidth: 4 }} tick={{ fontWeight: 'bold', fontSize: 10 }} />
                <YAxis axisLine={{ strokeWidth: 4 }} tick={{ fontWeight: 'bold', fontSize: 10 }} width={60} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip 
                  contentStyle={{ border: '4px solid black', fontWeight: 'bold', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value: any) => [`Rp${Number(value).toLocaleString('id-ID')}`, undefined]}
                />
                <Line 
                  type="monotone" 
                  dataKey="aktual" 
                  stroke="black" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: 'black' }} 
                  connectNulls={false}
                  name="Data Riil"
                />
                <Line 
                  type="monotone" 
                  dataKey="prediksi" 
                  stroke="#4ade80" 
                  strokeWidth={4} 
                  strokeDasharray="8 8" 
                  dot={{ r: 4, fill: '#4ade80', stroke: 'black', strokeWidth: 2 }} 
                  connectNulls={false}
                  name="Prediksi AI"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* BAR CHART: Distribution per Category */}
        {categoryBarData.length > 0 && (
          <div className="col-span-1 md:col-span-12 lg:col-span-6 bg-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl md:text-2xl font-black uppercase mb-6 italic flex items-center gap-2">
              Distribusi Pengeluaran per Kategori
            </h2>
            <div className="h-[250px] md:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBarData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ddd" />
                  <XAxis type="number" tick={{ fontWeight: 'bold', fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontWeight: 'bold', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ border: '4px solid black', fontWeight: 'bold', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(value: any) => [`Rp${Number(value).toLocaleString('id-ID')}`, 'Jumlah']}
                  />
                  <Bar dataKey="amount" radius={[0, 8, 8, 0]} barSize={24}>
                    {categoryBarData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} stroke="black" strokeWidth={2} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* INSIGHT CARDS ROW */}

        {/* Anomaly Card */}
        <div className={`col-span-1 md:col-span-12 ${categoryBarData.length > 0 ? 'lg:col-span-6' : 'lg:col-span-4'} bg-[#FFB6C1] border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between`}>
          <div>
            <div className="bg-white border-2 border-black rounded-xl w-fit p-2 mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="font-black text-lg md:text-xl uppercase mb-2 leading-none">Anomali Terdeteksi</h3>
            {latestWarning ? (
              <div className="mb-6">
                <p className="font-bold text-xs md:text-sm mb-2 leading-tight italic">
                  "{latestWarning.message}"
                </p>
                <p className="text-[9px] font-black uppercase text-black/50">
                  {new Date(latestWarning.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
                {warnings.length > 1 && (
                  <p className="text-[9px] font-black uppercase mt-2 text-black/70">
                    + {warnings.length - 1} peringatan lainnya
                  </p>
                )}
              </div>
            ) : (
              <p className="font-bold text-xs md:text-sm mb-6 leading-tight italic">
                "Tidak ada anomali atau peringatan yang signifikan terdeteksi saat ini. Keuangan Anda baik!"
              </p>
            )}
          </div>
          <button 
            onClick={() => navigate('/budgets')}
            className="w-full bg-black text-white py-3 font-black uppercase text-[10px] border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all rounded-xl"
          >
            Sesuaikan Anggaran
          </button>
        </div>

        {/* Saving Opportunity Card */}
        <div className="col-span-1 md:col-span-12 lg:col-span-4 bg-[#A85CF9] border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="bg-white border-2 border-black rounded-xl w-fit p-2 mb-4">
            <TrendingUp size={24} />
          </div>
          <h3 className="font-black text-lg md:text-xl uppercase mb-2 leading-none">Peluang Menabung</h3>
          {topCatName && totalExpense > 0 ? (
            <div className="mb-6">
              <p className="font-bold text-xs md:text-sm mb-3 leading-tight italic">
                Pengeluaran terbesar Anda ada di kategori <span className="font-black underline">{topCatName}</span> sebesar{' '}
                <span className="font-black">Rp{Number(topCategory![1]).toLocaleString('id-ID')}</span>{' '}
                ({Math.round((Number(topCategory![1]) / totalExpense) * 100)}% dari total).
              </p>
              <p className="font-bold text-xs md:text-sm leading-tight italic">
                Mengurangi 10% di kategori ini bisa menghemat{' '}
                <span className="font-black text-white bg-black px-1 rounded">
                  Rp{Math.round(Number(topCategory![1]) * 0.1).toLocaleString('id-ID')}
                </span>{' '}
                per bulan!
              </p>
            </div>
          ) : (
            <p className="font-bold text-xs md:text-sm mb-6 leading-tight italic">
              Belum cukup data transaksi untuk menemukan peluang menabung spesifik. Catat lebih banyak transaksi!
            </p>
          )}
          <button 
            onClick={() => navigate('/transactions')}
            className="w-full bg-white text-black py-3 font-black uppercase text-[10px] border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
          >
            Tinjau Pengeluaran
          </button>
        </div>

        {/* Financial Stability Card */}
        <div className="col-span-1 md:col-span-12 lg:col-span-4 bg-[#D4FF00] border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="bg-white border-2 border-black rounded-xl w-fit p-2 mb-4">
            <ShieldCheck size={24} />
          </div>
          <h3 className="font-black text-lg md:text-xl uppercase mb-2 leading-none">Stabilitas Keuangan</h3>
          {warningStatus ? (
            <div className="mb-6">
              {warningStatus.isOverBudget ? (
                <>
                  <p className="font-bold text-xs md:text-sm mb-2 leading-tight italic">
                    ⚠️ Pengeluaran diprediksi <span className="font-black text-[#B22222]">melebihi anggaran</span>!
                  </p>
                  <p className="font-bold text-xs md:text-sm leading-tight italic">
                    Proyeksi: Rp{(warningStatus.projectedTotal || 0).toLocaleString('id-ID')} vs Budget: Rp{(warningStatus.totalBudget || 0).toLocaleString('id-ID')}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold text-xs md:text-sm mb-2 leading-tight italic">
                    ✅ Keuangan Anda stabil! Pengeluaran dalam batas aman.
                  </p>
                  {totalExpense > 0 && totalIncome > 0 && (
                    <p className="font-bold text-xs md:text-sm leading-tight italic">
                      Rasio pengeluaran: <span className="font-black">{Math.round((totalExpense / totalIncome) * 100)}%</span> dari pemasukan.
                      {(totalExpense / totalIncome) <= 0.7 && ' 🎯 Sangat baik!'}
                      {(totalExpense / totalIncome) > 0.7 && (totalExpense / totalIncome) <= 0.9 && ' ⚡ Perlu perhatian.'}
                      {(totalExpense / totalIncome) > 0.9 && ' ⚠️ Hampir melebihi pemasukan!'}
                    </p>
                  )}
                </>
              )}
            </div>
          ) : (
            <p className="font-bold text-xs md:text-sm mb-6 leading-tight italic">
              Set anggaran terlebih dahulu untuk melihat status stabilitas keuangan.
            </p>
          )}
          <div 
            onClick={() => navigate('/budgets')}
            className="flex items-center gap-2 font-black text-[10px] uppercase underline cursor-pointer hover:bg-black hover:text-[#D4FF00] transition-colors w-fit px-1 rounded"
          >
            Lihat Detail Anggaran <ArrowRight size={14} />
          </div>
        </div>

        {/* Spending Pattern Card */}
        <div className="col-span-1 md:col-span-12 lg:col-span-4 bg-[#1A4D2E] text-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="bg-[#4ade80] border-2 border-black rounded-xl w-fit p-2 mb-4">
            <BrainCircuit size={24} className="text-black" />
          </div>
          <h3 className="font-black text-lg md:text-xl uppercase mb-2 leading-none text-[#4ade80]">Pola Pengeluaran</h3>
          {allTransactions.length > 0 ? (() => {
            // Calculate spending by day of week
            const daySpending: Record<number, { total: number; count: number }> = {};
            allTransactions.forEach((t: any) => {
              if (t.category.type === 'EXPENSE') {
                const day = new Date(t.transaction_date).getDay();
                if (!daySpending[day]) daySpending[day] = { total: 0, count: 0 };
                daySpending[day].total += Number(t.amount);
                daySpending[day].count += 1;
              }
            });
            const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const highestDay = Object.entries(daySpending).sort(([,a], [,b]) => (b.total / b.count) - (a.total / a.count))[0];
            const highestDayName = highestDay ? dayNames[Number(highestDay[0])] : '-';
            
            return (
              <div className="mb-4">
                <p className="font-bold text-xs md:text-sm mb-2 leading-tight italic">
                  Pengeluaran rata-rata tertinggi terjadi pada hari <span className="font-black text-[#4ade80]">{highestDayName}</span>.
                </p>
                <p className="font-bold text-xs md:text-sm leading-tight italic">
                  AI akan terus memonitor pola ini untuk memberikan peringatan dini.
                </p>
              </div>
            );
          })() : (
            <p className="font-bold text-xs md:text-sm mb-4 leading-tight italic">
              Belum ada data pola pengeluaran. Catat transaksi untuk analisis.
            </p>
          )}
        </div>

        {/* BOTTOM: Behavioral Insight */}
        <div className="col-span-1 md:col-span-12 bg-black text-white border-4 border-black rounded-2xl p-6 md:p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col lg:flex-row gap-8 items-center">
          <div className="flex-1 text-left">
             <h2 className="text-2xl md:text-3xl font-black uppercase mb-4 text-[#4ade80]">Wawasan Perilaku</h2>
             {topCatName ? (
               <p className="text-base md:text-lg font-bold leading-tight">
                 Model LSTM kami telah mempelajari riwayat belanja Anda. Anda cenderung mengalokasikan anggaran terbesar pada kategori <span className="text-[#4ade80] font-black">{topCatName}</span>
                 {totalIncome > 0 && <> dengan rasio pengeluaran <span className="text-[#D4FF00] font-black">{Math.round((totalExpense / totalIncome) * 100)}%</span> dari pemasukan</>}.
                 {' '}Sistem akan terus memonitor pola ini.
               </p>
             ) : (
               <p className="text-base md:text-lg font-bold leading-tight">
                 Belum cukup data untuk menganalisis pola perilaku keuangan. Catat lebih banyak transaksi untuk insight yang lebih akurat.
               </p>
             )}
          </div>
          <div className="w-full lg:w-1/3 bg-white/10 p-4 border-2 border-dashed border-[#4ade80] rounded-xl">
             <p className="text-[10px] font-black uppercase mb-2 text-[#4ade80]">Rasio Pengeluaran/Pemasukan</p>
             <div className="w-full h-4 bg-white/20 border border-white relative rounded">
                <div 
                  className={`h-full rounded ${totalIncome > 0 && (totalExpense / totalIncome) > 0.9 ? 'bg-[#FF6B6B]' : 'bg-[#4ade80]'}`} 
                  style={{ width: `${totalIncome > 0 ? Math.min(100, Math.round((totalExpense / totalIncome) * 100)) : 0}%` }}
                ></div>
             </div>
             <p className="text-right text-[10px] font-black mt-1 uppercase">
               {totalIncome > 0 ? `${Math.round((totalExpense / totalIncome) * 100)}%` : '0%'} Terpakai
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}