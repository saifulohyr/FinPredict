import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { BrainCircuit, TrendingUp, TrendingDown, Wallet, AlertTriangle } from 'lucide-react';
import { usePredictions } from '../hooks/usePredictions';
import { useTransactions } from '../hooks/useTransactions';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { usePredictionsQuery, useWarningStatusQuery, useAiAnalysisResultQuery } = usePredictions();
  const { useTransactionSummaryQuery, useTransactionsQuery } = useTransactions();

  const { data: predictionsData } = usePredictionsQuery();
  const predictions = predictionsData?.predictions || predictionsData || [];
  const { data: warningStatus } = useWarningStatusQuery();
  const { data: summary } = useTransactionSummaryQuery();
  const { data: aiResult } = useAiAnalysisResultQuery();

  const { data: allTransactions = [] } = useTransactionsQuery();

  const chartData = (() => {
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

    const historicalData = Object.entries(dailyActual)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateStr, amount]) => {
        const d = new Date(dateStr);
        return {
          name: `${d.getDate()} ${d.toLocaleString('id-ID', { month: 'short' }).toUpperCase()}`,
          value: amount, // 'value' used in Dashboard
        };
      });

    const predictionData = (Array.isArray(predictions) ? predictions : []).map((p: any) => {
      const d = new Date(p.forecast_date);
      return {
        name: `${d.getDate()} ${d.toLocaleString('id-ID', { month: 'short' }).toUpperCase()}`,
        value: Number(p.predicted_amount)
      };
    });

    return [...historicalData.slice(-15), ...predictionData.slice(0, 15)];
  })();

  // Use actual + predicted for projected total (not just warningStatus which requires budgets)
  const actualExpense = warningStatus?.actualExpense || summary?.totalExpense || 0;
  const predictedExpense = warningStatus?.predictedExpense || 0;
  const projectedTotal = actualExpense + predictedExpense;
  
  // Summary data for the month
  const totalIncome = summary?.totalIncome || 0;
  const totalExpense = summary?.totalExpense || 0;
  const balance = summary?.balance || (totalIncome - totalExpense);

  // Calculate distribution data from summary
  const expenseByCategory = summary?.expenseByCategory || {};
  
  // Sort categories by amount
  const sortedCategories = Object.entries(expenseByCategory)
    .sort(([,a], [,b]) => Number(b) - Number(a))
    .slice(0, 3); // top 3

  const colors = ['#80FF80', '#FFB6C1', '#D9D9D9'];

  return (
    <div className="bg-[#F0F0F0] min-h-screen p-4 md:p-8 font-sans text-black">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6 text-left">
        <div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2 italic">Dashboard</h1>
          <div className="flex flex-wrap gap-2">
            <span className="bg-[#1A4D2E] text-[#4ade80] px-3 py-1 text-[10px] md:text-xs font-bold border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              AI AKTIF
            </span>
            <span className="bg-black text-white px-3 py-1 text-[10px] md:text-xs font-bold border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              STATUS: <span className={aiResult?.ai_status === 'BAHAYA' ? 'text-[#FF6B6B]' : 'text-[#4ade80]'}>{aiResult?.ai_status || 'UNAVAILABLE'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards: Pemasukan, Pengeluaran, Saldo Bersih */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#80FF80] border-4 border-black rounded-2xl p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
          <div className="bg-white border-2 border-black rounded-xl p-2 shrink-0">
            <TrendingUp size={24} className="text-[#1A4D2E]" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase">Pemasukan Bulan Ini</p>
            <p className="text-xl md:text-2xl font-black leading-tight">Rp{totalIncome.toLocaleString('id-ID')}</p>
          </div>
        </div>

        <div className="bg-[#FFB6C1] border-4 border-black rounded-2xl p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
          <div className="bg-white border-2 border-black rounded-xl p-2 shrink-0">
            <TrendingDown size={24} className="text-[#B22222]" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase">Pengeluaran Bulan Ini</p>
            <p className="text-xl md:text-2xl font-black leading-tight">Rp{totalExpense.toLocaleString('id-ID')}</p>
          </div>
        </div>

        <div className={`${balance >= 0 ? 'bg-[#D4FF00]' : 'bg-[#FF6B6B]'} border-4 border-black rounded-2xl p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4`}>
          <div className="bg-white border-2 border-black rounded-xl p-2 shrink-0">
            <Wallet size={24} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase">Saldo Bersih</p>
            <p className="text-xl md:text-2xl font-black leading-tight">
              {balance >= 0 ? '' : '-'}Rp{Math.abs(balance).toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>



      {/* Grid System */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
        
        {/* Main Forecast Chart Card */}
        <div className="col-span-1 md:col-span-12 lg:col-span-8 bg-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl md:text-2xl font-black uppercase italic">Proyeksi Saldo</h2>
          </div>

          <div className="h-[250px] md:h-[300px] w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.length > 0 ? chartData : [{ name: 'No Data', value: 0 }]}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#1A4D2E" 
                  strokeWidth={6} 
                  dot={{ r: 4, fill: 'black', strokeWidth: 0 }}
                  activeDot={{ r: 8, stroke: 'black', strokeWidth: 2 }}
                />
                <XAxis dataKey="name" axisLine={{ strokeWidth: 4 }} tick={{ fontWeight: 'bold', fontSize: 10 }} />
                <YAxis hide />
                <Tooltip contentStyle={{ border: '4px solid black', fontWeight: 'bold' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-[#4ade80] border-4 border-black rounded-2xl p-4 flex-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-[10px] font-black uppercase">Terproyeksi (Pengeluaran)</p>
              <p className="text-xl md:text-2xl font-black leading-tight">Rp{projectedTotal.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-[#D9D9D9] border-4 border-black rounded-2xl p-4 flex-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-[10px] font-black uppercase">Status Early Warning</p>
              <p className="text-xl md:text-2xl font-black uppercase">{warningStatus?.isOverBudget ? 'Waspada' : 'Aman'}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Alerts & AI Risk */}
        <div className="col-span-1 md:col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Peringatan Dini Card */}
          <div className="bg-[#B22222] border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white p-1 border-2 border-black rounded-lg text-black shrink-0">
                <AlertTriangle size={20} className="text-[#B22222]" />
              </div>
              <h2 className="text-xl md:text-2xl font-black uppercase leading-none tracking-tight">Peringatan Dini</h2>
            </div>
            <p className="font-bold mb-6 text-sm md:text-base leading-tight italic">
              Prediksi total pengeluaran bulan ini sebesar Rp{projectedTotal.toLocaleString('id-ID')} melebihi anggaran Anda (Rp{(warningStatus?.totalBudget || 0).toLocaleString('id-ID')}).
            </p>
            <button onClick={() => navigate('/transactions')} className="w-full bg-white text-black border-4 border-black rounded-2xl py-3 font-black uppercase text-xs md:text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
              Tinjau Pengeluaran
            </button>
          </div>

          {/* AI Risk Assessment Card */}
          <div className="bg-[#1A1A1A] border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[#4ade80] p-2 border-2 border-black rounded-xl text-black shrink-0">
              <BrainCircuit size={24} />
            </div>
            <h2 className="text-xl md:text-2xl font-black uppercase leading-none text-[#4ade80]">Analisis Risiko AI</h2>
          </div>
          
          {aiResult ? (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <div className="text-[10px] md:text-xs font-black uppercase">
                    Status: <span className={aiResult.ai_status === 'BAHAYA' ? 'text-[#FF6B6B]' : 'text-[#4ade80]'}>{aiResult.ai_status}</span>
                  </div>
                  <div className="text-[10px] md:text-xs font-black uppercase">
                    Risk Score: {aiResult.risk_probability >= 0 ? `${Math.round(aiResult.risk_probability * 100)}%` : 'N/A'}
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full h-4 bg-white/20 border-2 border-white rounded mb-6 relative overflow-hidden">
                  <div 
                    className={`h-full ${aiResult.ai_status === 'BAHAYA' ? 'bg-[#FF6B6B]' : 'bg-[#4ade80]'}`}
                    style={{ width: `${aiResult.risk_probability >= 0 ? Math.round(aiResult.risk_probability * 100) : 0}%` }}
                  ></div>
                </div>

                <p className="font-bold mb-6 text-sm md:text-base leading-tight italic text-slate-300">
                  "{aiResult.rekomendasi}"
                </p>
              </div>
              
              <button onClick={() => navigate('/analytics')} className="w-full bg-[#4ade80] text-black border-4 border-[#4ade80] rounded-2xl py-3 font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_rgba(74,222,128,0.5)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                Lihat Detail Analisis
              </button>
            </div>
          ) : (
             <div className="flex-1 flex flex-col justify-center items-center text-center">
               <p className="font-bold mb-6 text-sm md:text-base leading-tight italic text-slate-400">
                 Belum ada data analisis AI.
               </p>
               <button onClick={() => navigate('/analytics')} className="w-full bg-white text-black border-4 border-white rounded-2xl py-3 font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                 Generate AI Pertama Kali
               </button>
             </div>
          )}
          </div>
        </div>

        {/* Asset Distribution Card */}
        <div className="col-span-1 md:col-span-6 bg-[#D4FF00] border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black uppercase mb-6 italic text-left">Distribusi Pengeluaran</h2>
          
          {sortedCategories.length > 0 ? (
            <>
              <div className="flex justify-between font-black text-[10px] md:text-sm mb-2 uppercase">
                <span>Total Pengeluaran</span>
                <span>Rp{totalExpense.toLocaleString('id-ID')}</span>
              </div>
              <div className="w-full h-12 md:h-16 border-4 border-black rounded-2xl flex mb-6">
                {sortedCategories.map(([name, amount], idx) => (
                  <div key={name} className={`h-full border-r-4 border-black last:border-r-0`} style={{ width: `${(Number(amount) / totalExpense) * 100}%`, backgroundColor: colors[idx] }}></div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 font-black text-[10px] uppercase text-left">
                {sortedCategories.map(([name, amount], idx) => (
                  <div key={name} className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black rounded-xl" style={{ backgroundColor: colors[idx] }}></div> 
                    {name} ({Math.round((Number(amount) / totalExpense) * 100)}%)
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="font-bold text-sm italic">Belum ada data pengeluaran untuk bulan ini.</p>
          )}
        </div>

        {/* Quick Actions Card - replaces removed Market Sentiment */}
        <div className="col-span-1 md:col-span-6 bg-black text-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black uppercase mb-6 italic text-left text-[#4ade80]">Aksi Cepat</h2>
          <div className="space-y-4">
            <button 
              onClick={() => navigate('/transactions')} 
              className="w-full bg-[#4ade80] text-black border-4 border-[#4ade80] rounded-2xl py-3 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(74,222,128,0.5)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              + Catat Transaksi Baru
            </button>
            <button 
              onClick={() => navigate('/analytics')} 
              className="w-full bg-transparent text-white border-4 border-white rounded-2xl py-3 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              Lihat Analisis AI
            </button>
            <button 
              onClick={() => navigate('/budgets')} 
              className="w-full bg-[#D4FF00] text-black border-4 border-[#D4FF00] rounded-2xl py-3 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(212,255,0,0.5)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            >
              Atur Anggaran
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;