import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { BrainCircuit, TrendingUp, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

const data = [
  { name: '1 Mei', aktual: 4000, prediksi: null },
  { name: '5 Mei', aktual: 3500, prediksi: null },
  { name: '10 Mei', aktual: 5200, prediksi: null },
  { name: '15 Mei', aktual: 4800, prediksi: 4800 },
  { name: '20 Mei', aktual: null, prediksi: 6100 },
  { name: '25 Mei', aktual: null, prediksi: 5500 },
  { name: '30 Mei', aktual: null, prediksi: 7200 },
];

export function AIAnalyticsPage() {
  return (
    <div className="bg-[#F5F5DC] min-h-screen font-sans text-black p-4 md:p-8">
      
      {/* Header Section: Stack di Mobile, Row di Desktop */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6 text-left">
        <div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2 italic leading-none">Analisis AI</h1>
          <div className="flex flex-wrap gap-2">
            <span className="bg-[#4ade80] text-black px-3 py-1 text-[10px] md:text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              MODEL: LSTM-V3
            </span>
            <span className="bg-white text-black px-3 py-1 text-[10px] md:text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
              Latihan Terakhir: 2 jam lalu
            </span>
          </div>
        </div>
        <div className="bg-black text-white p-4 border-4 border-black shadow-[6px_6px_0px_0px_rgba(74,222,128,1)] self-start md:self-auto">
           <p className="text-[10px] font-black uppercase text-[#4ade80]">Skor Akurasi</p>
           <p className="text-2xl md:text-3xl font-black italic">94.82%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 text-left">
        
        {/* KARTU UTAMA: GRAFIK PROYEKSI KAS */}
        <div className="col-span-1 md:col-span-12 bg-white border-4 border-black p-4 md:p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] outline outline-4 outline-black outline-offset-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <h2 className="text-xl md:text-2xl font-black uppercase flex items-center gap-2">
              <BrainCircuit size={28} className="shrink-0" /> Proyeksi Arus Kas
            </h2>
            <div className="flex flex-wrap gap-4 text-[9px] md:text-[10px] font-black uppercase">
              <div className="flex items-center gap-1"><div className="w-3 h-1 bg-black"></div> Data Riil</div>
              <div className="flex items-center gap-1"><div className="w-3 h-1 bg-black border-t-2 border-dashed"></div> Prediksi AI</div>
            </div>
          </div>
          
          <div className="h-[250px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
                <XAxis dataKey="name" axisLine={{ strokeWidth: 4 }} tick={{ fontWeight: 'bold', fontSize: 10 }} />
                <YAxis axisLine={{ strokeWidth: 4 }} tick={{ fontWeight: 'bold', fontSize: 10 }} width={40} />
                <Tooltip 
                  contentStyle={{ border: '4px solid black', fontWeight: 'bold', borderRadius: '0px', fontSize: '12px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="aktual" 
                  stroke="black" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: 'black' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="prediksi" 
                  stroke="#4ade80" 
                  strokeWidth={4} 
                  strokeDasharray="8 8" 
                  dot={{ r: 4, fill: '#4ade80', stroke: 'black', strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KARTU RISIKO & WAWASAN: Stack di Mobile & Tablet, 3 Kolom di Desktop Besar */}
        <div className="col-span-1 md:col-span-12 lg:col-span-4 bg-[#FFB6C1] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="bg-white border-2 border-black w-fit p-2 mb-4">
            <AlertTriangle size={24} />
          </div>
          <h3 className="font-black text-lg md:text-xl uppercase mb-2 leading-none">Anomali Terdeteksi</h3>
          <p className="font-bold text-xs md:text-sm mb-6 leading-tight italic">
            "Pengeluaran akhir pekan Anda meningkat 25% selama 3 minggu terakhir. AI memprediksi anggaran habis pada 24 Mei."
          </p>
          <button className="w-full bg-black text-white py-3 font-black uppercase text-[10px] border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
            Sesuaikan Anggaran
          </button>
        </div>

        <div className="col-span-1 md:col-span-12 lg:col-span-4 bg-[#7CFF7C] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="bg-white border-2 border-black w-fit p-2 mb-4">
            <TrendingUp size={24} />
          </div>
          <h3 className="font-black text-lg md:text-xl uppercase mb-2 leading-none">Peluang Menabung</h3>
          <p className="font-bold text-xs md:text-sm mb-6 leading-tight italic">
            "AI menemukan langganan rutin senilai Rp75rb yang tidak digunakan dalam 60 hari. Batalkan untuk menambah surplus."
          </p>
          <button className="w-full bg-white text-black py-3 font-black uppercase text-[10px] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
            Tinjau Langganan
          </button>
        </div>

        <div className="col-span-1 md:col-span-12 lg:col-span-4 bg-[#FFFF00] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="bg-white border-2 border-black w-fit p-2 mb-4">
            <ShieldCheck size={24} />
          </div>
          <h3 className="font-black text-lg md:text-xl uppercase mb-2 leading-none">Stabilitas Keuangan</h3>
          <p className="font-bold text-xs md:text-sm mb-6 leading-tight italic">
            "Skor kepercayaan tinggi. Anda berada di jalur yang tepat untuk mencapai target tabungan Rp2 Juta di akhir Juni."
          </p>
          <div className="flex items-center gap-2 font-black text-[10px] uppercase underline cursor-pointer hover:bg-black hover:text-[#FFFF00] transition-colors w-fit px-1">
            Lihat Laporan Lengkap <ArrowRight size={14} />
          </div>
        </div>

        {/* BAGIAN BAWAH: ANALISIS PERILAKU: Stack di Mobile */}
        <div className="col-span-1 md:col-span-12 bg-black text-white border-4 border-black p-6 md:p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col lg:flex-row gap-8 items-center">
          <div className="flex-1 text-left">
             <h2 className="text-2xl md:text-3xl font-black uppercase mb-4 text-[#4ade80]">Wawasan Perilaku</h2>
             <p className="text-base md:text-lg font-bold leading-tight">
               Model LSTM kami telah mempelajari siklus belanja Anda. Anda cenderung membelanjakan <span className="text-[#FFFF00]">40% lebih banyak</span> pada Jumat pertama setelah gajian. Sistem akan menyesuaikan peringatan secara otomatis.
             </p>
          </div>
          <div className="w-full lg:w-1/3 bg-white/10 p-4 border-2 border-dashed border-[#4ade80]">
             <p className="text-[10px] font-black uppercase mb-2 text-[#4ade80]">Keyakinan Pola AI</p>
             <div className="w-full h-4 bg-white/20 border border-white relative">
                <div className="h-full bg-[#4ade80] w-[85%]"></div>
             </div>
             <p className="text-right text-[10px] font-black mt-1 uppercase">85% Kecocokan Pola</p>
          </div>
        </div>

      </div>
    </div>
  );
}