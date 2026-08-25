import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ClientProfile, 
  SubscriptionPlan, 
  AccountStatus, 
  isClientProfileOnline,
  getProfileSessionCounts 
} from '../../types/auth';
import { generateNextProfileId, generateSuggestedPassword } from '../../data/initialAuthData';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  Key, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  ShieldCheck, 
  LogOut, 
  DollarSign, 
  Layers, 
  RefreshCw, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight, 
  Store, 
  Sliders, 
  Moon, 
  Sun,
  Lock,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  FileText,
  Bell,
  Laptop,
  Smartphone,
  Tablet,
  Ban,
  Power
} from 'lucide-react';
import { AdminNotificationsManager } from './AdminNotificationsManager';
import { ClientPermissionsModal } from './ClientPermissionsModal';
import { ClientDevicesModal } from './ClientDevicesModal';
import { ClientPermissions } from '../../types/auth';

export const AdminDashboard: React.FC = () => {
  const { 
    authDatabase, 
    notifications,
    logout, 
    createClientProfile, 
    updateClientProfile, 
    toggleProfileStatus, 
    deleteClientProfile, 
    impersonateClient,
    resetAuthDatabase,
    refreshServerDatabase,
    logoutClientFromAdmin,
    terminateDeviceSession,
    toggleBanDevice,
    toggleEnforceSingleDevice
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'profiles' | 'notifications' | 'plans' | 'logs' | 'settings'>('profiles');
  const [preselectedForPush, setPreselectedForPush] = useState<string | string[] | null>(null);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | SubscriptionPlan>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await refreshServerDatabase();
    setTimeout(() => {
      setIsSyncing(false);
      showToast('Database synchronized across all devices worldwide.');
    }, 400);
  };

  const toggleSelectClient = (profileId: string) => {
    setSelectedClientIds(prev => 
      prev.includes(profileId) ? prev.filter(id => id !== profileId) : [...prev, profileId]
    );
  };

  const handleClearSelectedClients = () => {
    setSelectedClientIds([]);
  };

  const handleSendNotificationToSelected = () => {
    if (selectedClientIds.length === 0) return;
    setPreselectedForPush(selectedClientIds);
    setActiveTab('notifications');
  };

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [devicesModalOpen, setDevicesModalOpen] = useState(false);
  const [profileForPermissions, setProfileForPermissions] = useState<ClientProfile | null>(null);
  const [profileForDevices, setProfileForDevices] = useState<ClientProfile | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<ClientProfile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSavePermissions = async (profileId: string, permissions: ClientPermissions) => {
    await updateClientProfile(profileId, { permissions });
    showToast(`Access rules & screen permissions updated for client ${profileId}!`);
  };

  const handleRemoteLogout = async (profile: ClientProfile) => {
    if (confirm(`Immediately terminate all active login sessions and force logout for "${profile.businessName}" (${profile.profileId})?`)) {
      await logoutClientFromAdmin(profile.profileId);
      showToast(`Logged out "${profile.businessName}" from all devices.`);
    }
  };

  // Stats computation
  const today = new Date().toISOString().split('T')[0];

  const stats = useMemo(() => {
    const total = authDatabase.profiles.length;
    const active = authDatabase.profiles.filter(p => p.status === 'active').length;
    const inactive = authDatabase.profiles.filter(p => p.status === 'inactive').length;
    const expired = authDatabase.profiles.filter(p => p.expiryDate < today).length;
    
    // Estimate MRR ($49 Starter, $99 Pro, $189 Premium, $349 Enterprise)
    const mrr = authDatabase.profiles.reduce((acc, p) => {
      if (p.status !== 'active') return acc;
      switch (p.plan) {
        case 'Starter': return acc + 49;
        case 'Pro': return acc + 99;
        case 'Premium': return acc + 189;
        case 'Enterprise': return acc + 349;
        default: return acc + 99;
      }
    }, 0);

    return { total, active, inactive, expired, mrr };
  }, [authDatabase.profiles, today]);

  // Filtered Profiles
  const filteredProfiles = useMemo(() => {
    return authDatabase.profiles.filter(p => {
      const matchSearch = 
        p.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.profileId.toLowerCase().includes(searchTerm.toLowerCase());

      const isExpired = p.expiryDate < today;
      let matchStatus = true;
      if (statusFilter === 'active') matchStatus = p.status === 'active';
      if (statusFilter === 'inactive') matchStatus = p.status === 'inactive';
      if (statusFilter === 'expired') matchStatus = isExpired;

      let matchPlan = true;
      if (planFilter !== 'all') matchPlan = p.plan === planFilter;

      return matchSearch && matchStatus && matchPlan;
    });
  }, [authDatabase.profiles, searchTerm, statusFilter, planFilter, today]);

  // Live ticker to re-evaluate real-time online/offline presence every 3 seconds
  const [, setPresenceTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setPresenceTick(t => t + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(`Copied ${text} to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleStatus = async (profile: ClientProfile) => {
    await toggleProfileStatus(profile.profileId);
    showToast(`Profile ${profile.profileId} (${profile.businessName}) status updated.`);
  };

  const handleDeleteProfile = async (profile: ClientProfile) => {
    if (confirm(`Are you sure you want to permanently delete profile "${profile.businessName}" (${profile.profileId})?`)) {
      await deleteClientProfile(profile.profileId);
      showToast(`Deleted ${profile.businessName} successfully.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0505] text-[#FAF8F5] flex flex-col antialiased selection:bg-[#FF6B00] selection:text-white">
      {/* Toast Bar */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#240C0B] border border-[#FF6B00] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[#FF6B00]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Navbar */}
      <header className="sticky top-0 z-30 bg-[#1C0908]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#2E8A81] to-[#4ECDC4] flex items-center justify-center text-white shadow-md shadow-[#2E8A81]/30">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-base text-white tracking-wide">
                Paw Grooming SaaS
              </h1>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-[#2E8A81] text-white">
                Admin Console
              </span>
            </div>
            <p className="text-[11px] text-[#A08E8B]">
              Multi-Client Profile & Authentication Manager
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Worldwide Server Database Sync Button */}
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-[#C5B7B4] hover:text-white rounded-xl text-xs font-semibold border border-white/10 transition-all cursor-pointer"
            title="Sync all client profiles globally across all devices"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#2E8A81] ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Global Cloud Sync'}</span>
          </button>

          {/* Quick Create Account Button */}
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FF6B00] hover:bg-[#E55C00] text-white rounded-xl text-xs font-bold shadow-md shadow-[#FF6B00]/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Client</span>
          </button>

          {/* Admin Profile Pill & Logout */}
          <div className="flex items-center gap-2 pl-3 border-l border-white/10">
            <div className="hidden sm:block text-right text-xs leading-tight">
              <span className="font-bold text-white block">{authDatabase.admin.name}</span>
              <span className="text-[10px] text-[#A08E8B] font-mono">{authDatabase.admin.email}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-[#A08E8B] hover:text-white transition-colors cursor-pointer"
              title="Logout from Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Top Metric Cards with luminous glowing borders & ambient dark shadows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Total Profiles */}
          <div className="kpi-card-dark p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#A08E8B] uppercase tracking-wider">Total Clients</p>
              <p className="text-2xl font-black text-white font-display mt-0.5">{stats.total}</p>
              <p className="text-[10px] text-[#2E8A81] mt-0.5">Registered Studios</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 text-[#FFA052]">
              <Users className="w-5 h-5" />
            </div>
          </div>

          {/* Active Accounts */}
          <div className="kpi-card-dark p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#A08E8B] uppercase tracking-wider">Active Studios</p>
              <p className="text-2xl font-black text-[#2E8A81] font-display mt-0.5">{stats.active}</p>
              <p className="text-[10px] text-[#A08E8B] mt-0.5">{Math.round((stats.active / (stats.total || 1)) * 100)}% active rate</p>
            </div>
            <div className="p-3 rounded-xl bg-[#2E8A81]/15 text-[#2E8A81]">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Inactive Accounts */}
          <div className="kpi-card-dark p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#A08E8B] uppercase tracking-wider">Inactive Accounts</p>
              <p className="text-2xl font-black text-[#C9503A] font-display mt-0.5">{stats.inactive}</p>
              <p className="text-[10px] text-[#A08E8B] mt-0.5">Access locked</p>
            </div>
            <div className="p-3 rounded-xl bg-[#C9503A]/15 text-[#C9503A]">
              <UserX className="w-5 h-5" />
            </div>
          </div>

          {/* Expired / Due Soon */}
          <div className="kpi-card-dark p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#A08E8B] uppercase tracking-wider">Expired Passes</p>
              <p className="text-2xl font-black text-[#FFB703] font-display mt-0.5">{stats.expired}</p>
              <p className="text-[10px] text-[#A08E8B] mt-0.5">Needs renewal</p>
            </div>
            <div className="p-3 rounded-xl bg-[#FFB703]/15 text-[#FFB703]">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* Estimated MRR */}
          <div className="kpi-card-dark p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-[#A08E8B] uppercase tracking-wider">Est. Monthly Rev</p>
              <p className="text-2xl font-black text-white font-display mt-0.5">${stats.mrr}</p>
              <p className="text-[10px] text-[#2E8A81] mt-0.5">Active tiers total</p>
            </div>
            <div className="p-3 rounded-xl bg-[#FF6B00]/15 text-[#FF6B00]">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Navigation & Search Bar */}
        <div className="bg-[#1C0908] p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => {
                setPreselectedForPush(null);
                setActiveTab('profiles');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'profiles' 
                  ? 'bg-[#FF6B00] text-white shadow-sm' 
                  : 'text-[#A08E8B] hover:bg-white/5 hover:text-white'
              }`}
            >
              Client Accounts ({authDatabase.profiles.length})
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'notifications' 
                  ? 'bg-[#FF6B00] text-white shadow-sm' 
                  : 'text-[#A08E8B] hover:bg-white/5 hover:text-white'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Push & Pop-ups ({notifications.length})</span>
            </button>
            <button
              onClick={() => {
                setPreselectedForPush(null);
                setActiveTab('plans');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'plans' 
                  ? 'bg-[#FF6B00] text-white shadow-sm' 
                  : 'text-[#A08E8B] hover:bg-white/5 hover:text-white'
              }`}
            >
              Subscription Tiers
            </button>
            <button
              onClick={() => {
                setPreselectedForPush(null);
                setActiveTab('settings');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'settings' 
                  ? 'bg-[#FF6B00] text-white shadow-sm' 
                  : 'text-[#A08E8B] hover:bg-white/5 hover:text-white'
              }`}
            >
              System & Database
            </button>
          </div>

          {/* Search & Quick Filters */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-[#A08E8B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search studio, owner, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#7A6865] focus:border-[#FF6B00] outline-none"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/10 text-white text-xs rounded-xl px-2.5 py-1.5 outline-none font-bold"
            >
              <option value="all" className="bg-[#1C0908]">All Statuses</option>
              <option value="active" className="bg-[#1C0908]">Active Only</option>
              <option value="inactive" className="bg-[#1C0908]">Inactive Only</option>
              <option value="expired" className="bg-[#1C0908]">Expired</option>
            </select>

            {/* Plan Filter */}
            <select
              value={planFilter}
              onChange={(e: any) => setPlanFilter(e.target.value)}
              className="bg-white/5 border border-white/10 text-white text-xs rounded-xl px-2.5 py-1.5 outline-none font-bold"
            >
              <option value="all" className="bg-[#1C0908]">All Plans</option>
              <option value="Starter" className="bg-[#1C0908]">Starter ($49)</option>
              <option value="Pro" className="bg-[#1C0908]">Pro ($99)</option>
              <option value="Premium" className="bg-[#1C0908]">Premium ($189)</option>
              <option value="Enterprise" className="bg-[#1C0908]">Enterprise ($349)</option>
            </select>
          </div>
        </div>

        {/* Batch Selection Banner & Actions */}
        {selectedClientIds.length > 0 && activeTab === 'profiles' && (
          <div className="mb-4 p-3 bg-gradient-to-r from-[#FF6B00]/20 via-[#FF6B00]/10 to-[#1C0908] rounded-2xl border border-[#FF6B00]/40 flex flex-wrap items-center justify-between gap-3 shadow-lg animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center font-bold text-sm shadow-md">
                {selectedClientIds.length}
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  {selectedClientIds.length} {selectedClientIds.length === 1 ? 'Client Studio Selected' : 'Client Studios Selected'}
                </p>
                <p className="text-[10px] text-[#A08E8B]">
                  Batch actions available for selected client profiles
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSendNotificationToSelected}
                className="px-3.5 py-1.5 rounded-xl bg-[#FF6B00] hover:bg-[#E55C00] text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Send Notification to {selectedClientIds.length} {selectedClientIds.length === 1 ? 'Client' : 'Clients'}</span>
              </button>

              <button
                type="button"
                onClick={handleClearSelectedClients}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
              >
                Deselect All
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Client Profiles Table */}
        {activeTab === 'profiles' && (
          <div className="bg-[#1C0908] rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-[#A08E8B] font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-3 w-10 text-center">
                      <input 
                        type="checkbox"
                        checked={filteredProfiles.length > 0 && filteredProfiles.every(p => selectedClientIds.includes(p.profileId))}
                        onChange={(e) => {
                          if (e.target.checked) {
                            const allFilteredIds = filteredProfiles.map(p => p.profileId);
                            setSelectedClientIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
                          } else {
                            const filteredIdSet = new Set(filteredProfiles.map(p => p.profileId));
                            setSelectedClientIds(prev => prev.filter(id => !filteredIdSet.has(id)));
                          }
                        }}
                        className="w-3.5 h-3.5 accent-[#FF6B00] rounded cursor-pointer"
                        title="Select/Deselect all visible clients"
                      />
                    </th>
                    <th className="py-3.5 px-4">Profile ID</th>
                    <th className="py-3.5 px-4">Business & Owner</th>
                    <th className="py-3.5 px-4">Live Status & Devices</th>
                    <th className="py-3.5 px-4">Credentials & Contact</th>
                    <th className="py-3.5 px-4">Subscription Plan</th>
                    <th className="py-3.5 px-4">Expiry Date</th>
                    <th className="py-3.5 px-4 text-center">Account Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white">
                  {filteredProfiles.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-[#7A6865]">
                        <Store className="w-10 h-10 mx-auto text-[#7A6865]/40 mb-2" />
                        <p className="font-bold text-sm">No client profiles found</p>
                        <p className="text-xs text-[#7A6865] mt-1">Try adjusting your filters or create a new client account.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProfiles.map((p) => {
                      const isActive = p.status === 'active';
                      const isExpired = p.expiryDate < today;
                      const { activeCount, onlineCount, totalCount, bannedCount } = getProfileSessionCounts(p);
                      const isOnline = isClientProfileOnline(p);
                      const isSingleDeviceEnforced = !!p.enforceSingleDeviceLogin;
                      const isSelected = selectedClientIds.includes(p.profileId);

                      return (
                        <tr 
                          key={p.profileId} 
                          className={`transition-colors ${
                            isSelected ? 'bg-[#FF6B00]/10' : 'hover:bg-white/[0.02]'
                          }`}
                        >
                          {/* Selection Checkbox */}
                          <td className="py-3.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectClient(p.profileId)}
                              className="w-3.5 h-3.5 accent-[#FF6B00] rounded cursor-pointer"
                              title={`Select ${p.businessName}`}
                            />
                          </td>

                          {/* Profile ID */}
                          <td className="py-3.5 px-4 font-mono font-bold text-[#FF6B00]">
                            <div className="flex items-center gap-1.5">
                              <span>{p.profileId}</span>
                              <button
                                onClick={() => handleCopy(p.profileId, `id_${p.profileId}`)}
                                className="text-[#A08E8B] hover:text-white p-1 rounded cursor-pointer"
                                title="Copy ID"
                              >
                                {copiedId === `id_${p.profileId}` ? <Check className="w-3 h-3 text-[#2E8A81]" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </td>

                          {/* Business & Owner */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white text-sm">
                              {p.businessName}
                            </div>
                            <div className="text-[11px] text-[#A08E8B]">
                              Owner: {p.ownerName}
                            </div>
                          </td>

                          {/* Live Status & Device Tracking */}
                          <td className="py-3.5 px-4 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {isOnline ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  ONLINE {onlineCount > 1 ? `(${onlineCount})` : ''}
                                </span>
                              ) : activeCount > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                  IDLE ({activeCount})
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                                  Offline
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setProfileForDevices(p);
                                  setDevicesModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-colors cursor-pointer"
                                title="Click to view and manage active & online device sessions"
                              >
                                <Laptop className="w-3 h-3" />
                                <span>{activeCount} Active {onlineCount > 0 ? `(${onlineCount} Online)` : ''}</span>
                              </button>
                            </div>

                            <div className="flex items-center gap-1 flex-wrap">
                              {isSingleDeviceEnforced && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[8px] font-black uppercase rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                  1-Device Lock
                                </span>
                              )}
                              {bannedCount > 0 && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[8px] font-black uppercase rounded bg-red-500/15 text-red-400 border border-red-500/30">
                                  {bannedCount} Banned
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Credentials & Contact */}
                          <td className="py-3.5 px-4 space-y-0.5">
                            <div className="flex items-center gap-1.5 font-mono text-[#E6DFD5]">
                              <Mail className="w-3 h-3 text-[#FF6B00]" />
                              <span>{p.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-[#A08E8B] font-mono">
                              <Lock className="w-3 h-3 text-[#2E8A81]" />
                              <span>{p.password}</span>
                            </div>
                            {p.phoneNumber && (
                              <div className="text-[10px] text-[#7A6865]">
                                Tel: {p.phoneNumber}
                              </div>
                            )}
                          </td>

                          {/* Subscription Plan */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              p.plan === 'Enterprise' ? 'bg-[#8B6D9C]/20 text-[#C49BDB] border border-[#8B6D9C]/40' :
                              p.plan === 'Premium' ? 'bg-[#FF6B00]/20 text-[#FF8E3C] border border-[#FF6B00]/40' :
                              p.plan === 'Pro' ? 'bg-[#2E8A81]/20 text-[#4ECDC4] border border-[#2E8A81]/40' :
                              'bg-white/10 text-white border border-white/20'
                            }`}>
                              ● {p.plan}
                            </span>
                          </td>

                          {/* Expiry Date */}
                          <td className="py-3.5 px-4">
                            <div className="text-xs font-mono font-medium">
                              {p.expiryDate}
                            </div>
                            {isExpired ? (
                              <span className="text-[9px] font-bold text-[#C9503A] uppercase block">Expired</span>
                            ) : (
                              <span className="text-[9px] text-[#2E8A81] block">Active Valid</span>
                            )}
                          </td>

                          {/* Status & Quick Toggle */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(p)}
                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95 border ${
                                isActive 
                                  ? 'bg-[#2E8A81]/20 text-[#2E8A81] border-[#2E8A81]/40 hover:bg-[#C9503A]/20 hover:text-[#C9503A] hover:border-[#C9503A]/40' 
                                  : 'bg-[#C9503A]/20 text-[#C9503A] border-[#C9503A]/40 hover:bg-[#2E8A81]/20 hover:text-[#2E8A81] hover:border-[#2E8A81]/40'
                              }`}
                              title="Click to toggle Active / Inactive status"
                            >
                              {isActive ? '● Active' : '● Inactive'}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Remote Logout Client Profile */}
                              <button
                                onClick={() => handleRemoteLogout(p)}
                                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all cursor-pointer"
                                title={`Remote Logout & End All Device Sessions for ${p.businessName}`}
                              >
                                <LogOut className="w-3.5 h-3.5" />
                              </button>

                              {/* Manage Devices & Ban Credentials */}
                              <button
                                onClick={() => {
                                  setProfileForDevices(p);
                                  setDevicesModalOpen(true);
                                }}
                                className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white transition-all cursor-pointer"
                                title={`Manage Logged-in Devices & Ban Credentials for ${p.businessName}`}
                              >
                                <Laptop className="w-3.5 h-3.5" />
                              </button>

                              {/* Impersonate / Preview Dashboard */}
                              <button
                                onClick={() => impersonateClient(p.profileId)}
                                className="p-2 rounded-xl bg-white/5 hover:bg-[#FF6B00] text-white transition-all cursor-pointer"
                                title={`Launch ${p.businessName} Dashboard`}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>

                              {/* Configure Screen & Feature Permissions / Trial Controls */}
                              <button
                                onClick={() => {
                                  setProfileForPermissions(p);
                                  setPermissionsModalOpen(true);
                                }}
                                className="p-2 rounded-xl bg-white/5 hover:bg-[#FF6B00] text-white transition-all cursor-pointer"
                                title={`Configure Screen & Feature Access Controls for ${p.businessName}`}
                              >
                                <Sliders className="w-3.5 h-3.5 text-[#FF8833] hover:text-white" />
                              </button>

                              {/* Send Push / Pop-up direct */}
                              <button
                                onClick={() => {
                                  setPreselectedForPush(p.profileId);
                                  setActiveTab('notifications');
                                }}
                                className="p-2 rounded-xl bg-white/5 hover:bg-[#FF6B00] text-white transition-all cursor-pointer"
                                title={`Send Push / Pop-up Notification to ${p.businessName}`}
                              >
                                <Bell className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit Profile */}
                              <button
                                onClick={() => {
                                  setSelectedProfile(p);
                                  setEditModalOpen(true);
                                }}
                                className="p-2 rounded-xl bg-white/5 hover:bg-[#2E8A81] text-white transition-all cursor-pointer"
                                title="Edit Profile Details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Profile */}
                              <button
                                onClick={() => handleDeleteProfile(p)}
                                className="p-2 rounded-xl bg-white/5 hover:bg-[#C9503A] text-[#A08E8B] hover:text-white transition-all cursor-pointer"
                                title="Delete Profile"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Push Notifications & Interactive Pop-ups */}
        {activeTab === 'notifications' && (
          <AdminNotificationsManager 
            onSendSuccess={showToast} 
            preselectedProfileId={preselectedForPush} 
          />
        )}

        {/* Tab 2: Subscription Plans Overview */}
        {activeTab === 'plans' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { name: 'Starter', price: 49, color: 'border-white/20', badge: 'bg-white/10 text-white', features: ['Up to 100 Pets', 'Standard Invoicing', '1 Staff Groomer', 'Standard Analytics'] },
              { name: 'Pro', price: 99, color: 'border-[#2E8A81]/40', badge: 'bg-[#2E8A81]/20 text-[#2E8A81]', features: ['Up to 500 Pets', 'QR Invoicing & WhatsApp', '5 Staff Groomers', 'Vaccine Alert Monitor'] },
              { name: 'Premium', price: 189, color: 'border-[#FF6B00]/40', badge: 'bg-[#FF6B00]/20 text-[#FF6B00]', features: ['Unlimited Pets', 'A4 Standalone Receipts', 'Unlimited Staff', 'Loyalty Rewards Program', 'Before/After Showcase'] },
              { name: 'Enterprise', price: 349, color: 'border-[#8B6D9C]/40', badge: 'bg-[#8B6D9C]/20 text-[#8B6D9C]', features: ['Multi-Branch Studios', 'Custom Domain Branding', 'Dedicated Support 24/7', 'VIP Account Manager'] }
            ].map((plan) => {
              const count = authDatabase.profiles.filter(p => p.plan === plan.name).length;
              return (
                <div key={plan.name} className={`p-6 rounded-3xl bg-[#1C0908] border ${plan.color} space-y-4`}>
                  <div className="flex justify-between items-start">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${plan.badge}`}>
                      {plan.name}
                    </span>
                    <span className="text-xs font-bold text-[#A08E8B]">{count} Active Studios</span>
                  </div>
                  <div>
                    <span className="text-3xl font-display font-black text-white">${plan.price}</span>
                    <span className="text-xs text-[#A08E8B]"> / month</span>
                  </div>
                  <ul className="space-y-2 pt-2 border-t border-white/10 text-xs text-[#C5B7B4]">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#2E8A81] shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: System & Database */}
        {activeTab === 'settings' && (
          <div className="bg-[#1C0908] p-6 rounded-3xl border border-white/10 space-y-6 max-w-3xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-black text-lg text-white">Centralized Online Profile Database</h3>
                <p className="text-xs text-[#A08E8B] mt-0.5">
                  Connected directly to live Google Cloud Firebase Firestore with real-time replication.
                </p>
              </div>
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#2E8A81]/20 text-[#2E8A81] border border-[#2E8A81]/30">
                <span className="w-2 h-2 rounded-full bg-[#2E8A81] animate-pulse" />
                Firebase Online
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-[#A08E8B]">Database Engine:</span>
                <span className="font-mono font-bold text-[#2E8A81]">Google Cloud Firestore (Online)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#A08E8B]">Firebase Project ID:</span>
                <span className="font-mono font-bold text-white">vast-tractor-mtj8l</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#A08E8B]">Replication Mode:</span>
                <span className="font-mono text-[#FFA052]">Real-time onSnapshot + REST API + Local Replica</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#A08E8B]">Database Version:</span>
                <span className="font-mono font-bold text-white">{authDatabase.version}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#A08E8B]">Last Synchronized:</span>
                <span className="font-mono text-white">{authDatabase.lastUpdated}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#A08E8B]">Total Registered Profiles:</span>
                <span className="font-mono font-bold text-[#FF6B00]">{authDatabase.profiles.length}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Live Firebase Database Sync</p>
                <p className="text-[11px] text-[#A08E8B]">Manually fetch and refresh all profiles from Firebase Firestore</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await refreshServerDatabase();
                  showToast('Synchronized with live Firebase Firestore database!');
                }}
                className="px-4 py-2 rounded-xl bg-[#2E8A81]/30 hover:bg-[#2E8A81]/50 text-white font-bold text-xs transition-colors cursor-pointer border border-[#2E8A81]/40"
              >
                Fetch from Firebase
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Modal 1: Create New Client Account */}
      {createModalOpen && (
        <CreateClientModal 
          onClose={() => setCreateModalOpen(false)} 
          onCreate={async (data) => {
            const newP = await createClientProfile(data);
            setCreateModalOpen(false);
            showToast(`Created client account for ${newP.businessName} (${newP.profileId})!`);
          }}
          existingProfiles={authDatabase.profiles}
        />
      )}

      {/* Modal 2: Edit Client Profile */}
      {editModalOpen && selectedProfile && (
        <EditClientModal 
          profile={selectedProfile}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedProfile(null);
          }}
          onSave={async (updates) => {
            await updateClientProfile(selectedProfile.profileId, updates);
            setEditModalOpen(false);
            setSelectedProfile(null);
            showToast(`Updated profile for ${selectedProfile.businessName}!`);
          }}
        />
      )}

      {/* Modal 3: Client Screen & Feature Permissions / Trial Controls */}
      {permissionsModalOpen && profileForPermissions && (
        <ClientPermissionsModal
          isOpen={permissionsModalOpen}
          profile={authDatabase.profiles.find(p => p.profileId === profileForPermissions.profileId) || profileForPermissions}
          onClose={() => {
            setPermissionsModalOpen(false);
            setProfileForPermissions(null);
          }}
          onSave={handleSavePermissions}
        />
      )}

      {/* Modal 4: Client Devices & Session Management */}
      {devicesModalOpen && profileForDevices && (
        <ClientDevicesModal
          isOpen={devicesModalOpen}
          profile={authDatabase.profiles.find(p => p.profileId === profileForDevices.profileId) || profileForDevices}
          onClose={() => {
            setDevicesModalOpen(false);
            setProfileForDevices(null);
          }}
          onSuccess={(msg) => showToast(msg)}
        />
      )}
    </div>
  );
};

// Sub-Component: Create Client Account Modal
interface CreateModalProps {
  onClose: () => void;
  onCreate: (profile: Omit<ClientProfile, 'profileId' | 'createdAt'> & { profileId?: string }) => Promise<void>;
  existingProfiles: ClientProfile[];
}

const CreateClientModal: React.FC<CreateModalProps> = ({ onClose, onCreate, existingProfiles }) => {
  const nextId = useMemo(() => generateNextProfileId(existingProfiles), [existingProfiles]);
  const defaultPass = useMemo(() => generateSuggestedPassword(), []);

  const [profileId, setProfileId] = useState(nextId);
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(defaultPass);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [plan, setPlan] = useState<SubscriptionPlan>('Premium');
  const [status, setStatus] = useState<AccountStatus>('active');
  
  // Default expiry 1 year ahead
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !ownerName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onCreate({
        profileId,
        businessName,
        ownerName,
        email,
        password,
        phoneNumber,
        plan,
        status,
        expiryDate
      });
    } catch (err) {
      setError('Failed to create client account.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#1C0908] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF6B00] flex items-center justify-center text-white shadow-md">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-white">
                Create New Client Account
              </h3>
              <p className="text-xs text-[#A08E8B]">
                Auto-provisioned login credentials for tenant
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#A08E8B] hover:text-white text-xs font-bold">
            Cancel
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#FEF2F2]/10 border border-[#C9503A]/40 text-[#FFA494] text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Row 1: Profile ID & Plan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Profile ID (Auto)</label>
              <input
                type="text"
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-mono font-bold"
                required
              />
            </div>
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Subscription Plan</label>
              <select
                value={plan}
                onChange={(e: any) => setPlan(e.target.value)}
                className="w-full bg-[#240C0B] border border-white/15 rounded-xl px-3 py-2 text-white font-bold outline-none"
              >
                <option value="Starter">Starter ($49/mo)</option>
                <option value="Pro">Pro ($99/mo)</option>
                <option value="Premium">Premium ($189/mo)</option>
                <option value="Enterprise">Enterprise ($349/mo)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Business Name & Owner Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Business Name *</label>
              <input
                type="text"
                placeholder="e.g. Royal Fur Care"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-[#FF6B00]"
                required
              />
            </div>
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Owner Name *</label>
              <input
                type="text"
                placeholder="e.g. Rachel Adams"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-[#FF6B00]"
                required
              />
            </div>
          </div>

          {/* Row 3: Email & Password */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Login Email *</label>
              <input
                type="email"
                placeholder="rachel@royalfur.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-[#FF6B00]"
                required
              />
            </div>
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Generated Password *</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-[#FF6B00]"
                required
              />
            </div>
          </div>

          {/* Row 4: Phone & Expiry & Status */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="(555) 000-0000"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Initial Status</label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full bg-[#240C0B] border border-white/15 rounded-xl px-3 py-2 text-white font-bold outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E55C00] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-[#FF6B00]/30"
            >
              {isLoading ? 'Creating...' : 'Provision Account'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

// Sub-Component: Edit Client Profile Modal
interface EditModalProps {
  profile: ClientProfile;
  onClose: () => void;
  onSave: (updates: Partial<ClientProfile>) => Promise<void>;
}

const EditClientModal: React.FC<EditModalProps> = ({ profile, onClose, onSave }) => {
  const [businessName, setBusinessName] = useState(profile.businessName);
  const [ownerName, setOwnerName] = useState(profile.ownerName);
  const [email, setEmail] = useState(profile.email);
  const [password, setPassword] = useState(profile.password);
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber || '');
  const [plan, setPlan] = useState<SubscriptionPlan>(profile.plan);
  const [status, setStatus] = useState<AccountStatus>(profile.status);
  const [expiryDate, setExpiryDate] = useState(profile.expiryDate);

  // Synchronized Studio Custom Settings
  const [taxRate, setTaxRate] = useState<number>(profile.customSettings?.taxRate ?? 8.5);
  const [currency, setCurrency] = useState<string>(profile.customSettings?.currency ?? 'USD');
  const [colorTheme, setColorTheme] = useState<string>(profile.customSettings?.colorTheme ?? 'terracotta');
  const [address, setAddress] = useState<string>(profile.customSettings?.address ?? '');
  const [website, setWebsite] = useState<string>(profile.customSettings?.website ?? '');
  const [openHour, setOpenHour] = useState<number>(profile.customSettings?.open ?? 8);
  const [closeHour, setCloseHour] = useState<number>(profile.customSettings?.close ?? 18);
  const [showSettingsTab, setShowSettingsTab] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onSave({
      businessName,
      ownerName,
      email,
      password,
      phoneNumber,
      plan,
      status,
      expiryDate,
      customSettings: {
        ...(profile.customSettings || {}),
        name: businessName,
        salonName: businessName,
        email,
        phone: phoneNumber,
        address: address || profile.customSettings?.address,
        website: website || profile.customSettings?.website,
        photo: profile.customSettings?.photo,
        open: openHour,
        close: closeHour,
        currency,
        taxRate,
        colorTheme: colorTheme as any,
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-xl bg-[#1C0908] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2E8A81] flex items-center justify-center text-white">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-white">
                Edit Profile: {profile.profileId}
              </h3>
              <p className="text-xs text-[#A08E8B]">{profile.businessName} (Firestore Synchronized)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#A08E8B] hover:text-white text-xs font-bold cursor-pointer">
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-[#FF6B00]"
                required
              />
            </div>
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Owner Name</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-[#FF6B00]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Login Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-[#FF6B00]"
                required
              />
            </div>
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Password</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-[#FF6B00]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                placeholder="(555) 000-0000"
              />
            </div>
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Subscription Plan</label>
              <select
                value={plan}
                onChange={(e: any) => setPlan(e.target.value)}
                className="w-full bg-[#240C0B] border border-white/15 rounded-xl px-3 py-2 text-white font-bold outline-none"
              >
                <option value="Starter">Starter</option>
                <option value="Pro">Pro</option>
                <option value="Premium">Premium</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label className="block text-[#A08E8B] font-bold mb-1">Status</label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full bg-[#240C0B] border border-white/15 rounded-xl px-3 py-2 text-white font-bold outline-none"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#A08E8B] font-bold mb-1">Expiry Date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
              required
            />
          </div>

          {/* Expandable Studio Custom Settings Section */}
          <div className="pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowSettingsTab(!showSettingsTab)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all text-xs cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse" />
                Client Custom Studio Settings (Firestore Synchronized)
              </span>
              <span className="text-[#FF6B00]">{showSettingsTab ? 'Hide ▲' : 'Edit Studio Settings ▼'}</span>
            </button>

            {showSettingsTab && (
              <div className="mt-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-3 animate-fadeIn">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#A08E8B] font-bold mb-1">Currency Code</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-[#240C0B] border border-white/15 rounded-xl px-3 py-2 text-white font-bold outline-none"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="CAD">CAD (C$)</option>
                      <option value="AUD">AUD (A$)</option>
                      <option value="JPY">JPY (¥)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#A08E8B] font-bold mb-1">Invoice US Tax Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      step="0.1"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white font-mono font-bold outline-none focus:border-[#FF6B00]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#A08E8B] font-bold mb-1">Studio Color Theme</label>
                    <select
                      value={colorTheme}
                      onChange={(e) => setColorTheme(e.target.value)}
                      className="w-full bg-[#240C0B] border border-white/15 rounded-xl px-3 py-2 text-white font-bold outline-none"
                    >
                      <option value="terracotta">Terracotta & Espresso</option>
                      <option value="emerald">Emerald & Sage Spa</option>
                      <option value="ocean">Coastal Navy & Blue</option>
                      <option value="plum">Royal Berry & Plum</option>
                      <option value="coral">Sunset Coral & Truffle</option>
                      <option value="slate">Nordic Slate & Amber</option>
                      <option value="nordic">Glacier Teal & Spruce</option>
                      <option value="lavender">Lavender Mist & Lilac</option>
                      <option value="rose">Cyber Rose & Berry</option>
                      <option value="gold">Imperial Gold & Espresso</option>
                      <option value="crimson">Crimson Wine & Bordeaux</option>
                      <option value="monochrome">Obsidian & Platinum</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#A08E8B] font-bold mb-1">Clinic Website</label>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="www.pawbookpro.com"
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#A08E8B] font-bold mb-1">Opening Hour (AM)</label>
                    <select
                      value={openHour}
                      onChange={(e) => setOpenHour(parseInt(e.target.value))}
                      className="w-full bg-[#240C0B] border border-white/15 rounded-xl px-3 py-2 text-white font-bold outline-none"
                    >
                      <option value={6}>6:00 AM</option>
                      <option value={7}>7:00 AM</option>
                      <option value={8}>8:00 AM</option>
                      <option value={9}>9:00 AM</option>
                      <option value={10}>10:00 AM</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#A08E8B] font-bold mb-1">Closing Hour (PM)</label>
                    <select
                      value={closeHour}
                      onChange={(e) => setCloseHour(parseInt(e.target.value))}
                      className="w-full bg-[#240C0B] border border-white/15 rounded-xl px-3 py-2 text-white font-bold outline-none"
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

                <div>
                  <label className="block text-[#A08E8B] font-bold mb-1">Studio Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="100 Bark Avenue, Suite 4, San Francisco, CA"
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-[#2E8A81] hover:bg-[#236F68] text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-md"
            >
              {isLoading ? 'Saving to Firestore...' : 'Save Changes & Sync'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
