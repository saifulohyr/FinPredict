import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, Globe, Key, Landmark } from 'lucide-react';

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', 'Muhammad Hafidz');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5DC] p-4 relative overflow-hidden font-sans text-black">
      
      {/* BACKGROUND DECORATIONS */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-[#4ade80] border-4 border-black -rotate-12 hidden lg:block shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-[#FFFF00] border-4 border-black rotate-12 hidden lg:block shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"></div>

      {/* LEFT FLOATING CARD (VOLATILITY HEDGE) */}
      <div className="hidden xl:block absolute left-[10%] top-[30%] w-72 bg-[#D9D9D7] border-4 border-black p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -rotate-3 z-20">
        <div className="flex justify-between items-start mb-4">
          <div className="border-2 border-black p-1 bg-white">
            <Zap size={24} className="fill-black" />
          </div>
          <span className="bg-black text-[#4ade80] text-[10px] px-2 py-1 font-black border-2 border-black">
            96.2% ACCURATE
          </span>
        </div>
        <h3 className="font-black uppercase text-xl mb-2 tracking-tight">Volatility Hedge</h3>
        <p className="text-xs font-bold leading-tight text-slate-700">
          The AI predicts a 14% shift in equity markets within 24 hours.
        </p>
      </div>

      {/* RIGHT FLOATING CARD (SYSTEM OPERATIONAL) */}
      <div className="hidden xl:block absolute right-[10%] bottom-[20%] w-64 bg-white border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-3 z-20">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 bg-[#4ade80] border-2 border-black"></div>
          <span className="text-[10px] font-black uppercase italic">System: Operational</span>
        </div>
        <div className="bg-black h-16 w-full flex items-end justify-center p-2 gap-1 border-2 border-black">
          <div className="bg-white/20 w-3 h-[40%]"></div>
          <div className="bg-white/40 w-3 h-[60%]"></div>
          <div className="bg-white w-3 h-[90%] rotate-[-10deg] origin-bottom shadow-[2px_0px_10px_rgba(255,255,255,0.5)]"></div>
          <div className="bg-white/60 w-3 h-[50%]"></div>
        </div>
      </div>

      {/* MAIN AUTH CARD */}
      <div className="w-full max-w-md bg-white border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative z-10 outline outline-4 outline-black outline-offset-4 border-dashed border-spacing-4">
        
        {/* TAB BUTTONS */}
        {/* <div className="flex border-b-4 border-black">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-4 font-black  uppercase text-sm transition-all ${isLogin ? 'bg-[#FFFF00]' : 'bg-white'}`}
          >
            Login
          </button>
          <div className="w-1 bg-black"></div>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-4 font-black uppercase text-sm transition-all ${!isLogin ? 'bg-[#FFFF00]' : 'bg-white'}`}
          >
            Register
          </button>
        </div> */}

        <div className="p-10">
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-4 leading-none">Welcome</h1>
          <p className="font-bold text-sm text-slate-800 mb-10 uppercase leading-tight">
            Access your AI-powered financial forecasts instantly.
          </p>

          <form className="space-y-8" onSubmit={handleLogin}>
            {/* EMAIL INPUT */}
            <div className="group">
              <label className="inline-block text-[11px] font-black uppercase border-2 border-black bg-[#D9D9D7] px-2 py-0.5 ml-3 -mb-3 relative z-20">
                Email Address
              </label>
              <input 
                type="email" 
                defaultValue="user@finpredict.ai" 
                className="w-full border-4 border-black p-4 font-bold text-lg focus:outline-none focus:bg-yellow-50 placeholder:text-slate-400"
              />
            </div>

            {/* PASSWORD INPUT */}
            <div className="group relative">
              <label className="inline-block text-[11px] font-black uppercase border-2 border-black bg-[#D9D9D7] px-2 py-0.5 ml-3 -mb-3 relative z-20">
                Secret Key
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  defaultValue="password123" 
                  className="w-full border-4 border-black p-4 font-bold text-lg focus:outline-none focus:bg-yellow-50 placeholder:text-slate-400"
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
              className="w-full bg-[#7CFF7C] border-4 border-black py-5 font-black uppercase text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[6px] active:translate-y-[6px] transition-all"
            >
              Initialize Session
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}