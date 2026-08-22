import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { isSectionAllowed } from '../../data/permissionPresets';
import { Settings, Download, Upload, RotateCcw, Award, CheckCircle2, Palette, Sparkles, Trash2, AlertTriangle, Cloud, Database, ShieldCheck, UserCheck, Smartphone } from 'lucide-react';
import { ColorTheme } from '../../types';
import { compressImageFile } from '../../utils/imageCompressor';

interface ThemeOption {
  id: ColorTheme;
  name: string;
  desc: string;
  canvasColor: string;
  primaryColor: string;
  accentColor: string;
}

const THEMES: ThemeOption[] = [
  {
    id: 'terracotta',
    name: 'Warm Espresso & Terracotta',
    desc: 'Clean warm studio background with rich espresso sidebar & orange accents',
    canvasColor: '#FAF8F5',
    primaryColor: '#240C0B',
    accentColor: '#FF6B00',
  },
  {
    id: 'emerald',
    name: 'Emerald & Sage Spa',
    desc: 'Botanical fresh background with deep forest pine & emerald accents',
    canvasColor: '#F4F8F6',
    primaryColor: '#0E2925',
    accentColor: '#059669',
  },
  {
    id: 'ocean',
    name: 'Coastal Navy & Blue',
    desc: 'Crisp airy background with deep marine slate & azure accents',
    canvasColor: '#F0F6FF',
    primaryColor: '#0F172A',
    accentColor: '#2563EB',
  },
  {
    id: 'plum',
    name: 'Royal Berry & Plum',
    desc: 'Luxury boutique background with regal plum & violet accents',
    canvasColor: '#FAF5FF',
    primaryColor: '#2E103B',
    accentColor: '#9333EA',
  },
  {
    id: 'coral',
    name: 'Sunset Coral & Truffle',
    desc: 'Warm artisan background with rich truffle & coral accents',
    canvasColor: '#FFF9F5',
    primaryColor: '#351C14',
    accentColor: '#EA580C',
  },
  {
    id: 'slate',
    name: 'Nordic Slate & Amber',
    desc: 'Modern executive background with minimalist charcoal & gold accents',
    canvasColor: '#F8FAFC',
    primaryColor: '#18181B',
    accentColor: '#D97706',
  },
  {
    id: 'nordic',
    name: 'Glacier Teal & Spruce',
    desc: 'Refreshing Nordic teal palette with deep spruce & amber highlights',
    canvasColor: '#F0FDF9',
    primaryColor: '#134E4A',
    accentColor: '#0D9488',
  },
  {
    id: 'lavender',
    name: 'Lavender Mist & Lilac',
    desc: 'Gentle calming lavender canvas with royal violet & cyan accents',
    canvasColor: '#FAF8FF',
    primaryColor: '#2E1065',
    accentColor: '#7C3AED',
  },
  {
    id: 'rose',
    name: 'Cyber Rose & Berry',
    desc: 'High-energy vivid berry rose styling with deep velvet framing',
    canvasColor: '#FFF5F6',
    primaryColor: '#4C0519',
    accentColor: '#E11D48',
  },
  {
    id: 'gold',
    name: 'Imperial Gold & Espresso',
    desc: 'Prestige luxury salon theme with warm amber gold & deep espresso',
    canvasColor: '#FCF9F2',
    primaryColor: '#2A1B0E',
    accentColor: '#D97706',
  },
  {
    id: 'crimson',
    name: 'Crimson Wine & Bordeaux',
    desc: 'Passionate bordeaux velvet background with rich ruby crimson accents',
    canvasColor: '#FFF6F6',
    primaryColor: '#3B0A0A',
    accentColor: '#DC2626',
  },
  {
    id: 'monochrome',
    name: 'Obsidian & Platinum',
    desc: 'High-contrast minimalist architecture with pure silver & indigo pop',
    canvasColor: '#FAFAFA',
    primaryColor: '#09090B',
    accentColor: '#18181B',
  },
];

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    resetToDemoData, 
    clearAllData,
    exportDataJSON, 
    importDataJSON, 
    confirmDelete,
    showToast 
  } = useApp();

  const { currentProfile, isAdmin } = useAuth();
  const showColorTheme = isSectionAllowed(currentProfile?.permissions, 'settings', 'colorTheme');
  const showGeneralInfo = isSectionAllowed(currentProfile?.permissions, 'settings', 'generalInfo');
  const showBackupRestore = isSectionAllowed(currentProfile?.permissions, 'settings', 'backupRestore');

  const [formData, setFormData] = useState({
    name: settings.name || settings.salonName || 'PawBook Pro Grooming Studio',
    email: settings.email || 'care@pawbookpro.com',
    website: settings.website || 'www.pawbookpro.com',
    photo: settings.photo || 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=240&q=80',
    address: settings.address || '100 Bark Avenue, Suite 4, San Francisco, CA 94107',
    phone: settings.phone || '(555) 123-PAWS',
    open: settings.open ?? 8,
    close: settings.close ?? 18,
    slot: settings.slot ?? 30,
    currency: settings.currency || 'USD',
    taxRate: settings.taxRate ?? 8.5,
    colorTheme: (settings.colorTheme || 'terracotta') as ColorTheme,
  });

  // Keep form fields synced when settings update from Firestore profile
  useEffect(() => {
    setFormData({
      name: settings.name || settings.salonName || 'PawBook Pro Grooming Studio',
      email: settings.email || 'care@pawbookpro.com',
      website: settings.website || 'www.pawbookpro.com',
      photo: settings.photo || 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=240&q=80',
      address: settings.address || '100 Bark Avenue, Suite 4, San Francisco, CA 94107',
      phone: settings.phone || '(555) 123-PAWS',
      open: settings.open ?? 8,
      close: settings.close ?? 18,
      slot: settings.slot ?? 30,
      currency: settings.currency || 'USD',
      taxRate: settings.taxRate ?? 8.5,
      colorTheme: (settings.colorTheme || 'terracotta') as ColorTheme,
    });
  }, [
    settings.name,
    settings.salonName,
    settings.email,
    settings.phone,
    settings.address,
    settings.website,
    settings.photo,
    settings.open,
    settings.close,
    settings.slot,
    settings.currency,
    settings.taxRate,
    settings.colorTheme
  ]);

  const handleSelectTheme = (themeId: ColorTheme) => {
    setFormData((prev) => ({ ...prev, colorTheme: themeId }));
    updateSettings({ ...settings, colorTheme: themeId });
    document.documentElement.setAttribute('data-theme', themeId);
    showToast(`Applied ${THEMES.find(t => t.id === themeId)?.name} color theme!`, 'success');
  };

  const handleTaxChange = (rate: number) => {
    const clamped = Math.min(20, Math.max(0, Math.round(rate * 10) / 10));
    setFormData((prev) => ({ ...prev, taxRate: clamped }));
    updateSettings({ ...settings, taxRate: clamped });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 400, 400, 0.75);
        setFormData((prev) => ({ ...prev, photo: compressed }));
        updateSettings({ ...settings, photo: compressed });
        showToast('Clinic photo optimized & updated successfully!', 'success');
      } catch (err) {
        console.error('Photo compression error:', err);
        showToast('Could not process image file', 'error');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...settings,
      name: formData.name,
      salonName: formData.name,
      email: formData.email,
      website: formData.website,
      photo: formData.photo,
      address: formData.address,
      phone: formData.phone,
      open: formData.open,
      close: formData.close,
      slot: formData.slot,
      currency: formData.currency,
      taxRate: formData.taxRate,
      colorTheme: formData.colorTheme,
    });
    showToast('Shop & Clinic settings saved across all views & invoices!', 'success');
  };

  const handleDownload = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PawBook_Pro_Backup_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    showToast('Downloaded JSON backup!', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) importDataJSON(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Real-time Firebase Firestore Profile & Settings Synchronization Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-[#240C0B] to-[#3B1412] text-white shadow-lg border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/20 border border-[#FF6B00]/40 flex items-center justify-center text-[#FF6B00] shrink-0">
            <Database className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                Firebase Firestore Real-Time Settings Sync
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#2E8A81] text-white flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> {currentProfile ? 'Firestore Synced' : 'Ready'}
              </span>
            </div>
            <p className="text-xs text-[#D8D3C4] mt-0.5">
              Client input values and settings are synced directly with Firestore database{' '}
              <span className="font-mono text-[#FFA494] font-semibold">ai-studio-pawbookpro</span> and are editable via Admin Panel.
            </p>
          </div>
        </div>

        {currentProfile && (
          <div className="bg-white/10 backdrop-blur-xs border border-white/15 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2.5 shrink-0 self-stretch md:self-auto justify-between md:justify-start">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#FF6B00]" />
              <div>
                <span className="text-[10px] uppercase font-bold text-[#A08E8B] block">Client Profile</span>
                <span className="font-mono font-bold text-white text-xs">{currentProfile.profileId}</span>
              </div>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30">
              {currentProfile.plan} Plan
            </span>
          </div>
        )}
      </div>

      {/* 1. Global Color Theme Selector */}
      {showColorTheme && (
        <div className="card-box space-y-4">
          <div className="flex items-center justify-between border-b pb-3 flex-wrap gap-2">
            <div>
              <h2 className="font-display font-bold text-lg text-[#240C0B] flex items-center gap-2">
                <Palette className="w-5 h-5 text-theme-primary" />
                Website Color Themes (12 Synchronized Themes)
              </h2>
              <p className="text-xs text-[#7A6865] font-semibold mt-0.5">
                Pick your preferred studio color palette. Every section, screen, header, sidebar, button, and invoice adapts instantly.
              </p>
            </div>
            <span className="text-[11px] font-extrabold px-3 py-1 bg-theme-light text-theme-primary rounded-full border border-theme-primary/30">
              Active: {THEMES.find(t => t.id === (settings.colorTheme || 'terracotta'))?.name}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {THEMES.map((theme) => {
              const isSelected = (settings.colorTheme || 'terracotta') === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-3 cursor-pointer group hover:scale-[1.02] ${
                    isSelected 
                      ? 'border-[#240C0B] bg-white ring-2 ring-[#FF6B00] shadow-md' 
                      : 'border-[#D8D3C4] bg-[#FAF8F5] hover:bg-white hover:border-[#240C0B]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-5 h-5 rounded-full shadow-xs border border-white"
                        style={{ backgroundColor: theme.canvasColor }} 
                      />
                      <span 
                        className="w-4 h-4 rounded-full shadow-xs -ml-3 border border-white"
                        style={{ backgroundColor: theme.primaryColor }} 
                      />
                      <span 
                        className="w-3.5 h-3.5 rounded-full shadow-xs -ml-3 border border-white"
                        style={{ backgroundColor: theme.accentColor }} 
                      />
                    </div>

                    {isSelected ? (
                      <span className="text-[10px] font-black text-white bg-[#FF6B00] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#7A6865] opacity-0 group-hover:opacity-100 transition-opacity">
                        Select
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-display font-extrabold text-sm text-[#240C0B]">
                      {theme.name}
                    </h4>
                    <p className="text-[11px] text-[#7A6865] leading-snug mt-0.5">
                      {theme.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Shop Profile & Settings Form */}
      {showGeneralInfo && (
        <form onSubmit={handleSubmit} className="card-box space-y-5">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h2 className="font-display font-bold text-lg text-[#173E39]">
              Clinic & Grooming Studio Profile
            </h2>
            <p className="text-xs text-[#7A6865] mt-0.5">
              All details here automatically synchronize across invoices, the sidebar profile, headers, emails, and client receipts.
            </p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 bg-[#E1F0E7] text-[#2E8A81] rounded-full border border-[#BBE3CA]">
            Synchronized Globally
          </span>
        </div>

        {/* Studio Photo / Avatar Uploader & Presets */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#D8D3C4] space-y-3">
          <label className="font-bold text-xs text-[#173E39] block">
            Clinic / Studio Profile Photo & Logo
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#FF6B00] shadow-sm shrink-0 bg-white">
              <img
                src={formData.photo}
                alt="Clinic Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <label className="btn-primary text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 font-bold cursor-pointer">
                  <Upload className="w-3.5 h-3.5" /> Upload New Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-[#7A6865]">or paste image URL:</span>
              </div>
              <input
                type="url"
                value={formData.photo}
                onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-1.5 text-xs border border-[#D8D3C4] rounded-xl font-medium focus:border-[#FF6B00] outline-none bg-white"
              />
            </div>
          </div>

          {/* Quick Preset Studio Logos */}
          <div className="pt-2 border-t border-[#D8D3C4]/60">
            <span className="text-[11px] font-bold text-[#7A6865] block mb-1.5">
              Quick Preset Avatars:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: 'Golden Retriever Spa', url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=240&q=80' },
                { label: 'Poodle Chic', url: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=240&q=80' },
                { label: 'Modern Pet Vet Clinic', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80' },
                { label: 'Fluffy Husky Studio', url: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=240&q=80' },
                { label: 'Cute Frenchie Salon', url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=240&q=80' },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, photo: preset.url }));
                    updateSettings({ ...settings, photo: preset.url });
                    showToast(`Updated clinic photo to "${preset.label}"!`, 'success');
                  }}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                    formData.photo === preset.url
                      ? 'bg-[#240C0B] text-white border-[#240C0B]'
                      : 'bg-white text-[#173E39] border-[#D8D3C4] hover:border-[#FF6B00]'
                  }`}
                >
                  <img src={preset.url} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-[#173E39]">Shop / Clinic Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-[#D8D3C4] rounded-xl font-medium focus:border-[#2E8A81] outline-none bg-white"
              placeholder="e.g., PawBook Pro Grooming Studio"
            />
          </div>

          <div>
            <label className="font-bold text-[#173E39]">Shop Phone / Mobile Number</label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-[#D8D3C4] rounded-xl font-medium focus:border-[#2E8A81] outline-none bg-white"
              placeholder="e.g., (555) 123-PAWS"
            />
          </div>

          <div>
            <label className="font-bold text-[#173E39]">Clinic Email (Synced on Invoices)</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-[#D8D3C4] rounded-xl font-medium focus:border-[#2E8A81] outline-none bg-white"
              placeholder="e.g., care@pawbookpro.com"
            />
          </div>

          <div>
            <label className="font-bold text-[#173E39]">Clinic Website (Synced on Invoices)</label>
            <input
              type="text"
              required
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-[#D8D3C4] rounded-xl font-medium focus:border-[#2E8A81] outline-none bg-white"
              placeholder="e.g., www.pawbookpro.com"
            />
          </div>

          <div className="md:col-span-2">
            <label className="font-bold text-[#173E39]">Shop Street Address</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-[#D8D3C4] rounded-xl font-medium focus:border-[#2E8A81] outline-none bg-white"
              placeholder="e.g., 100 Bark Avenue, Suite 4, San Francisco, CA 94107"
            />
          </div>

          <div>
            <label className="font-bold text-[#173E39]">Currency (All values synchronized)</label>
            <select
              value={formData.currency}
              onChange={(e) => {
                const newCurr = e.target.value;
                setFormData({ ...formData, currency: newCurr });
                updateSettings({ ...settings, currency: newCurr });
                showToast(`Currency updated to ${newCurr}! All financial views synchronized.`, 'success');
              }}
              className="w-full mt-1 px-3 py-2 border border-[#D8D3C4] rounded-xl font-bold focus:border-[#2E8A81] outline-none bg-white"
            >
              <option value="USD">$ USD - United States Dollar</option>
              <option value="GBP">£ GBP - British Pound</option>
              <option value="EUR">€ EUR - Euro</option>
              <option value="CAD">C$ CAD - Canadian Dollar</option>
              <option value="AUD">A$ AUD - Australian Dollar</option>
              <option value="JPY">¥ JPY - Japanese Yen</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-[#173E39]">Daily Opening Hour</label>
            <select
              value={formData.open}
              onChange={(e) => setFormData({ ...formData, open: parseInt(e.target.value) })}
              className="w-full mt-1 px-3 py-2 border border-[#D8D3C4] rounded-xl font-medium focus:border-[#2E8A81] outline-none bg-white"
            >
              <option value={6}>6:00 AM</option>
              <option value={7}>7:00 AM</option>
              <option value={8}>8:00 AM</option>
              <option value={9}>9:00 AM</option>
              <option value={10}>10:00 AM</option>
              <option value={11}>11:00 AM</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-[#173E39]">Daily Closing Hour</label>
            <select
              value={formData.close}
              onChange={(e) => setFormData({ ...formData, close: parseInt(e.target.value) })}
              className="w-full mt-1 px-3 py-2 border border-[#D8D3C4] rounded-xl font-medium focus:border-[#2E8A81] outline-none bg-white"
            >
              <option value={16}>4:00 PM</option>
              <option value={17}>5:00 PM</option>
              <option value={18}>6:00 PM</option>
              <option value={19}>7:00 PM</option>
              <option value={20}>8:00 PM</option>
              <option value={21}>9:00 PM</option>
              <option value={22}>10:00 PM</option>
            </select>
          </div>
        </div>

        {/* US Tax & Invoicing Configuration (0% to 20%) */}
        <div className="mt-4 p-4 rounded-2xl bg-[#FAF8F5] border border-[#D8D3C4] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D8D3C4]/60 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#240C0B] text-white text-[11px] font-black uppercase tracking-wider">
                  US Taxes
                </span>
                <h3 className="font-display font-bold text-sm text-[#173E39]">
                  US Sales Tax Rate on Invoices (0% to 20%)
                </h3>
              </div>
              <p className="text-[11px] text-[#7A6865] mt-1">
                Configure the US sales tax percentage applied to all client checkout bills, itemized invoices, and printable receipts.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#D8D3C4] shadow-xs">
              <span className="text-xs font-bold text-[#7A6865]">Current Tax:</span>
              <span className="font-display font-black text-base text-[#FF6B00]">
                {formData.taxRate}%
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={formData.taxRate}
                onChange={(e) => handleTaxChange(parseFloat(e.target.value))}
                className="w-full accent-[#FF6B00] cursor-pointer h-2 bg-[#E7C0B5]/40 rounded-lg appearance-none"
              />
              <div className="flex items-center gap-1 min-w-[90px]">
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.1"
                  value={formData.taxRate}
                  onChange={(e) => handleTaxChange(parseFloat(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-center font-bold text-xs border border-[#D8D3C4] rounded-lg bg-white outline-none focus:border-[#FF6B00]"
                />
                <span className="text-xs font-bold text-[#173E39]">%</span>
              </div>
            </div>

            {/* Quick Tax Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-[#7A6865]">Quick Presets:</span>
              {[
                { label: '0% (Tax-Free)', rate: 0 },
                { label: '5% (Low)', rate: 5 },
                { label: '7.25% (Standard)', rate: 7.25 },
                { label: '8.5% (Default)', rate: 8.5 },
                { label: '10% (Even)', rate: 10 },
                { label: '15% (High)', rate: 15 },
                { label: '20% (Max)', rate: 20 },
              ].map((preset) => {
                const isActive = Math.abs(formData.taxRate - preset.rate) < 0.05;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleTaxChange(preset.rate)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#240C0B] text-white border-[#240C0B] shadow-xs'
                        : 'bg-white text-[#173E39] border-[#D8D3C4] hover:border-[#240C0B]'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Live Invoice Sample Breakdown */}
            <div className="p-3 rounded-xl bg-white border border-[#E7C0B5]/60 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-[#7A6865] font-semibold">
                Sample Invoice Calculation ($100 Grooming):
              </span>
              <div className="flex items-center gap-3 font-mono font-bold">
                <span className="text-[#173E39]">Subtotal: $100.00</span>
                <span className="text-[#7A6865]">+</span>
                <span className="text-[#FF6B00]">US Tax ({formData.taxRate || 0}%): ${(100 * (Number(formData.taxRate || 0) / 100)).toFixed(2)}</span>
                <span className="text-[#7A6865]">=</span>
                <span className="text-[#240C0B] bg-[#FFF3EB] px-2 py-0.5 rounded-md border border-[#FFD0B3]">
                  Total: ${(100 * (1 + Number(formData.taxRate || 0) / 100)).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button type="submit" className="btn-primary text-xs px-6 py-2.5 rounded-full font-bold shadow-md cursor-pointer">
            Save Shop Profile & Settings
          </button>
        </div>
      </form>
      )}

      {/* 3. Data Backup & Reset Management */}
      {showBackupRestore && (
        <div className="card-box space-y-5">
          <div className="border-b border-[#E6DFD5] pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-lg text-[#240C0B]">
                Data Management & System Reset
              </h3>
              <p className="text-xs text-[#7A6865] mt-0.5">
                Export full studio database backups, restore JSON files, or wipe/reset website data.
              </p>
            </div>
          </div>

          {/* Backup & Restore Controls */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[#240C0B] uppercase tracking-wider block">
              Database Backup & Portability
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleDownload}
                className="bg-[#240C0B] hover:bg-[#180504] text-white text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold cursor-pointer transition-all shadow-xs"
              >
                <Download className="w-4 h-4 text-[#FF6B00]" /> Backup JSON Database
              </button>

              <label className="btn-ghost text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold cursor-pointer">
                <Upload className="w-4 h-4 text-[#2E8A81]" /> Restore JSON File
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Danger Zone: Reset & Clear All Website Data */}
          <div className="pt-3 border-t border-[#E6DFD5] space-y-3">
            <div className="flex items-center gap-2 text-[#C9503A]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <label className="text-xs font-black uppercase tracking-wider">
                Danger Zone: Reset & Clear Website Data
              </label>
            </div>

            <p className="text-xs text-[#6E5B58] leading-relaxed">
              Choose whether to reset back to the default sample dataset or completely wipe all stored records (clients, appointments, inventory, gift cards, invoices, and settings) from your browser storage.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* Reset to Demo Data */}
              <button
                type="button"
                onClick={() => {
                  confirmDelete({
                    title: 'Reset to Sample Demo Data?',
                    message: 'This will reset all clients, appointments, staff, and inventory to the fresh PawBook Pro demo dataset. Any custom records you created will be replaced with defaults.',
                    confirmLabel: 'Reset Demo Data',
                    onConfirm: () => resetToDemoData(),
                  });
                }}
                className="btn-ghost text-xs px-4 py-2.5 rounded-xl text-[#7A6865] hover:text-[#240C0B] border-[#D8D3C4] hover:bg-[#FAF8F5] flex items-center gap-2 font-bold cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-[#FF6B00]" /> Reset to Sample Dataset
              </button>

              {/* Clear ALL Website Data */}
              <button
                type="button"
                onClick={() => {
                  confirmDelete({
                    title: 'Clear ALL Website Data?',
                    message: 'WARNING: This will permanently wipe ALL website data including all client profiles, appointments, grooming history, retail items, sales tax settings, and storage keys. This action cannot be undone.',
                    confirmLabel: 'Clear All Website Data',
                    onConfirm: () => clearAllData(true),
                  });
                }}
                className="bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#C9503A] border border-[#FCA5A5] text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 font-extrabold cursor-pointer transition-all shadow-xs active:scale-95"
              >
                <Trash2 className="w-4 h-4 text-[#C9503A]" /> Clear All Website Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
