import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ViewMode, ColorTheme } from '../types';
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
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Palette,
  Search,
  Check,
  ChevronDown,
  User,
  SlidersHorizontal,
  ExternalLink,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type SidebarMode = 'expanded' | 'collapsed' | 'hidden';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  sidebarMode?: SidebarMode;
  setSidebarMode?: (mode: SidebarMode) => void;
}

interface NavCategory {
  title: string;
  items: {
    id: ViewMode;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
    shortcut?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  mobileOpen = false, 
  setMobileOpen,
  sidebarMode = 'expanded',
  setSidebarMode
}) => {
  const { view, setView, clients, settings, updateSettings, showToast, openModal } = useApp();
  const { currentProfile, isAdmin, logout, returnToAdmin } = useAuth();
  
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [themePopoverOpen, setThemePopoverOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
        setThemePopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const navCategories: NavCategory[] = [
    {
      title: 'Studio Core',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, shortcut: '⌘1' },
        { id: 'calendar', label: 'Appointments', icon: <Calendar className="w-4 h-4" />, shortcut: '⌘2' },
        { id: 'invoices', label: 'Invoices & QR', icon: <Receipt className="w-4 h-4" />, shortcut: '⌘3' },
        { id: 'clients', label: 'Pet Records', icon: <Dog className="w-4 h-4" />, shortcut: '⌘4' },
      ]
    },
    {
      title: 'Operations',
      items: [
        { id: 'services', label: 'Services & Add-ons', icon: <Scissors className="w-4 h-4" /> },
        { id: 'alerts', label: 'Health & Vaccine', icon: <AlertTriangle className="w-4 h-4" />, badge: alertCount, badgeColor: 'bg-red-500' },
        { id: 'staff', label: 'Groomers & Staff', icon: <UserCheck className="w-4 h-4" /> },
        { id: 'loyalty', label: 'Paws Rewards', icon: <Award className="w-4 h-4" /> },
      ]
    },
    {
      title: 'Growth & Studio',
      items: [
        { id: 'revenue', label: 'Financial Analytics', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'business', label: 'Activity & Store', icon: <Store className="w-4 h-4" /> },
        { id: 'gallery', label: 'Transformations', icon: <Sparkles className="w-4 h-4" /> },
        { id: 'settings', label: 'Studio Settings', icon: <Settings className="w-4 h-4" /> },
      ]
    }
  ];

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

  const handleNavClick = (id: ViewMode) => {
    setView(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  const handleThemeChange = (tId: ColorTheme) => {
    updateSettings({ ...settings, colorTheme: tId });
    document.documentElement.setAttribute('data-theme', tId);
    setThemePopoverOpen(false);
    showToast(`Switched theme to ${tId.toUpperCase()}`, 'success');
  };

  const isCollapsed = sidebarMode === 'collapsed' && !mobileOpen;
  const isHidden = sidebarMode === 'hidden' && !mobileOpen;
  const isTrial = currentProfile?.permissions?.isTrialMode;

  const toggleCollapse = () => {
    if (setSidebarMode) {
      if (sidebarMode === 'expanded') setSidebarMode('collapsed');
      else setSidebarMode('expanded');
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen && setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sliding Sidebar Container */}
      <aside 
        id="sliding-app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between select-none
          bg-[#1C0908]/95 backdrop-blur-2xl text-white border-r border-white/10
          shadow-[0_0_40px_rgba(0,0,0,0.35)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${mobileOpen ? 'translate-x-0 w-[260px] p-4' : ''}
          ${!mobileOpen && isHidden ? '-translate-x-full lg:-translate-x-full w-[260px]' : ''}
          ${!mobileOpen && !isHidden && isCollapsed ? 'translate-x-0 w-[74px] p-3' : ''}
          ${!mobileOpen && !isHidden && !isCollapsed ? 'translate-x-0 w-[256px] p-4.5' : ''}
          ${!mobileOpen ? 'hidden lg:flex' : 'flex'}
        `}
      >
        {/* Top Header & Navigation Section */}
        <div className="flex flex-col gap-4 min-h-0">
          
          {/* Header Brand Bar */}
          <div className="flex items-center justify-between gap-2 px-1 relative">
            <div 
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-3 min-w-0 cursor-pointer group"
              title="Return to Dashboard"
            >
              {/* Animated Brand Paw Logo */}
              <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#FF8833] flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 group-hover:shadow-[#FF6B00]/40 transition-all">
                <svg className="w-5 h-5 fill-white drop-shadow-xs" viewBox="0 0 32 32">
                  <ellipse cx="16" cy="20" rx="6" ry="5" />
                  <circle cx="9.5" cy="13" r="2.6" />
                  <circle cx="16" cy="10.5" r="2.8" />
                  <circle cx="22.5" cy="13" r="2.6" />
                </svg>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#1C0908]" />
              </div>

              {/* Brand Title (Shown when expanded or on mobile) */}
              {(!isCollapsed || mobileOpen) && (
                <div className="min-w-0 animate-fadeIn">
                  <h1 className="font-display font-extrabold text-sm text-white tracking-wide uppercase leading-tight truncate group-hover:text-theme-primary transition-colors">
                    {currentProfile?.businessName || settings.salonName || settings.name || 'PawBook Pro'}
                  </h1>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] font-bold text-[#A08E8B] tracking-wider uppercase truncate">
                      {currentProfile ? `${currentProfile.plan} Plan` : 'Professional Studio'}
                    </span>
                    {isTrial && (
                      <span className="px-1.5 py-0.2 rounded-md bg-[#FF6B00]/25 text-[#FF8833] text-[8px] font-black uppercase tracking-wider border border-[#FF6B00]/40">
                        Trial
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Collapse/Expand Toggle & Mobile Close */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Desktop Toggle Button */}
              {setSidebarMode && !mobileOpen && (
                <button
                  onClick={toggleCollapse}
                  className="hidden lg:flex w-7 h-7 rounded-xl bg-white/5 hover:bg-white/12 border border-white/10 text-[#A08E8B] hover:text-white items-center justify-center transition-all cursor-pointer"
                  title={isCollapsed ? "Expand sidebar (⌘B)" : "Collapse sidebar (⌘B)"}
                  aria-label="Toggle sidebar collapse"
                >
                  {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                </button>
              )}

              {/* Mobile Close Button */}
              {setMobileOpen && mobileOpen && (
                <button 
                  onClick={() => setMobileOpen(false)}
                  className="lg:hidden p-1.5 rounded-xl bg-white/5 text-[#A08E8B] hover:text-white border border-white/10"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Filter Search within Sidebar (When expanded) */}
          {(!isCollapsed || mobileOpen) && (
            <div className="relative px-1 animate-fadeIn">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A08E8B]" />
              <input
                type="text"
                placeholder="Filter tools & views..."
                value={navSearchQuery}
                onChange={(e) => setNavSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white/5 hover:bg-white/8 focus:bg-white/12 border border-white/10 focus:border-theme-primary/60 rounded-xl outline-none text-white placeholder-[#8A7976] transition-all"
              />
              {navSearchQuery && (
                <button 
                  onClick={() => setNavSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A08E8B] hover:text-white p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Navigation Items Categories */}
          <nav className="flex-1 flex flex-col gap-3 overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-white/10">
            {navCategories.map((category, catIdx) => {
              // Filter items based on sidebar search
              const filteredItems = category.items.filter(item => 
                item.label.toLowerCase().includes(navSearchQuery.toLowerCase())
              );

              if (filteredItems.length === 0) return null;

              return (
                <div key={catIdx} className="space-y-1">
                  {/* Category Header (When expanded) */}
                  {(!isCollapsed || mobileOpen) && (
                    <div className="px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-[#7A6865] flex items-center justify-between select-none">
                      <span>{category.title}</span>
                    </div>
                  )}

                  {/* Category Items */}
                  <div className="space-y-1">
                    {filteredItems.map((item) => {
                      const isActive = view === item.id;
                      const allowed = isScreenAllowed(currentProfile?.permissions, item.id);

                      return (
                        <div 
                          key={item.id} 
                          className="relative"
                          onMouseEnter={() => setHoveredItem(item.id)}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          <button
                            onClick={() => handleNavClick(item.id)}
                            className={`w-full flex items-center rounded-xl text-xs font-bold text-left transition-all duration-200 cursor-pointer group relative ${
                              isCollapsed
                                ? 'justify-center p-2.5'
                                : 'gap-3 px-3 py-2'
                            } ${
                              isActive
                                ? 'bg-theme-primary text-white shadow-lg theme-glow'
                                : allowed 
                                  ? 'text-[#C5B7B4] hover:bg-white/8 hover:text-white'
                                  : 'text-[#6A5855] hover:bg-white/5 hover:text-[#A08E8B]'
                            }`}
                          >
                            {/* Icon with smooth micro-animation */}
                            <span className={`shrink-0 transition-transform duration-200 ${
                              isActive 
                                ? 'text-white scale-110' 
                                : allowed 
                                  ? 'text-[#A08E8B] group-hover:text-white group-hover:scale-105' 
                                  : 'text-[#6A5855]'
                            }`}>
                              {item.icon}
                            </span>

                            {/* Label (Expanded Mode) */}
                            {(!isCollapsed || mobileOpen) && (
                              <span className={`flex-1 truncate tracking-tight ${
                                !allowed ? 'line-through decoration-theme-primary/50 text-white/40' : ''
                              }`}>
                                {item.label}
                              </span>
                            )}

                            {/* Lock Icon if feature restricted */}
                            {!allowed && (!isCollapsed || mobileOpen) && (
                              <span className="text-[10px] text-theme-primary opacity-80" title="Locked feature">
                                <Lock className="w-3 h-3" />
                              </span>
                            )}

                            {/* Badge count */}
                            {allowed && item.badge !== undefined && item.badge > 0 && (
                              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full shrink-0 shadow-2xs ${
                                isActive 
                                  ? 'bg-white text-theme-primary' 
                                  : item.badgeColor || 'bg-theme-primary text-white'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </button>

                          {/* Floating Tooltip in Collapsed Mode */}
                          {isCollapsed && hoveredItem === item.id && (
                            <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 z-50 pointer-events-none animate-fadeIn">
                              <div className="bg-[#240C0B] text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xl border border-white/15 whitespace-nowrap flex items-center gap-2">
                                <span>{item.label}</span>
                                {item.shortcut && (
                                  <span className="text-[9px] font-mono bg-white/10 px-1.5 py-0.5 rounded text-[#A08E8B]">
                                    {item.shortcut}
                                  </span>
                                )}
                                {item.badge !== undefined && item.badge > 0 && (
                                  <span className="text-[9px] font-black px-1.5 py-0.2 bg-red-500 text-white rounded-full">
                                    {item.badge}
                                  </span>
                                )}
                                {!allowed && (
                                  <Lock className="w-3 h-3 text-theme-primary" />
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile Section */}
        <div ref={profileRef} className="pt-3 border-t border-white/10 space-y-2 relative">
          
          {/* Quick Action: Book Grooming Button (When expanded) */}
          {(!isCollapsed || mobileOpen) && (
            <button
              onClick={() => openModal('appointmentForm')}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-theme-primary to-[#FF8833] hover:opacity-95 text-white font-bold text-xs shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>
          )}

          {/* Profile Card Trigger */}
          <div 
            onClick={() => setProfileMenuOpen(prev => !prev)}
            className={`flex items-center bg-white/5 hover:bg-white/10 border border-white/10 hover:border-theme-primary/50 rounded-2xl transition-all cursor-pointer group ${
              isCollapsed ? 'justify-center p-2' : 'justify-between p-2.5'
            }`}
            title="Studio Profile & Preferences"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <img 
                  src={settings.photo || "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=120&q=80"} 
                  alt={settings.name || "Studio profile"}
                  className="w-8 h-8 rounded-xl object-cover ring-1 ring-white/20 group-hover:ring-theme-primary transition-all"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#1C0908]" />
              </div>

              {(!isCollapsed || mobileOpen) && (
                <div className="min-w-0 text-left">
                  <p className="text-xs font-extrabold text-white truncate group-hover:text-theme-primary transition-colors">
                    {currentProfile?.ownerName || settings.name || settings.salonName || 'Studio Master'}
                  </p>
                  <p className="text-[10px] text-[#A08E8B] truncate font-mono">
                    {currentProfile?.email || settings.email || 'care@pawbookpro.com'}
                  </p>
                </div>
              )}
            </div>

            {(!isCollapsed || mobileOpen) && (
              <ChevronDown className={`w-3.5 h-3.5 text-[#A08E8B] transition-transform ${profileMenuOpen ? 'rotate-180 text-white' : ''}`} />
            )}
          </div>

          {/* Profile Popover / Dropdown Menu */}
          <AnimatePresence>
            {profileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={`absolute bottom-full mb-2 bg-[#240C0B] border border-white/15 rounded-2xl shadow-2xl p-2 z-50 text-white animate-fadeIn ${
                  isCollapsed ? 'left-full ml-3 w-56' : 'left-0 right-0 w-full'
                }`}
              >
                {/* Header info in popover */}
                <div className="px-2.5 py-1.5 border-b border-white/10 mb-1">
                  <p className="text-xs font-bold text-white truncate">
                    {currentProfile?.businessName || settings.salonName || 'PawBook Pro'}
                  </p>
                  <span className="text-[10px] text-[#A08E8B] uppercase font-mono tracking-wider">
                    {currentProfile?.plan || 'Pro Tier'} Active
                  </span>
                </div>

                {/* Menu items */}
                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      setView('settings');
                      setProfileMenuOpen(false);
                      if (setMobileOpen) setMobileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold hover:bg-white/10 text-[#E6DFD5] hover:text-white transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#A08E8B]" />
                    <span>Studio Settings</span>
                  </button>

                  <button
                    onClick={() => setThemePopoverOpen(prev => !prev)}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold hover:bg-white/10 text-[#E6DFD5] hover:text-white transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Palette className="w-3.5 h-3.5 text-theme-primary" />
                      <span>Color Theme</span>
                    </div>
                    <span 
                      className="w-2.5 h-2.5 rounded-full border border-white/40"
                      style={{ backgroundColor: quickThemes.find(t => t.id === (settings.colorTheme || 'terracotta'))?.color || '#FF6B00' }}
                    />
                  </button>

                  {/* Embedded theme grid if toggled */}
                  {themePopoverOpen && (
                    <div className="grid grid-cols-4 gap-1 p-1.5 bg-black/40 rounded-xl my-1 border border-white/10">
                      {quickThemes.map(t => (
                        <button
                          key={t.id}
                          onClick={() => handleThemeChange(t.id)}
                          className={`w-full h-6 rounded-lg flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                            (settings.colorTheme || 'terracotta') === t.id ? 'ring-2 ring-white scale-105' : ''
                          }`}
                          style={{ backgroundColor: t.color }}
                          title={t.label}
                        />
                      ))}
                    </div>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => {
                        returnToAdmin();
                        setProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-[#4ECDC4] hover:bg-[#2E8A81]/30 transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>SuperAdmin Panel</span>
                    </button>
                  )}

                  <div className="border-t border-white/10 my-1 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>
    </>
  );
};
