import React from 'react';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, Calendar, Dog, Receipt, Menu, X } from 'lucide-react';
import { ViewMode } from '../types';

interface MobileNavProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { view, setView, clients } = useApp();

  const healthAlertsCount = React.useMemo(() => {
    const today = new Date(2026, 7, 12);
    return clients.filter((c) => {
      if (!c.rabiesExpiry) return false;
      const exp = new Date(c.rabiesExpiry);
      const diff = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return diff <= 30;
    }).length;
  }, [clients]);

  const navItems: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'invoices', label: 'Invoices', icon: <Receipt className="w-4 h-4 sm:w-5 sm:h-5" /> },
    { id: 'clients', label: 'Pets', icon: <Dog className="w-4 h-4 sm:w-5 sm:h-5" /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#240C0B]/95 backdrop-blur-xl border-t border-white/10 text-white/70 z-40 flex items-center justify-around px-2 py-2 sm:py-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl transition-colors">
      {navItems.map((item) => {
        const isActive = view === item.id && !isSidebarOpen;
        return (
          <button
            key={item.id}
            onClick={() => {
              setView(item.id);
              setIsSidebarOpen(false);
            }}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] font-bold py-1.5 px-3 rounded-2xl transition-all cursor-pointer min-w-[58px] active:scale-95 ${
              isActive
                ? 'text-white bg-theme-primary shadow-lg ring-1 ring-white/20'
                : 'hover:text-white hover:bg-white/5'
            }`}
          >
            {item.icon}
            <span className="leading-none">{item.label}</span>
          </button>
        );
      })}

      {/* Menu / All Views Drawer Trigger */}
      <button
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        className={`relative flex flex-col items-center justify-center gap-1 text-[10px] font-bold py-1.5 px-3 rounded-2xl transition-all cursor-pointer min-w-[58px] active:scale-95 ${
          isSidebarOpen
            ? 'text-white bg-white/20 shadow-md ring-2 ring-theme-primary'
            : 'hover:text-white hover:bg-white/5'
        }`}
        aria-label={isSidebarOpen ? "Close menu" : "Open full studio menu"}
      >
        {isSidebarOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
        <span className="leading-none">{isSidebarOpen ? 'Close' : 'More'}</span>

        {healthAlertsCount > 0 && !isSidebarOpen && (
          <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#240C0B] animate-pulse" />
        )}
      </button>
    </nav>
  );
};

