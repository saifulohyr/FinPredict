import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { AlertTriangle, Calendar, Filter, Search } from 'lucide-react';

const data = [
  { name: '1 MEI', value: 4000 },
  { name: '', value: 3500 },
  { name: '', value: 4200 },
  { name: '', value: 3800 },
  { name: '', value: 6000 },
  { name: '', value: 5000 },
  { name: '30 MEI', value: 8500 },
];

export const Dashboard = () => {
  return (
    <div className="bg-[#F5F5DC] min-h-screen p-4 md:p-8 font-sans text-black">
      
      {/* Header Section: Responsif Stack di Mobile, Row di Desktop */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6 text-left">
        <div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2 italic">Dashboard</h1>
          <div className="flex flex-wrap gap-2">
            <span className="bg-[#1A4D2E] text-[#4ade80] px-3 py-1 text-[10px] md:text-xs font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              AI AKTIF
            </span>
            <span className="bg-black text-white px-3 py-1 text-[10px] md:text-xs font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              AKURASI: <span className="text-[#4ade80]">99.4%</span>
            </span>
          </div>
        </div>
        
        <div className="w-full md:w-auto flex flex-col md:items-end">
          <span className="text-[10px] font-black uppercase mb-1">Pencarian Cepat</span>
          <div className="bg-white border-4 border-black p-3 md:p-4 w-full md:w-64 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-bold">Cari wawasan AI...</span>
              <Search size={18} className="text-black" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid System: 1 Kolom di Mobile, 12 Kolom di Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
        
        {/* Main Forecast Chart Card: Full di mobile, 8 kolom di desktop */}
        <div className="col-span-1 md:col-span-12 lg:col-span-8 bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl md:text-2xl font-black uppercase italic">Proyeksi Saldo</h2>
            <div className="flex gap-2">
              <button className="border-2 border-black p-1 hover:bg-[#FFFF00] transition-colors"><Calendar size={20}/></button>
              <button className="border-2 border-black p-1 hover:bg-[#FFFF00] transition-colors"><Filter size={20}/></button>
            </div>
          </div>

          <div className="h-[250px] md:h-[300px] w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
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
            <div className="bg-[#4ade80] border-4 border-black p-4 flex-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-[10px] font-black uppercase">Terproyeksi</p>
              <p className="text-xl md:text-2xl font-black leading-tight">Rp14.500.000</p>
            </div>
            <div className="bg-[#D9D9D9] border-4 border-black p-4 flex-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-[10px] font-black uppercase">Tingkat Keyakinan</p>
              <p className="text-xl md:text-2xl font-black uppercase">Tinggi</p>
            </div>
          </div>
        </div>

        {/* Early Warning Side Card */}
        <div className="col-span-1 md:col-span-12 lg:col-span-4 bg-[#B22222] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white p-2 border-2 border-black text-[#B22222]">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black uppercase leading-none">Peringatan Dini</h2>
          </div>
          
          <p className="font-bold mb-8 text-base md:text-lg leading-tight italic">
            Langganan "CloudScale Pro" diprediksi naik 40% pada siklus penagihan berikutnya.
          </p>

          <div className="space-y-3">
            <button className="w-full bg-white text-[#B22222] border-4 border-black py-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
              Batalkan Langganan
            </button>
            <button className="w-full bg-black text-white border-4 border-black py-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
              Abaikan Alerta
            </button>
          </div>
        </div>

        {/* Asset Distribution Card */}
        <div className="col-span-1 md:col-span-6 bg-[#FFFF00] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black uppercase mb-6 italic text-left">Distribusi Aset</h2>
          <div className="flex justify-between font-black text-[10px] md:text-sm mb-2 uppercase">
            <span>Aset Digital</span>
            <span>Rp4.200.000 (60%)</span>
          </div>
          <div className="w-full h-12 md:h-16 border-4 border-black flex mb-6">
            <div className="h-full w-[60%] bg-[#80FF80] border-r-4 border-black"></div>
            <div className="h-full w-[25%] bg-[#FFB6C1] border-r-4 border-black"></div>
            <div className="h-full w-[15%] bg-[#D9D9D9]"></div>
          </div>
          <div className="flex flex-wrap gap-4 font-black text-[10px] uppercase text-left">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#80FF80] border-2 border-black"></div> Stablecoins
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#FFB6C1] border-2 border-black"></div> Growth Tokens
            </div>
          </div>
        </div>

        {/* Market Sentiment Box */}
        <div className="col-span-1 md:col-span-6 border-4 border-black relative h-[250px] md:h-auto overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group">
          <img 
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800" 
            alt="Market" 
            className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 transition-all duration-500"
          />
          <div className="absolute bottom-4 left-4 right-4 bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-[10px] font-black uppercase mb-1">Prediksi Sentimen Pasar</p>
            <p className="text-xs md:text-sm font-bold italic leading-tight">"Volatilitas tinggi diperkirakan pada sektor teknologi dalam 72 jam ke depan."</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;