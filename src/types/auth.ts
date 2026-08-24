export type SubscriptionPlan = 'Starter' | 'Pro' | 'Premium' | 'Enterprise';
export type AccountStatus = 'active' | 'inactive';

export type SessionStatus = 'active' | 'inactive' | 'terminated' | 'banned';

export interface ClientDeviceSession {
  sessionId: string;
  deviceId: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  deviceName: string; // e.g. "MacBook Pro 16", "iPhone 15 Pro", "Windows PC"
  browser: string; // e.g. "Chrome 128", "Safari 18", "Firefox 130"
  os: string; // e.g. "macOS Sequoia", "Windows 11", "iOS 18", "Android 15"
  ipAddress?: string;
  location?: string; // e.g. "New York, US", "London, UK", "Local Network"
  loginAt: string; // ISO string
  lastActiveAt: string; // ISO string
  isCurrentDevice?: boolean;
  status: SessionStatus;
}

export interface BannedDeviceRecord {
  deviceId: string;
  deviceName?: string;
  bannedAt: string; // ISO string
  reason?: string;
  bannedBy?: string;
  os?: string;
  browser?: string;
  ipAddress?: string;
  location?: string;
}

export interface ScreenPermissions {
  dashboard?: boolean;
  calendar?: boolean;
  invoices?: boolean;
  clients?: boolean;
  services?: boolean;
  alerts?: boolean;
  loyalty?: boolean;
  staff?: boolean;
  revenue?: boolean;
  business?: boolean;
  gallery?: boolean;
  settings?: boolean;
}

export interface ScreenSectionPermissions {
  dashboard?: {
    kpiCards?: boolean;
    quickActions?: boolean;
    todaySchedule?: boolean;
    stationOccupancy?: boolean;
    petSummaryTable?: boolean;
    revenueMiniChart?: boolean;
    vaccineAlertsCard?: boolean;
    [key: string]: boolean | undefined;
  };
  calendar?: {
    viewModeToggle?: boolean;
    staffFilter?: boolean;
    printSchedule?: boolean;
    appointmentGrid?: boolean;
    [key: string]: boolean | undefined;
  };
  invoices?: {
    summaryCards?: boolean;
    searchAndFilters?: boolean;
    invoiceTable?: boolean;
    exportButtons?: boolean;
    actionButtons?: boolean;
    [key: string]: boolean | undefined;
  };
  clients?: {
    searchAndFilters?: boolean;
    clientsList?: boolean;
    addClientButton?: boolean;
    [key: string]: boolean | undefined;
  };
  services?: {
    servicesGrid?: boolean;
    packagesSection?: boolean;
    addServiceButton?: boolean;
    [key: string]: boolean | undefined;
  };
  staff?: {
    staffList?: boolean;
    addStaffButton?: boolean;
    scheduleEditor?: boolean;
    performanceMetrics?: boolean;
    [key: string]: boolean | undefined;
  };
  loyalty?: {
    statsOverview?: boolean;
    rulesConfig?: boolean;
    tierManagement?: boolean;
    redemptionsHistory?: boolean;
    [key: string]: boolean | undefined;
  };
  alerts?: {
    vaccineAlerts?: boolean;
    automatedTriggers?: boolean;
    notificationComposer?: boolean;
    [key: string]: boolean | undefined;
  };
  revenue?: {
    financialOverview?: boolean;
    profitReports?: boolean;
    exportAccounting?: boolean;
    [key: string]: boolean | undefined;
  };
  business?: {
    inventory?: boolean;
    retailSales?: boolean;
    giftCards?: boolean;
    expenses?: boolean;
    waitlist?: boolean;
    [key: string]: boolean | undefined;
  };
  gallery?: {
    transformationsGrid?: boolean;
    uploadPhotoBtn?: boolean;
    categoryFilters?: boolean;
    portfolioShare?: boolean;
    [key: string]: boolean | undefined;
  };
  settings?: {
    generalInfo?: boolean;
    colorTheme?: boolean;
    backupRestore?: boolean;
    [key: string]: boolean | undefined;
  };
  [key: string]: Record<string, boolean | undefined> | undefined;
}

export interface FeaturePermissions {
  allowBooking?: boolean; // Can book new grooming appointments
  allowCheckout?: boolean; // POS & retail checkout
  allowClientEdit?: boolean; // Add/edit client & pet records
  allowPdfExport?: boolean; // Download invoices as PDF
  allowReportExport?: boolean; // Export revenue & reports as CSV
  allowWhatsApp?: boolean; // Send WhatsApp client reminders
  allowLoyalty?: boolean; // Redeem & assign loyalty points
  allowVaccineAlerts?: boolean; // Vaccine & health alerts system
  allowStaffPayroll?: boolean; // Groomer commission & payroll calculator
  allowCustomThemes?: boolean; // Customize studio color themes
  allowAiAssistant?: boolean; // AI Grooming Assistant & smart notes
}

export interface ClientPermissions {
  isTrialMode?: boolean;
  trialTierName?: string;
  trialMessage?: string;
  screens?: ScreenPermissions;
  sections?: ScreenSectionPermissions;
  features?: FeaturePermissions;
}

export interface ClientProfile {
  profileId: string; // e.g. "PG001"
  businessName: string; // e.g. "Happy Paws Grooming"
  ownerName: string; // e.g. "Sarah Jenkins"
  email: string; // e.g. "happy@email.com"
  password: string; // e.g. "password123"
  phoneNumber?: string;
  plan: SubscriptionPlan;
  createdAt: string; // 'YYYY-MM-DD'
  expiryDate: string; // 'YYYY-MM-DD'
  status: AccountStatus;
  
  // Device & Session Management
  isCurrentlyLoggedIn?: boolean;
  lastActiveAt?: string;
  lastActiveDevice?: string;
  enforceSingleDeviceLogin?: boolean; // When true, only 1 device can stay active at a time
  activeSessions?: ClientDeviceSession[]; // List of registered / active device sessions
  bannedDevices?: string[]; // List of banned device IDs for this profile
  bannedDeviceRecords?: BannedDeviceRecord[]; // Rich metadata list of banned devices for this profile

  permissions?: ClientPermissions; // Feature & Screen granular permissions for demo & trials
  customSettings?: {
    salonName?: string;
    name?: string;
    phone?: string;
    address?: string;
    email?: string;
    website?: string;
    open?: number;
    close?: number;
    slot?: number;
    currency?: string;
    taxRate?: number;
    colorTheme?: string;
    photo?: string;
    logoUrl?: string;
    tagline?: string;
    ppd?: number;
    redeem?: number;
    bday?: number;
  };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'super_admin' | 'admin';
  avatar?: string;
  lastLogin?: string;
}

export interface AuthSession {
  userType: 'client' | 'admin';
  profile?: ClientProfile;
  admin?: AdminUser;
  token: string;
  sessionId?: string;
  deviceId?: string;
  loginTime: string;
  rememberMe: boolean;
}

export interface AuthDatabase {
  admin: AdminUser;
  profiles: ClientProfile[];
  version: string;
  lastUpdated: string;
}

export type NotificationType = 
  | 'popup' 
  | 'banner' 
  | 'push' 
  | 'ticker' 
  | 'drawer' 
  | 'floating_badge' 
  | 'spotlight_card' 
  | 'toast_stack' 
  | 'sidebar_alert' 
  | 'modal_takeover' 
  | 'message'
  // 10+ New Delivery Formats
  | 'email_digest'
  | 'sms_text'
  | 'whatsapp_msg'
  | 'telegram_bot'
  | 'discord_webhook'
  | 'slack_webhook'
  | 'voice_tts'
  | 'floating_dock'
  | 'matrix_teams'
  | 'system_tray_fcm'
  | 'inbox_badge_modal';

export type NotificationPriority = 'info' | 'warning' | 'urgent' | 'promotion' | 'update';

export interface AdminNotification {
  id: string;
  targetType: 'all' | 'specific';
  targetProfileId?: string; // profileId or 'all' (primary target or fallback)
  targetProfileIds?: string[]; // Array of selected profileIds when targeting multiple specific clients
  targetBusinessName?: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  imageUrl?: string; // Optional image URL for modern visuals
  actionLabel?: string; // Clickable button label
  actionUrl?: string; // URL (opens in new tab) or internal screen mode (e.g. 'calendar')
  actionTarget?: '_blank' | '_self'; // '_blank' opens in new browser tab
  createdAt: string; // ISO string
  expiresAt?: string;
  createdBy: string;
  readBy: string[]; // profileIds that have read this
  dismissedBy: string[]; // profileIds that have dismissed the popup/banner
  isActive: boolean;
  
  // Format-specific metadata
  metadata?: {
    channelName?: string;
    senderHandle?: string;
    audioVoice?: string;
    phoneRecipient?: string;
    emailRecipient?: string;
    digestSections?: { label: string; value: string }[];
  };
}

/**
 * Check if a client profile is currently online based on session status and recent heartbeat activity.
 * A client is considered online if:
 * 1. isCurrentlyLoggedIn is true and lastActiveAt is within the last 60 seconds (fresh heartbeat), OR
 * 2. Any active session in activeSessions has transmitted a heartbeat within the last 60 seconds.
 */
export function isClientProfileOnline(profile?: ClientProfile | null): boolean {
  if (!profile) return false;
  
  const now = Date.now();
  const bannedSet = new Set((profile.bannedDevices || []).map(d => d.toLowerCase()));

  // 1. Check profile-level heartbeat and logged in flag
  if (profile.isCurrentlyLoggedIn && profile.lastActiveAt) {
    const lastActiveMs = new Date(profile.lastActiveAt).getTime();
    if (!isNaN(lastActiveMs) && now - lastActiveMs >= 0 && now - lastActiveMs < 60000) {
      return true;
    }
  }

  // 2. Check individual active sessions
  if (Array.isArray(profile.activeSessions)) {
    const hasOnlineSession = profile.activeSessions.some(s => {
      if (s.status !== 'active' || bannedSet.has(s.deviceId.toLowerCase())) return false;
      if (!s.lastActiveAt) return false;
      const sessMs = new Date(s.lastActiveAt).getTime();
      return !isNaN(sessMs) && now - sessMs >= 0 && now - sessMs < 60000;
    });
    if (hasOnlineSession) return true;
  }

  return false;
}

/**
 * Check if a specific device session is currently transmitting an active online heartbeat
 */
export function isDeviceSessionOnline(session?: ClientDeviceSession | null, profileIsOnline: boolean = false): boolean {
  if (!session || session.status !== 'active') return false;
  if (!session.lastActiveAt) return profileIsOnline;
  const lastActiveMs = new Date(session.lastActiveAt).getTime();
  if (isNaN(lastActiveMs)) return profileIsOnline;
  const diffMs = Date.now() - lastActiveMs;
  return diffMs >= 0 && diffMs < 60000;
}

/**
 * Get unified counts for active sessions, online sessions, and total devices for a client profile
 */
export function getProfileSessionCounts(profile?: ClientProfile | null): {
  activeCount: number;
  onlineCount: number;
  totalCount: number;
  bannedCount: number;
} {
  if (!profile) {
    return { activeCount: 0, onlineCount: 0, totalCount: 0, bannedCount: 0 };
  }

  const bannedSet = new Set((profile.bannedDevices || []).map(d => d.toLowerCase()));
  const isOnline = isClientProfileOnline(profile);
  const rawSessions = Array.isArray(profile.activeSessions) ? profile.activeSessions : [];

  let activeCount = rawSessions.filter(s => s.status === 'active' && !bannedSet.has(s.deviceId.toLowerCase())).length;
  let onlineCount = rawSessions.filter(s => s.status === 'active' && !bannedSet.has(s.deviceId.toLowerCase()) && isDeviceSessionOnline(s, isOnline)).length;

  // If profile is marked logged in or online, but sessions array is empty, count the live primary session
  if (activeCount === 0 && (profile.isCurrentlyLoggedIn || isOnline)) {
    activeCount = 1;
    if (isOnline) onlineCount = 1;
  }

  const totalCount = Math.max(rawSessions.length, activeCount);
  const bannedCount = (profile.bannedDevices || []).length;

  return { activeCount, onlineCount, totalCount, bannedCount };
}

