import { useState } from 'react';
import { Zap, ChevronDown, FileText } from 'lucide-react';

export function TransactionPage() {
  const [type, setType] = useState<'expense' | 'income'>('expense');

  return (
    <div className="bg-[#F5F5DC] min-h-screen font-sans text-black p-4 md:p-8">
      {/* Bagian Header: Stack di mobile, Row di desktop */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
        <div className="text-left">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2 leading-none">Entri Baru</h1>
          <p className="font-bold text-xs md:text-sm text-slate-800 uppercase italic">
            Catat transaksi keuangan dengan presisi standar AI.
          </p>
        </div>
        <div className="bg-black text-[#4ade80] px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(74,222,128,0.5)] self-start md:self-auto">
          <span className="font-black text-[10px] md:text-xs uppercase">Skor Akurasi: 98%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
        {/* Sisi Kiri: Formulir Utama (Full di mobile, 7 kolom di desktop) */}
        <div className="col-span-1 md:col-span-12 lg:col-span-7 bg-white border-4 border-black p-6 md:p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] outline outline-4 outline-black outline-offset-4">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            
            {/* Tombol Toggle: Responsif Height */}
            <div className="flex border-4 border-black">
              <button 
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 py-3 md:py-4 font-black uppercase text-xs md:text-base transition-all ${type === 'expense' ? 'bg-[#FFFF00]' : 'bg-white'}`}
              >
                Pengeluaran
              </button>
              <div className="w-1 bg-black"></div>
              <button 
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 py-3 md:py-4 font-black uppercase text-xs md:text-base transition-all ${type === 'income' ? 'bg-[#FFFF00]' : 'bg-white'}`}
              >
                Pemasukan
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Jumlah */}
              <div className="group">
                <label className="block text-[10px] md:text-xs font-black uppercase mb-1">Jumlah (Rp)</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  className="w-full border-4 border-black p-3 md:p-4 font-black text-2xl md:text-3xl focus:outline-none focus:bg-yellow-50"
                />
              </div>

              {/* Input Tanggal */}
              <div className="group">
                <label className="block text-[10px] md:text-xs font-black uppercase mb-1">Tanggal</label>
                <input 
                  type="date" 
                  className="w-full border-4 border-black p-3 md:p-4 font-black text-sm md:text-lg focus:outline-none focus:bg-yellow-50"
                />
              </div>
            </div>

            {/* Dropdown Kategori */}
            <div>
              <label className="block text-[10px] md:text-xs font-black uppercase mb-1">Kategori</label>
              <div className="relative">
                <select className="w-full border-4 border-black p-3 md:p-4 font-black text-sm md:text-base appearance-none focus:outline-none bg-white cursor-pointer">
                  <option>Software & Infrastruktur</option>
                  <option>Makanan & Minuman</option>
                  <option>Transportasi</option>
                  <option>Hiburan</option>
                  <option>Lainnya</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" size={20} />
              </div>
            </div>

            {/* Deskripsi Transaksi */}
            <div>
              <label className="block text-[10px] md:text-xs font-black uppercase mb-1">Deskripsi</label>
              <textarea 
                rows={3}
                placeholder="Identifikasi vendor atau tujuan spesifik..."
                className="w-full border-4 border-black p-3 md:p-4 font-bold text-sm focus:outline-none focus:bg-yellow-50 resize-none"
              ></textarea>
            </div>

            {/* Tombol Simpan: Responsif Font Size */}
            <button className="w-full bg-[#7CFF7C] border-4 border-black py-4 md:py-6 font-black uppercase text-2xl md:text-4xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[8px] active:translate-y-[8px] transition-all text-left px-6 md:px-8 leading-none">
              Catat Transaksi
            </button>
          </form>
        </div>

        {/* Sisi Kanan: Impor & AI (Full di mobile, 5 kolom di desktop) */}
        <div className="col-span-1 md:col-span-12 lg:col-span-5 space-y-8">
          
          {/* Kartu Impor Massal */}
          <div className="bg-[#FFFF00] border-4 border-black p-6 md:p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl md:text-3xl font-black uppercase mb-6 text-center italic">Impor Massal</h2>
            <div className="border-4 border-black border-dashed p-6 md:p-10 flex flex-col items-center justify-center bg-white/50 mb-6">
              <FileText size={40} className="mb-4" />
              <p className="font-black text-[10px] md:text-xs uppercase mb-1 text-center">Tarik File CSV ke Sini</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase text-center">Maks. 10MB per unggahan</p>
            </div>
            <button className="w-full bg-[#1A1A1A] text-white border-4 border-black py-3 md:py-4 font-black uppercase text-xs md:text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black transition-colors">
              Pilih File
            </button>
          </div>

          {/* Kartu Wawasan AI */}
          <div className="bg-[#FFB6C1] border-4 border-black p-6 md:p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white border-2 border-black p-2">
                <Zap size={20} className="fill-black" />
              </div>
              <h2 className="text-xl md:text-2xl font-black uppercase italic">Analisis AI</h2>
            </div>
            <p className="font-bold text-xs md:text-sm leading-tight mb-8">
              Mesin AI FinPredict akan secara otomatis memindai entri ini untuk mendeteksi anomali. Pola berulang akan teridentifikasi setelah 3 entri berturut-turut.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-black text-white text-[7px] md:text-[8px] font-black px-2 py-1 border-2 border-black uppercase whitespace-nowrap">Auto-Tagging Aktif</span>
              <span className="bg-black text-white text-[7px] md:text-[8px] font-black px-2 py-1 border-2 border-black uppercase whitespace-nowrap">Prediksi Real-Time</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}