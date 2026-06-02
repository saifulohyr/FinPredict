import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';
import { ArrowRight, BrainCircuit, Activity, LineChart, Network, Database, Bell } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [token, navigate]);

  return (
    <div className="bg-[#F0F0F0] min-h-screen font-sans text-black overflow-x-hidden selection:bg-black selection:text-[#D4FF00]">
      {/* Navbar Minimalis */}
      <nav className="p-6 border-b-8 border-black flex justify-between items-center bg-[#D4FF00]">
        <div className="flex items-center gap-2">
          <BrainCircuit size={32} strokeWidth={3} />
          <h1 className="text-2xl font-black uppercase tracking-tighter italic">FINPREDICT.AI</h1>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="bg-black text-white px-6 py-2 font-black uppercase text-sm border-2 border-transparent hover:bg-white hover:text-black hover:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
        >
          Masuk
        </button>
      </nav>

      {/* Hero Section */}
      <header className="px-6 py-20 md:py-32 flex flex-col items-center justify-center text-center border-b-8 border-black bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]">
        <div className="bg-white border-8 border-black rounded-3xl p-8 md:p-16 max-w-4xl shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] rotate-1 hover:rotate-0 transition-transform">
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 italic leading-none">
            Kendalikan Keuanganmu Sebelum Kehabisan.
          </h2>
          <p className="text-xl md:text-2xl font-bold mb-10 border-4 border-black rounded-2xl inline-block px-4 py-2 bg-[#D4FF00]">
            Ditenagai oleh Deep Learning LSTM
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-4">
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto bg-[#A85CF9] text-black border-4 border-black rounded-2xl px-8 py-4 font-black uppercase text-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all flex items-center justify-center gap-2"
            >
              Mulai Sekarang <ArrowRight size={24} />
            </button>
            <button 
              onClick={() => document.getElementById('lstm-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto bg-[#FF8A00] text-black border-4 border-black rounded-2xl px-8 py-4 font-black uppercase text-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all"
            >
              Pelajari Cara Kerjanya
            </button>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="px-6 py-20 bg-black text-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl md:text-6xl font-black uppercase text-center mb-16 text-[#D4FF00] italic">Kenapa FinPredict?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-[#FF8A00] text-black border-4 border-white rounded-2xl p-8 shadow-[8px_8px_0px_0px_#FFFFFF] hover:-translate-y-2 transition-transform">
              <Activity size={48} className="mb-6" />
              <h4 className="text-2xl font-black uppercase mb-4">Pencatatan Real-time</h4>
              <p className="font-bold text-sm">Catat pengeluaran dan pemasukan dengan cepat. Sistem akan otomatis memonitor sisa anggaran bulananmu tanpa repot.</p>
            </div>
            {/* Card 2 */}
            <div className="bg-[#D4FF00] text-black border-4 border-white p-8 shadow-[8px_8px_0px_0px_#FFFFFF] hover:-translate-y-2 transition-transform">
              <LineChart size={48} className="mb-6" />
              <h4 className="text-2xl font-black uppercase mb-4">Prediksi Masa Depan</h4>
              <p className="font-bold text-sm">AI akan menganalisis histori transaksimu untuk memprediksi kurva saldo selama 30 hari ke depan secara akurat.</p>
            </div>
            {/* Card 3 */}
            <div className="bg-[#A85CF9] text-black border-4 border-white p-8 shadow-[8px_8px_0px_0px_#FFFFFF] hover:-translate-y-2 transition-transform">
              <Bell size={48} className="mb-6" />
              <h4 className="text-2xl font-black uppercase mb-4">Peringatan Dini</h4>
              <p className="font-bold text-sm">Jangan tunggu sampai saldo minus. AI akan memperingatkanmu jauh-jauh hari jika pola pengeluaranmu berpotensi overbudget.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bagaimana LSTM Bekerja Section (Untuk Capstone) */}
      <section id="lstm-section" className="px-6 py-20 bg-[#F0F0F0] border-b-8 border-black">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-4xl md:text-6xl font-black uppercase text-center mb-6 italic">Arsitektur AI LSTM</h3>
          <p className="text-center font-bold text-lg mb-16 border-b-4 border-black pb-4">
            Bagaimana Model Long Short-Term Memory Bekerja di Bawah Kap
          </p>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
            {/* Step 1 */}
            <div className="flex-1 bg-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center relative w-full">
              <Database size={40} className="mx-auto mb-4" />
              <h5 className="font-black uppercase mb-2">1. Input Historis</h5>
              <p className="text-xs font-bold">Data transaksi 30 hari terakhir dikumpulkan dan dinormalisasi menjadi urutan waktu (Time-Series).</p>
            </div>
            
            <ArrowRight size={32} className="hidden md:block shrink-0" strokeWidth={3} />
            
            {/* Step 2 */}
            <div className="flex-1 bg-black text-white border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_#D4FF00] text-center relative w-full scale-105 z-10">
              <Network size={40} className="mx-auto mb-4 text-[#D4FF00]" />
              <h5 className="font-black uppercase mb-2 text-[#D4FF00]">2. LSTM Layer</h5>
              <p className="text-xs font-bold">Jaringan saraf LSTM mengingat pola pengeluaran berkala (misal: belanja di akhir pekan) dan melupakan noise acak.</p>
            </div>

            <ArrowRight size={32} className="hidden md:block shrink-0" strokeWidth={3} />

            {/* Step 3 */}
            <div className="flex-1 bg-[#A85CF9] border-4 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center relative w-full">
              <LineChart size={40} className="mx-auto mb-4" />
              <h5 className="font-black uppercase mb-2">3. Forecast & Warning</h5>
              <p className="text-xs font-bold">Model memprediksi saldo 30 hari kedepan. Jika prediksi melebihi anggaran, sistem memicu peringatan otomatis.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#D4FF00] p-8 border-t-8 border-black text-center">
        <BrainCircuit size={48} className="mx-auto mb-4" strokeWidth={2} />
        <h2 className="text-3xl font-black uppercase italic mb-2">FinPredict</h2>
        <p className="font-bold text-sm uppercase">Capstone Project 2026 &copy; Hak Cipta Dilindungi</p>
      </footer>
    </div>
  );
}
