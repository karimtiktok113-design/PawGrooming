import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ClientProfile, ClientDeviceSession, BannedDeviceRecord, isClientProfileOnline } from '../../types/auth';
import { 
  Laptop, 
  Smartphone, 
  Tablet, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Ban, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Globe, 
  LogOut, 
  X, 
  Check, 
  RefreshCw,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  PlusCircle,
  Search,
  Lock,
  UserX,
  Info
} from 'lucide-react';
import { getOrCreateDeviceId } from '../../utils/deviceDetector';

interface ClientDevicesModalProps {
  isOpen: boolean;
  profile: ClientProfile | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const ClientDevicesModal: React.FC<ClientDevicesModalProps> = ({
  isOpen,
  profile,
  onClose,
  onSuccess
}) => {
  const { 
    logoutClientFromAdmin, 
    terminateDeviceSession, 
    banDevice,
    unbanDevice,
    toggleBanDevice, 
    toggleEnforceSingleDevice,
    refreshServerDatabase,
    authDatabase
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'sessions' | 'banned' | 'security'>('sessions');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Ban confirmation dialog state
  const [banPrompt, setBanPrompt] = useState<{
    isOpen: boolean;
    deviceId: string;
    deviceName: string;
    sessionInfo?: ClientDeviceSession;
    reason: string;
  }>({
    isOpen: false,
    deviceId: '',
    deviceName: '',
    reason: 'Restricted by salon administrator'
  });

  // Manual ban input state
  const [manualBanId, setManualBanId] = useState('');
  const [manualBanDeviceName, setManualBanDeviceName] = useState('');
  const [manualBanReason, setManualBanReason] = useState('Manual administrative restriction');

  const currentBrowserDeviceId = getOrCreateDeviceId();

  if (!isOpen || !profile) return null;

  // Retrieve freshest profile data from authDatabase
  const freshProfile = authDatabase.profiles.find(p => p.profileId === profile.profileId) || profile;
  const sessions: ClientDeviceSession[] = Array.isArray(freshProfile.activeSessions) ? freshProfile.activeSessions : [];
  const bannedList: string[] = Array.isArray(freshProfile.bannedDevices) ? freshProfile.bannedDevices : [];
  const bannedRecords: BannedDeviceRecord[] = Array.isArray(freshProfile.bannedDeviceRecords) ? freshProfile.bannedDeviceRecords : [];
  
  // Real-time ticker to refresh session active states every 3s
  const [, setPresenceTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setPresenceTick(t => t + 1), 3000);
    return () => clearInterval(timer);
  }, []);

  const isProfileOnlineNow = isClientProfileOnline(freshProfile);
  const activeSessions = sessions.filter(s => {
    if (s.status !== 'active' || bannedList.includes(s.deviceId)) return false;
    // Session is active if profile is online or session had recent heartbeat
    if (!s.lastActiveAt) return isProfileOnlineNow;
    const diff = Date.now() - new Date(s.lastActiveAt).getTime();
    return diff >= 0 && diff < 60000;
  });
  const activeSessionsCount = activeSessions.length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshServerDatabase();
      onSuccess('Refreshed latest device and session states from Firestore.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRemoteLogoutAll = async () => {
    if (confirm(`Terminate all active login sessions and log out ${freshProfile.businessName} across all devices?`)) {
      setIsProcessing(true);
      try {
        await logoutClientFromAdmin(freshProfile.profileId);
        onSuccess(`Logged out client ${freshProfile.businessName} from all devices.`);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleTerminateSession = async (sessionId: string, deviceName: string) => {
    setIsProcessing(true);
    try {
      await terminateDeviceSession(freshProfile.profileId, sessionId);
      onSuccess(`Terminated active session on ${deviceName}.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenBanPrompt = (deviceId: string, deviceName: string, sessionInfo?: ClientDeviceSession) => {
    setBanPrompt({
      isOpen: true,
      deviceId,
      deviceName,
      sessionInfo,
      reason: 'Banned by salon administrator'
    });
  };

  const handleConfirmBan = async () => {
    if (!banPrompt.deviceId.trim()) return;
    setIsProcessing(true);
    try {
      await banDevice(
        freshProfile.profileId, 
        banPrompt.deviceId, 
        banPrompt.reason,
        banPrompt.sessionInfo
      );
      onSuccess(`Device ${banPrompt.deviceName || banPrompt.deviceId} has been banned.`);
      setBanPrompt(prev => ({ ...prev, isOpen: false }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnban = async (deviceId: string) => {
    setIsProcessing(true);
    try {
      await unbanDevice(freshProfile.profileId, deviceId);
      onSuccess(`Device ID ${deviceId} unbanned successfully.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualAddBan = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = manualBanId.trim();
    if (!cleanId) return;

    setIsProcessing(true);
    try {
      await banDevice(
        freshProfile.profileId,
        cleanId,
        manualBanReason.trim() || 'Manual administrative blacklist',
        { deviceName: manualBanDeviceName.trim() || `Device (${cleanId.slice(-6)})` }
      );
      onSuccess(`Device ID ${cleanId} added to blacklist.`);
      setManualBanId('');
      setManualBanDeviceName('');
      setManualBanReason('Manual administrative blacklist');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleSingleDevice = async () => {
    setIsProcessing(true);
    try {
      await toggleEnforceSingleDevice(freshProfile.profileId);
      onSuccess(
        freshProfile.enforceSingleDeviceLogin 
          ? `Single-Device Restriction Disabled.` 
          : `Single-Device Restriction Activated! Only 1 device can remain active at a time.`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-5 h-5 text-indigo-400" />;
      case 'tablet': return <Tablet className="w-5 h-5 text-cyan-400" />;
      default: return <Laptop className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 text-white rounded-3xl border border-slate-700/80 shadow-2xl max-w-3xl w-full p-6 space-y-5 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-display font-black text-lg text-white">
                  Device Logins & Session Security
                </h3>
                {isProfileOnlineNow ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE ONLINE
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                    OFFLINE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Client Profile: <strong className="text-white">{freshProfile.businessName}</strong> ({freshProfile.profileId}) • {freshProfile.ownerName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Refresh device states from Cloud Firestore"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Sessions</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-display font-black text-emerald-400">{activeSessionsCount}</span>
              <span className="text-xs text-slate-500">online</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Recorded</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-display font-black text-white">{sessions.length}</span>
              <span className="text-xs text-slate-500">devices</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Banned Devices</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-display font-black text-red-400">{bannedList.length}</span>
              <span className="text-xs text-slate-500">blacklisted</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Single Device Lock</span>
            <div className="mt-0.5">
              <span className={`inline-flex items-center gap-1 text-xs font-bold ${
                freshProfile.enforceSingleDeviceLogin ? 'text-amber-400' : 'text-slate-400'
              }`}>
                {freshProfile.enforceSingleDeviceLogin ? '● ENFORCED' : '○ Allowed'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('sessions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'sessions'
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Device Sessions & History ({sessions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('banned')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'banned'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Ban className="w-4 h-4" />
            <span>Banned Devices Blacklist ({bannedList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'security'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security Controls</span>
          </button>
        </div>

        {/* TAB 1: SESSIONS & HISTORY */}
        {activeTab === 'sessions' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Active & Recorded Sessions
              </h4>
              {activeSessionsCount > 0 && (
                <button
                  type="button"
                  onClick={handleRemoteLogoutAll}
                  disabled={isProcessing}
                  className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out All ({activeSessionsCount}) Devices</span>
                </button>
              )}
            </div>

            {sessions.length === 0 ? (
              <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-slate-800">
                <Laptop className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400">
                  No device login sessions recorded yet. Device metadata will be registered automatically upon client sign-in.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {sessions.map((sess) => {
                  const isBanned = bannedList.some(d => d.toLowerCase() === sess.deviceId.toLowerCase());
                  const isActive = sess.status === 'active' && !isBanned;
                  const isThisBrowser = sess.deviceId === currentBrowserDeviceId;

                  return (
                    <div 
                      key={sess.sessionId}
                      className={`p-4 rounded-2xl border transition-all ${
                        isActive 
                          ? 'bg-slate-800/90 border-slate-700 hover:border-indigo-500/40 shadow-sm' 
                          : isBanned 
                            ? 'bg-red-950/20 border-red-800/40' 
                            : 'bg-slate-800/30 border-slate-800/60 opacity-75'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`p-2.5 rounded-xl border shrink-0 ${
                            isActive 
                              ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' 
                              : isBanned 
                                ? 'bg-red-500/20 border-red-500/30 text-red-400'
                                : 'bg-slate-800 border-slate-700 text-slate-500'
                          }`}>
                            {getDeviceIcon(sess.deviceType)}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="text-sm font-bold text-white truncate">
                                {sess.deviceName}
                              </h5>

                              {isThisBrowser && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                  This Browser
                                </span>
                              )}

                              {isActive && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  ACTIVE NOW
                                </span>
                              )}
                              {isBanned && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-red-500/20 text-red-400 border border-red-500/30">
                                  <Ban className="w-2.5 h-2.5" />
                                  BANNED
                                </span>
                              )}
                              {sess.status === 'terminated' && !isBanned && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                  Session Ended
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3 text-slate-500" />
                                {sess.browser} • {sess.os}
                              </span>
                              {sess.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-500" />
                                  {sess.location}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                Login: {new Date(sess.loginAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
                              ID: {sess.deviceId}
                            </div>
                          </div>
                        </div>

                        {/* Control Actions */}
                        <div className="flex items-center gap-2 shrink-0 sm:self-center">
                          {isActive && (
                            <button
                              type="button"
                              onClick={() => handleTerminateSession(sess.sessionId, sess.deviceName)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                              title="End active session on this device"
                            >
                              <LogOut className="w-3.5 h-3.5 inline mr-1" />
                              Log Out Device
                            </button>
                          )}

                          {isBanned ? (
                            <button
                              type="button"
                              onClick={() => handleUnban(sess.deviceId)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                              Unban Device
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenBanPrompt(sess.deviceId, sess.deviceName, sess)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 transition-colors cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5 inline mr-1" />
                              Ban Device
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BANNED DEVICES BLACKLIST */}
        {activeTab === 'banned' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Manual Ban Input Form */}
            <form onSubmit={handleManualAddBan} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-400">
                <PlusCircle className="w-4 h-4" />
                <span>Ban Device ID Manually</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  value={manualBanId}
                  onChange={(e) => setManualBanId(e.target.value)}
                  placeholder="Device ID (e.g., dev_...)"
                  required
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono outline-none focus:border-red-500"
                />
                <input
                  type="text"
                  value={manualBanDeviceName}
                  onChange={(e) => setManualBanDeviceName(e.target.value)}
                  placeholder="Device Name (e.g. Unknown iPhone)"
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-red-500"
                />
                <input
                  type="text"
                  value={manualBanReason}
                  onChange={(e) => setManualBanReason(e.target.value)}
                  placeholder="Ban Reason (Optional)"
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-red-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isProcessing || !manualBanId.trim()}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Add to Blacklist & Ban</span>
                </button>
              </div>
            </form>

            {/* Banned Devices List */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Blacklisted Device Credentials ({bannedList.length})
              </h4>

              {bannedList.length === 0 ? (
                <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-slate-800">
                  <ShieldCheck className="w-10 h-10 text-emerald-500/60 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">
                    No devices are currently banned for this client profile.
                  </p>
                </div>
              ) : (
                bannedList.map((devId) => {
                  const record = bannedRecords.find(r => r.deviceId.toLowerCase() === devId.toLowerCase());
                  const sessionMatch = sessions.find(s => s.deviceId.toLowerCase() === devId.toLowerCase());

                  return (
                    <div 
                      key={devId}
                      className="p-4 rounded-2xl bg-red-950/20 border border-red-800/40 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white">
                            {record?.deviceName || sessionMatch?.deviceName || 'Banned Device'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-red-500/20 text-red-400 border border-red-500/30">
                            BANNED
                          </span>
                        </div>
                        <div className="text-[11px] text-red-300/80 mt-1">
                          Reason: <span className="font-semibold text-white">{record?.reason || 'Restricted by salon administrator'}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          ID: {devId} • Banned: {record?.bannedAt ? new Date(record.bannedAt).toLocaleDateString() : 'Active'}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUnban(devId)}
                        disabled={isProcessing}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Unban Device</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY CONTROLS */}
        {activeTab === 'security' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Single Device Strict Mode Card */}
            <div className={`p-5 rounded-2xl border transition-all ${
              freshProfile.enforceSingleDeviceLogin 
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-200' 
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <span className="text-sm font-bold text-white">
                    Single-Device Strict Login Policy
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleSingleDevice}
                  disabled={isProcessing}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {freshProfile.enforceSingleDeviceLogin ? (
                    <ToggleRight className="w-9 h-9 text-amber-400" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-500" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                When enabled, logging into this client profile on any new phone, tablet, or browser will automatically invalidate and log out all other active sessions worldwide.
              </p>
            </div>

            {/* Emergency Remote Logout Card */}
            <div className="p-5 rounded-2xl bg-red-950/20 border border-red-800/40 space-y-3">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-bold text-white">
                  Emergency Global Remote Sign-Out
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instantly revoke all session credentials and forcibly sign out {freshProfile.businessName} on every device currently online.
              </p>
              <button
                type="button"
                onClick={handleRemoteLogoutAll}
                disabled={isProcessing || activeSessionsCount === 0}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out All Devices Now</span>
              </button>
            </div>

            {/* Security Explanation Info Box */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-400 space-y-1">
                <p className="font-bold text-white">How Device Security Works:</p>
                <p>• Every device generates a cryptographically consistent fingerprint ID stored with its user-agent, operating system, and geographic timestamp.</p>
                <p>• Banning a device prevents both active sessions and future login attempts with a clear denial notice.</p>
                <p>• Unbanning a device immediately restores access upon the next client login.</p>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Universal Cloud Firestore Device Authorization</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Done & Close
          </button>
        </div>

      </div>

      {/* Ban Reason Confirmation Dialog */}
      {banPrompt.isOpen && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-3 rounded-2xl bg-red-500/20 border border-red-500/30">
                <Ban className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Ban Device Credential</h4>
                <p className="text-xs text-slate-400">Restricts access and logs out this device</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-1">
              <p className="text-slate-300">Device: <strong className="text-white">{banPrompt.deviceName}</strong></p>
              <p className="text-slate-400 font-mono text-[10px] truncate">ID: {banPrompt.deviceId}</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Reason for Ban (will be displayed to client):
              </label>
              <input
                type="text"
                value={banPrompt.reason}
                onChange={(e) => setBanPrompt(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="e.g. Unauthorized device, Suspicious login, Lost phone"
                className="w-full bg-slate-800 border border-slate-700 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBanPrompt(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBan}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-600/30"
              >
                <Ban className="w-3.5 h-3.5" />
                <span>Confirm Ban & Terminate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
