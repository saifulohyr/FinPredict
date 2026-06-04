import { useState, useEffect } from 'react';
import { Settings, Wallet, Bell, ShieldCheck, Save, Target } from 'lucide-react';
import { useBudgets } from '../hooks/useBudgets';
import { useCategories } from '../hooks/useCategories';
import { useTransactions } from '../hooks/useTransactions';
import { useSettings } from '../hooks/useSettings';

export function BudgetSettingsPage() {
  const [isAiActive, setIsAiActive] = useState(true);
  const [notifHighSpending, setNotifHighSpending] = useState(true);
  const [notifLowBalance, setNotifLowBalance] = useState(true);
  const [fixedIncome, setFixedIncome] = useState('');
  const [savingsTarget, setSavingsTarget] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ income?: boolean; savings?: boolean }>({});
  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Settings from backend
  const { useSettingsQuery, useUpdateSettingsMutation } = useSettings();
  const { data: userSettings } = useSettingsQuery();
  const updateSettingsMutation = useUpdateSettingsMutation();

  // Sync settings from backend
  useEffect(() => {
    if (userSettings) {
      setIsAiActive(userSettings.ai_enabled);
      setNotifHighSpending(userSettings.notif_high_spending);
      setNotifLowBalance(userSettings.notif_low_balance);
    }
  }, [userSettings]);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleFixedIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\./g, '');
    if (!isNaN(Number(rawValue))) {
      setFixedIncome(rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
    }
  };

  const handleSavingsTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\./g, '');
    if (!isNaN(Number(rawValue))) {
      setSavingsTarget(rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
    }
  };
  
  const { useBudgetsQuery, useUpsertBudgetMutation } = useBudgets();
  const { data: budgets = [] } = useBudgetsQuery();
  const upsertMutation = useUpsertBudgetMutation();

  const { useCategoriesQuery } = useCategories();
  const { data: categories = [] } = useCategoriesQuery();

  const { useTransactionsQuery } = useTransactions();
  const { data: transactions = [] } = useTransactionsQuery();

  const handleExportJson = () => {
    if (transactions.length === 0) {
      showToast('Tidak ada data transaksi untuk diekspor.', 'error');
      return;
    }
    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finpredict_dataset_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Dataset berhasil diekspor!', 'success');
  };

  useEffect(() => {
    // Find basic categories if they exist in budgets
    const incomeBudget = budgets.find((b: any) => b.category?.name === 'Pemasukan Tetap' || b.category?.type === 'INCOME');
    const savingsBudget = budgets.find((b: any) => b.category?.name === 'Target Tabungan');
    
    if (incomeBudget) setFixedIncome(incomeBudget.monthly_limit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
    if (savingsBudget) setSavingsTarget(savingsBudget.monthly_limit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
  }, [budgets]);

  const handleSave = async () => {
    // Validation
    const errors: { income?: boolean; savings?: boolean } = {};
    const incomeVal = Number(fixedIncome.replace(/\./g, ''));
    const savingsVal = Number(savingsTarget.replace(/\./g, ''));
    if (!fixedIncome || incomeVal <= 0) errors.income = true;
    if (!savingsTarget || savingsVal <= 0) errors.savings = true;
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      showToast('Pemasukan tetap dan target tabungan wajib diisi!', 'error');
      return;
    }
    setValidationErrors({});

    try {
      // Find category IDs
      const incomeCat = categories.find((c: any) => c.type === 'INCOME');
      const savingCat = categories.find((c: any) => c.name.toLowerCase().includes('tabungan'));
      
      const promises = [];
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01'; // YYYY-MM-01

      if (incomeCat && fixedIncome) {
        promises.push(upsertMutation.mutateAsync({
          category_id: incomeCat.id,
          monthly_limit: incomeVal,
          month_year: currentMonth
        }));
      }
      if (savingCat && savingsTarget) {
        promises.push(upsertMutation.mutateAsync({
          category_id: savingCat.id,
          monthly_limit: savingsVal,
          month_year: currentMonth
        }));
      }

      // Save settings to backend
      promises.push(updateSettingsMutation.mutateAsync({
        ai_enabled: isAiActive,
        notif_high_spending: notifHighSpending,
        notif_low_balance: notifLowBalance,
      }));

      await Promise.all(promises);
      showToast('Pengaturan anggaran berhasil disimpan!', 'success');
    } catch (error) {
      showToast('Gagal menyimpan anggaran.', 'error');
    }
  };

  return (
    <div className="bg-[#F0F0F0] min-h-screen font-sans text-black p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6 text-left">
        <div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2 italic leading-none">Pengaturan</h1>
          <p className="font-bold text-xs md:text-sm text-slate-800 uppercase italic">
            Konfigurasi parameter AI dan batasan anggaran Anda.
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={upsertMutation.isPending}
          className="bg-[#A85CF9] border-4 border-black rounded-2xl px-6 py-3 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50"
        >
          <Save size={18} /> {upsertMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
        
        {/* KOLOM KIRI: BUDGETING (8 KOLOM) */}
        <div className="col-span-1 md:col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] outline outline-4 outline-black outline-offset-4">
            <h2 className="text-2xl font-black uppercase mb-8 flex items-center gap-3">
              <Wallet size={28} /> Alokasi Anggaran Bulanan
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase border-2 border-black rounded-xl bg-[#D9D9D7] px-2 py-0.5 ml-3 -mb-2 relative z-20 w-fit">
                    Pemasukan Tetap
                  </label>
                  <input 
                    type="text" 
                    value={fixedIncome}
                    onChange={handleFixedIncomeChange}
                    placeholder="Masukkan pemasukan tetap"
                    className={`w-full border-4 rounded-2xl p-4 font-black text-xl focus:bg-[#D4FF00] outline-none transition-colors ${validationErrors.income ? 'border-[#B22222] bg-red-50' : 'border-black'}`} 
                  />
                  {validationErrors.income && <p className="text-[10px] font-bold text-[#B22222] mt-1 uppercase">Wajib diisi</p>}
                </div>
                
                <div>
                  <label className="block text-[10px] font-black uppercase border-2 border-black rounded-xl bg-[#D9D9D7] px-2 py-0.5 ml-3 -mb-2 relative z-20 w-fit">
                    Target Tabungan
                  </label>
                  <input 
                    type="text" 
                    value={savingsTarget}
                    onChange={handleSavingsTargetChange}
                    placeholder="Masukkan target tabungan"
                    className={`w-full border-4 rounded-2xl p-4 font-black text-xl focus:bg-[#D4FF00] outline-none transition-colors ${validationErrors.savings ? 'border-[#B22222] bg-red-50' : 'border-black'}`} 
                  />
                  {validationErrors.savings && <p className="text-[10px] font-bold text-[#B22222] mt-1 uppercase">Wajib diisi</p>}
                </div>
              </div>

              <div className="bg-[#D4FF00] border-4 border-black rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <Target size={40} className="mb-2" />
                <p className="font-black text-xs uppercase mb-1 text-black">Anggaran Aman (Prediksi AI)</p>
                <p className="text-4xl font-black leading-none italic">Rp {(fixedIncome && savingsTarget) ? ((Number(fixedIncome.replace(/\./g, '')) || 0) - (Number(savingsTarget.replace(/\./g, '')) || 0)).toLocaleString('id-ID') : '0'}</p>
                <p className="text-[10px] font-bold mt-2 uppercase">Batas pengeluaran bulanan agar target tercapai.</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
              <Bell size={28} /> Ambang Batas Peringatan
            </h2>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black pb-4 border-dashed">
                <div>
                  <p className="font-black uppercase text-sm">Peringatan Pengeluaran Tinggi</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase italic">Kirim notifikasi jika transaksi {'>'} Rp 500.000</p>
                </div>
                <input type="checkbox" checked={notifHighSpending} onChange={(e) => setNotifHighSpending(e.target.checked)} className="w-8 h-8 border-4 border-black rounded-2xl checked:bg-[#4ade80] appearance-none cursor-pointer relative checked:after:content-['✓'] checked:after:absolute checked:after:left-1 checked:after:top-0 checked:after:text-black checked:after:font-bold" />
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="font-black uppercase text-sm">Prediksi Saldo Rendah</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase italic">Ingatkan jika AI memprediksi saldo habis dalam 5 hari.</p>
                </div>
                <input type="checkbox" checked={notifLowBalance} onChange={(e) => setNotifLowBalance(e.target.checked)} className="w-8 h-8 border-4 border-black rounded-2xl checked:bg-[#4ade80] appearance-none cursor-pointer relative checked:after:content-['✓'] checked:after:absolute checked:after:left-1 checked:after:top-0 checked:after:text-black checked:after:font-bold" />
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: AI SETTINGS (4 KOLOM) */}
        <div className="col-span-1 md:col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-[#4ade80] border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white border-2 border-black rounded-xl p-2">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-2xl font-black uppercase italic">Mode AI</h2>
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={() => setIsAiActive(!isAiActive)}
                className={`w-full border-4 border-black rounded-2xl p-4 font-black uppercase text-center transition-all ${isAiActive ? 'bg-black text-[#4ade80]' : 'bg-white text-black'}`}
              >
                {isAiActive ? 'LSTM Engine: AKTIF' : 'LSTM Engine: MATI'}
              </button>
              <p className="text-[10px] font-bold leading-tight uppercase italic text-black">
                Saat aktif, sistem akan mempelajari pola belanja Anda untuk memberikan prediksi arus kas yang presisi.
              </p>
            </div>
          </div>

          <div className="bg-black text-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-3 mb-4">
              <Settings size={24} className="text-[#D4FF00]" />
              <h2 className="text-xl font-black uppercase italic text-[#D4FF00]">Data & Privasi</h2>
            </div>
            <p className="text-xs font-bold mb-6 leading-relaxed opacity-80 uppercase tracking-wider">
              Data transaksi dienkripsi secara lokal sebelum diproses oleh model LSTM FinPredict.
            </p>
            <button 
              onClick={handleExportJson}
              className="w-full bg-white text-black py-2 font-black uppercase text-[10px] border-2 border-white hover:bg-[#D4FF00] transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
            >
              Ekspor Dataset (.JSON)
            </button>
          </div>
        </div>

      </div>

      {/* Neo-Brutalism Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50">
          <div className={`border-4 border-black rounded-2xl p-4 md:p-6 font-black uppercase text-sm md:text-base shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 ${
            toastMessage.type === 'success' ? 'bg-[#A85CF9] text-black' : 'bg-[#FF4D4D] text-white'
          }`}>
            {toastMessage.type === 'success' ? <ShieldCheck size={28} /> : <Bell size={28} />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}