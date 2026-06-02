import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { AlertTriangle, Calendar, Filter } from 'lucide-react';
import { usePredictions } from '../hooks/usePredictions';
import { useTransactions } from '../hooks/useTransactions';

export const Dashboard = () => {
  const { usePredictionsQuery, useWarningStatusQuery } = usePredictions();
  const { useTransactionSummaryQuery } = useTransactions();

  const { data: predictions = [] } = usePredictionsQuery();
  const { data: warningStatus } = useWarningStatusQuery();
  const { data: summary } = useTransactionSummaryQuery();

  const chartData = predictions.map((p: any) => {
    const d = new Date(p.forecast_date);
    return {
      name: `${d.getDate()} ${d.toLocaleString('id-ID', { month: 'short' }).toUpperCase()}`,
      value: Number(p.predicted_amount)
    };
  });

  const latestPred = predictions[predictions.length - 1];
  const accuracyScore = latestPred ? Math.round(latestPred.confidence_score * 100) : 94;

  const projectedTotal = warningStatus?.projectedTotal || 0;
  
  // Calculate distribution data from summary
  const expenseByCategory = summary?.expenseByCategory || {};
  const totalExpense = summary?.totalExpense || 0;
  
  // Sort categories by amount
  const sortedCategories = Object.entries(expenseByCategory)
    .sort(([,a], [,b]) => Number(b) - Number(a))
    .slice(0, 3); // top 3

  const colors = ['#80FF80', '#FFB6C1', '#D9D9D9'];
  return (
    <div className="bg-[#F0F0F0] min-h-screen p-4 md:p-8 font-sans text-black">
      
      {/* Header Section: Responsif Stack di Mobile, Row di Desktop */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6 text-left">
        <div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2 italic">Dashboard</h1>
          <div className="flex flex-wrap gap-2">
            <span className="bg-[#1A4D2E] text-[#4ade80] px-3 py-1 text-[10px] md:text-xs font-bold border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              AI AKTIF
            </span>
            <span className="bg-black text-white px-3 py-1 text-[10px] md:text-xs font-bold border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              AKURASI: <span className="text-[#4ade80]">{accuracyScore}%</span>
            </span>
          </div>
        </div>
        
        {/* Removed Pencarian Cepat for MVP */}
      </div>

      {/* Grid System: 1 Kolom di Mobile, 12 Kolom di Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
        
        {/* Main Forecast Chart Card: Full di mobile, 8 kolom di desktop */}
        <div className="col-span-1 md:col-span-12 lg:col-span-8 bg-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl md:text-2xl font-black uppercase italic">Proyeksi Saldo</h2>
            <div className="flex gap-2">
              <button className="border-2 border-black rounded-xl p-1 hover:bg-[#D4FF00] transition-colors"><Calendar size={20}/></button>
              <button className="border-2 border-black rounded-xl p-1 hover:bg-[#D4FF00] transition-colors"><Filter size={20}/></button>
            </div>
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
              <p className="text-[10px] font-black uppercase">Terproyeksi</p>
              <p className="text-xl md:text-2xl font-black leading-tight">Rp{projectedTotal.toLocaleString('id-ID')}</p>
            </div>
            <div className="bg-[#D9D9D9] border-4 border-black rounded-2xl p-4 flex-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-[10px] font-black uppercase">Tingkat Keyakinan</p>
              <p className="text-xl md:text-2xl font-black uppercase">Tinggi</p>
            </div>
          </div>
        </div>

        {/* Early Warning Side Card */}
        <div className="col-span-1 md:col-span-12 lg:col-span-4 bg-[#B22222] border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white p-2 border-2 border-black rounded-xl text-[#B22222] shrink-0">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-2xl xl:text-3xl font-black uppercase leading-none break-words min-w-0">Peringatan Dini</h2>
          </div>
          
          {warningStatus?.isOverBudget ? (
            <>
              <p className="font-bold mb-8 text-base md:text-lg leading-tight italic">
                Prediksi total pengeluaran bulan ini sebesar Rp {warningStatus.projectedTotal.toLocaleString('id-ID')} 
                melebihi anggaran Anda (Rp {warningStatus.totalBudget.toLocaleString('id-ID')}).
              </p>
              <div className="space-y-3">
                <button className="w-full bg-white text-[#B22222] border-4 border-black rounded-2xl py-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                  Tinjau Pengeluaran
                </button>
              </div>
            </>
          ) : (
             <p className="font-bold mb-8 text-base md:text-lg leading-tight italic">
               Pengeluaran Anda saat ini diprediksi masih dalam batas aman. Pertahankan pola keuangan Anda!
             </p>
          )}
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

        {/* Removed Market Sentiment Box for MVP */}
      </div>
    </div>
  );
};

export default Dashboard;