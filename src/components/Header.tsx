import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Menu, 
  Search, 
  X, 
  Bell, 
  LogOut, 
  ShieldCheck, 
  Palette, 
  ChevronDown,
  Dog,
  Scissors,
  Check,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { ClientNotificationDrawer } from './notifications/ClientNotificationDrawer';
import { ColorTheme } from '../types';
import { SidebarMode } from './Sidebar';
import { formatISO, getFixedToday } from '../data/initialData';

interface HeaderProps {
  onMenuClick?: () => void;
  isSidebarOpen?: boolean;
  sidebarMode?: SidebarMode;
  setSidebarMode?: (mode: SidebarMode) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onMenuClick, 
  isSidebarOpen = false,
  sidebarMode = 'expanded',
  setSidebarMode
}) => {
  const { 
    view, 
    setView, 
    openModal, 
    searchQuery, 
    setSearchQuery, 
    settings,
    updateSettings,
    clients,
    appointments,
    showToast
  } = useApp();

  const { currentProfile, isAdmin, logout, returnToAdmin, unreadNotificationsCount } = useAuth();
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus input when mobile search opens
  useEffect(() => {
    if (mobileSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [mobileSearchOpen]);

  const todayStr = formatISO(getFixedToday());

  const healthAlertsCount = React.useMemo(() => {
    const nowTime = new Date().getTime();
    return clients.filter((c) => {
      if (!c.rabiesExpiry) return false;
      const exp = new Date(c.rabiesExpiry);
      const diff = Math.ceil((exp.getTime() - nowTime) / (1000 * 3600 * 24));
      return diff <= 30;
    }).length;
  }, [clients]);

  // Synchronized today's appointments count
  const todayBookingsCount = React.useMemo(() => {
    return appointments.filter(a => a.date === todayStr && a.status !== 'cancelled').length;
  }, [appointments, todayStr]);

  const totalBadges = healthAlertsCount + unreadNotificationsCount;

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

  const handleQuickTheme = (themeId: ColorTheme) => {
    updateSettings({ ...settings, colorTheme: themeId });
    document.documentElement.setAttribute('data-theme', themeId);
    setThemeDropdownOpen(false);
    showToast(`Switched theme to ${themeId.toUpperCase()}`, 'success');
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E6DFD5] transition-all py-2 sm:py-2.5 px-2.5 sm:px-6 lg:px-8 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
          
          {/* Left Section: Mobile Menu Toggle & Brand / Desktop Search */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-1 min-w-0">
            {/* Mobile Navigation Menu Toggle */}
            <button
              onClick={onMenuClick}
              className={`lg:hidden flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl border text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0 ${
                isSidebarOpen 
                  ? 'bg-theme-sidebar text-white border-transparent shadow-md' 
                  : 'bg-white border-[#E6DFD5] text-[#240C0B] hover:bg-[#F1EEE6]'
              }`}
              aria-label={isSidebarOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isSidebarOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-[#240C0B]" />}
            </button>

            {/* Desktop Sliding Sidebar Toggle Button */}
            {setSidebarMode && (
              <button
                onClick={() => {
                  if (sidebarMode === 'expanded') setSidebarMode('collapsed');
                  else if (sidebarMode === 'collapsed') setSidebarMode('expanded');
                  else setSidebarMode('expanded');
                }}
                className={`hidden lg:flex items-center justify-center w-9 h-9 rounded-full border text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs hover:scale-105 active:scale-95 ${
                  sidebarMode === 'collapsed'
                    ? 'bg-theme-light border-theme-primary/40 text-theme-primary'
                    : 'bg-white border-[#E6DFD5] text-[#7A6865] hover:text-[#240C0B] hover:border-[#D8D3C4]'
                }`}
                title={sidebarMode === 'expanded' ? "Collapse sidebar (⌘B)" : "Expand sidebar (⌘B)"}
                aria-label="Toggle sidebar collapse"
              >
                {sidebarMode === 'collapsed' ? (
                  <PanelLeftOpen className="w-4 h-4" />
                ) : (
                  <PanelLeft className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Mobile Minimalist Brand Header */}
            <div className="flex sm:hidden items-center gap-1.5 min-w-0 pr-1">
              <div className="w-7 h-7 rounded-lg bg-theme-primary flex items-center justify-center shrink-0 shadow-2xs">
                <Dog className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-display font-black text-xs text-[#240C0B] truncate max-w-[90px] xs:max-w-[120px]">
                {currentProfile?.businessName || settings.salonName || 'PawBook'}
              </span>
            </div>

            {/* Desktop & Tablet Inline Search Input */}
            <div className="hidden sm:block relative w-full max-w-xs md:max-w-sm group">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A08E8B] group-focus-within:text-theme-primary transition-colors" />
              <input
                type="text"
                placeholder="Search pets, clients, invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-12 py-2 text-xs bg-white border border-[#E6DFD5] rounded-full focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none text-[#240C0B] placeholder-[#A08E8B] shadow-2xs transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-[#A08E8B] hover:text-[#240C0B] p-0.5 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#FAF8F5] text-[#A08E8B] border border-[#E6DFD5]">
                    ⌘K
                  </span>
                )}
              </div>
            </div>

            {/* Live Studio Status Pill (Responsive) */}
            <button
              onClick={() => setView('calendar')}
              className="hidden xs:flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-theme-light border border-theme-subtle text-[10px] sm:text-[11px] font-bold text-theme-primary shrink-0 hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-2xs"
              title="View today's schedule in Calendar"
            >
              <Scissors className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="whitespace-nowrap">
                {todayBookingsCount} <span className="hidden sm:inline">{todayBookingsCount === 1 ? 'Grooming' : 'Groomings'}</span> Today
              </span>
            </button>
          </div>

          {/* Right Section: Mobile Search Toggle, Theme, Notifications, Booking */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setMobileSearchOpen(prev => !prev)}
              className={`sm:hidden w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                mobileSearchOpen || searchQuery
                  ? 'bg-theme-light border-theme-primary text-theme-primary shadow-xs'
                  : 'bg-white border-[#E6DFD5] text-[#7A6865] hover:text-[#240C0B]'
              }`}
              aria-label="Toggle mobile search"
            >
              <Search className="w-3.5 h-3.5" />
            </button>

            {/* Quick Theme Switcher */}
            <div className="relative">
              <button
                onClick={() => setThemeDropdownOpen(prev => !prev)}
                className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-white border border-[#E6DFD5] hover:border-theme-primary text-xs font-bold text-[#240C0B] shadow-2xs cursor-pointer transition-all active:scale-95"
                title="Switch Color Theme"
              >
                <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-theme-primary shrink-0" />
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" 
                  style={{ backgroundColor: quickThemes.find(t => t.id === (settings.colorTheme || 'terracotta'))?.color || '#FF6B00' }}
                />
                <span className="hidden md:inline capitalize text-[11px]">
                  {settings.colorTheme || 'Theme'}
                </span>
                <ChevronDown className="hidden sm:inline w-3 h-3 text-[#A08E8B]" />
              </button>

              {themeDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setThemeDropdownOpen(false)} 
                  />
                  <div className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-full mt-2 w-[calc(100vw-1rem)] sm:w-60 max-w-sm p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E6DFD5] shadow-2xl z-50 animate-scaleUp text-[#240C0B]">
                    <div className="px-2 py-1 mb-2 border-b border-[#F1EEE6] flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-[#A08E8B] tracking-wider">
                        12 Synchronized Themes
                      </span>
                      <button 
                        onClick={() => {
                          setThemeDropdownOpen(false);
                          setView('settings');
                        }}
                        className="text-[11px] font-bold text-theme-primary hover:underline"
                      >
                        All Settings →
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto pr-1">
                      {quickThemes.map(t => {
                        const isCurrent = (settings.colorTheme || 'terracotta') === t.id;
                        return (
                          <button
                            key={t.id}
                            onClick={() => handleQuickTheme(t.id)}
                            className={`flex items-center justify-between p-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-theme-light text-theme-primary ring-1 ring-theme-primary/30 font-black'
                                : 'hover:bg-[#FAF8F5] text-[#240C0B]'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span 
                                className="w-3.5 h-3.5 rounded-full shrink-0 border border-white shadow-2xs"
                                style={{ backgroundColor: t.color }}
                              />
                              <span className="truncate text-[11px]">{t.label}</span>
                            </div>
                            {isCurrent && <Check className="w-3 h-3 text-theme-primary shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Admin Return Button (Tablet/Desktop) */}
            {isAdmin && (
              <button
                onClick={returnToAdmin}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#2E8A81] hover:bg-[#236F68] text-white rounded-full text-[11px] font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
                title="Return to SuperAdmin Control Center"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}

            {/* Notification Bell */}
            <button
              onClick={() => setNotificationDrawerOpen(true)}
              className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border border-[#E6DFD5] hover:border-theme-primary flex items-center justify-center text-[#240C0B] hover:text-theme-primary transition-all cursor-pointer shadow-2xs group shrink-0"
              title={`${totalBadges} Notifications & Alerts`}
              aria-label="Open notifications center"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
              {totalBadges > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] px-1 bg-theme-primary text-white text-[8px] sm:text-[9px] font-black rounded-full flex items-center justify-center animate-pulse shadow-md">
                  {totalBadges > 99 ? '99+' : totalBadges}
                </span>
              )}
            </button>

            {/* User Profile Badge (Desktop/Tablet) */}
            <div 
              onClick={() => setView('settings')}
              className="hidden sm:flex items-center gap-2 bg-white border border-[#E6DFD5] hover:border-theme-primary py-1 px-2.5 rounded-full shadow-2xs cursor-pointer transition-all hover:scale-[1.01]"
              title="Open Studio Settings"
            >
              <div className="relative shrink-0">
                <img 
                  src={settings.photo || "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=120&q=80"} 
                  alt={settings.name || "Clinic Profile"} 
                  className="w-7 h-7 rounded-full object-cover border border-[#E6DFD5]"
                />
                <span className="w-2 h-2 rounded-full bg-emerald-500 border border-white absolute -bottom-0.5 -right-0.5" />
              </div>
              <div className="text-left leading-tight pr-0.5 max-w-[100px] lg:max-w-[130px]">
                <span className="text-[9px] text-[#A08E8B] font-bold block uppercase tracking-wider truncate">
                  {currentProfile?.businessName || settings.salonName || 'Park Studio'}
                </span>
                <span className="text-xs font-extrabold text-[#240C0B] font-display truncate block">
                  {currentProfile?.ownerName || settings.name || 'Master Stylist'}
                </span>
              </div>
            </div>

            {/* Book Grooming Button (Minimalist on Mobile, Rich on Desktop) */}
            <button
              onClick={() => openModal('appointmentForm')}
              className="btn-primary flex items-center gap-1 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-bold active:scale-95 transition-all cursor-pointer shrink-0 shadow-xs"
              title="Book New Grooming Appointment"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-[11px] sm:text-xs">Book</span>
              <span className="hidden md:inline">Grooming</span>
            </button>

            {/* Logout Button (Desktop/Tablet) */}
            <button
              onClick={logout}
              className="hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#E6DFD5] hover:bg-[#FEF2F2] hover:border-red-300 text-[#7A6865] hover:text-red-600 items-center justify-center transition-all cursor-pointer shadow-2xs shrink-0"
              title="Sign out of Studio"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Minimalist Mobile Search Bar Dropdown (Animated & Clean) */}
        {mobileSearchOpen && (
          <div className="sm:hidden pt-2 pb-1 animate-slideDown">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-theme-primary" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search pets, owners, invoices, phones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-1.5 text-xs bg-white border-2 border-theme-primary/50 rounded-xl focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none text-[#240C0B] placeholder-[#A08E8B] shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7A6865] hover:text-[#240C0B] p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Slide-over Push Notification Center */}
      <ClientNotificationDrawer 
        isOpen={notificationDrawerOpen} 
        onClose={() => setNotificationDrawerOpen(false)} 
      />
    </>
  );
};
