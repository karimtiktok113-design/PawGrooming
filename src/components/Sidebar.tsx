import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ViewMode } from '../types';
import { isScreenAllowed } from '../data/permissionPresets';
import { 
  LayoutDashboard, 
  Calendar, 
  Receipt,
  Dog, 
  Scissors, 
  UserCheck, 
  Award, 
  AlertTriangle, 
  TrendingUp, 
  Store, 
  Sparkles, 
  Settings,
  X,
  LogOut,
  ShieldCheck,
  Lock,
  Crown
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { view, setView, clients, settings } = useApp();
  const { currentProfile, isAdmin, logout, returnToAdmin } = useAuth();

  // Calculate alerts badge count
  const alertCount = React.useMemo(() => {
    const today = new Date(2026, 7, 12);
    return clients.filter((c) => {
      if (!c.rabiesExpiry) return false;
      const expiry = new Date(c.rabiesExpiry);
      const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return diffDays <= 30; // Expired or expiring within 30 days
    }).length;
  }, [clients]);

  const navItems: { id: ViewMode; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'calendar', label: 'Appointments', icon: <Calendar className="w-4 h-4" /> },
    { id: 'invoices', label: 'Invoices & QR', icon: <Receipt className="w-4 h-4" /> },
    { id: 'clients', label: 'My Pets', icon: <Dog className="w-4 h-4" /> },
    { id: 'services', label: 'Grooming', icon: <Scissors className="w-4 h-4" /> },
    { id: 'alerts', label: 'Health & Vaccine', icon: <AlertTriangle className="w-4 h-4" />, badge: alertCount },
    { id: 'loyalty', label: 'Paws & Rewards', icon: <Award className="w-4 h-4" /> },
    { id: 'staff', label: 'Groomers', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'revenue', label: 'Revenue & Stats', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'business', label: 'Activity & Store', icon: <Store className="w-4 h-4" /> },
    { id: 'gallery', label: 'Transformations', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleNavClick = (id: ViewMode) => {
    setView(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  const isTrial = currentProfile?.permissions?.isTrialMode;

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen && setMobileOpen(false)}
        />
      )}

      <aside 
        className={`fixed top-0 bottom-0 left-0 w-[240px] bg-[#240C0B] text-white p-5 flex flex-col justify-between z-50 transition-transform duration-300 ease-out shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col gap-5 min-h-0">
          {/* Brand Logo Header */}
          <div className="flex items-center justify-between px-1 relative">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#FF6B00] flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 fill-white" viewBox="0 0 32 32">
                  <ellipse cx="16" cy="20" rx="6" ry="5" />
                  <circle cx="9.5" cy="13" r="2.6" />
                  <circle cx="16" cy="10.5" r="2.8" />
                  <circle cx="22.5" cy="13" r="2.6" />
                </svg>
              </div>
              <div>
                <h1 className="font-display font-extrabold text-base text-white tracking-wide uppercase leading-tight line-clamp-1">
                  {currentProfile?.businessName || settings.salonName || settings.name || 'Paw Grooming'}
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] font-bold text-[#A08E8B] tracking-widest uppercase block">
                    {currentProfile ? `${currentProfile.plan} Tier` : (settings.name || 'Grooming & Spa')}
                  </span>
                  {isTrial && (
                    <span className="px-1.5 py-0.2 rounded-md bg-[#FF6B00]/30 text-[#FF8833] text-[8px] font-black uppercase tracking-wider border border-[#FF6B00]/40">
                      Trial
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Close Button */}
            {setMobileOpen && (
              <button 
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-1 text-[#A08E8B] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto pr-1">
            {navItems.map((item) => {
              const isActive = view === item.id;
              const allowed = isScreenAllowed(currentProfile?.permissions, item.id);

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-left transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-theme-primary text-white shadow-md theme-glow scale-[1.02]'
                      : allowed 
                        ? 'text-[#C5B7B4] hover:bg-white/8 hover:text-white'
                        : 'text-[#7A6865] hover:bg-white/5 hover:text-[#C5B7B4]'
                  }`}
                >
                  <span className={isActive ? 'text-white' : allowed ? 'text-[#A08E8B]' : 'text-[#7A6865]'}>
                    {item.icon}
                  </span>
                  
                  <span className={`flex-1 truncate ${!allowed ? 'line-through decoration-theme-primary/50 text-white/50' : ''}`}>
                    {item.label}
                  </span>
                  
                  {!allowed && (
                    <span className="text-[10px] text-theme-primary opacity-80" title="Locked in trial/demo">
                      <Lock className="w-3 h-3" />
                    </span>
                  )}

                  {allowed && item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white text-theme-primary' : 'bg-theme-primary text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile Section & Actions */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          {isAdmin && (
            <button
              onClick={returnToAdmin}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#2E8A81]/20 hover:bg-[#2E8A81] text-[#4ECDC4] hover:text-white text-[11px] font-bold border border-[#2E8A81]/40 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Return to Admin Panel</span>
            </button>
          )}

          <div 
            onClick={() => handleNavClick('settings')}
            className="flex items-center justify-between bg-[#180504] p-2.5 rounded-2xl border border-white/5 hover:border-[#FF6B00]/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF6B00] to-[#FFA052] p-0.5 shrink-0 overflow-hidden">
                <img 
                  src={settings.photo || "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=120&q=80"} 
                  alt={settings.name || "Clinic Profile"}
                  className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate group-hover:text-[#FF6B00] transition-colors">
                  {currentProfile?.ownerName || settings.name || settings.salonName || 'PawBook Pro Studio'}
                </p>
                <p className="text-[10px] text-[#A08E8B] truncate font-mono">
                  {currentProfile?.email || settings.email || 'care@pawbookpro.com'}
                </p>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                logout();
              }}
              className="p-1.5 text-[#A08E8B] hover:text-[#C9503A] hover:bg-white/10 rounded-xl transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
