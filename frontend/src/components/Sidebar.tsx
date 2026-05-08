import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, BrainCircuit, Settings, LifeBuoy, X, LogOut } from 'lucide-react';

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navItems = [
    { name: 'Forecast', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Transactions', path: '/transactions', icon: <Receipt size={20} /> },
    { name: 'AI Analytics', path: '/analytics', icon: <BrainCircuit size={20} /> },
    { name: 'Settings', path: '/budgets', icon: <Settings size={20} /> },
    { name: 'Support', path: '/support', icon: <LifeBuoy size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#F5F5DC] border-r-4 border-black transition-transform duration-300 transform md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <button onClick={onClose} className="md:hidden absolute top-4 right-4 p-1 border-2 border-black bg-white"><X size={20} /></button>

      <div className="p-8 flex flex-col items-center border-b-4 border-black">
        <div className="w-20 h-20 rounded-full border-4 border-black overflow-hidden mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" alt="Profile" className="w-full h-full object-cover"/>
        </div>
        <h2 className="font-black uppercase text-sm tracking-tighter">M. Hafidz</h2>
        <p className="text-[10px] font-bold text-slate-500 uppercase text-center">Premium AI Member</p>
      </div>

      <nav className="flex-1 p-4 space-y-4 mt-4 text-left">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} onClick={onClose} className={`flex items-center gap-3 px-4 py-3 text-sm font-black uppercase transition-all border-4 ${isActive ? 'bg-[#4ade80] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'border-transparent hover:border-black hover:bg-white/50'}`}>
              {item.icon} {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 mt-auto border-t-4 border-black">
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 border-4 border-black p-2 font-black uppercase bg-[#B22222] text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all">
          <LogOut size={18} /> Exit System
        </button>
      </div>
    </aside>
  );
}