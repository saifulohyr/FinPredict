import { useState, useRef } from 'react';
import { Zap, ChevronDown, FileText, Trash2, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';
import { useTransactions } from '../hooks/useTransactions';

export function TransactionPage() {
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [tableFilter, setTableFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

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

  const { useCreateTransactionMutation, useImportCsvMutation, useTransactionsQuery, useDeleteTransactionMutation, useTransactionSummaryQuery } = useTransactions();
  const createMutation = useCreateTransactionMutation();
  const importMutation = useImportCsvMutation();
  const deleteMutation = useDeleteTransactionMutation();
  
  const { data: transactions = [] } = useTransactionsQuery();
  const { data: summary } = useTransactionSummaryQuery();

  // Summary data
  const totalIncome = summary?.totalIncome || 0;
  const totalExpense = summary?.totalExpense || 0;
  const balance = summary?.balance || (totalIncome - totalExpense);

  // Filter transactions for table
  const filteredTransactions = tableFilter === 'ALL' 
    ? transactions 
    : transactions.filter((t: any) => t.category.type === tableFilter);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE));
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filter changes
  const handleFilterChange = (filter: 'ALL' | 'INCOME' | 'EXPENSE') => {
    setTableFilter(filter);
    setCurrentPage(1);
  };

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

  const handleDelete = (id: string) => {
    if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
      deleteMutation.mutate(id);
    }
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
    <div className="bg-[#F0F0F0] min-h-screen font-sans text-black p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
        <div className="text-left">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2 leading-none">Entri Baru</h1>
          <p className="font-bold text-xs md:text-sm text-slate-800 uppercase italic">
            Catat transaksi keuangan dengan presisi standar AI.
          </p>
        </div>
      </div>

      {/* Summary Banner: Pemasukan, Pengeluaran, Saldo Bersih */}
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

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
        {/* Left: Main Form */}
        <div className="col-span-1 md:col-span-12 lg:col-span-7 bg-white border-4 border-black rounded-2xl p-6 md:p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] outline outline-4 outline-black outline-offset-4">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Toggle Buttons */}
            <div className="flex border-4 border-black rounded-2xl">
              <button 
                type="button"
                onClick={() => setType('EXPENSE')}
                className={`flex-1 py-3 md:py-4 font-black uppercase text-xs md:text-base transition-all ${type === 'EXPENSE' ? 'bg-[#D4FF00]' : 'bg-white'}`}
              >
                Pengeluaran
              </button>
              <div className="w-1 bg-black"></div>
              <button 
                type="button"
                onClick={() => setType('INCOME')}
                className={`flex-1 py-3 md:py-4 font-black uppercase text-xs md:text-base transition-all ${type === 'INCOME' ? 'bg-[#D4FF00]' : 'bg-white'}`}
              >
                Pemasukan
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Amount Input */}
              <div className="group">
                <label className="block text-[10px] md:text-xs font-black uppercase mb-1">Jumlah (Rp)</label>
                <input 
                  type="text" 
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0" 
                  className="w-full border-4 border-black rounded-2xl p-3 md:p-4 font-black text-2xl md:text-3xl focus:outline-none focus:bg-yellow-50"
                  required
                />
              </div>

              {/* Date Input */}
              <div className="group">
                <label className="block text-[10px] md:text-xs font-black uppercase mb-1">Tanggal</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border-4 border-black rounded-2xl p-3 md:p-4 font-black text-sm md:text-lg focus:outline-none focus:bg-yellow-50"
                  required
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-[10px] md:text-xs font-black uppercase mb-1">Kategori</label>
              <div className="relative">
                <select 
                  value={categoryId} 
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full border-4 border-black rounded-2xl p-3 md:p-4 font-black text-sm md:text-base appearance-none focus:outline-none bg-white cursor-pointer"
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

            {/* Description */}
            <div>
              <label className="block text-[10px] md:text-xs font-black uppercase mb-1">Deskripsi</label>
              <textarea 
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Identifikasi vendor atau tujuan spesifik..."
                className="w-full border-4 border-black rounded-2xl p-3 md:p-4 font-bold text-sm focus:outline-none focus:bg-yellow-50 resize-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-[#A85CF9] border-4 border-black rounded-2xl py-4 md:py-6 font-black uppercase text-2xl md:text-4xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[8px] active:translate-y-[8px] transition-all text-left px-6 md:px-8 leading-none disabled:opacity-50"
            >
              {createMutation.isPending ? 'Mencatat...' : 'Catat Transaksi'}
            </button>
          </form>
        </div>

        {/* Right: Import & AI */}
        <div className="col-span-1 md:col-span-12 lg:col-span-5 space-y-8">
          
          {/* Import Card */}
          <div className="bg-[#D4FF00] border-4 border-black rounded-2xl p-6 md:p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl md:text-3xl font-black uppercase mb-6 text-center italic">Impor Massal</h2>
            <div className="border-4 border-black rounded-2xl border-dashed p-6 md:p-10 flex flex-col items-center justify-center bg-white/50 mb-6">
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
              className="w-full bg-[#1A1A1A] text-white border-4 border-black rounded-2xl py-3 md:py-4 font-black uppercase text-xs md:text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black transition-colors disabled:opacity-50"
            >
              {importMutation.isPending ? 'Mengimpor...' : 'Pilih File'}
            </button>
          </div>

          {/* AI Insights Card - with real data */}
          <div className="bg-[#FFB6C1] border-4 border-black rounded-2xl p-6 md:p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white border-2 border-black rounded-xl p-2">
                <Zap size={20} className="fill-black" />
              </div>
              <h2 className="text-xl md:text-2xl font-black uppercase italic">Analisis AI</h2>
            </div>
            
            {/* Show actual summary insights instead of static text */}
            {summary && totalExpense > 0 ? (
              <div className="space-y-3 mb-6">
                <p className="font-bold text-xs md:text-sm leading-tight">
                  Bulan ini Anda telah mencatat <span className="font-black">{summary.transactionCount || 0} transaksi</span>. 
                  Pengeluaran terbesar di kategori{' '}
                  <span className="font-black underline">
                    {Object.entries(summary.expenseByCategory || {}).sort(([,a]: any, [,b]: any) => b - a)[0]?.[0] || '-'}
                  </span>.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className={`text-[8px] md:text-[9px] font-black px-2 py-1 border-2 border-black rounded-xl uppercase whitespace-nowrap ${balance >= 0 ? 'bg-[#80FF80] text-black' : 'bg-[#B22222] text-white'}`}>
                    {balance >= 0 ? '✅ Saldo Positif' : '⚠️ Saldo Negatif'}
                  </span>
                  <span className="bg-black text-white text-[8px] md:text-[9px] font-black px-2 py-1 border-2 border-black rounded-xl uppercase whitespace-nowrap">
                    {summary.transactionCount || 0} Transaksi
                  </span>
                </div>
              </div>
            ) : (
              <p className="font-bold text-xs md:text-sm leading-tight mb-8">
                Belum ada cukup data transaksi bulan ini. Catat transaksi untuk mendapatkan insight dari AI.
              </p>
            )}
          </div>

        </div>

        {/* Transaction Table */}
        <div className="col-span-1 md:col-span-12 bg-white border-4 border-black rounded-2xl p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-xl md:text-2xl font-black uppercase italic">Riwayat Transaksi</h2>
            
            {/* Filter Bar */}
            <div className="flex border-4 border-black rounded-2xl overflow-hidden">
              <button 
                onClick={() => handleFilterChange('ALL')}
                className={`px-3 md:px-4 py-2 font-black uppercase text-[10px] md:text-xs transition-all ${tableFilter === 'ALL' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
              >
                Semua
              </button>
              <div className="w-[2px] bg-black"></div>
              <button 
                onClick={() => handleFilterChange('INCOME')}
                className={`px-3 md:px-4 py-2 font-black uppercase text-[10px] md:text-xs transition-all ${tableFilter === 'INCOME' ? 'bg-[#80FF80] text-black' : 'bg-white text-black hover:bg-gray-100'}`}
              >
                Pemasukan
              </button>
              <div className="w-[2px] bg-black"></div>
              <button 
                onClick={() => handleFilterChange('EXPENSE')}
                className={`px-3 md:px-4 py-2 font-black uppercase text-[10px] md:text-xs transition-all ${tableFilter === 'EXPENSE' ? 'bg-[#FFB6C1] text-black' : 'bg-white text-black hover:bg-gray-100'}`}
              >
                Pengeluaran
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-bold text-sm">
              <thead className="bg-[#D9D9D7] border-y-4 border-black text-xs uppercase font-black">
                <tr>
                  <th className="p-4">Tanggal</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Deskripsi</th>
                  <th className="p-4 text-right">Jumlah</th>
                  <th className="p-4 text-center w-16">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((t: any) => (
                  <tr key={t.id} className="border-b-2 border-black border-dashed hover:bg-yellow-50 transition-colors">
                    <td className="p-4">{new Date(t.transaction_date).toLocaleDateString('id-ID')}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] uppercase font-black border-2 border-black rounded-xl ${t.category.type === 'INCOME' ? 'bg-[#80FF80]' : 'bg-[#FFB6C1]'}`}>
                        {t.category.name}
                      </span>
                    </td>
                    <td className="p-4">{t.description || '-'}</td>
                    <td className={`p-4 text-right font-black ${t.category.type === 'INCOME' ? 'text-[#1A4D2E]' : 'text-[#B22222]'}`}>
                      {t.category.type === 'INCOME' ? '+' : '-'}Rp{Number(t.amount).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleDelete(t.id)}
                        disabled={deleteMutation.isPending}
                        className="bg-[#B22222] text-white border-2 border-black rounded-xl p-1.5 hover:bg-red-800 transition-colors disabled:opacity-50"
                        title="Hapus transaksi"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center italic text-slate-500">
                      {tableFilter === 'ALL' ? 'Belum ada transaksi.' : `Belum ada transaksi ${tableFilter === 'INCOME' ? 'pemasukan' : 'pengeluaran'}.`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredTransactions.length > ITEMS_PER_PAGE && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t-4 border-black">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 bg-black text-white px-4 py-2 font-black uppercase text-xs border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-30 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              >
                <ChevronLeft size={14} /> Sebelumnya
              </button>
              <span className="font-black text-xs uppercase">
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 bg-black text-white px-4 py-2 font-black uppercase text-xs border-2 border-black rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] disabled:opacity-30 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              >
                Berikutnya <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}