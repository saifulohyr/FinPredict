import { useState, useEffect } from 'react';
import { Settings, Wallet, Bell, ShieldCheck, Save, Target } from 'lucide-react';
import { useBudgets } from '../hooks/useBudgets';
import { useCategories } from '../hooks/useCategories';

export function BudgetSettingsPage() {
  const [isAiActive, setIsAiActive] = useState(true);
  const [fixedIncome, setFixedIncome] = useState('7.500.000');
  const [savingsTarget, setSavingsTarget] = useState('2.000.000');
  const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

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

  useEffect(() => {
    // Find basic categories if they exist in budgets
    const incomeBudget = budgets.find((b: any) => b.category?.name === 'Pemasukan Tetap' || b.category?.type === 'INCOME');
    const savingsBudget = budgets.find((b: any) => b.category?.name === 'Target Tabungan');
    
    if (incomeBudget) setFixedIncome(incomeBudget.monthly_limit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
    if (savingsBudget) setSavingsTarget(savingsBudget.monthly_limit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."));
  }, [budgets]);

  const handleSave = async () => {
    try {
      // Find category IDs
      const incomeCat = categories.find((c: any) => c.type === 'INCOME');
      const savingCat = categories.find((c: any) => c.name.toLowerCase().includes('tabungan'));
      
      const promises = [];
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01'; // YYYY-MM-01

      if (incomeCat && fixedIncome) {
        promises.push(upsertMutation.mutateAsync({
          category_id: incomeCat.id,
          monthly_limit: Number(fixedIncome.replace(/\./g, '')),
          month_year: currentMonth
        }));
      }
      if (savingCat && savingsTarget) {
        promises.push(upsertMutation.mutateAsync({
          category_id: savingCat.id,
          monthly_limit: Number(savingsTarget.replace(/\./g, '')),
          month_year: currentMonth
        }));
      }

      await Promise.all(promises);
      showToast('Pengaturan anggaran berhasil disimpan!', 'success');
    } catch (error) {
      showToast('Gagal menyimpan anggaran.', 'error');
    }
  };

  return (
    <div className="bg-[#F5F5DC] min-h-screen font-sans text-black p-4 md:p-8">
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
          className="bg-[#7CFF7C] border-4 border-black px-6 py-3 font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50"
        >
          <Save size={18} /> {upsertMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
        
        {/* KOLOM KIRI: BUDGETING (8 KOLOM) */}
        <div className="col-span-1 md:col-span-12 lg:col-span-8 space-y-8">
          <div className="bg-white border-4 border-black p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] outline outline-4 outline-black outline-offset-4">
            <h2 className="text-2xl font-black uppercase mb-8 flex items-center gap-3">
              <Wallet size={28} /> Alokasi Anggaran Bulanan
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase border-2 border-black bg-[#D9D9D7] px-2 py-0.5 ml-3 -mb-2 relative z-20 w-fit">
                    Pemasukan Tetap
                  </label>
                  <input 
                    type="text" 
                    value={fixedIncome}
                    onChange={handleFixedIncomeChange}
                    className="w-full border-4 border-black p-4 font-black text-xl focus:bg-[#FFFF00] outline-none transition-colors" 
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black uppercase border-2 border-black bg-[#D9D9D7] px-2 py-0.5 ml-3 -mb-2 relative z-20 w-fit">
                    Target Tabungan
                  </label>
                  <input 
                    type="text" 
                    value={savingsTarget}
                    onChange={handleSavingsTargetChange}
                    className="w-full border-4 border-black p-4 font-black text-xl focus:bg-[#FFFF00] outline-none transition-colors" 
                  />
                </div>
              </div>

              <div className="bg-[#FFFF00] border-4 border-black p-6 flex flex-col justify-center items-center text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <Target size={40} className="mb-2" />
                <p className="font-black text-xs uppercase mb-1 text-black">Anggaran Aman (Prediksi AI)</p>
                <p className="text-4xl font-black leading-none italic">Rp {(Number(fixedIncome.replace(/\./g, '')) - Number(savingsTarget.replace(/\./g, ''))).toLocaleString('id-ID')}</p>
                <p className="text-[10px] font-bold mt-2 uppercase">Batas pengeluaran bulanan agar target tercapai.</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-4 border-black p-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
              <Bell size={28} /> Ambang Batas Peringatan
            </h2>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-black pb-4 border-dashed">
                <div>
                  <p className="font-black uppercase text-sm">Peringatan Pengeluaran Tinggi</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase italic">Kirim notifikasi jika transaksi {'>'} Rp 500.000</p>
                </div>
                <input type="checkbox" className="w-8 h-8 border-4 border-black checked:bg-[#4ade80] appearance-none cursor-pointer relative checked:after:content-['✓'] checked:after:absolute checked:after:left-1 checked:after:top-0 checked:after:text-black checked:after:font-bold" defaultChecked />
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="font-black uppercase text-sm">Prediksi Saldo Rendah</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase italic">Ingatkan jika AI memprediksi saldo habis dalam 5 hari.</p>
                </div>
                <input type="checkbox" className="w-8 h-8 border-4 border-black checked:bg-[#4ade80] appearance-none cursor-pointer relative checked:after:content-['✓'] checked:after:absolute checked:after:left-1 checked:after:top-0 checked:after:text-black checked:after:font-bold" defaultChecked />
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: AI SETTINGS (4 KOLOM) */}
        <div className="col-span-1 md:col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-[#4ade80] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-white border-2 border-black p-2">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-2xl font-black uppercase italic">Mode AI</h2>
            </div>
            
            <div className="space-y-4">
              <button 
                onClick={() => setIsAiActive(!isAiActive)}
                className={`w-full border-4 border-black p-4 font-black uppercase text-center transition-all ${isAiActive ? 'bg-black text-[#4ade80]' : 'bg-white text-black'}`}
              >
                {isAiActive ? 'LSTM Engine: AKTIF' : 'LSTM Engine: MATI'}
              </button>
              <p className="text-[10px] font-bold leading-tight uppercase italic text-black">
                Saat aktif, sistem akan mempelajari pola belanja Anda untuk memberikan prediksi arus kas yang presisi.
              </p>
            </div>
          </div>

          <div className="bg-black text-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-3 mb-4">
              <Settings size={24} className="text-[#FFFF00]" />
              <h2 className="text-xl font-black uppercase italic text-[#FFFF00]">Data & Privasi</h2>
            </div>
            <p className="text-xs font-bold mb-6 leading-relaxed opacity-80 uppercase tracking-wider">
              Data transaksi dienkripsi secara lokal sebelum diproses oleh model LSTM FinPredict.
            </p>
            <button className="w-full bg-white text-black py-2 font-black uppercase text-[10px] border-2 border-white hover:bg-[#FFFF00] transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
              Ekspor Dataset (.JSON)
            </button>
          </div>
        </div>

      </div>

      {/* Neo-Brutalism Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50">
          <div className={`border-4 border-black p-4 md:p-6 font-black uppercase text-sm md:text-base shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 ${
            toastMessage.type === 'success' ? 'bg-[#7CFF7C] text-black' : 'bg-[#FF4D4D] text-white'
          }`}>
            {toastMessage.type === 'success' ? <ShieldCheck size={28} /> : <Bell size={28} />}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}