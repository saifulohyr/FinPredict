import { Bell, User, Menu } from 'lucide-react';

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="h-20 bg-[#F5F5DC] border-b-4 border-black flex items-center justify-between px-4 md:px-8">
      {/* Mobile Menu & Logo */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 border-4 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl md:text-3xl font-black uppercase tracking-tighter italic">
          FinPredict
        </h1>
      </div>

      {/* Right Side Navigation */}
      <div className="flex items-center gap-4 md:gap-8 font-black uppercase text-sm">
        <nav className="hidden lg:flex gap-6">
          <button className="hover:underline decoration-4">Forecast</button>
          <button className="text-[#1A4D2E] underline decoration-4">Settings</button>
        </nav>
        
        <div className="flex gap-2 md:gap-3">
          <button className="p-2 border-2 md:border-4 border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all">
            <Bell size={18} />
          </button>
          <button className="p-2 border-2 md:border-4 border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all">
            <User size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}