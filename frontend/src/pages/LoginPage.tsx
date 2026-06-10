import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, ArrowLeft } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (isLogin) {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.status === 'success') {
          const { user, access_token, refresh_token } = response.data.data;
          setAuth(user, access_token, refresh_token);
          navigate('/');
        }
      } else {
        const response = await api.post('/auth/register', { email, password, full_name: fullName });
        if (response.data.status === 'success') {
          const { user, access_token, refresh_token } = response.data.data;
          setAuth(user, access_token, refresh_token);
          navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || `${isLogin ? 'Login' : 'Register'} failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F0F0] p-4 relative overflow-hidden font-sans text-black">
      
      {/* BACKGROUND DECORATIONS */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-[#4ade80] border-4 border-black rounded-2xl -rotate-12 hidden lg:block shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-[#D4FF00] border-4 border-black rounded-2xl rotate-12 hidden lg:block shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"></div>

      {/* LEFT FLOATING CARD (VOLATILITY HEDGE) */}
      <div className="hidden xl:block absolute left-[10%] top-[30%] w-72 bg-[#D9D9D7] border-4 border-black rounded-2xl p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -rotate-3 z-20">
        <div className="flex justify-between items-start mb-4">
          <div className="border-2 border-black rounded-xl p-1 bg-white">
            <Zap size={24} className="fill-black" />
          </div>
          <span className="bg-black text-[#4ade80] text-[10px] px-2 py-1 font-black border-2 border-black rounded-xl">
            96.2% ACCURATE
          </span>
        </div>
        <h3 className="font-black uppercase text-xl mb-2 tracking-tight">Volatility Hedge</h3>
        <p className="text-xs font-bold leading-tight text-slate-700">
          The AI predicts a 14% shift in equity markets within 24 hours.
        </p>
      </div>

      {/* RIGHT FLOATING CARD (SYSTEM OPERATIONAL) */}
      <div className="hidden xl:block absolute right-[10%] bottom-[20%] w-64 bg-white border-4 border-black rounded-2xl p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-3 z-20">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 bg-[#4ade80] border-2 border-black rounded-xl"></div>
          <span className="text-[10px] font-black uppercase italic">System: Operational</span>
        </div>
        <div className="bg-black h-16 w-full flex items-end justify-center p-2 gap-1 border-2 border-black rounded-xl">
          <div className="bg-white/20 w-3 h-[40%]"></div>
          <div className="bg-white/40 w-3 h-[60%]"></div>
          <div className="bg-white w-3 h-[90%] rotate-[-10deg] origin-bottom shadow-[2px_0px_10px_rgba(255,255,255,0.5)]"></div>
          <div className="bg-white/60 w-3 h-[50%]"></div>
        </div>
      </div>

      {/* MAIN AUTH CARD */}
      <div className="w-full max-w-md bg-white border-4 border-black rounded-2xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative z-10 outline outline-4 outline-black outline-offset-4 border-dashed border-spacing-4">
        
        {/* TAB BUTTONS */}
        <div className="flex border-b-4 border-black">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-4 font-black  uppercase text-sm transition-all ${isLogin ? 'bg-[#D4FF00]' : 'bg-white'}`}
          >
            Login
          </button>
          <div className="w-1 bg-black"></div>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-4 font-black uppercase text-sm transition-all ${!isLogin ? 'bg-[#D4FF00]' : 'bg-white'}`}
          >
            Register
          </button>
        </div>

        <div className="p-10">
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 leading-none">{isLogin ? 'Welcome' : 'Join Us'}</h1>
          <p className="font-bold text-sm text-slate-800 mb-6 uppercase leading-tight">
            {isLogin ? 'Access your AI-powered financial forecasts instantly.' : 'Create an account to start your financial journey.'}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border-4 border-black rounded-2xl text-red-600 font-bold uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {error}
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* FULL NAME INPUT (REGISTER ONLY) */}
            {!isLogin && (
              <div className="group">
                <label className="inline-block text-[11px] font-black uppercase border-2 border-black rounded-xl bg-[#D9D9D7] px-2 py-0.5 ml-3 -mb-3 relative z-20">
                  Full Name
                </label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border-4 border-black rounded-2xl p-4 font-bold text-lg focus:outline-none focus:bg-yellow-50 placeholder:text-slate-400"
                />
              </div>
            )}
            {/* EMAIL INPUT */}
            <div className="group">
              <label className="inline-block text-[11px] font-black uppercase border-2 border-black rounded-xl bg-[#D9D9D7] px-2 py-0.5 ml-3 -mb-3 relative z-20">
                Email Address
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-4 border-black rounded-2xl p-4 font-bold text-lg focus:outline-none focus:bg-yellow-50 placeholder:text-slate-400"
              />
            </div>

            {/* PASSWORD INPUT */}
            <div className="group relative">
              <label className="inline-block text-[11px] font-black uppercase border-2 border-black rounded-xl bg-[#D9D9D7] px-2 py-0.5 ml-3 -mb-3 relative z-20">
                Secret Key
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border-4 border-black rounded-2xl p-4 font-bold text-lg focus:outline-none focus:bg-yellow-50 placeholder:text-slate-400"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 border-2 border-transparent hover:border-black transition-all"
                >
                  {showPassword ? <EyeOff size={22}/> : <Eye size={22}/>}
                </button>
              </div>
            </div>

            {/* LOGIN BUTTON */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#A85CF9] border-4 border-black rounded-2xl py-5 font-black uppercase text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[6px] active:translate-y-[6px] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Initializing...' : 'Initialize Session'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 font-black uppercase text-xs text-slate-500 hover:text-black transition-colors"
            >
              <ArrowLeft size={14} /> Kembali ke Halaman Utama
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}