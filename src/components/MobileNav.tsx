import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Calendar, 
  Dog, 
  Receipt, 
  TrendingUp,
  Scissors, 
  UserCheck, 
  Award, 
  AlertTriangle, 
  Store, 
  Sparkles, 
  Settings, 
  Plus, 
  Grid, 
  X, 
  Palette, 
  ShieldCheck, 
  LogOut,
  ChevronRight,
  Lock
} from 'lucide-react';
import { ViewMode, ColorTheme } from '../types';
import { isScreenAllowed } from '../data/permissionPresets';
import { motion, AnimatePresence } from 'motion/react';

interface MobileNavProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { view, setView, clients, openModal, settings, updateSettings, showToast } = useApp();
  const { currentProfile, isAdmin, logout, returnToAdmin } = useAuth();
  
  const [hubSheetOpen, setHubSheetOpen] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);

  const healthAlertsCount = React.useMemo(() => {
    const today = new Date(2026, 7, 12);
    return clients.filter((c) => {
      if (!c.rabiesExpiry) return false;
      const exp = new Date(c.rabiesExpiry);
      const diff = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));
      return diff <= 30;
    }).length;
  }, [clients]);

  const quickThemes: { id: ColorTheme; label: string; color: string }[] = [
    { id: 'terracotta', label: 'Terracotta', color: '#FF6B00' },
    { id: 'emerald', label: 'Emerald', color: '#059669' },
    { id: 'ocean', label: 'Ocean', color: '#2563EB' },
    { id: 'plum', label: 'Plum', color: '#9333EA' },
    { id: 'coral', label: 'Coral', color: '#EA580C' },
    { id: 'slate', label: 'Slate', color: '#D97706' },
    { id: 'nordic', label: 'Nordic', color: '#0D9488' },
    { id: 'lavender', label: 'Lavender', color: '#7C3AED' },
    { id: 'rose', label: 'Rose', color: '#E11D48' },
    { id: 'gold', label: 'Gold', color: '#B45309' },
    { id: 'crimson', label: 'Crimson', color: '#DC2626' },
    { id: 'monochrome', label: 'Obsidian', color: '#18181B' },
  ];

  const handleSelectView = (id: ViewMode) => {
    setView(id);
    setHubSheetOpen(false);
    setIsSidebarOpen(false);
  };

  const handleQuickTheme = (themeId: ColorTheme) => {
    updateSettings({ ...settings, colorTheme: themeId });
    document.documentElement.setAttribute('data-theme', themeId);
    showToast(`Switched theme to ${themeId.toUpperCase()}`, 'success');
  };

  const extraViews: { id: ViewMode; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    { id: 'invoices', label: 'Invoices & QR Billing', icon: <Receipt className="w-4 h-4 text-amber-400" /> },
    { id: 'revenue', label: 'Financial Analytics', icon: <TrendingUp className="w-4 h-4 text-emerald-400" /> },
    { id: 'services', label: 'Grooming Services', icon: <Scissors className="w-4 h-4 text-orange-400" /> },
    { id: 'alerts', label: 'Health & Vaccine Alerts', icon: <AlertTriangle className="w-4 h-4 text-rose-400" />, badge: healthAlertsCount, badgeColor: 'bg-rose-500' },
    { id: 'staff', label: 'Groomers & Staff', icon: <UserCheck className="w-4 h-4 text-cyan-400" /> },
    { id: 'loyalty', label: 'Paws & Rewards', icon: <Award className="w-4 h-4 text-purple-400" /> },
    { id: 'business', label: 'Activity & Store', icon: <Store className="w-4 h-4 text-blue-400" /> },
    { id: 'gallery', label: 'Transformations', icon: <Sparkles className="w-4 h-4 text-pink-400" /> },
    { id: 'settings', label: 'Studio Settings', icon: <Settings className="w-4 h-4 text-stone-300" /> },
  ];

  return (
    <>
      {/* Floating Bottom Navigation Bar (Mobile / Small Tablet) */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 max-w-lg mx-auto z-40">
        <nav 
          aria-label="Mobile Bottom Navigation"
          className="relative bg-[#1C0908]/92 backdrop-blur-2xl border border-white/15 text-white shadow-[0_12px_36px_rgba(0,0,0,0.45)] rounded-3xl p-1.5 px-3 flex items-center justify-between gap-1 pb-[max(0.4rem,env(safe-area-inset-bottom))]"
        >
          {/* 1. Dashboard (Home) */}
          <button
            onClick={() => handleSelectView('dashboard')}
            className={`relative flex flex-col items-center justify-center py-2 px-2.5 rounded-2xl transition-all duration-200 cursor-pointer min-w-[52px] active:scale-95 ${
              view === 'dashboard' && !hubSheetOpen && !isSidebarOpen
                ? 'text-white'
                : 'text-[#A08E8B] hover:text-white'
            }`}
          >
            {view === 'dashboard' && !hubSheetOpen && !isSidebarOpen && (
              <motion.div 
                layoutId="mobileNavPill"
                className="absolute inset-0 bg-theme-primary rounded-2xl shadow-md theme-glow -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 transition-transform" />
            <span className="text-[10px] font-bold mt-1 leading-none">Home</span>
          </button>

          {/* 2. Appointments (Calendar) */}
          <button
            onClick={() => handleSelectView('calendar')}
            className={`relative flex flex-col items-center justify-center py-2 px-2.5 rounded-2xl transition-all duration-200 cursor-pointer min-w-[52px] active:scale-95 ${
              view === 'calendar' && !hubSheetOpen && !isSidebarOpen
                ? 'text-white'
                : 'text-[#A08E8B] hover:text-white'
            }`}
          >
            {view === 'calendar' && !hubSheetOpen && !isSidebarOpen && (
              <motion.div 
                layoutId="mobileNavPill"
                className="absolute inset-0 bg-theme-primary rounded-2xl shadow-md theme-glow -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 transition-transform" />
            <span className="text-[10px] font-bold mt-1 leading-none">Schedule</span>
          </button>

          {/* 3. Center Elevated Action Button: Book Grooming */}
          <div className="relative -top-3 px-1">
            <button
              onClick={() => openModal('appointmentForm')}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-theme-primary via-[#FF8833] to-[#FFA052] text-white flex items-center justify-center shadow-[0_8px_20px_var(--ring-glow,rgba(255,107,0,0.4))] border-2 border-[#1C0908] hover:scale-105 active:scale-95 transition-all cursor-pointer group"
              title="Book Grooming Appointment"
              aria-label="Book new grooming appointment"
            >
              <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>

          {/* 4. Pet Records (Clients) */}
          <button
            onClick={() => handleSelectView('clients')}
            className={`relative flex flex-col items-center justify-center py-2 px-2.5 rounded-2xl transition-all duration-200 cursor-pointer min-w-[52px] active:scale-95 ${
              view === 'clients' && !hubSheetOpen && !isSidebarOpen
                ? 'text-white'
                : 'text-[#A08E8B] hover:text-white'
            }`}
          >
            {view === 'clients' && !hubSheetOpen && !isSidebarOpen && (
              <motion.div 
                layoutId="mobileNavPill"
                className="absolute inset-0 bg-theme-primary rounded-2xl shadow-md theme-glow -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <Dog className="w-4 h-4 sm:w-5 sm:h-5 transition-transform" />
            <span className="text-[10px] font-bold mt-1 leading-none">Pets</span>
          </button>

          {/* 5. More Studio Tools (Hub Modal Sheet) */}
          <button
            onClick={() => setHubSheetOpen(prev => !prev)}
            className={`relative flex flex-col items-center justify-center py-2 px-2.5 rounded-2xl transition-all duration-200 cursor-pointer min-w-[52px] active:scale-95 ${
              hubSheetOpen || isSidebarOpen
                ? 'text-white'
                : 'text-[#A08E8B] hover:text-white'
            }`}
          >
            {(hubSheetOpen || isSidebarOpen) && (
              <motion.div 
                layoutId="mobileNavPill"
                className="absolute inset-0 bg-white/20 rounded-2xl shadow-md -z-10"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <Grid className="w-4 h-4 sm:w-5 sm:h-5 transition-transform" />
            <span className="text-[10px] font-bold mt-1 leading-none">More</span>

            {/* Health Alert / Unread Badge Indicator */}
            {healthAlertsCount > 0 && !hubSheetOpen && (
              <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#1C0908] animate-pulse" />
            )}
          </button>
        </nav>
      </div>

      {/* Slide-Up Mobile Navigation Hub Sheet */}
      <AnimatePresence>
        {hubSheetOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHubSheetOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Bottom Sheet Container */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative bg-[#1C0908] text-white rounded-t-3xl border-t border-white/15 shadow-2xl p-5 pb-24 max-h-[85vh] overflow-y-auto space-y-4"
            >
              {/* Top Grab Handle */}
              <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto -mt-2 mb-3" />

              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-theme-primary flex items-center justify-center shadow-sm">
                    <Grid className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">
                      Studio Navigation Hub
                    </h3>
                    <p className="text-[10px] text-[#A08E8B]">
                      {currentProfile?.businessName || settings.salonName || 'PawBook Pro'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setHubSheetOpen(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#A08E8B] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Grid of Views */}
              <div className="grid grid-cols-2 gap-2">
                {extraViews.map((item) => {
                  const isActive = view === item.id;
                  const allowed = isScreenAllowed(currentProfile?.permissions, item.id);

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectView(item.id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                        isActive
                          ? 'bg-theme-primary border-theme-primary text-white shadow-md'
                          : allowed
                            ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                            : 'bg-white/2 border-white/5 text-[#7A6865]'
                      }`}
                    >
                      <span className="p-2 rounded-xl bg-white/10 shrink-0">
                        {item.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className={`text-xs font-bold block truncate ${
                          !allowed ? 'line-through opacity-60' : ''
                        }`}>
                          {item.label}
                        </span>
                        {!allowed ? (
                          <span className="text-[9px] text-theme-primary flex items-center gap-1 font-mono">
                            <Lock className="w-2.5 h-2.5" /> Locked
                          </span>
                        ) : item.badge !== undefined && item.badge > 0 ? (
                          <span className="text-[9px] text-rose-400 font-bold">
                            {item.badge} Alert{item.badge === 1 ? '' : 's'}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Theme Selector Section */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-theme-primary" />
                    <span className="text-xs font-bold text-white">Accent Theme</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono text-[#A08E8B]">
                    {settings.colorTheme || 'Terracotta'}
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-2 pt-1">
                  {quickThemes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleQuickTheme(t.id)}
                      className={`h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        (settings.colorTheme || 'terracotta') === t.id
                          ? 'ring-2 ring-white scale-105 shadow-md'
                          : 'hover:scale-105 opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: t.color }}
                      title={t.label}
                    />
                  ))}
                </div>
              </div>

              {/* Admin & Logout Section */}
              <div className="pt-2 flex items-center gap-2">
                {isAdmin && (
                  <button
                    onClick={() => {
                      returnToAdmin();
                      setHubSheetOpen(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-[#2E8A81]/30 hover:bg-[#2E8A81] text-[#4ECDC4] hover:text-white text-xs font-bold border border-[#2E8A81]/40 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    logout();
                    setHubSheetOpen(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white text-xs font-bold border border-red-500/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
