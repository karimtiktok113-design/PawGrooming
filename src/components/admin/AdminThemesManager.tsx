import React, { useState } from 'react';
import { useDashboardSystem } from '../../context/DashboardSystemContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Palette, 
  Layout, 
  Sliders, 
  Check, 
  Eye, 
  Sparkles, 
  Zap, 
  Layers, 
  CheckCircle2, 
  RefreshCw,
  Shield,
  Monitor,
  BarChart3,
  Calendar,
  DollarSign,
  Package,
  HeartHandshake
} from 'lucide-react';
import { DASHBOARD_THEMES, DASHBOARD_LAYOUTS, ALL_DASHBOARD_SECTIONS } from '../../data/dashboardThemesData';

export const AdminThemesManager: React.FC = () => {
  const { 
    currentTheme, 
    setTheme, 
    currentLayout, 
    setLayout, 
    enabledSections, 
    toggleSection, 
    resetToDefaults,
    setIsAdminStudioOpen
  } = useDashboardSystem();

  const { authDatabase, impersonateClient } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'themes' | 'layouts' | 'sections' | 'client_assignments'>('themes');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const categories = ['all', 'Luxury', 'Minimalist', 'Dark', 'Creative', 'Professional', 'Nature', 'High-Tech'];

  const filteredThemes = selectedCategory === 'all' 
    ? DASHBOARD_THEMES 
    : DASHBOARD_THEMES.filter(t => t.category === selectedCategory);

  const showCopyAlert = (msg: string) => {
    setCopiedNotification(msg);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {copiedNotification && (
        <div className="fixed top-6 right-6 z-50 bg-[#FF6B00] text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-slideDown">
          <CheckCircle2 className="w-4 h-4" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* Top Banner with Stats & Controls */}
      <div className="bg-gradient-to-r from-[#240C0B] via-[#351412] to-[#1C0908] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FF6B00] text-white text-[10px] font-black uppercase tracking-wider">
                Multi-Tenant Architecture
              </span>
              <span className="text-xs text-[#A08E8B] font-bold">14 Curated Themes • 7 Screen Layouts</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display">
              SaaS Dashboard Theme & Screen Layout Engine
            </h2>
            <p className="text-xs sm:text-sm text-[#A08E8B] mt-1 max-w-2xl">
              Control the visual archetype, layout configuration, widget composition, and real-time live telemetry for every pet grooming studio in your platform.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => setIsAdminStudioOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FF6B00] hover:bg-[#E56000] text-white text-xs font-black shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>Launch Live Customizer</span>
            </button>

            <button
              onClick={resetToDefaults}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
              title="Reset configuration to factory defaults"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-white/10 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveSubTab('themes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'themes'
                ? 'bg-white text-[#240C0B] shadow-md'
                : 'text-[#A08E8B] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>14 Visual Themes ({DASHBOARD_THEMES.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('layouts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'layouts'
                ? 'bg-white text-[#240C0B] shadow-md'
                : 'text-[#A08E8B] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Layout className="w-3.5 h-3.5 text-[#2E8A81]" />
            <span>7 Screen Layouts ({DASHBOARD_LAYOUTS.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('sections')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'sections'
                ? 'bg-white text-[#240C0B] shadow-md'
                : 'text-[#A08E8B] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#9333EA]" />
            <span>Widget Visibility Matrix</span>
          </button>

          <button
            onClick={() => setActiveSubTab('client_assignments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeSubTab === 'client_assignments'
                ? 'bg-white text-[#240C0B] shadow-md'
                : 'text-[#A08E8B] hover:bg-white/5 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#059669]" />
            <span>Client Workspace Assignment</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: 14 VISUAL THEMES */}
      {activeSubTab === 'themes' && (
        <div className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer capitalize shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#FF6B00] text-white shadow-xs'
                    : 'bg-[#1C0908] text-[#A08E8B] border border-white/10 hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid of 14 Themes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredThemes.map(t => {
              const isSelected = currentTheme === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    showCopyAlert(`Activated theme "${t.name}"!`);
                  }}
                  className={`group relative rounded-3xl p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#2A100E] border-[#FF6B00] ring-2 ring-[#FF6B00]/40 shadow-xl'
                      : 'bg-[#1C0908] border-white/10 hover:border-white/20 hover:bg-[#220B0A]'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-white/10 text-[#A08E8B]">
                        {t.category}
                      </span>
                      {isSelected ? (
                        <span className="flex items-center gap-1 text-[10px] font-black text-[#FF6B00] uppercase">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#7A6865] group-hover:text-white transition-colors">
                          Click to apply
                        </span>
                      )}
                    </div>

                    {/* Color Swatch Bar */}
                    <div className="h-12 rounded-2xl overflow-hidden flex border border-white/10 shadow-inner mb-3">
                      <div className="flex-1" style={{ backgroundColor: t.previewColors.bg }} title={`Background: ${t.previewColors.bg}`} />
                      <div className="flex-1" style={{ backgroundColor: t.previewColors.card }} title={`Card: ${t.previewColors.card}`} />
                      <div className="flex-1" style={{ backgroundColor: t.previewColors.primary }} title={`Primary: ${t.previewColors.primary}`} />
                      <div className="flex-1" style={{ backgroundColor: t.previewColors.accent }} title={`Accent: ${t.previewColors.accent}`} />
                    </div>

                    {/* Title & Description */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-3 h-3 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: t.previewColors.primary }} />
                      <h3 className="font-display font-black text-sm text-white">{t.name}</h3>
                    </div>
                    <p className="text-[11px] text-[#A08E8B] line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>
                  </div>

                  {/* Footer Tag */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px]">
                    <span className="text-[#7A6865] font-mono">{t.id}</span>
                    <span className="font-bold text-[#FFA052]">{t.tag}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: 7 SCREEN LAYOUTS */}
      {activeSubTab === 'layouts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DASHBOARD_LAYOUTS.map(l => {
            const isSelected = currentLayout === l.id;
            return (
              <div
                key={l.id}
                onClick={() => {
                  setLayout(l.id);
                  showCopyAlert(`Activated layout "${l.name}"!`);
                }}
                className={`rounded-3xl p-6 border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#2A100E] border-[#2E8A81] ring-2 ring-[#2E8A81]/40 shadow-xl'
                    : 'bg-[#1C0908] border-white/10 hover:border-white/20 hover:bg-[#220B0A]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-[#4ECDC4]">{l.columns} Col</span>
                    {isSelected ? (
                      <span className="flex items-center gap-1 text-[10px] font-black text-[#4ECDC4] bg-[#2E8A81]/20 px-2.5 py-1 rounded-full uppercase">
                        <Check className="w-3 h-3" /> Selected Layout
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#7A6865]">Select Layout</span>
                    )}
                  </div>

                  <h3 className="font-display font-black text-base text-white">{l.name}</h3>
                  <p className="text-xs text-[#A08E8B] mt-1 mb-4 leading-relaxed">
                    {l.description}
                  </p>

                  <div className="space-y-1.5 pt-3 border-t border-white/10">
                    <span className="text-[10px] uppercase font-bold text-[#7A6865] tracking-wider block">
                      Target Studio Archetype:
                    </span>
                    <p className="text-xs font-bold text-[#FFA052]">{l.bestFor}</p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#A08E8B]">Tagline</span>
                  <span className="text-xs font-bold text-white bg-white/10 px-2.5 py-1 rounded-xl">
                    {l.tagline}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-TAB 3: WIDGET VISIBILITY MATRIX */}
      {activeSubTab === 'sections' && (
        <div className="bg-[#1C0908] rounded-3xl p-6 border border-white/10 shadow-xl">
          <div className="mb-6">
            <h3 className="text-base font-black text-white font-display">
              Dynamic Widget Visibility Control
            </h3>
            <p className="text-xs text-[#A08E8B] mt-1">
              Toggle which data cards and analytics widgets appear across the pet dashboard in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {ALL_DASHBOARD_SECTIONS.map(item => {
              const isEnabled = !!enabledSections[item.key];
              return (
                <div
                  key={item.key}
                  onClick={() => {
                    toggleSection(item.key);
                    showCopyAlert(`${isEnabled ? 'Disabled' : 'Enabled'} ${item.label}`);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isEnabled
                      ? 'bg-white/5 border-white/20 text-white'
                      : 'bg-white/[0.02] border-white/5 text-[#7A6865] opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isEnabled ? 'bg-[#FF6B00] text-white' : 'bg-white/10 text-[#7A6865]'
                    }`}>
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{item.label}</h4>
                      <p className="text-[10px] text-[#A08E8B] truncate">{item.description}</p>
                    </div>
                  </div>

                  <div className={`w-9 h-5 rounded-full transition-colors relative shrink-0 p-0.5 ${
                    isEnabled ? 'bg-[#FF6B00]' : 'bg-white/20'
                  }`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      isEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: CLIENT WORKSPACE ASSIGNMENT */}
      {activeSubTab === 'client_assignments' && (
        <div className="bg-[#1C0908] rounded-3xl border border-white/10 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white font-display">
                Client Studio Profile Customizer Matrix
              </h3>
              <p className="text-xs text-[#A08E8B] mt-1">
                Preview or assign custom visual themes and layout archetypes to individual client studios.
              </p>
            </div>
            <span className="text-xs text-[#A08E8B] font-bold">
              {authDatabase.profiles.length} Active Profiles
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[#A08E8B] font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Profile ID</th>
                  <th className="py-3.5 px-4">Business & Owner</th>
                  <th className="py-3.5 px-4">Subscription</th>
                  <th className="py-3.5 px-4">Assigned Theme</th>
                  <th className="py-3.5 px-4">Assigned Layout</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {authDatabase.profiles.map(p => (
                  <tr key={p.profileId} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#FF6B00]">
                      {p.profileId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{p.businessName}</div>
                      <div className="text-[10px] text-[#A08E8B]">{p.ownerName} • {p.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-white font-bold text-[10px]">
                        {p.plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white capitalize">{currentTheme}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#4ECDC4]">{currentLayout}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => impersonateClient(p.profileId)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#2E8A81] hover:bg-[#236F68] text-white font-bold text-[11px] transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Impersonate & Test</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
