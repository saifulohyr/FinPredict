import { Bell, User, Menu, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import { useAuthStore } from '../store/authStore';

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { useNotificationsQuery } = useNotifications();
  const { data: notifications = [] } = useNotificationsQuery();
  const unreadCount = notifications.filter((n: any) => !n.is_read).length;
  
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
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

        
        <div className="flex gap-2 md:gap-3">
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                if (showUserMenu) setShowUserMenu(false);
              }}
              className="relative p-2 border-2 md:border-4 border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#FF4D4D] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-black font-bold">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            {showNotifMenu && (
              <div className="absolute right-0 top-12 mt-2 w-72 md:w-80 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 max-h-96 overflow-y-auto">
                <div className="p-3 border-b-4 border-black bg-[#FFFF00]">
                  <p className="font-black text-sm uppercase">Peringatan ({unreadCount})</p>
                </div>
                {notifications.length > 0 ? (
                  notifications.map((n: any) => (
                    <div key={n.id} className="p-3 border-b-2 border-black hover:bg-yellow-50 cursor-pointer">
                      <p className="font-black text-[10px] uppercase text-[#B22222] mb-1">{n.type === 'WARNING' ? '⚠️ ' : ''}{n.title}</p>
                      <p className="font-bold text-xs leading-tight normal-case">{n.message}</p>
                      <p className="text-[9px] font-bold text-slate-500 mt-2">{new Date(n.created_at).toLocaleDateString('id-ID')}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center">
                    <p className="font-bold text-xs uppercase italic text-slate-500">Tidak ada notifikasi</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="relative">
            <button 
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                if (showNotifMenu) setShowNotifMenu(false);
              }}
              className="p-2 border-2 md:border-4 border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all"
            >
              <User size={18} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-12 mt-2 w-48 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50">
                <div className="p-3 border-b-2 border-black">
                  <p className="font-black text-sm truncate">{user?.full_name || 'User'}</p>
                </div>
                <Link 
                  to="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full flex items-center gap-2 p-3 hover:bg-[#4ade80] border-b-2 border-black font-black text-xs uppercase transition-colors text-left"
                >
                  <User size={14} />
                  Profile
                </Link>
                <button 
                  onClick={() => logout()}
                  className="w-full flex items-center gap-2 p-3 hover:bg-[#FFFF00] font-black text-xs uppercase transition-colors text-left"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}