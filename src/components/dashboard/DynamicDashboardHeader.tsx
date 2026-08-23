import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useDashboardSystem } from '../../context/DashboardSystemContext';
import { 
  Search, 
  Bell, 
  Sparkles, 
  Scissors, 
  Settings, 
  Sliders, 
  Layers, 
  Zap, 
  LogOut, 
  Calendar, 
  User, 
  DollarSign, 
  ShieldCheck, 
  Activity,
  ChevronDown
} from 'lucide-react';
import { DASHBOARD_THEMES } from '../../data/dashboardThemesData';

export const DynamicDashboardHeader: React.FC = () => {
  const { currentProfile, logout } = useAuth();
  const { openModal, appointments, clients, formatPrice } = useApp();
  const { 
    headerStyle, 
    setHeaderStyle, 
    currentTheme, 
    setTheme, 
    currentThemeDef, 
    currentLayoutDef, 
    setIsAdminStudioOpen,
    activeClientProfile,
    clientProfiles,
    switchClientProfile,
    triggerSimulationEvent
  } = useDashboardSystem();

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysAppts = appointments.filter(a => a.date === todayStr);
  const completedToday = todaysAppts.filter(a => a.status === 'completed');
  const todayRevenue = todaysAppts.reduce((sum, a) => sum + (a.totalPrice || 85), 0);

  // Common quick controls
  const renderCommonActions = () => (
    <div className="flex items-center gap-2">
      {/* Real-time Simulator Quick Trigger */}
      <button
        id="btn-sim-event-quick"
        onClick={() => triggerSimulationEvent('check_in')}
        className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-theme-light border border-theme-subtle text-xs font-semibold text-theme-ink hover:border-theme-primary transition-all"
        title="Simulate Instant Pet Arrival"
      >
        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        <span>Simulate Check-In</span>
      </button>

      {/* Admin Studio Open Trigger Button */}
      <button
        id="btn-open-admin-studio"
        onClick={() => setIsAdminStudioOpen(true)}
        className="btn-primary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md hover:scale-105 transition-all"
      >
        <Sliders className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Admin Studio</span>
        <span className="sm:hidden">Studio</span>
      </button>

      {/* Client Profile Switcher dropdown */}
      <div className="relative group">
        <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-theme-light border border-theme-subtle text-xs font-bold text-theme-ink hover:border-theme-primary">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="max-w-[100px] truncate">{activeClientProfile.name}</span>
          <ChevronDown className="w-3 h-3 text-theme-muted" />
        </button>

        <div className="absolute right-0 mt-1 w-64 p-1.5 rounded-xl bg-theme-canvas border border-theme-subtle shadow-xl hidden group-hover:block z-50">
          <div className="px-2 py-1 text-[10px] uppercase font-bold text-theme-muted tracking-wider border-b border-theme-subtle mb-1">
            Switch SaaS Client Workspace
          </div>
          {clientProfiles.map(profile => (
            <button
              key={profile.id}
              onClick={() => switchClientProfile(profile.id)}
              className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                profile.id === activeClientProfile.id
                  ? 'bg-theme-primary text-black font-bold'
                  : 'text-theme-ink hover:bg-theme-light'
              }`}
            >
              <div className="truncate">
                <div>{profile.name}</div>
                <div className="text-[10px] opacity-75 font-normal">{profile.plan.toUpperCase()} • {profile.location}</div>
              </div>
              {profile.id === activeClientProfile.id && <span>✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* User profile avatar */}
      <div className="flex items-center gap-2 pl-2 border-l border-theme-subtle">
        <div className="w-8 h-8 rounded-lg bg-theme-primary text-black font-extrabold flex items-center justify-center text-xs">
          {currentProfile?.ownerName?.[0] || 'A'}
        </div>
      </div>
    </div>
  );

  // STYLE 1: Clean Search
  if (headerStyle === 'clean_search') {
    return (
      <header id="dashboard-header" className="sticky top-0 z-30 px-4 sm:px-6 py-3 bg-theme-canvas/90 backdrop-blur-md border-b border-theme-subtle">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
              <input
                type="text"
                placeholder="Search dog, client, microchip #, phone..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-theme-light border border-theme-subtle text-xs text-theme-ink focus:outline-none focus:border-theme-primary placeholder:text-theme-muted transition-colors"
              />
            </div>
          </div>

          {renderCommonActions()}
        </div>
      </header>
    );
  }

  // STYLE 2: Live Salon Pulse
  if (headerStyle === 'live_salon_pulse') {
    return (
      <header id="dashboard-header" className="sticky top-0 z-30 px-4 sm:px-6 py-3 bg-theme-canvas/90 backdrop-blur-md border-b border-theme-subtle">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-extrabold text-theme-ink uppercase tracking-wider font-display">
                Live Salon Telemetry
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-3 text-xs border-l border-theme-subtle pl-4">
              <span className="text-theme-muted">In Bath/Styling: <strong className="text-theme-ink">3 Dogs</strong></span>
              <span>•</span>
              <span className="text-theme-muted">Queue: <strong className="text-theme-ink">{todaysAppts.length - completedToday.length} Waiting</strong></span>
              <span>•</span>
              <span className="text-theme-muted">HVAC Temp: <strong className="text-emerald-500">72°F Optimal</strong></span>
            </div>
          </div>

          {renderCommonActions()}
        </div>
      </header>
    );
  }

  // STYLE 3: KPI Ticker
  if (headerStyle === 'kpi_ticker') {
    return (
      <header id="dashboard-header" className="sticky top-0 z-30 px-4 sm:px-6 py-2.5 bg-theme-canvas/95 backdrop-blur-md border-b border-theme-subtle">
        <div className="flex items-center justify-between gap-3">
          {/* Running KPI ticker items */}
          <div className="flex items-center gap-6 overflow-x-auto py-1 text-xs">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-theme-muted font-medium">Today Gross:</span>
              <span className="font-bold text-theme-primary">{formatPrice(todayRevenue)}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-theme-muted font-medium">Baths & Cuts:</span>
              <span className="font-bold text-theme-ink">{completedToday.length}/{todaysAppts.length} Done</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 hidden md:flex">
              <span className="text-theme-muted font-medium">Loyalty Pts Issued:</span>
              <span className="font-bold text-amber-500">+840 Pts</span>
            </div>
          </div>

          {renderCommonActions()}
        </div>
      </header>
    );
  }

  // STYLE 4: Floating Island
  return (
    <header id="dashboard-header" className="sticky top-2 z-30 px-4 sm:px-6 py-1">
      <div className="max-w-7xl mx-auto px-4 py-2 rounded-2xl bg-theme-canvas/90 backdrop-blur-xl border border-theme-subtle shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-theme-primary text-black font-black flex items-center justify-center text-xs">
              🐾
            </div>
            <span className="text-sm font-black text-theme-ink font-display tracking-tight hidden sm:inline">
              PawGroom
            </span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-theme-light text-theme-muted border border-theme-subtle hidden md:inline">
            {activeClientProfile.name}
          </span>
        </div>

        {renderCommonActions()}
      </div>
    </header>
  );
};
