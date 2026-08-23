import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  AuthDatabase, 
  ClientProfile, 
  AdminUser, 
  AuthSession, 
  SubscriptionPlan, 
  AccountStatus,
  AdminNotification,
  NotificationType,
  NotificationPriority,
  ClientDeviceSession,
  BannedDeviceRecord
} from '../types/auth';
import { 
  loadAuthDatabase, 
  saveAuthDatabase, 
  SESSION_STORAGE_KEY, 
  INITIAL_AUTH_DATABASE, 
  generateNextProfileId 
} from '../data/initialAuthData';
import { 
  testConnection, 
  subscribeToOnlineFirestoreProfiles, 
  getOnlineFirestoreProfiles,
  saveProfileToFirestore, 
  deleteProfileFromFirestore,
  authenticateWithFirestore,
  subscribeToOnlineFirestoreNotifications,
  getOnlineFirestoreNotifications,
  saveNotificationToFirestore,
  deleteNotificationFromFirestore,
  markNotificationReadInFirestore,
  markNotificationDismissedInFirestore,
  markProfileOfflineInFirestore,
  updateProfileHeartbeatInFirestore
} from '../lib/firebase';
import { 
  FULL_ACCESS_SCREENS, 
  FULL_ACCESS_SECTIONS,
  FULL_ACCESS_FEATURES 
} from '../data/permissionPresets';
import { detectCurrentDevice, getOrCreateDeviceId } from '../utils/deviceDetector';

export type AuthViewMode = 'client_login' | 'admin_login' | 'admin_dashboard' | 'app';

export interface LoginResult {
  success: boolean;
  error?: string;
  status?: 'active' | 'inactive' | 'invalid';
  profile?: ClientProfile;
}

interface AuthContextType {
  authDatabase: AuthDatabase;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  currentProfile: ClientProfile | null;
  currentAdmin: AdminUser | null;
  authView: AuthViewMode;
  setAuthView: (view: AuthViewMode) => void;
  
  // Login & Session Methods
  loginClient: (email: string, password: string, rememberMe?: boolean) => Promise<LoginResult>;
  loginAdmin: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  impersonateClient: (profileId: string) => void;
  returnToAdmin: () => void;
  refreshServerDatabase: () => Promise<void>;
  
  // Device & Remote Session Management from Admin
  logoutClientFromAdmin: (profileId: string) => Promise<boolean>;
  terminateDeviceSession: (profileId: string, sessionId: string) => Promise<boolean>;
  banDevice: (profileId: string, deviceId: string, reason?: string, deviceInfo?: Partial<ClientDeviceSession>) => Promise<boolean>;
  unbanDevice: (profileId: string, deviceId: string) => Promise<boolean>;
  toggleBanDevice: (profileId: string, deviceId: string, reason?: string) => Promise<boolean>;
  toggleEnforceSingleDevice: (profileId: string) => Promise<boolean>;
  updateSessionActivity: () => Promise<void>;
  
  // Remote Logout Notice State
  remoteLogoutNotice: { isOpen: boolean; reason: 'admin_logout' | 'single_device_conflict' | 'device_banned' };
  setRemoteLogoutNotice: (notice: { isOpen: boolean; reason: 'admin_logout' | 'single_device_conflict' | 'device_banned' }) => void;

  // Profile Management Methods
  createClientProfile: (profile: Omit<ClientProfile, 'profileId' | 'createdAt'> & { profileId?: string }) => Promise<ClientProfile>;
  updateClientProfile: (profileId: string, updates: Partial<ClientProfile>) => Promise<boolean>;
  toggleProfileStatus: (profileId: string) => Promise<boolean>;
  deleteClientProfile: (profileId: string) => Promise<boolean>;
  resetAuthDatabase: () => Promise<void>;
  
  // Inactive Account Modal State
  inactiveModalOpen: boolean;
  setInactiveModalOpen: (open: boolean) => void;
  inactiveProfileDetails: ClientProfile | null;
  setInactiveProfileDetails: (profile: ClientProfile | null) => void;

  // Account Deleted Auto-Logout Notice State
  deletedAccountNotice: boolean;
  setDeletedAccountNotice: (open: boolean) => void;

  // Push Notifications & Pop-ups System
  notifications: AdminNotification[];
  clientNotifications: AdminNotification[];
  activePopupsForCurrentProfile: AdminNotification[];
  activeBannersForCurrentProfile: AdminNotification[];
  unreadNotificationsCount: number;
  createAdminNotification: (notifData: Omit<AdminNotification, 'id' | 'createdAt' | 'createdBy' | 'readBy' | 'dismissedBy'>) => Promise<AdminNotification>;
  deleteAdminNotification: (notificationId: string) => Promise<boolean>;
  toggleNotificationStatus: (notificationId: string) => Promise<boolean>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  dismissPopupNotification: (notificationId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authDatabase, setAuthDatabase] = useState<AuthDatabase>(() => loadAuthDatabase());
  const [session, setSession] = useState<AuthSession | null>(() => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY) || sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed: AuthSession = JSON.parse(saved);
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved auth session:', e);
    }
    return null;
  });

  const [authView, setAuthView] = useState<AuthViewMode>(() => {
    if (session) {
      if (session.userType === 'admin') return 'admin_dashboard';
      if (session.userType === 'client') return 'app';
    }
    return 'client_login';
  });

  const [inactiveModalOpen, setInactiveModalOpen] = useState<boolean>(false);
  const [inactiveProfileDetails, setInactiveProfileDetails] = useState<ClientProfile | null>(null);
  const [deletedAccountNotice, setDeletedAccountNotice] = useState<boolean>(false);
  const [remoteLogoutNotice, setRemoteLogoutNotice] = useState<{
    isOpen: boolean;
    reason: 'admin_logout' | 'single_device_conflict' | 'device_banned';
  }>({
    isOpen: false,
    reason: 'admin_logout'
  });
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  // Manual refresh from Firestore database
  const refreshServerDatabase = useCallback(async () => {
    try {
      const [onlineList, onlineNotifs] = await Promise.all([
        getOnlineFirestoreProfiles(),
        getOnlineFirestoreNotifications()
      ]);
      
      setAuthDatabase(prev => {
        const updated = {
          ...prev,
          profiles: onlineList,
          lastUpdated: new Date().toISOString()
        };
        saveAuthDatabase(updated);
        return updated;
      });

      if (onlineNotifs && onlineNotifs.length > 0) {
        setNotifications(onlineNotifs);
      }
    } catch (err) {
      console.warn('Direct Firestore fetch error:', err);
    }
  }, []);

  // 1. Subscribe to Real-Time Firebase Firestore Database (Profiles & Notifications)
  useEffect(() => {
    testConnection();

    // Direct Real-time Firestore Snapshot Listener for Profiles
    const unsubscribeProfiles = subscribeToOnlineFirestoreProfiles(
      (firestoreProfiles) => {
        setAuthDatabase(prev => {
          const updated = {
            ...prev,
            profiles: firestoreProfiles,
            lastUpdated: new Date().toISOString()
          };
          saveAuthDatabase(updated);
          return updated;
        });
      },
      (err) => {
        console.warn('Firestore profiles subscription notice:', err);
      }
    );

    // Direct Real-time Firestore Snapshot Listener for Notifications & Pop-ups
    const unsubscribeNotifs = subscribeToOnlineFirestoreNotifications(
      (firestoreNotifs) => {
        setNotifications(firestoreNotifs);
      },
      (err) => {
        console.warn('Firestore notifications subscription notice:', err);
      }
    );

    // Initial load
    refreshServerDatabase();

    return () => {
      if (unsubscribeProfiles) unsubscribeProfiles();
      if (unsubscribeNotifs) unsubscribeNotifs();
    };
  }, [refreshServerDatabase]);

  // 2. SIMULTANEOUS AUTO-LOGOUT & DEVICE CONFLICT DETECTION:
  // Synchronize active session when profiles in Firestore change
  useEffect(() => {
    if (session && session.userType === 'client' && session.profile) {
      const profileId = session.profile.profileId;
      const currentSessionId = session.sessionId;
      const currentDeviceId = session.deviceId || getOrCreateDeviceId();

      if (authDatabase.profiles && authDatabase.profiles.length > 0) {
        const updatedProfile = authDatabase.profiles.find(p => p.profileId === profileId);
        
        if (updatedProfile) {
          // 1. Account Suspended / Inactive
          if (updatedProfile.status === 'inactive') {
            setInactiveProfileDetails(updatedProfile);
            setInactiveModalOpen(true);
            logout();
            return;
          }

          // 2. Check if current device ID is banned
          const isBanned = (
            (Array.isArray(updatedProfile.bannedDevices) && updatedProfile.bannedDevices.some(d => d.toLowerCase() === currentDeviceId.toLowerCase())) ||
            (Array.isArray(updatedProfile.bannedDeviceRecords) && updatedProfile.bannedDeviceRecords.some(r => r.deviceId.toLowerCase() === currentDeviceId.toLowerCase()))
          );

          if (isBanned) {
            setRemoteLogoutNotice({ isOpen: true, reason: 'device_banned' });
            logout();
            return;
          }

          // 3. Check if this specific session was terminated (e.g. Remote Admin Logout, single-device conflict, or session termination)
          if (currentSessionId && Array.isArray(updatedProfile.activeSessions)) {
            const matchedSession = updatedProfile.activeSessions.find(s => s.sessionId === currentSessionId);
            if (matchedSession && matchedSession.status === 'terminated') {
              const reason = updatedProfile.enforceSingleDeviceLogin ? 'single_device_conflict' : 'admin_logout';
              setRemoteLogoutNotice({ isOpen: true, reason });
              logout();
              return;
            }
          }

          // 4. Keep active session profile in sync with profile edits
          setSession(prev => {
            if (!prev || JSON.stringify(prev.profile) === JSON.stringify(updatedProfile)) {
              return prev;
            }
            return { ...prev, profile: updatedProfile };
          });
        } else {
          // PROFILE WAS DELETED FROM DATABASE!
          console.warn(`Profile ${profileId} no longer exists in Firestore. Triggering simultaneous logout.`);
          setDeletedAccountNotice(true);
          logout();
        }
      }
    }
  }, [authDatabase.profiles, session?.sessionId, session?.deviceId]);

  // Real-time presence management: Heartbeat & Tab/Browser Close (unload) handling
  useEffect(() => {
    if (!session || session.userType !== 'client' || !session.profile?.profileId) {
      return;
    }

    const profileId = session.profile.profileId;
    const sessionId = session.sessionId;

    // 1. Initial online mark
    updateProfileHeartbeatInFirestore(profileId, sessionId).catch(() => {});

    // 2. Periodic heartbeat every 12 seconds
    const heartbeatInterval = setInterval(() => {
      if (document.visibilityState !== 'hidden') {
        updateProfileHeartbeatInFirestore(profileId, sessionId).catch(() => {});
      }
    }, 12000);

    // 3. User interaction activity throttle (at most every 10s)
    let lastActivityPing = Date.now();
    const handleUserActivity = () => {
      const now = Date.now();
      if (now - lastActivityPing > 10000) {
        lastActivityPing = now;
        updateProfileHeartbeatInFirestore(profileId, sessionId).catch(() => {});
      }
    };

    window.addEventListener('pointerdown', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity, { passive: true });

    // 4. Visibility change handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateProfileHeartbeatInFirestore(profileId, sessionId).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 5. Browser/Tab close or navigate away: immediately mark offline in Firestore
    const handleBeforeUnload = () => {
      markProfileOfflineInFirestore(profileId, sessionId).catch(() => {});
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('pointerdown', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      markProfileOfflineInFirestore(profileId, sessionId).catch(() => {});
    };
  }, [session?.userType, session?.profile?.profileId, session?.sessionId]);

  // Save session to storage
  const persistSession = (newSession: AuthSession | null, rememberMe: boolean = true) => {
    setSession(newSession);
    if (newSession) {
      const serialized = JSON.stringify(newSession);
      if (rememberMe) {
        localStorage.setItem(SESSION_STORAGE_KEY, serialized);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } else {
        sessionStorage.setItem(SESSION_STORAGE_KEY, serialized);
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  };

  /**
   * Client Login: Authenticates and registers device session in Firestore
   */
  const loginClient = async (email: string, password: string, rememberMe: boolean = true): Promise<LoginResult> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const currentDeviceRaw = detectCurrentDevice();

    try {
      const firestoreResult = await authenticateWithFirestore(cleanEmail, cleanPassword);
      let targetProfile = firestoreResult.profile;

      if (!targetProfile) {
        targetProfile = authDatabase.profiles.find(
          p => p.email.toLowerCase() === cleanEmail && p.password === cleanPassword
        );
      }

      if (targetProfile) {
        if (targetProfile.status === 'inactive') {
          setInactiveProfileDetails(targetProfile);
          setInactiveModalOpen(true);
          return {
            success: false,
            status: 'inactive',
            error: 'Your account is currently inactive. Please contact support.',
            profile: targetProfile
          };
        }

        // Check if device is banned
        const isDeviceBanned = (
          (Array.isArray(targetProfile.bannedDevices) && targetProfile.bannedDevices.some(d => d.toLowerCase() === currentDeviceRaw.deviceId.toLowerCase())) ||
          (Array.isArray(targetProfile.bannedDeviceRecords) && targetProfile.bannedDeviceRecords.some(r => r.deviceId.toLowerCase() === currentDeviceRaw.deviceId.toLowerCase()))
        );

        if (isDeviceBanned) {
          const banRecord = targetProfile.bannedDeviceRecords?.find(r => r.deviceId.toLowerCase() === currentDeviceRaw.deviceId.toLowerCase());
          const reasonNotice = banRecord?.reason ? ` Reason: ${banRecord.reason}.` : '';
          return {
            success: false,
            status: 'invalid',
            error: `Access Denied: This device (ID: ${currentDeviceRaw.deviceId}) is restricted/banned from this account.${reasonNotice} Contact your salon administrator to unban this device.`
          };
        }

        // Prepare new Device Session
        const newDeviceSession: ClientDeviceSession = {
          ...currentDeviceRaw,
          loginAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          status: 'active',
          isCurrentDevice: true
        };

        // Handle single device enforcement: terminate prior sessions if enabled
        let updatedSessions: ClientDeviceSession[] = Array.isArray(targetProfile.activeSessions) 
          ? [...targetProfile.activeSessions] 
          : [];

        if (targetProfile.enforceSingleDeviceLogin) {
          updatedSessions = updatedSessions.map(s => ({
            ...s,
            status: 'terminated' as const
          }));
        }

        // Append new session (keep active on top, limit history to last 20)
        updatedSessions = [newDeviceSession, ...updatedSessions.filter(s => s.sessionId !== newDeviceSession.sessionId)].slice(0, 20);

        const updatedProfile: ClientProfile = {
          ...targetProfile,
          isCurrentlyLoggedIn: true,
          lastActiveAt: new Date().toISOString(),
          lastActiveDevice: newDeviceSession.deviceName,
          activeSessions: updatedSessions
        };

        // Create AuthSession
        const newSession: AuthSession = {
          userType: 'client',
          profile: updatedProfile,
          sessionId: newDeviceSession.sessionId,
          deviceId: newDeviceSession.deviceId,
          token: `firebase_token_${updatedProfile.profileId}_${Date.now()}`,
          loginTime: new Date().toISOString(),
          rememberMe
        };

        persistSession(newSession, rememberMe);
        setAuthView('app');

        // Save updated sessions and online status to Firestore
        await saveProfileToFirestore(updatedProfile);

        return { success: true, status: 'active', profile: updatedProfile };
      }

      // Check wrong password vs email not found
      const emailExists = authDatabase.profiles.some(p => p.email.toLowerCase() === cleanEmail);
      return {
        success: false,
        status: 'invalid',
        error: emailExists 
          ? 'Incorrect password for this account. Please verify case-sensitivity.'
          : 'No registered client profile found for this email address.'
      };
    } catch (firebaseErr) {
      console.warn('Direct Firestore authentication exception:', firebaseErr);
      return {
        success: false,
        status: 'invalid',
        error: 'Authentication connection error. Please try again.'
      };
    }
  };

  const loginAdmin = async (email: string, password: string, rememberMe: boolean = true): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (
      cleanEmail === authDatabase.admin.email.toLowerCase() &&
      cleanPassword === authDatabase.admin.password
    ) {
      const newSession: AuthSession = {
        userType: 'admin',
        admin: authDatabase.admin,
        token: `admin_token_${Date.now()}`,
        loginTime: new Date().toISOString(),
        rememberMe
      };

      persistSession(newSession, rememberMe);
      setAuthView('admin_dashboard');
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid admin credentials. Please check your admin email and password.'
    };
  };

  const logout = () => {
    // If currently logged in client, mark logged out in state
    if (session && session.userType === 'client' && session.profile) {
      const pId = session.profile.profileId;
      const target = authDatabase.profiles.find(p => p.profileId === pId);
      if (target) {
        const updated = {
          ...target,
          isCurrentlyLoggedIn: false,
          activeSessions: Array.isArray(target.activeSessions)
            ? target.activeSessions.map(s => s.sessionId === session.sessionId ? { ...s, status: 'terminated' as const } : s)
            : []
        };
        saveProfileToFirestore(updated).catch(() => {});
      }
    }

    persistSession(null);
    setAuthView('client_login');
  };

  /**
   * Remote Logout Client from Admin Console: Immediately terminates client sessions across all devices
   */
  const logoutClientFromAdmin = async (profileId: string): Promise<boolean> => {
    const target = authDatabase.profiles.find(p => p.profileId === profileId);
    if (!target) return false;

    const updatedProfile: ClientProfile = {
      ...target,
      isCurrentlyLoggedIn: false,
      activeSessions: Array.isArray(target.activeSessions)
        ? target.activeSessions.map(s => ({ ...s, status: 'terminated' as const }))
        : []
    };

    setAuthDatabase(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => p.profileId === profileId ? updatedProfile : p),
      lastUpdated: new Date().toISOString()
    }));

    await saveProfileToFirestore(updatedProfile);
    return true;
  };

  /**
   * Terminate a specific device session
   */
  const terminateDeviceSession = async (profileId: string, sessionId: string): Promise<boolean> => {
    const target = authDatabase.profiles.find(p => p.profileId === profileId);
    if (!target) return false;

    const updatedSessions = Array.isArray(target.activeSessions)
      ? target.activeSessions.map(s => s.sessionId === sessionId ? { ...s, status: 'terminated' as const } : s)
      : [];

    const hasRemainingActive = updatedSessions.some(s => s.status === 'active');

    const updatedProfile: ClientProfile = {
      ...target,
      isCurrentlyLoggedIn: hasRemainingActive,
      activeSessions: updatedSessions
    };

    setAuthDatabase(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => p.profileId === profileId ? updatedProfile : p),
      lastUpdated: new Date().toISOString()
    }));

    await saveProfileToFirestore(updatedProfile);
    return true;
  };

  /**
   * Ban a specific Device ID from this client profile with optional reason and metadata
   */
  const banDevice = async (
    profileId: string, 
    deviceId: string, 
    reason?: string,
    deviceInfo?: Partial<ClientDeviceSession>
  ): Promise<boolean> => {
    const target = authDatabase.profiles.find(p => p.profileId === profileId);
    if (!target) return false;

    const cleanDeviceId = deviceId.trim();
    if (!cleanDeviceId) return false;

    const currentBanned = Array.isArray(target.bannedDevices) ? [...target.bannedDevices] : [];
    const nextBanned = currentBanned.some(d => d.toLowerCase() === cleanDeviceId.toLowerCase())
      ? currentBanned
      : [...currentBanned, cleanDeviceId];

    // Find existing session info if available to populate record details
    const matchedSession = target.activeSessions?.find(s => s.deviceId.toLowerCase() === cleanDeviceId.toLowerCase());

    const existingRecords = Array.isArray(target.bannedDeviceRecords) ? [...target.bannedDeviceRecords] : [];
    const newRecord: BannedDeviceRecord = {
      deviceId: cleanDeviceId,
      deviceName: deviceInfo?.deviceName || matchedSession?.deviceName || `Device (${cleanDeviceId.slice(-6)})`,
      bannedAt: new Date().toISOString(),
      reason: reason?.trim() || 'Banned by salon administrator',
      bannedBy: authDatabase.admin?.email || 'Administrator',
      os: deviceInfo?.os || matchedSession?.os,
      browser: deviceInfo?.browser || matchedSession?.browser,
      ipAddress: deviceInfo?.ipAddress || matchedSession?.ipAddress || '192.168.1.1',
      location: deviceInfo?.location || matchedSession?.location
    };

    const nextRecords = [
      newRecord,
      ...existingRecords.filter(r => r.deviceId.toLowerCase() !== cleanDeviceId.toLowerCase())
    ];

    // Terminate any active sessions associated with this device
    const updatedSessions = Array.isArray(target.activeSessions)
      ? target.activeSessions.map(s => s.deviceId.toLowerCase() === cleanDeviceId.toLowerCase() ? { ...s, status: 'terminated' as const } : s)
      : [];

    const hasRemainingActive = updatedSessions.some(s => s.status === 'active');

    const updatedProfile: ClientProfile = {
      ...target,
      bannedDevices: nextBanned,
      bannedDeviceRecords: nextRecords,
      isCurrentlyLoggedIn: hasRemainingActive,
      activeSessions: updatedSessions
    };

    setAuthDatabase(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => p.profileId === profileId ? updatedProfile : p),
      lastUpdated: new Date().toISOString()
    }));

    await saveProfileToFirestore(updatedProfile);
    return true;
  };

  /**
   * Unban a specific Device ID from this client profile
   */
  const unbanDevice = async (profileId: string, deviceId: string): Promise<boolean> => {
    const target = authDatabase.profiles.find(p => p.profileId === profileId);
    if (!target) return false;

    const cleanDeviceId = deviceId.trim();
    const currentBanned = Array.isArray(target.bannedDevices) ? [...target.bannedDevices] : [];
    const nextBanned = currentBanned.filter(d => d.toLowerCase() !== cleanDeviceId.toLowerCase());

    const currentRecords = Array.isArray(target.bannedDeviceRecords) ? [...target.bannedDeviceRecords] : [];
    const nextRecords = currentRecords.filter(r => r.deviceId.toLowerCase() !== cleanDeviceId.toLowerCase());

    const updatedProfile: ClientProfile = {
      ...target,
      bannedDevices: nextBanned,
      bannedDeviceRecords: nextRecords
    };

    setAuthDatabase(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => p.profileId === profileId ? updatedProfile : p),
      lastUpdated: new Date().toISOString()
    }));

    await saveProfileToFirestore(updatedProfile);
    return true;
  };

  /**
   * Ban or Unban a specific Device ID from this client profile
   */
  const toggleBanDevice = async (profileId: string, deviceId: string, reason?: string): Promise<boolean> => {
    const target = authDatabase.profiles.find(p => p.profileId === profileId);
    if (!target) return false;

    const cleanDeviceId = deviceId.trim();
    const isAlreadyBanned = (
      (Array.isArray(target.bannedDevices) && target.bannedDevices.some(d => d.toLowerCase() === cleanDeviceId.toLowerCase())) ||
      (Array.isArray(target.bannedDeviceRecords) && target.bannedDeviceRecords.some(r => r.deviceId.toLowerCase() === cleanDeviceId.toLowerCase()))
    );

    if (isAlreadyBanned) {
      return unbanDevice(profileId, cleanDeviceId);
    } else {
      return banDevice(profileId, cleanDeviceId, reason);
    }
  };

  /**
   * Update active heartbeat for current client session
   */
  const updateSessionActivity = async (): Promise<void> => {
    if (session && session.userType === 'client' && session.profile && session.sessionId) {
      const pId = session.profile.profileId;
      const currentSessId = session.sessionId;
      const target = authDatabase.profiles.find(p => p.profileId === pId);
      if (target && Array.isArray(target.activeSessions)) {
        const now = new Date().toISOString();
        const updatedSessions = target.activeSessions.map(s =>
          s.sessionId === currentSessId ? { ...s, lastActiveAt: now, status: 'active' as const } : s
        );
        const updatedProfile: ClientProfile = {
          ...target,
          isCurrentlyLoggedIn: true,
          lastActiveAt: now,
          activeSessions: updatedSessions
        };
        setAuthDatabase(prev => ({
          ...prev,
          profiles: prev.profiles.map(p => p.profileId === pId ? updatedProfile : p),
          lastUpdated: now
        }));
        await saveProfileToFirestore(updatedProfile);
      }
    }
  };

  /**
   * Toggle Enforce Single Device Login Mode
   */
  const toggleEnforceSingleDevice = async (profileId: string): Promise<boolean> => {
    const target = authDatabase.profiles.find(p => p.profileId === profileId);
    if (!target) return false;

    const nextEnforce = !target.enforceSingleDeviceLogin;

    // If enabling single-device and there are multiple active sessions, keep only the latest active one
    let updatedSessions = Array.isArray(target.activeSessions) ? [...target.activeSessions] : [];
    if (nextEnforce && updatedSessions.length > 0) {
      let foundFirstActive = false;
      updatedSessions = updatedSessions.map(s => {
        if (s.status === 'active') {
          if (!foundFirstActive) {
            foundFirstActive = true;
            return s;
          }
          return { ...s, status: 'terminated' as const };
        }
        return s;
      });
    }

    const updatedProfile: ClientProfile = {
      ...target,
      enforceSingleDeviceLogin: nextEnforce,
      activeSessions: updatedSessions
    };

    setAuthDatabase(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => p.profileId === profileId ? updatedProfile : p),
      lastUpdated: new Date().toISOString()
    }));

    await saveProfileToFirestore(updatedProfile);
    return true;
  };

  const impersonateClient = (profileId: string) => {
    const profile = authDatabase.profiles.find(p => p.profileId === profileId);
    if (!profile) return;

    const currentDeviceRaw = detectCurrentDevice();
    const now = new Date().toISOString();
    const newDeviceSession: ClientDeviceSession = {
      ...currentDeviceRaw,
      loginAt: now,
      lastActiveAt: now,
      status: 'active',
      isCurrentDevice: true
    };

    let updatedSessions = Array.isArray(profile.activeSessions) ? [...profile.activeSessions] : [];
    if (profile.enforceSingleDeviceLogin) {
      updatedSessions = updatedSessions.map(s => ({ ...s, status: 'terminated' as const }));
    }
    updatedSessions = [newDeviceSession, ...updatedSessions.filter(s => s.sessionId !== newDeviceSession.sessionId)].slice(0, 20);

    const updatedProfile: ClientProfile = {
      ...profile,
      isCurrentlyLoggedIn: true,
      lastActiveAt: now,
      lastActiveDevice: newDeviceSession.deviceName,
      activeSessions: updatedSessions
    };

    const newSession: AuthSession = {
      userType: 'client',
      profile: updatedProfile,
      sessionId: newDeviceSession.sessionId,
      deviceId: newDeviceSession.deviceId,
      token: `impersonate_${profileId}_${Date.now()}`,
      loginTime: now,
      rememberMe: false
    };

    setAuthDatabase(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => p.profileId === profileId ? updatedProfile : p),
      lastUpdated: now
    }));

    saveProfileToFirestore(updatedProfile).catch(() => {});

    persistSession(newSession, false);
    setAuthView('app');
  };

  const returnToAdmin = () => {
    const newSession: AuthSession = {
      userType: 'admin',
      admin: authDatabase.admin,
      token: `admin_token_${Date.now()}`,
      loginTime: new Date().toISOString(),
      rememberMe: true
    };
    persistSession(newSession, true);
    setAuthView('admin_dashboard');
  };

  /**
   * Create Client Profile: Saved to Firebase Firestore
   */
  const createClientProfile = async (
    profileData: Omit<ClientProfile, 'profileId' | 'createdAt'> & { profileId?: string }
  ): Promise<ClientProfile> => {
    const profileId = profileData.profileId || generateNextProfileId(authDatabase.profiles);
    const today = new Date().toISOString().split('T')[0];

    const newProfile: ClientProfile = {
      ...profileData,
      profileId,
      createdAt: today,
      status: profileData.status || 'active',
      plan: profileData.plan || 'Premium',
      isCurrentlyLoggedIn: false,
      enforceSingleDeviceLogin: profileData.enforceSingleDeviceLogin ?? true,
      activeSessions: [],
      bannedDevices: [],
      permissions: profileData.permissions || {
        isTrialMode: false,
        trialTierName: profileData.plan ? `${profileData.plan} Tier` : 'Standard',
        trialMessage: '',
        screens: { ...FULL_ACCESS_SCREENS },
        features: { ...FULL_ACCESS_FEATURES }
      },
      customSettings: profileData.customSettings || {
        salonName: profileData.businessName,
        name: `${profileData.businessName} Studio`,
        email: profileData.email,
        phone: profileData.phoneNumber || '(555) 000-0000',
        colorTheme: 'terracotta'
      }
    };

    // Update local state
    setAuthDatabase(prev => {
      const updated = {
        ...prev,
        profiles: [newProfile, ...prev.profiles.filter(p => p.profileId !== profileId)],
        lastUpdated: new Date().toISOString()
      };
      saveAuthDatabase(updated);
      return updated;
    });

    // Persist to Firebase Firestore
    await saveProfileToFirestore(newProfile);

    return newProfile;
  };

  /**
   * Update Client Profile: Saved to Firebase Firestore
   */
  const updateClientProfile = async (profileId: string, updates: Partial<ClientProfile>): Promise<boolean> => {
    const existing = authDatabase.profiles.find(p => p.profileId === profileId);
    if (!existing) {
      console.error(`Cannot find profile ${profileId} to update.`);
      return false;
    }

    const updatedProfile: ClientProfile = {
      ...existing,
      ...updates,
      permissions: updates.permissions !== undefined 
        ? {
            isTrialMode: updates.permissions.isTrialMode ?? false,
            trialTierName: updates.permissions.trialTierName || (existing.permissions?.trialTierName || 'Standard'),
            trialMessage: updates.permissions.trialMessage !== undefined ? updates.permissions.trialMessage : (existing.permissions?.trialMessage || ''),
            screens: {
              ...FULL_ACCESS_SCREENS,
              ...(existing.permissions?.screens || {}),
              ...(updates.permissions.screens || {})
            },
            sections: updates.permissions.sections !== undefined 
              ? updates.permissions.sections 
              : (existing.permissions?.sections || { ...FULL_ACCESS_SECTIONS }),
            features: {
              ...FULL_ACCESS_FEATURES,
              ...(existing.permissions?.features || {}),
              ...(updates.permissions.features || {})
            }
          }
        : existing.permissions,
      customSettings: {
        ...(existing.customSettings || {}),
        ...(updates.customSettings || {}),
        salonName: updates.businessName || existing.customSettings?.salonName || existing.businessName,
        email: updates.email || existing.email || existing.customSettings?.email || '',
        phone: updates.phoneNumber || existing.phoneNumber || existing.customSettings?.phone || ''
      }
    };

    // Update local state
    setAuthDatabase(prev => {
      const updated = {
        ...prev,
        profiles: prev.profiles.map(p => p.profileId === profileId ? updatedProfile : p),
        lastUpdated: new Date().toISOString()
      };
      saveAuthDatabase(updated);
      return updated;
    });

    if (session && session.userType === 'client' && session.profile?.profileId === profileId) {
      setSession(prev => prev ? { ...prev, profile: updatedProfile } : null);
    }

    await saveProfileToFirestore(updatedProfile);
    return true;
  };

  /**
   * Toggle Profile Status: Saved to Firebase Firestore
   */
  const toggleProfileStatus = async (profileId: string): Promise<boolean> => {
    const existing = authDatabase.profiles.find(p => p.profileId === profileId);
    if (!existing) return false;

    const nextStatus: AccountStatus = existing.status === 'active' ? 'inactive' : 'active';
    const toggledProfile: ClientProfile = {
      ...existing,
      status: nextStatus
    };

    setAuthDatabase(prev => {
      const updated = {
        ...prev,
        profiles: prev.profiles.map(p => p.profileId === profileId ? toggledProfile : p),
        lastUpdated: new Date().toISOString()
      };
      saveAuthDatabase(updated);
      return updated;
    });

    // If currently logged in as this client and set to inactive, trigger logout
    if (nextStatus === 'inactive' && session?.userType === 'client' && session.profile?.profileId === profileId) {
      setInactiveProfileDetails(toggledProfile);
      setInactiveModalOpen(true);
      logout();
    }

    await saveProfileToFirestore(toggledProfile);
    return true;
  };

  /**
   * Delete Client Profile: Directly removed from Firebase Firestore & Auto-Logout active session
   */
  const deleteClientProfile = async (profileId: string): Promise<boolean> => {
    // 1. If currently logged in as this client profile, immediately trigger auto-logout!
    if (session && session.userType === 'client' && session.profile?.profileId === profileId) {
      setDeletedAccountNotice(true);
      logout();
    }

    // 2. Local state delete
    setAuthDatabase(prev => {
      const updated = {
        ...prev,
        profiles: prev.profiles.filter(p => p.profileId !== profileId),
        lastUpdated: new Date().toISOString()
      };
      saveAuthDatabase(updated);
      return updated;
    });

    // 3. Remove from Firebase Firestore Online Database
    await deleteProfileFromFirestore(profileId);

    return true;
  };

  const resetAuthDatabase = async () => {
    await refreshServerDatabase();
  };

  // -------------------------------------------------------------
  // PUSH NOTIFICATIONS & POP-UPS SYSTEM METHODS
  // -------------------------------------------------------------

  const currentClientProfileId = session?.userType === 'client' ? session.profile?.profileId : null;

  // Filter notifications applicable for the currently logged in client profile
  const clientNotifications = useMemo(() => {
    if (!currentClientProfileId) return [];
    return notifications.filter(n => {
      if (!n.isActive) return false;
      if (n.targetType === 'all') return true;
      if (n.targetType === 'specific') {
        if (n.targetProfileId === currentClientProfileId) return true;
        if (Array.isArray(n.targetProfileIds) && n.targetProfileIds.includes(currentClientProfileId)) return true;
      }
      return false;
    });
  }, [notifications, currentClientProfileId]);

  // Active Popup Modals that have not yet been dismissed by this client
  const activePopupsForCurrentProfile = useMemo(() => {
    if (!currentClientProfileId) return [];
    return clientNotifications.filter(n => {
      if (n.type !== 'popup') return false;
      const dismissed = Array.isArray(n.dismissedBy) ? n.dismissedBy : [];
      return !dismissed.includes(currentClientProfileId);
    });
  }, [clientNotifications, currentClientProfileId]);

  // Active Banners
  const activeBannersForCurrentProfile = useMemo(() => {
    if (!currentClientProfileId) return [];
    return clientNotifications.filter(n => {
      if (n.type !== 'banner') return false;
      const dismissed = Array.isArray(n.dismissedBy) ? n.dismissedBy : [];
      return !dismissed.includes(currentClientProfileId);
    });
  }, [clientNotifications, currentClientProfileId]);

  // Unread Count
  const unreadNotificationsCount = useMemo(() => {
    if (!currentClientProfileId) return 0;
    return clientNotifications.filter(n => {
      const read = Array.isArray(n.readBy) ? n.readBy : [];
      return !read.includes(currentClientProfileId);
    }).length;
  }, [clientNotifications, currentClientProfileId]);

  /**
   * Create Admin Broadcast / Push Notification / Pop-up
   */
  const createAdminNotification = async (
    notifData: Omit<AdminNotification, 'id' | 'createdAt' | 'createdBy' | 'readBy' | 'dismissedBy'>
  ): Promise<AdminNotification> => {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newNotif: AdminNotification = {
      ...notifData,
      id,
      createdAt: new Date().toISOString(),
      createdBy: authDatabase.admin.email || 'Admin',
      readBy: [],
      dismissedBy: [],
      isActive: notifData.isActive !== undefined ? notifData.isActive : true
    };

    setNotifications(prev => [newNotif, ...prev]);
    await saveNotificationToFirestore(newNotif);
    return newNotif;
  };

  /**
   * Delete Admin Notification from Firestore
   */
  const deleteAdminNotification = async (notificationId: string): Promise<boolean> => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    await deleteNotificationFromFirestore(notificationId);
    return true;
  };

  /**
   * Toggle Notification active status
   */
  const toggleNotificationStatus = async (notificationId: string): Promise<boolean> => {
    const existing = notifications.find(n => n.id === notificationId);
    if (!existing) return false;

    const updated: AdminNotification = {
      ...existing,
      isActive: !existing.isActive
    };

    setNotifications(prev => prev.map(n => n.id === notificationId ? updated : n));
    await saveNotificationToFirestore(updated);
    return true;
  };

  /**
   * Mark notification as read
   */
  const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    if (!currentClientProfileId) return;
    setNotifications(prev => prev.map(n => {
      if (n.id === notificationId) {
        const readBy = Array.isArray(n.readBy) ? n.readBy : [];
        if (!readBy.includes(currentClientProfileId)) {
          return { ...n, readBy: [...readBy, currentClientProfileId] };
        }
      }
      return n;
    }));
    await markNotificationReadInFirestore(notificationId, currentClientProfileId);
  };

  /**
   * Dismiss a popup modal notification
   */
  const dismissPopupNotification = async (notificationId: string): Promise<void> => {
    if (!currentClientProfileId) return;
    setNotifications(prev => prev.map(n => {
      if (n.id === notificationId) {
        const dismissedBy = Array.isArray(n.dismissedBy) ? n.dismissedBy : [];
        const readBy = Array.isArray(n.readBy) ? n.readBy : [];
        return {
          ...n,
          dismissedBy: dismissedBy.includes(currentClientProfileId) ? dismissedBy : [...dismissedBy, currentClientProfileId],
          readBy: readBy.includes(currentClientProfileId) ? readBy : [...readBy, currentClientProfileId]
        };
      }
      return n;
    }));
    await markNotificationDismissedInFirestore(notificationId, currentClientProfileId);
  };

  return (
    <AuthContext.Provider
      value={{
        authDatabase,
        session,
        isAuthenticated: !!session,
        isAdmin: session?.userType === 'admin',
        currentProfile: session?.userType === 'client' 
          ? (authDatabase.profiles.find(p => p.profileId === session.profile?.profileId) || session.profile || null) 
          : null,
        currentAdmin: session?.userType === 'admin' ? session.admin || null : null,
        authView,
        setAuthView,
        loginClient,
        loginAdmin,
        logout,
        impersonateClient,
        returnToAdmin,
        refreshServerDatabase,
        logoutClientFromAdmin,
        terminateDeviceSession,
        banDevice,
        unbanDevice,
        toggleBanDevice,
        toggleEnforceSingleDevice,
        updateSessionActivity,
        remoteLogoutNotice,
        setRemoteLogoutNotice,
        createClientProfile,
        updateClientProfile,
        toggleProfileStatus,
        deleteClientProfile,
        resetAuthDatabase,
        inactiveModalOpen,
        setInactiveModalOpen,
        inactiveProfileDetails,
        setInactiveProfileDetails,
        deletedAccountNotice,
        setDeletedAccountNotice,
        notifications,
        clientNotifications,
        activePopupsForCurrentProfile,
        activeBannersForCurrentProfile,
        unreadNotificationsCount,
        createAdminNotification,
        deleteAdminNotification,
        toggleNotificationStatus,
        markNotificationAsRead,
        dismissPopupNotification
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

