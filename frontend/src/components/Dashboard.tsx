import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { AlertTriangle, Calendar, Filter, Search } from 'lucide-react';

// Data simulasi untuk grafik balance forecast
const data = [
  { name: 'OCT 1', value: 4000 },
  { name: '', value: 3500 },
  { name: '', value: 4200 },
  { name: '', value: 3800 },
  { name: '', value: 6000 },
  { name: '', value: 5000 },
  { name: 'OCT 30', value: 8500 },
];

export const Dashboard = () => {
  return (
    <div className="bg-[#F5F5DC] min-h-screen p-8 font-sans text-black">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-6xl font-black uppercase tracking-tighter mb-2">Dashboard</h1>
          <div className="flex gap-2">
            <span className="bg-[#1A4D2E] text-[#4ade80] px-3 py-1 text-xs font-bold border-2 border-black">
              AI ACTIVE
            </span>
            <span className="bg-black text-white px-3 py-1 text-xs font-bold border-2 border-black">
              PRECISION: <span className="text-[#4ade80]">99.4%</span>
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold uppercase mb-1">Quick Search</span>
          <div className="bg-white border-4 border-black p-4 w-48 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-sm">Search insights...</span>
              <Search size={18} className="text-black" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Forecast Chart Card */}
        <div className="col-span-8 bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black uppercase italic">Balance Forecast</h2>
            <div className="flex gap-2">
              <button className="border-2 border-black p-1 hover:bg-slate-100"><Calendar size={20}/></button>
              <button className="border-2 border-black p-1 hover:bg-slate-100"><Filter size={20}/></button>
            </div>
          </div>

          <div className="h-[300px] w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#1A4D2E" 
                  strokeWidth={8} 
                  dot={{ r: 6, fill: 'black', strokeWidth: 0 }}
                  activeDot={{ r: 10, stroke: 'black', strokeWidth: 2 }}
                />
                <XAxis dataKey="name" axisLine={{ strokeWidth: 4 }} tick={{ fontWeight: 'bold' }} />
                <YAxis hide />
                <Tooltip contentStyle={{ border: '4px solid black', fontWeight: 'bold' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-4">
            <div className="bg-[#4ade80] border-4 border-black p-4 w-40 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-[10px] font-black uppercase">Projected</p>
              <p className="text-2xl font-black leading-tight">$14,500.00</p>
            </div>
            <div className="bg-[#D9D9D9] border-4 border-black p-4 w-40 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-[10px] font-black uppercase">Confidence</p>
              <p className="text-2xl font-black uppercase">High</p>
            </div>
          </div>
        </div>

        {/* Early Warning Side Card */}
        <div className="col-span-4 bg-[#B22222] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white p-2 border-2 border-black text-[#B22222]">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-3xl font-black uppercase leading-none">Early Warning</h2>
          </div>
          
          <p className="font-bold mb-8 text-lg leading-tight">
            Subscription "CloudScale Pro" expected to increase by 40% next billing cycle.
          </p>

          <div className="space-y-3">
            <button className="w-full bg-white text-[#B22222] border-4 border-black py-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              Cancel Subscription
            </button>
            <button className="w-full bg-[#8B0000] text-white border-4 border-black py-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Dismiss Alert
            </button>
          </div>
        </div>

        {/* Asset Distribution Card */}
        <div className="col-span-6 bg-[#FFFF00] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black uppercase mb-6">Asset Distribution</h2>
          <div className="flex justify-between font-black text-sm mb-2 uppercase">
            <span>Digital Assets</span>
            <span>$4,200 (60%)</span>
          </div>
          <div className="w-full h-16 border-4 border-black flex mb-6">
            <div className="h-full w-[60%] bg-[#80FF80] border-r-4 border-black"></div>
            <div className="h-full w-[25%] bg-[#FFB6C1] border-r-4 border-black"></div>
            <div className="h-full w-[15%] bg-[#D9D9D9]"></div>
          </div>
          <div className="flex gap-8 font-black text-[10px] uppercase">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#80FF80] border-2 border-black"></div> Stablecoins
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#FFB6C1] border-2 border-black"></div> Growth Tokens
            </div>
          </div>
        </div>

        {/* Market Sentiment Prediction Image Box */}
        <div className="col-span-6 border-4 border-black relative overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group">
          <img 
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800" 
            alt="Market" 
            className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 transition-all duration-500"
          />
          <div className="absolute bottom-6 left-6 right-6 bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-xs font-black uppercase mb-1">Market Sentiment Prediction</p>
            <p className="font-bold italic">"High volatility expected in tech sector within 72 hours."</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;