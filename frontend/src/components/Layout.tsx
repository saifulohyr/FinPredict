import { useState, ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function Layout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-[#F5F5DC] text-black">
      {/* Sidebar - Desktop & Mobile */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar - Kirim fungsi toggle ke sini */}
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </main>
      </div>

      {/* Overlay untuk mobile saat sidebar terbuka */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}