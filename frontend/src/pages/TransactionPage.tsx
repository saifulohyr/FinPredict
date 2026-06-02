import { useState, useRef } from 'react';
import { Zap, ChevronDown, FileText } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { useTransactions } from '../hooks/useTransactions';

export function TransactionPage() {
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\./g, '');
    if (!isNaN(Number(rawValue))) {
      setAmount(rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
    }
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { useCategoriesQuery } = useCategories();
  const { data: categories = [] } = useCategoriesQuery();
  const filteredCategories = categories.filter((c: any) => c.type === type);

  const { useCreateTransactionMutation, useImportCsvMutation, useTransactionsQuery } = useTransactions();
  const createMutation = useCreateTransactionMutation();
  const importMutation = useImportCsvMutation();
  
  const { data: transactions = [] } = useTransactionsQuery();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date || !categoryId) return;
    
    createMutation.mutate({
      category_id: Number(categoryId),
      amount: Number(amount.replace(/\./g, '')),
      transaction_date: date,
      description
    }, {
      onSuccess: () => {
        setAmount('');
        setDate('');
        setDescription('');
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target?.result as string;
      importMutation.mutate(csvData, {
        onSuccess: () => {
          if (fileInputRef.current) fileInputRef.current.value = '';
          alert('Berhasil mengimpor transaksi!');
        },
        onError: (err: any) => {
          alert(`Gagal impor: ${err.response?.data?.message || 'Unknown error'}`);
        }
      });
    };
    reader.readAsText(file);
  };

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
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Tombol Toggle: Responsif Height */}
            <div className="flex border-4 border-black">
              <button 
                type="button"
                onClick={() => setType('EXPENSE')}
                className={`flex-1 py-3 md:py-4 font-black uppercase text-xs md:text-base transition-all ${type === 'EXPENSE' ? 'bg-[#FFFF00]' : 'bg-white'}`}
              >
                Pengeluaran
              </button>
              <div className="w-1 bg-black"></div>
              <button 
                type="button"
                onClick={() => setType('INCOME')}
                className={`flex-1 py-3 md:py-4 font-black uppercase text-xs md:text-base transition-all ${type === 'INCOME' ? 'bg-[#FFFF00]' : 'bg-white'}`}
              >
                Pemasukan
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Jumlah */}
              <div className="group">
                <label className="block text-[10px] md:text-xs font-black uppercase mb-1">Jumlah (Rp)</label>
                <input 
                  type="text" 
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0" 
                  className="w-full border-4 border-black p-3 md:p-4 font-black text-2xl md:text-3xl focus:outline-none focus:bg-yellow-50"
                  required
                />
              </div>

              {/* Input Tanggal */}
              <div className="group">
                <label className="block text-[10px] md:text-xs font-black uppercase mb-1">Tanggal</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border-4 border-black p-3 md:p-4 font-black text-sm md:text-lg focus:outline-none focus:bg-yellow-50"
                  required
                />
              </div>
            </div>

            {/* Dropdown Kategori */}
            <div>
              <label className="block text-[10px] md:text-xs font-black uppercase mb-1">Kategori</label>
              <div className="relative">
                <select 
                  value={categoryId} 
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full border-4 border-black p-3 md:p-4 font-black text-sm md:text-base appearance-none focus:outline-none bg-white cursor-pointer"
                  required
                >
                  <option value="" disabled>Pilih Kategori</option>
                  {filteredCategories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" size={20} />
              </div>
            </div>

            {/* Deskripsi Transaksi */}
            <div>
              <label className="block text-[10px] md:text-xs font-black uppercase mb-1">Deskripsi</label>
              <textarea 
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Identifikasi vendor atau tujuan spesifik..."
                className="w-full border-4 border-black p-3 md:p-4 font-bold text-sm focus:outline-none focus:bg-yellow-50 resize-none"
              ></textarea>
            </div>

            {/* Tombol Simpan: Responsif Font Size */}
            <button 
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-[#7CFF7C] border-4 border-black py-4 md:py-6 font-black uppercase text-2xl md:text-4xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[8px] active:translate-y-[8px] transition-all text-left px-6 md:px-8 leading-none disabled:opacity-50"
            >
              {createMutation.isPending ? 'Mencatat...' : 'Catat Transaksi'}
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
              <p className="font-black text-[10px] md:text-xs uppercase mb-1 text-center">Pilih File CSV</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase text-center">Format: date,category_id,amount,description</p>
              <input 
                type="file" 
                accept=".csv"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={importMutation.isPending}
              className="w-full bg-[#1A1A1A] text-white border-4 border-black py-3 md:py-4 font-black uppercase text-xs md:text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black transition-colors disabled:opacity-50"
            >
              {importMutation.isPending ? 'Mengimpor...' : 'Pilih File'}
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

        {/* Tabel Transaksi */}
        <div className="col-span-1 md:col-span-12 bg-white border-4 border-black p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] mt-8">
          <h2 className="text-xl md:text-2xl font-black uppercase mb-6 italic">Riwayat Transaksi</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-bold text-sm">
              <thead className="bg-[#D9D9D7] border-y-4 border-black text-xs uppercase font-black">
                <tr>
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Deskripsi</th>
                  <th className="p-4 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 10).map((t: any) => (
                  <tr key={t.id} className="border-b-2 border-black border-dashed hover:bg-yellow-50">
                    <td className="p-4">{new Date(t.transaction_date).toLocaleDateString('id-ID')}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] uppercase font-black border-2 border-black ${t.category.type === 'INCOME' ? 'bg-[#80FF80]' : 'bg-[#FFB6C1]'}`}>
                        {t.category.name}
                      </span>
                    </td>
                    <td className="p-4">{t.description || '-'}</td>
                    <td className={`p-4 text-right font-black ${t.category.type === 'INCOME' ? 'text-[#1A4D2E]' : 'text-[#B22222]'}`}>
                      {t.category.type === 'INCOME' ? '+' : '-'}Rp{Number(t.amount).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center italic text-slate-500">Belum ada transaksi.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}