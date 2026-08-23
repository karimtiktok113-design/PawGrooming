import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useDashboardSystem } from '../../context/DashboardSystemContext';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Scissors, 
  ShoppingBag, 
  UserCheck, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  Sliders, 
  LogOut, 
  Sparkles, 
  Layers, 
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { DASHBOARD_THEMES } from '../../data/dashboardThemesData';

export const DynamicDashboardSidebar: React.FC = () => {
  const { view, setView } = useApp();
  const { currentProfile, logout } = useAuth();
  const { 
    sidebarStyle, 
    setIsAdminStudioOpen, 
    activeClientProfile,
    currentThemeDef,
    currentLayoutDef 
  } = useDashboardSystem();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard 360°', icon: LayoutDashboard },
    { id: 'calendar', label: 'Appointments', icon: Calendar },
    { id: 'clients', label: 'Pet Directory', icon: Users },
    { id: 'services', label: 'Spa Services', icon: Scissors },
    { id: 'staff', label: 'Groomers', icon: UserCheck },
    { id: 'inventory', label: 'Inventory', icon: ShoppingBag },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // If top_navbar, we don't render a left sidebar
  if (sidebarStyle === 'top_navbar') {
    return null;
  }

  // 1. SLIM ICON RAIL STYLE
  if (sidebarStyle === 'slim_icon_rail') {
    return (
      <aside className="w-16 shrink-0 bg-theme-canvas border-r border-theme-subtle flex flex-col items-center justify-between py-4 select-none z-20">
        {/* Brand Logo icon */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-theme-primary text-black font-extrabold flex items-center justify-center text-lg shadow-sm">
            🐾
          </div>

          {/* Nav Icons */}
          <nav className="flex flex-col items-center gap-2 mt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = view === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id as any)}
                  title={item.label}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-theme-primary text-black font-bold shadow-md'
                      : 'text-theme-muted hover:text-theme-ink hover:bg-theme-light'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom studio & logout */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => setIsAdminStudioOpen(true)}
            title="Open Admin Studio"
            className="w-10 h-10 rounded-xl bg-theme-light border border-theme-subtle text-theme-primary hover:border-theme-primary flex items-center justify-center transition-all"
          >
            <Sliders className="w-5 h-5" />
          </button>
          <button
            onClick={logout}
            title="Log Out"
            className="w-10 h-10 rounded-xl text-theme-muted hover:text-rose-500 hover:bg-theme-light flex items-center justify-center transition-all"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </aside>
    );
  }

  // 2. FLOATING DOCK STYLE
  if (sidebarStyle === 'floating_dock') {
    return (
      <aside className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 px-3 py-2 rounded-2xl bg-theme-canvas/90 backdrop-blur-xl border border-theme-subtle shadow-2xl flex items-center gap-1.5 max-w-[95vw] overflow-x-auto">
        <div className="flex items-center gap-1 pr-2 border-r border-theme-subtle">
          <span className="text-sm">🐾</span>
          <span className="text-xs font-bold text-theme-ink font-display hidden sm:inline">PawGroom</span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = view === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-theme-primary text-black shadow-md'
                  : 'text-theme-muted hover:text-theme-ink hover:bg-theme-light'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden md:inline">{item.label}</span>
            </button>
          );
        })}

        <div className="pl-2 border-l border-theme-subtle flex items-center gap-1">
          <button
            onClick={() => setIsAdminStudioOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-theme-light border border-theme-subtle text-theme-primary text-xs font-bold flex items-center gap-1"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Studio</span>
          </button>
        </div>
      </aside>
    );
  }

  // 3. COMPACT DUAL RAIL STYLE
  if (sidebarStyle === 'compact_dual') {
    return (
      <aside className="flex shrink-0 z-20">
        {/* Rail 1: Fast switch icons */}
        <div className="w-14 bg-theme-canvas border-r border-theme-subtle flex flex-col items-center justify-between py-4">
          <div className="w-9 h-9 rounded-xl bg-theme-primary text-black font-extrabold flex items-center justify-center text-sm shadow-sm">
            🐾
          </div>
          <button
            onClick={() => setIsAdminStudioOpen(true)}
            className="w-9 h-9 rounded-xl bg-theme-light border border-theme-subtle text-theme-primary hover:border-theme-primary flex items-center justify-center"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>

        {/* Rail 2: Menu list */}
        <div className="w-52 bg-theme-canvas/70 backdrop-blur-md border-r border-theme-subtle flex flex-col justify-between p-3">
          <div>
            <div className="px-2 py-1 mb-2">
              <span className="text-[10px] uppercase font-extrabold text-theme-muted tracking-wider">
                {activeClientProfile.name}
              </span>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = view === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setView(item.id as any)}
                    className={`w-full px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                      isActive
                        ? 'bg-theme-primary text-black shadow-sm'
                        : 'text-theme-muted hover:text-theme-ink hover:bg-theme-light'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          <button
            onClick={logout}
            className="w-full px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    );
  }

  // 4. DEFAULT: CLASSIC LEFT SIDEBAR STYLE
  return (
    <aside className="w-64 shrink-0 bg-theme-canvas border-r border-theme-subtle flex flex-col justify-between p-4 select-none z-20">
      <div>
        {/* Brand logo & active salon workspace */}
        <div className="flex items-center gap-3 px-2 py-1 mb-4">
          <div className="w-10 h-10 rounded-xl bg-theme-primary text-black font-black flex items-center justify-center text-lg shadow-md">
            🐾
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold text-theme-ink font-display tracking-tight">
                PawGroom
              </h1>
              <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-theme-light text-theme-primary border border-theme-subtle">
                SaaS
              </span>
            </div>
            <p className="text-[11px] text-theme-muted font-medium truncate max-w-[140px]">
              {activeClientProfile.name}
            </p>
          </div>
        </div>

        {/* Client Active Tier Badge */}
        <div className="p-2.5 rounded-xl bg-theme-light border border-theme-subtle mb-4">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-theme-muted font-semibold">Active Plan</span>
            <span className="text-theme-primary font-bold">{activeClientProfile.tier.toUpperCase()}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-theme-muted mt-1">
            <span>Theme: {currentThemeDef.name}</span>
            <span>{currentLayoutDef.name.split(' ')[0]}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = view === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setView(item.id as any)}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all group ${
                  isActive
                    ? 'bg-theme-primary text-black shadow-sm font-extrabold'
                    : 'text-theme-muted hover:text-theme-ink hover:bg-theme-light'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-theme-muted group-hover:text-theme-primary'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Panel */}
      <div className="space-y-2 pt-4 border-t border-theme-subtle">
        {/* Open Admin Studio CTA */}
        <button
          onClick={() => setIsAdminStudioOpen(true)}
          className="w-full px-3 py-2.5 rounded-xl bg-theme-light border border-theme-subtle text-theme-ink hover:border-theme-primary text-xs font-bold flex items-center justify-between transition-all group"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-theme-primary group-hover:rotate-45 transition-transform" />
            <span>Admin Studio</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-theme-primary text-black font-bold">
            14 Themes
          </span>
        </button>

        {/* Sign Out */}
        <button
          onClick={logout}
          className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-theme-muted hover:text-rose-500 hover:bg-theme-light flex items-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
