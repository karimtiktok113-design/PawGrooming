import React, { useState } from 'react';
import { useDashboardSystem } from '../../context/DashboardSystemContext';
import { 
  DASHBOARD_THEMES, 
  DASHBOARD_LAYOUTS, 
  ALL_DASHBOARD_SECTIONS, 
  SIDEBAR_STYLE_OPTIONS, 
  HEADER_STYLE_OPTIONS 
} from '../../data/dashboardThemesData';
import { 
  X, 
  Palette, 
  Layout, 
  ToggleLeft, 
  Building2, 
  Zap, 
  Check, 
  RotateCcw, 
  Sparkles, 
  Sliders, 
  Code2, 
  ShieldCheck, 
  Play, 
  Trash2
} from 'lucide-react';
import { DashboardThemeId, DashboardLayoutId, SidebarStyleId, HeaderStyleId } from '../../types/dashboardSystem';

export const AdminStudioDrawer: React.FC = () => {
  const { 
    isAdminStudioOpen, 
    setIsAdminStudioOpen,
    activeStudioTab,
    setActiveStudioTab,
    currentTheme,
    setTheme,
    currentThemeDef,
    currentLayout,
    setLayout,
    currentLayoutDef,
    sidebarStyle,
    setSidebarStyle,
    headerStyle,
    setHeaderStyle,
    enabledSections,
    toggleSection,
    resetSectionsToLayoutDefault,
    clientProfiles,
    activeClientProfile,
    switchClientProfile,
    saveProfilePreset,
    realtimeEvents,
    triggerSimulationEvent,
    clearEvents
  } = useDashboardSystem();

  const [themeSearch, setThemeSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isAdminStudioOpen) return null;

  const categories = ['all', 'Luxury', 'Minimalist', 'Dark', 'Creative', 'Professional', 'Nature', 'High-Tech'];

  const filteredThemes = DASHBOARD_THEMES.filter(theme => {
    const matchesSearch = theme.name.toLowerCase().includes(themeSearch.toLowerCase()) ||
      theme.description.toLowerCase().includes(themeSearch.toLowerCase()) ||
      theme.tag.toLowerCase().includes(themeSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedCategory !== 'all' && theme.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      {/* Drawer Container */}
      <div className="w-full max-w-2xl bg-[#FAF8F5] text-[#240C0B] h-full shadow-2xl border-l border-[#E6DFD5] flex flex-col justify-between">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E6DFD5] flex items-center justify-between bg-white/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B00] text-white font-extrabold flex items-center justify-center shadow-md">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold font-display text-[#240C0B]">
                  PawGroom SaaS Admin Studio
                </h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FF6B00] text-white">
                  14 Themes & 7 Layouts
                </span>
              </div>
              <p className="text-xs text-[#7A6865]">
                Dynamic theme switcher, screen layouts, widget switchboard & multi-client profiles
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAdminStudioOpen(false)}
            className="w-9 h-9 rounded-xl bg-white border border-[#E6DFD5] hover:bg-[#F1EEE6] text-[#7A6865] hover:text-[#240C0B] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 py-2.5 border-b border-[#E6DFD5] bg-white flex gap-1.5 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'themes', label: '14 Themes', icon: Palette },
            { id: 'layouts', label: '7 Layouts', icon: Layout },
            { id: 'sections', label: 'Section Switchboard', icon: ToggleLeft },
            { id: 'clients', label: 'Client Studios', icon: Building2 },
            { id: 'simulator', label: 'Live Event Sync', icon: Zap },
            { id: 'architecture', label: 'Architecture', icon: Code2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeStudioTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveStudioTab(tab.id as any)}
                className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FF6B00] text-white font-bold shadow-xs'
                    : 'text-[#7A6865] hover:text-[#240C0B] hover:bg-[#F1EEE6]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* TAB 1: 14 THEMES */}
          {activeStudioTab === 'themes' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#240C0B] font-display">
                    Select & Activate Dashboard Theme (14 Variations)
                  </h3>
                  <p className="text-xs text-[#7A6865]">
                    CSS variables switch instantaneously across typography, canvas, borders, glass & accents
                  </p>
                </div>

                {/* Filter mode */}
                <div className="flex bg-white p-0.5 rounded-xl border border-[#E6DFD5] text-[11px] font-semibold overflow-x-auto">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2 py-1 rounded-lg capitalize transition-all cursor-pointer whitespace-nowrap ${
                        selectedCategory === cat ? 'bg-[#FF6B00] text-white font-bold' : 'text-[#7A6865]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredThemes.map((theme) => {
                  const isActive = currentTheme === theme.id;

                  return (
                    <div
                      key={theme.id}
                      onClick={() => setTheme(theme.id as DashboardThemeId)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                        isActive
                          ? 'border-[#FF6B00] ring-2 ring-[#FF6B00]/30 bg-white shadow-lg'
                          : 'border-[#E6DFD5] bg-white/70 hover:border-[#FF6B00]/60 hover:bg-white'
                      }`}
                    >
                      {/* Top swatch bar */}
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span 
                            className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                            style={{ backgroundColor: theme.previewColors.primary }}
                          />
                          <span 
                            className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                            style={{ backgroundColor: theme.previewColors.accent }}
                          />
                          <span 
                            className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                            style={{ backgroundColor: theme.previewColors.bg }}
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#FAF8F5] text-[#7A6865] border border-[#E6DFD5]">
                            {theme.category}
                          </span>
                          {isActive && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-0.5 shadow-xs">
                              <Check className="w-2.5 h-2.5" /> Active
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Name & Tag */}
                      <div className="flex items-baseline justify-between gap-1">
                        <h4 className="text-xs font-bold text-[#240C0B] font-display group-hover:text-[#FF6B00] transition-colors truncate">
                          {theme.name}
                        </h4>
                        <span className="text-[10px] text-[#FF6B00] font-semibold shrink-0">
                          {theme.tag}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#7A6865] mt-1 line-clamp-2">
                        {theme.description}
                      </p>

                      {/* Badge info */}
                      <div className="mt-2.5 pt-2 border-t border-[#E6DFD5] flex items-center justify-between text-[10px]">
                        <span className="text-[#7A6865] italic truncate max-w-[150px]">
                          {theme.badges[0] || theme.visualStyle}
                        </span>
                        <span className="font-semibold text-[#240C0B]">
                          {theme.fontHeading.split(',')[0]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: 7 LAYOUTS & NAVIGATION STYLES */}
          {activeStudioTab === 'layouts' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[#240C0B] font-display">
                  Dashboard Screen Layouts (7 Architectures)
                </h3>
                <p className="text-xs text-[#7A6865]">
                  Switch the viewport arrangement, widget hierarchies, and operational emphasis
                </p>
              </div>

              {/* Layout Grid */}
              <div className="space-y-3">
                {DASHBOARD_LAYOUTS.map((layout) => {
                  const isActive = currentLayout === layout.id;

                  return (
                    <div
                      key={layout.id}
                      onClick={() => setLayout(layout.id as DashboardLayoutId)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isActive
                          ? 'border-[#FF6B00] ring-2 ring-[#FF6B00]/30 bg-white shadow-md'
                          : 'border-[#E6DFD5] bg-white/70 hover:border-[#FF6B00]/60 hover:bg-white'
                      }`}
                    >
                      <div className="space-y-1 max-w-md">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-[#240C0B] font-display">
                            {layout.name}
                          </h4>
                          {isActive && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> Active Layout
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#7A6865]">
                          {layout.description}
                        </p>
                        <div className="text-[10px] text-[#FF6B00] font-semibold flex items-center gap-1 pt-1">
                          <span>Target:</span>
                          <span className="text-[#240C0B]">{layout.bestFor}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E6DFD5] text-[#240C0B] font-bold">
                          {layout.columns} Columns
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Bar & Sidebar Style Switcher */}
              <div className="pt-4 border-t border-[#E6DFD5] space-y-4">
                <h3 className="text-sm font-bold text-[#240C0B] font-display">
                  Navigation Architecture & Sidebar Form Factors
                </h3>

                {/* Sidebar Style Selection */}
                <div>
                  <label className="text-xs font-semibold text-[#7A6865] uppercase tracking-wider block mb-2">
                    Sidebar Style (5 Variations)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SIDEBAR_STYLE_OPTIONS.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSidebarStyle(style.id as SidebarStyleId)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          sidebarStyle === style.id
                            ? 'bg-[#FF6B00] text-white font-bold border-[#FF6B00] shadow-xs'
                            : 'bg-white border-[#E6DFD5] text-[#240C0B] hover:border-[#FF6B00]/50'
                        }`}
                      >
                        <div className="font-bold">{style.name}</div>
                        <div className={`text-[10px] mt-0.5 ${sidebarStyle === style.id ? 'text-white/80' : 'text-[#7A6865]'}`}>
                          {style.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Header Style Selection */}
                <div>
                  <label className="text-xs font-semibold text-[#7A6865] uppercase tracking-wider block mb-2">
                    Header Banner Style (4 Variations)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {HEADER_STYLE_OPTIONS.map((hStyle) => (
                      <button
                        key={hStyle.id}
                        onClick={() => setHeaderStyle(hStyle.id as HeaderStyleId)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          headerStyle === hStyle.id
                            ? 'bg-[#FF6B00] text-white font-bold border-[#FF6B00] shadow-xs'
                            : 'bg-white border-[#E6DFD5] text-[#240C0B] hover:border-[#FF6B00]/50'
                        }`}
                      >
                        <div className="font-bold">{hStyle.name}</div>
                        <div className={`text-[10px] mt-0.5 ${headerStyle === hStyle.id ? 'text-white/80' : 'text-[#7A6865]'}`}>
                          {hStyle.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SECTION & WIDGET TOGGLES */}
          {activeStudioTab === 'sections' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#240C0B] font-display">
                    Modular Section Switchboard
                  </h3>
                  <p className="text-xs text-[#7A6865]">
                    Toggle individual widgets for active tenant: <strong>{activeClientProfile.name}</strong>
                  </p>
                </div>

                <button
                  onClick={resetSectionsToLayoutDefault}
                  className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E6DFD5] text-[#7A6865] hover:text-[#240C0B] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Defaults
                </button>
              </div>

              {/* Toggle switch list */}
              <div className="space-y-2.5">
                {ALL_DASHBOARD_SECTIONS.map((sec) => {
                  const isEnabled = !!enabledSections[sec.key];

                  return (
                    <div
                      key={sec.key}
                      onClick={() => toggleSection(sec.key)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isEnabled
                          ? 'bg-white border-[#E6DFD5] hover:border-[#FF6B00]'
                          : 'bg-white/40 border-[#E6DFD5]/50 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#240C0B] font-display">
                            {sec.label}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-[#FAF8F5] text-[#7A6865] border border-[#E6DFD5]">
                            {sec.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#7A6865] mt-0.5">
                          {sec.description}
                        </p>
                      </div>

                      {/* Switch Pill */}
                      <div className={`w-11 h-6 rounded-full p-0.5 transition-colors relative shrink-0 ${
                        isEnabled ? 'bg-[#FF6B00]' : 'bg-[#D1C7BD]'
                      }`}>
                        <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: CLIENT PROFILES (MULTI-TENANT SAAS) */}
          {activeStudioTab === 'clients' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#240C0B] font-display">
                  Multi-Tenant SaaS Client Businesses
                </h3>
                <p className="text-xs text-[#7A6865]">
                  Each salon operates as an isolated tenant with custom theme, layout presets, and brand rules
                </p>
              </div>

              <div className="space-y-3">
                {clientProfiles.map((client) => {
                  const isSelected = activeClientProfile.id === client.id;
                  const themeName = DASHBOARD_THEMES.find(t => t.id === client.activeTheme)?.name || client.activeTheme;
                  const layoutName = DASHBOARD_LAYOUTS.find(l => l.id === client.activeLayout)?.name || client.activeLayout;

                  return (
                    <div
                      key={client.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? 'border-[#FF6B00] ring-2 ring-[#FF6B00]/30 bg-white shadow-md'
                          : 'border-[#E6DFD5] bg-white/70 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🏪</span>
                            <h4 className="text-sm font-bold text-[#240C0B] font-display">
                              {client.name}
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF6B00] text-white uppercase">
                              {client.plan}
                            </span>
                          </div>
                          <p className="text-xs text-[#7A6865] mt-1">
                            {client.location} • Stylist: {client.primaryGroomer}
                          </p>
                        </div>

                        {isSelected ? (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Active Workspace
                          </span>
                        ) : (
                          <button
                            onClick={() => switchClientProfile(client.id)}
                            className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E6DFD5] text-xs font-bold text-[#240C0B] hover:border-[#FF6B00] transition-all cursor-pointer"
                          >
                            Switch Workspace
                          </button>
                        )}
                      </div>

                      {/* Presets and stats */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-[#E6DFD5] text-xs">
                        <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#E6DFD5]">
                          <span className="text-[10px] text-[#7A6865] block font-medium">Assigned Theme</span>
                          <span className="font-bold text-[#240C0B] truncate block">{themeName}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#E6DFD5]">
                          <span className="text-[10px] text-[#7A6865] block font-medium">Layout Architecture</span>
                          <span className="font-bold text-[#240C0B] truncate block">{layoutName.split(' ')[0]}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#E6DFD5]">
                          <span className="text-[10px] text-[#7A6865] block font-medium">Enabled Widgets</span>
                          <span className="font-bold text-[#FF6B00] block">
                            {Object.values(client.enabledSections).filter(Boolean).length} Widgets
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#E6DFD5]">
                          <span className="text-[10px] text-[#7A6865] block font-medium">Header / Sidebar</span>
                          <span className="font-bold text-[#240C0B] block">{client.sidebarStyle.split('_')[0]}</span>
                        </div>
                      </div>

                      {/* Save current configuration to this profile */}
                      {isSelected && (
                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={() => saveProfilePreset(client.id, currentTheme, currentLayout)}
                            className="btn-primary px-3 py-1 rounded-lg text-xs font-bold"
                          >
                            Save Current Theme & Layout as Default
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: REALTIME EVENT SIMULATOR */}
          {activeStudioTab === 'simulator' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-[#240C0B] font-display">
                  Real-time Database Synchronization Simulator
                </h3>
                <p className="text-xs text-[#7A6865]">
                  Trigger live events to test instant reactivity across appointments, revenue, telemetry, and health alerts
                </p>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <button
                  onClick={() => triggerSimulationEvent('check_in')}
                  className="p-3 rounded-xl bg-white border border-[#E6DFD5] hover:border-[#FF6B00] text-left transition-all cursor-pointer"
                >
                  <div className="text-xs font-bold text-[#240C0B] flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    1. Pet Arrival Check-in
                  </div>
                  <p className="text-[10px] text-[#7A6865] mt-1">
                    Updates status to in-service & starts station timer
                  </p>
                </button>

                <button
                  onClick={() => triggerSimulationEvent('payment')}
                  className="p-3 rounded-xl bg-white border border-[#E6DFD5] hover:border-[#FF6B00] text-left transition-all cursor-pointer"
                >
                  <div className="text-xs font-bold text-[#240C0B] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    2. Payment Reconciled
                  </div>
                  <p className="text-[10px] text-[#7A6865] mt-1">
                    Adds revenue to charts, triggers confetti & updates avg ticket
                  </p>
                </button>

                <button
                  onClick={() => triggerSimulationEvent('booking')}
                  className="p-3 rounded-xl bg-white border border-[#E6DFD5] hover:border-[#FF6B00] text-left transition-all cursor-pointer"
                >
                  <div className="text-xs font-bold text-[#240C0B] flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-500" />
                    3. Walk-in Instant Booking
                  </div>
                  <p className="text-[10px] text-[#7A6865] mt-1">
                    Pushes a new booking into the appointment queue
                  </p>
                </button>

                <button
                  onClick={() => triggerSimulationEvent('vaccine_alert')}
                  className="p-3 rounded-xl bg-white border border-[#E6DFD5] hover:border-[#FF6B00] text-left transition-all cursor-pointer"
                >
                  <div className="text-xs font-bold text-[#240C0B] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
                    4. Rabies Expiry Alert
                  </div>
                  <p className="text-[10px] text-[#7A6865] mt-1">
                    Generates health flag & auto SMS reminder
                  </p>
                </button>

                <button
                  onClick={() => triggerSimulationEvent('status_change')}
                  className="p-3 rounded-xl bg-white border border-[#E6DFD5] hover:border-[#FF6B00] text-left transition-all cursor-pointer"
                >
                  <div className="text-xs font-bold text-[#240C0B] flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-purple-500" />
                    5. Grooming Finished
                  </div>
                  <p className="text-[10px] text-[#7A6865] mt-1">
                    Marks completed, notifies owner via SMS
                  </p>
                </button>

                <button
                  onClick={() => triggerSimulationEvent('inventory_restock')}
                  className="p-3 rounded-xl bg-white border border-[#E6DFD5] hover:border-[#FF6B00] text-left transition-all cursor-pointer"
                >
                  <div className="text-xs font-bold text-[#240C0B] flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-cyan-500" />
                    6. Inventory Restocked
                  </div>
                  <p className="text-[10px] text-[#7A6865] mt-1">
                    Restores stock levels and clears warning banner
                  </p>
                </button>
              </div>

              {/* Streaming Event Log */}
              <div className="mt-4 pt-4 border-t border-[#E6DFD5]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h4 className="text-xs font-bold text-[#240C0B] uppercase tracking-wider">
                      Live Streaming Sync Log ({realtimeEvents.length} events)
                    </h4>
                  </div>
                  <button
                    onClick={clearEvents}
                    className="text-[11px] text-[#7A6865] hover:text-rose-500 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Clear Log
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {realtimeEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-2.5 rounded-xl bg-white border border-[#E6DFD5] text-xs flex items-start gap-2.5"
                    >
                      <span className="text-[10px] text-[#7A6865] shrink-0 font-mono">
                        {evt.timestamp}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[#240C0B] flex items-center gap-2">
                          <span>{evt.title}</span>
                          {evt.amount && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 font-bold">
                              +${evt.amount}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#7A6865] mt-0.5">
                          {evt.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ARCHITECTURE & SAAS SPEC */}
          {activeStudioTab === 'architecture' && (
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="text-sm font-bold text-[#240C0B] font-display">
                  PawGroom Dynamic Dashboard Architecture
                </h3>
                <p className="text-xs text-[#7A6865]">
                  Technical blueprint for multi-theme engine and live database synchronization
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E6DFD5] space-y-3">
                <h4 className="font-bold text-[#FF6B00] uppercase tracking-wider text-[11px]">
                  1. Zero-Flicker CSS Variables Engine
                </h4>
                <p className="text-[#7A6865] leading-relaxed">
                  The dashboard system relies on CSS variables mapped under <code className="px-1.5 py-0.5 rounded bg-[#FAF8F5] text-[#240C0B]">[data-theme="..."]</code> selectors in <code className="px-1.5 py-0.5 rounded bg-[#FAF8F5] text-[#240C0B]">/src/index.css</code>. Theme switches happen synchronously in DOM memory without full React unmounting, achieving sub-5ms transition times.
                </p>

                <h4 className="font-bold text-[#FF6B00] uppercase tracking-wider text-[11px] pt-2 border-t border-[#E6DFD5]">
                  2. Dynamic Viewport & Layout Composition
                </h4>
                <p className="text-[#7A6865] leading-relaxed">
                  The active layout renders a curated hierarchy of widgets while referencing the client's <code className="px-1.5 py-0.5 rounded bg-[#FAF8F5] text-[#240C0B]">enabledSections</code> map. Individual business admins can turn any widget on or off without code alterations.
                </p>

                <h4 className="font-bold text-[#FF6B00] uppercase tracking-wider text-[11px] pt-2 border-t border-[#E6DFD5]">
                  3. Multi-Tenant SaaS Isolation
                </h4>
                <p className="text-[#7A6865] leading-relaxed">
                  Each salon branch is governed by a <code className="px-1.5 py-0.5 rounded bg-[#FAF8F5] text-[#240C0B]">ClientBusinessProfile</code> containing independent theme, layout, sidebar style, and enabled features.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E6DFD5] bg-white flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#7A6865]">Active:</span>
            <span className="font-bold text-[#240C0B]">{currentThemeDef.name}</span>
            <span>•</span>
            <span className="font-semibold text-[#FF6B00]">{currentLayoutDef.name}</span>
          </div>

          <button
            onClick={() => setIsAdminStudioOpen(false)}
            className="btn-primary px-4 py-2 rounded-xl font-bold shadow-md cursor-pointer"
          >
            Apply & Close Studio
          </button>
        </div>
      </div>
    </div>
  );
};
