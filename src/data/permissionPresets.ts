import { ClientPermissions, ScreenPermissions, ScreenSectionPermissions, FeaturePermissions, NotificationType, NotificationPriority } from '../types/auth';
import { ViewMode } from '../types';

export interface ScreenDefinition {
  id: ViewMode;
  label: string;
  category: 'core' | 'operations' | 'finance' | 'studio';
  description: string;
  iconName: string;
}

export const ALL_SCREENS: ScreenDefinition[] = [
  { id: 'dashboard', label: 'Dashboard & Quick Stats', category: 'core', description: 'Studio overview, metrics, today appointments and live status', iconName: 'LayoutDashboard' },
  { id: 'calendar', label: 'Appointments & Booking Calendar', category: 'core', description: 'Interactive appointment scheduling, time slots and groomer assignment', iconName: 'Calendar' },
  { id: 'invoices', label: 'Invoices, Billing & QR Pay', category: 'finance', description: 'Digital invoices, checkout receipts, tips, and QR payment generation', iconName: 'Receipt' },
  { id: 'clients', label: 'Client & Pet Records (CRM)', category: 'core', description: 'Pet profiles, breed notes, rabies dates, and owner emergency contacts', iconName: 'Dog' },
  { id: 'services', label: 'Grooming Services & Add-ons', category: 'operations', description: 'Service catalog, breed sizing pricing, duration and spa add-ons', iconName: 'Scissors' },
  { id: 'alerts', label: 'Health & Vaccine Compliance', category: 'operations', description: 'Automated 30-day rabies expiration trackers and health flags', iconName: 'AlertTriangle' },
  { id: 'loyalty', label: 'Paws Loyalty & VIP Rewards', category: 'operations', description: 'Tiered client loyalty points, redeemable grooming discounts and rewards', iconName: 'Award' },
  { id: 'staff', label: 'Groomers & Stylists Roster', category: 'operations', description: 'Staff profiles, specialization, working hours, and commission tracker', iconName: 'UserCheck' },
  { id: 'revenue', label: 'Revenue, Analytics & Tax', category: 'finance', description: 'Financial analytics, payment distribution, tips and service revenue charts', iconName: 'TrendingUp' },
  { id: 'business', label: 'Salon Activity & Retail Store', category: 'studio', description: 'Retail product inventory, stock levels, sales checkout and activity log', iconName: 'Store' },
  { id: 'gallery', label: 'Transformation Photo Gallery', category: 'studio', description: 'Before & After grooming photo showcase and portfolio', iconName: 'Sparkles' },
  { id: 'settings', label: 'Studio Settings & Branding', category: 'studio', description: 'Salon branding, color themes, logo upload, and business hours', iconName: 'Settings' },
];

export interface FeatureDefinition {
  key: keyof FeaturePermissions;
  label: string;
  description: string;
  category: 'booking' | 'sales' | 'communication' | 'advanced';
}

export const ALL_FEATURES: FeatureDefinition[] = [
  { key: 'allowBooking', label: 'Appointment Booking & Creation', description: 'Allow creating and modifying customer grooming appointments', category: 'booking' },
  { key: 'allowCheckout', label: 'POS & Retail Store Checkout', description: 'Allow completing sales and charging retail pet products', category: 'sales' },
  { key: 'allowClientEdit', label: 'Add & Edit Client/Pet Profiles', description: 'Allow registering new pet owners and editing medical notes', category: 'booking' },
  { key: 'allowPdfExport', label: 'PDF Invoice & Receipt Download', description: 'Allow generating printable and downloadable PDF invoices', category: 'sales' },
  { key: 'allowReportExport', label: 'Financial Reports & CSV Export', description: 'Allow exporting salon revenue and appointment history to CSV', category: 'advanced' },
  { key: 'allowWhatsApp', label: 'WhatsApp Automated Reminders', description: 'Allow sending 1-click WhatsApp appointment reminders to clients', category: 'communication' },
  { key: 'allowLoyalty', label: 'Loyalty Points Redemption', description: 'Allow awarding and redeeming VIP loyalty rewards', category: 'sales' },
  { key: 'allowVaccineAlerts', label: 'Vaccine & Health Expiry System', description: 'Enable medical alerts and vaccination compliance tracking', category: 'advanced' },
  { key: 'allowStaffPayroll', label: 'Groomer Commission & Payroll', description: 'Enable commission calculations and staff payroll reports', category: 'advanced' },
  { key: 'allowCustomThemes', label: 'Custom Studio Color Themes', description: 'Allow changing salon palette and branding theme', category: 'advanced' },
  { key: 'allowAiAssistant', label: 'AI Grooming Assistant & Smart Notes', description: 'Enable AI coat suggestions and auto-generated rebooking recommendations', category: 'advanced' },
];

export const FULL_ACCESS_SCREENS: ScreenPermissions = {
  dashboard: true,
  calendar: true,
  invoices: true,
  clients: true,
  services: true,
  alerts: true,
  loyalty: true,
  staff: true,
  revenue: true,
  business: true,
  gallery: true,
  settings: true,
};

export const FULL_ACCESS_FEATURES: FeaturePermissions = {
  allowBooking: true,
  allowCheckout: true,
  allowClientEdit: true,
  allowPdfExport: true,
  allowReportExport: true,
  allowWhatsApp: true,
  allowLoyalty: true,
  allowVaccineAlerts: true,
  allowStaffPayroll: true,
  allowCustomThemes: true,
  allowAiAssistant: true,
};

export interface SectionDefinition {
  id: string;
  screenId: ViewMode;
  label: string;
  description: string;
}

export const ALL_SCREEN_SECTIONS: Record<ViewMode, SectionDefinition[]> = {
  dashboard: [
    { id: 'kpiCards', screenId: 'dashboard', label: 'Key Metric Stat Cards', description: 'Total Revenue, Appointments Count, Active Clients, Grooming Rating' },
    { id: 'quickActions', screenId: 'dashboard', label: 'Quick Action Command Buttons', description: 'New Appointment, Quick Invoice, Add Pet Owner, Send WhatsApp' },
    { id: 'todaySchedule', screenId: 'dashboard', label: "Today's Appointment Schedule", description: 'Live dog lineup, appointment status toggles, time slots' },
    { id: 'stationOccupancy', screenId: 'dashboard', label: 'Grooming Station & Staff Load', description: 'Bathing tub, scissoring tables, drying station occupancy monitors' },
    { id: 'petSummaryTable', screenId: 'dashboard', label: 'Pet Directory & Medical Overview', description: 'Quick search, rabies expiration tags, VIP client markers' },
    { id: 'revenueMiniChart', screenId: 'dashboard', label: 'Monthly Revenue Matrix Mini-Chart', description: 'Daily earnings histogram with interactive tooltip breakdowns' },
    { id: 'vaccineAlertsCard', screenId: 'dashboard', label: 'Health & Vaccine Expiry Warning Banner', description: 'Top emergency banner for upcoming rabies/distemper renewals' },
  ],
  calendar: [
    { id: 'viewModeToggle', screenId: 'calendar', label: 'Calendar View Switcher (Day/Week/Month)', description: 'Day, Week, and Month view switcher controls & Today shortcut' },
    { id: 'staffFilter', screenId: 'calendar', label: 'Stylist / Staff Filter Selector', description: 'Filter calendar appointments by assigned groomer' },
    { id: 'printSchedule', screenId: 'calendar', label: 'Print Schedule Action Button', description: 'Print daily stylist schedule and appointment ledger PDF' },
    { id: 'appointmentGrid', screenId: 'calendar', label: 'Interactive Appointment Schedule Grid', description: 'Main timetable grid displaying booked grooming slots' },
  ],
  invoices: [
    { id: 'summaryCards', screenId: 'invoices', label: 'Billing Summary KPI Strip', description: 'Total Invoiced, Settled & Paid, Payment Due, Average Invoice' },
    { id: 'searchAndFilters', screenId: 'invoices', label: 'Invoice Search & Multi-Filters', description: 'Keyword search, Paid/Due status pills, and list/grid switcher' },
    { id: 'invoiceTable', screenId: 'invoices', label: 'Invoices Ledger & Cards Grid', description: 'Detailed invoice table or card view with client receipt records' },
    { id: 'exportButtons', screenId: 'invoices', label: 'Executive Reports & CSV Export Actions', description: 'Download CSV invoices spreadsheet and open report modals' },
    { id: 'actionButtons', screenId: 'invoices', label: 'Invoice Action Buttons & Tools', description: 'WhatsApp share, QR payment modal, status toggle, print invoice' },
  ],
  clients: [
    { id: 'searchAndFilters', screenId: 'clients', label: 'Filter Pills & Search Bar', description: 'All Pets, Vaccines warnings, Care Notes, and Coat Matting filter buttons' },
    { id: 'clientsList', screenId: 'clients', label: 'Client CRM & Pet Profile Directory', description: 'Pet cards, owner contacts, rabies status, and grooming history' },
    { id: 'addClientButton', screenId: 'clients', label: 'Add Pet & Client Action Button', description: 'Action button to register new clients and pet profiles' },
  ],
  services: [
    { id: 'servicesGrid', screenId: 'services', label: 'Services Menu Catalog & Pricing', description: 'Full grooming packages, bath, tidy, deshedding service cards' },
    { id: 'packagesSection', screenId: 'services', label: 'Spa Packages & Add-on Extras', description: 'Discounted multi-service bundles and add-on spa treatments' },
    { id: 'addServiceButton', screenId: 'services', label: 'Add Service / Package Action Buttons', description: 'Button to introduce new grooming services and package offerings' },
  ],
  staff: [
    { id: 'staffList', screenId: 'staff', label: 'Groomer Roster & Stylist Cards', description: 'Staff directory with monthly grooms, revenue share, and commission rates' },
    { id: 'addStaffButton', screenId: 'staff', label: 'Add Stylist Action Button', description: 'Action button to onboard new groomers and assistants' },
    { id: 'scheduleEditor', screenId: 'staff', label: 'Working Shift & Schedule Manager', description: 'Weekly shift schedule editor and working hours assignments' },
    { id: 'performanceMetrics', screenId: 'staff', label: 'Staff Revenue & Commission Calculator', description: 'Monthly commission payouts and performance calculations' },
  ],
  loyalty: [
    { id: 'statsOverview', screenId: 'loyalty', label: 'Loyalty Program Overview Banner', description: 'Paws & Rewards program summary, points per dollar, and birthday bonuses' },
    { id: 'rulesConfig', screenId: 'loyalty', label: 'Reward Catalog & Promo Code Creator', description: 'Available discount vouchers, free teeth brushing/nail grinds, custom promos' },
    { id: 'tierManagement', screenId: 'loyalty', label: 'Client Points Leaderboard & Redemptions', description: 'Searchable leaderboard with client point balances and direct redeem triggers' },
    { id: 'redemptionsHistory', screenId: 'loyalty', label: 'Generated Vouchers & Promo History', description: 'Active reward promo codes ready for invoice checkout application' },
  ],
  alerts: [
    { id: 'vaccineAlerts', screenId: 'alerts', label: 'Critical Vaccine Expiry Warnings', description: 'Urgent notices for expired or expiring rabies certificates' },
    { id: 'automatedTriggers', screenId: 'alerts', label: 'Active Pet Vaccination Schedules', description: 'Comprehensive medical immunization schedule and lot numbers' },
    { id: 'notificationComposer', screenId: 'alerts', label: 'Send Reminder Action Buttons', description: 'Trigger automated WhatsApp/phone medical reminder to pet owner' },
  ],
  revenue: [
    { id: 'financialOverview', screenId: 'revenue', label: 'Financial Summary KPI Cards & Banners', description: 'Gross Revenue, Settled & Paid, Payment Due, Average Invoice, Net Margin' },
    { id: 'profitReports', screenId: 'revenue', label: 'Daily Earnings Matrix & Analytics Graphs', description: 'Interactive area/line trend charts, top grossing services, stylist breakdown' },
    { id: 'exportAccounting', screenId: 'revenue', label: 'Executive Reports & CSV Export Actions', description: 'Download formatted accounting CSV and open visual reports modal' },
  ],
  business: [
    { id: 'inventory', screenId: 'business', label: 'Retail Store Stock & Products', description: 'SKU management, stock levels, low-stock warnings, and reorder levels' },
    { id: 'giftCards', screenId: 'business', label: 'Gift Cards Engine & Issuance', description: 'Issue digital gift vouchers, track balances, reload & redeem cards' },
    { id: 'expenses', screenId: 'business', label: 'Operating Expenses Ledger', description: 'Log studio overhead, supplies, equipment maintenance, and utility costs' },
    { id: 'waitlist', screenId: 'business', label: 'Standby Client Waitlist', description: 'Manage standby queue and auto-fill cancelled appointment slots' },
  ],
  gallery: [
    { id: 'transformationsGrid', screenId: 'gallery', label: 'Transformations Photo Showcase Grid', description: 'Before & After grooming transformations cards with cut & style notes' },
    { id: 'uploadPhotoBtn', screenId: 'gallery', label: 'Add Transformation Photo Action Button', description: 'Upload and attach Before/After dog images and tag groomers' },
    { id: 'categoryFilters', screenId: 'gallery', label: 'Breed Search & Filter Pills', description: 'Search and filter gallery by breed or cut styling tags' },
    { id: 'portfolioShare', screenId: 'gallery', label: 'Social Share & Delete Actions', description: 'Copy transformation link for social sharing or delete transformation' },
  ],
  settings: [
    { id: 'generalInfo', screenId: 'settings', label: 'Salon Profile & Contact Details', description: 'Business name, owner, phone, email, address, operating hours, tax rate' },
    { id: 'colorTheme', screenId: 'settings', label: 'Studio Theme & Color Customizer', description: 'Terracotta, Emerald Sage, Ocean Navy, Plum, Slate palette selector' },
    { id: 'backupRestore', screenId: 'settings', label: 'Data Backup, JSON Import/Export & Reset', description: 'Download offline JSON backup, restore data, or load demo studio dataset' },
  ],
};

export const FULL_ACCESS_SECTIONS: ScreenSectionPermissions = {
  dashboard: {
    kpiCards: true,
    quickActions: true,
    todaySchedule: true,
    stationOccupancy: true,
    petSummaryTable: true,
    revenueMiniChart: true,
    vaccineAlertsCard: true,
  },
  calendar: {
    viewModeToggle: true,
    staffFilter: true,
    printSchedule: true,
    appointmentGrid: true,
  },
  invoices: {
    summaryCards: true,
    searchAndFilters: true,
    invoiceTable: true,
    exportButtons: true,
    actionButtons: true,
  },
  clients: {
    searchAndFilters: true,
    clientsList: true,
    addClientButton: true,
  },
  services: {
    servicesGrid: true,
    packagesSection: true,
    addServiceButton: true,
  },
  staff: {
    staffList: true,
    addStaffButton: true,
    scheduleEditor: true,
    performanceMetrics: true,
  },
  loyalty: {
    statsOverview: true,
    rulesConfig: true,
    tierManagement: true,
    redemptionsHistory: true,
  },
  alerts: {
    vaccineAlerts: true,
    automatedTriggers: true,
    notificationComposer: true,
  },
  revenue: {
    financialOverview: true,
    profitReports: true,
    exportAccounting: true,
  },
  business: {
    inventory: true,
    giftCards: true,
    expenses: true,
    waitlist: true,
  },
  gallery: {
    transformationsGrid: true,
    uploadPhotoBtn: true,
    categoryFilters: true,
    portfolioShare: true,
  },
  settings: {
    generalInfo: true,
    colorTheme: true,
    backupRestore: true,
  },
};

export const DEFAULT_CLIENT_PERMISSIONS: ClientPermissions = {
  isTrialMode: false,
  trialTierName: 'Standard',
  trialMessage: '',
  screens: { ...FULL_ACCESS_SCREENS },
  sections: { ...FULL_ACCESS_SECTIONS },
  features: { ...FULL_ACCESS_FEATURES },
};

export interface PermissionPreset {
  id: string;
  name: string;
  description: string;
  badgeColor: string;
  isTrial: boolean;
  trialMessage?: string;
  screens: ScreenPermissions;
  sections?: ScreenSectionPermissions;
  features: FeaturePermissions;
}

export const PERMISSION_PRESETS: PermissionPreset[] = [
  {
    id: 'full_enterprise',
    name: '🌟 Full Enterprise / All Features',
    description: 'Complete unrestricted access to all 12 screens and 11 features.',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    isTrial: false,
    screens: { ...FULL_ACCESS_SCREENS },
    features: { ...FULL_ACCESS_FEATURES },
  },
  {
    id: 'standard_pro',
    name: '⚡ Studio Pro (Standard)',
    description: 'All core grooming operations, CRM, and invoices. Advanced custom themes restricted.',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    isTrial: false,
    screens: { ...FULL_ACCESS_SCREENS, settings: true },
    features: {
      ...FULL_ACCESS_FEATURES,
      allowCustomThemes: false,
    },
  },
  {
    id: 'trial_booking_crm',
    name: '📅 14-Day Trial: Booking & CRM Demo',
    description: 'Perfect for evaluating scheduling and pet client records. Financial analytics & payroll locked.',
    badgeColor: 'bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/30',
    isTrial: true,
    trialMessage: '⚡ You are currently exploring the PawBook Booking & CRM Trial. Contact admin@parkgrooming.com to unlock full financial analytics & staff payroll.',
    screens: {
      dashboard: true,
      calendar: true,
      invoices: true,
      clients: true,
      services: true,
      alerts: true,
      loyalty: true,
      staff: false,
      revenue: false,
      business: false,
      gallery: true,
      settings: false,
    },
    features: {
      allowBooking: true,
      allowCheckout: true,
      allowClientEdit: true,
      allowPdfExport: true,
      allowReportExport: false,
      allowWhatsApp: true,
      allowLoyalty: true,
      allowVaccineAlerts: true,
      allowStaffPayroll: false,
      allowCustomThemes: false,
      allowAiAssistant: true,
    },
  },
  {
    id: 'trial_frontdesk_demo',
    name: '📋 Trial: Front-Desk & Checkout Demo',
    description: 'Focused on appointment reception, dog check-in, and invoice QR generation.',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    isTrial: true,
    trialMessage: '🐾 Front-Desk Reception Demo Active. Upgrade your license to enable revenue reporting and team management.',
    screens: {
      dashboard: true,
      calendar: true,
      invoices: true,
      clients: true,
      services: true,
      alerts: false,
      loyalty: false,
      staff: false,
      revenue: false,
      business: false,
      gallery: true,
      settings: false,
    },
    features: {
      allowBooking: true,
      allowCheckout: true,
      allowClientEdit: true,
      allowPdfExport: true,
      allowReportExport: false,
      allowWhatsApp: false,
      allowLoyalty: false,
      allowVaccineAlerts: false,
      allowStaffPayroll: false,
      allowCustomThemes: false,
      allowAiAssistant: false,
    },
  },
  {
    id: 'trial_view_only',
    name: '👁️ Web Demo: View-Only Showcase',
    description: 'Safe preview for prospective clients. All screens visible for browsing, creation/modification locked.',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    isTrial: true,
    trialMessage: '🔒 Interactive Showcase Mode. Data creation and exports are disabled in this preview.',
    screens: { ...FULL_ACCESS_SCREENS },
    features: {
      allowBooking: false,
      allowCheckout: false,
      allowClientEdit: false,
      allowPdfExport: false,
      allowReportExport: false,
      allowWhatsApp: false,
      allowLoyalty: false,
      allowVaccineAlerts: false,
      allowStaffPayroll: false,
      allowCustomThemes: false,
      allowAiAssistant: false,
    },
  },
];

// Helper: Check if screen is allowed for a profile
export function isScreenAllowed(permissions: ClientPermissions | undefined, screen: ViewMode): boolean {
  if (!permissions || !permissions.screens) return true; // Default true if unspecified
  return permissions.screens[screen] !== false;
}

// Helper: Check if a specific section of a screen is allowed for a profile
export function isSectionAllowed(
  permissions: ClientPermissions | undefined, 
  screen: ViewMode, 
  sectionKey: string
): boolean {
  if (!permissions) return true;
  // If the whole screen is disabled, its sections are disabled
  if (permissions.screens && permissions.screens[screen] === false) return false;
  if (!permissions.sections || !permissions.sections[screen]) return true; // Default true if unspecified
  const screenSections = permissions.sections[screen] as Record<string, boolean | undefined>;
  return screenSections[sectionKey] !== false;
}

// Helper: Check if feature is allowed for a profile
export function isFeatureAllowed(permissions: ClientPermissions | undefined, feature: keyof FeaturePermissions): boolean {
  if (!permissions || !permissions.features) return true; // Default true if unspecified
  return permissions.features[feature] !== false;
}

// ==========================================
// 15 PRE-MADE PREMIUM MODERN UI NOTIFICATION TEMPLATES
// ==========================================
export interface NotificationTemplate {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  category: 'Feature Release' | 'Promotion' | 'Alert & Maintenance' | 'Tips & Guides' | 'Milestone';
  imageUrl?: string;
  actionLabel?: string;
  actionUrl?: string;
  actionTarget?: '_blank' | '_self';
}

export const READY_MADE_NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'tmpl-01',
    category: 'Feature Release',
    type: 'spotlight_card',
    priority: 'update',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
    title: '✨ AI Smart Grooming Assistant & Coat Notes',
    message: 'We have enabled automated grooming coat notes, smart service recommendations, and 4-week rebooking suggestions. Speed up appointment check-ins by 35%!',
    actionLabel: 'Open Appointments Calendar',
    actionUrl: 'calendar',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-02',
    category: 'Promotion',
    type: 'modal_takeover',
    priority: 'promotion',
    imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80',
    title: '🔥 Special Partner Offer: 40% Off Annual Upgrade',
    message: 'Upgrade to our Annual Studio Enterprise Plan today and unlock unlimited staff seats, automated WhatsApp reminders, and multi-location cloud sync at our lowest rate of the year.',
    actionLabel: 'Claim 40% Discount Online',
    actionUrl: 'https://pawbookpro.com/pricing',
    actionTarget: '_blank',
  },
  {
    id: 'tmpl-03',
    category: 'Alert & Maintenance',
    type: 'ticker',
    priority: 'warning',
    title: '⚠️ Scheduled Cloud Server Maintenance: Sunday at 02:00 UTC',
    message: 'Our cloud database will undergo routine performance optimization for 15 minutes this Sunday. Local appointment records remain safe and auto-synced.',
    actionLabel: 'View Live Server Status',
    actionUrl: 'https://status.pawbookpro.com',
    actionTarget: '_blank',
  },
  {
    id: 'tmpl-04',
    category: 'Alert & Maintenance',
    type: 'drawer',
    priority: 'urgent',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    title: '💳 Monthly Studio Pro Subscription Renewal',
    message: 'Your monthly PawBook Pro plan has renewed successfully. You can download and print your official tax invoice directly in the billing tab.',
    actionLabel: 'View Invoices & Billing',
    actionUrl: 'invoices',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-05',
    category: 'Promotion',
    type: 'floating_badge',
    priority: 'promotion',
    imageUrl: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=800&q=80',
    title: '🎁 Free Holiday Client Booking & Marketing Toolkit',
    message: 'Get your holiday season fully booked! Download our pre-built Instagram graphics, client SMS templates, and holiday package pricing guides designed by master groomers.',
    actionLabel: 'Download Free Marketing Kit',
    actionUrl: 'https://pawbookpro.com/resources/holiday-kit',
    actionTarget: '_blank',
  },
  {
    id: 'tmpl-06',
    category: 'Feature Release',
    type: 'toast_stack',
    priority: 'update',
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
    title: '📱 PawBook Mobile Companion App Now Available',
    message: 'Your bathers and stylists can now review their daily dog schedules, view coat notes, and snap before/after transformation photos directly on iOS and Android.',
    actionLabel: 'Download on App Store',
    actionUrl: 'https://apps.apple.com',
    actionTarget: '_blank',
  },
  {
    id: 'tmpl-07',
    category: 'Alert & Maintenance',
    type: 'banner',
    priority: 'urgent',
    title: '🛡️ Security Notice: Review Staff Access Roles',
    message: 'We recommend reviewing employee permissions to ensure checkout registers and financial exports are only accessible to senior team members.',
    actionLabel: 'Manage Groomers & Roles',
    actionUrl: 'staff',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-08',
    category: 'Milestone',
    type: 'popup',
    priority: 'info',
    imageUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80',
    title: '🎉 Studio Milestone: 1,000+ Happy Paws Groomed!',
    message: 'Congratulations on reaching 1,000 completed grooming appointments! Your salon is among the top 5% of thriving pet studios on the PawBook platform.',
    actionLabel: 'View Studio Analytics',
    actionUrl: 'revenue',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-09',
    category: 'Tips & Guides',
    type: 'push',
    priority: 'info',
    title: '📊 Month-End Financial Audit & Tax CSV Ready',
    message: 'Your monthly revenue breakdown, groomer commission totals, and retail product sales are reconciled. Export your CSV report for accounting with 1 click.',
    actionLabel: 'Open Revenue & Stats',
    actionUrl: 'revenue',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-10',
    category: 'Alert & Maintenance',
    type: 'drawer',
    priority: 'warning',
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=80',
    title: '💉 Upcoming Rabies Vaccine Expirations Detected',
    message: 'Several client pets on your schedule have rabies certificates expiring within 14 days. Review your compliance dashboard to dispatch automated reminder alerts.',
    actionLabel: 'Open Vaccine Alerts',
    actionUrl: 'alerts',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-11',
    category: 'Tips & Guides',
    type: 'ticker',
    priority: 'info',
    title: '💡 Salon Growth Tip: Blueberry Facials & Paw Balms',
    message: 'Salons offering blueberry facial add-ons and paw balm treatments report an average $18 higher ticket average per appointment. Add them to your menu!',
    actionLabel: 'Configure Services Menu',
    actionUrl: 'services',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-12',
    category: 'Promotion',
    type: 'banner',
    priority: 'promotion',
    title: '🎁 2-Minute Feedback Survey: Win 3 Months Free Studio Pro',
    message: 'Tell us what features you want next (multi-location sync, cat grooming tiers, or client portal) and get entered to win 3 months of free subscription.',
    actionLabel: 'Take Quick 2-Min Survey',
    actionUrl: 'https://pawbookpro.com/survey',
    actionTarget: '_blank',
  },
  {
    id: 'tmpl-13',
    category: 'Promotion',
    type: 'spotlight_card',
    priority: 'promotion',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
    title: '✂️ Masterclass: Asian Fusion & Teddy Bear Heads',
    message: 'Join Master Stylist Elena Vance this Thursday for a free live masterclass on speed scissoring and modern teddy bear styling. Free for all PawBook studios.',
    actionLabel: 'Reserve Free Masterclass Seat',
    actionUrl: 'https://pawbookpro.com/masterclass',
    actionTarget: '_blank',
  },
  {
    id: 'tmpl-14',
    category: 'Feature Release',
    type: 'floating_badge',
    priority: 'update',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67e557b649?auto=format&fit=crop&w=800&q=80',
    title: '💳 Dynamic QR Invoicing & Tap-to-Pay Ready',
    message: 'Show instant payment QR codes on your salon tablet or phone. Customers can scan to pay tips and invoices via Apple Pay, Google Pay, and cards with zero hardware cost.',
    actionLabel: 'Explore Invoices & QR',
    actionUrl: 'invoices',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-15',
    category: 'Alert & Maintenance',
    type: 'modal_takeover',
    priority: 'urgent',
    imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
    title: '⏳ Trial Account Status: 3 Days Remaining',
    message: 'Your 14-day web trial will conclude in 3 days. Upgrade your license today to preserve all your pet records, appointments, groomer rosters, and custom theme settings.',
    actionLabel: 'Upgrade License Plan Now',
    actionUrl: 'https://pawbookpro.com/upgrade',
    actionTarget: '_blank',
  },
  // 16 NEW HIGH-IMPACT READY-MADE TEMPLATES
  {
    id: 'tmpl-16',
    category: 'Alert & Maintenance',
    type: 'sms_text',
    priority: 'urgent',
    title: '📱 [SMS Alert] Unrecognized Device Login Detected',
    message: 'Security Alert: A new login to your Paw Grooming account was detected from an unrecognized device (Safari on iOS). If this was not you, ban this device immediately from your admin console.',
    actionLabel: 'Review Device Sessions',
    actionUrl: 'settings',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-17',
    category: 'Feature Release',
    type: 'whatsapp_msg',
    priority: 'update',
    imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
    title: '💬 Automated WhatsApp 24-Hr Grooming Reminders',
    message: 'Your clients now automatically receive a branded WhatsApp message 24 hours prior to their grooming slot with 1-click confirmation and directions to your studio.',
    actionLabel: 'Configure WhatsApp Bot',
    actionUrl: 'calendar',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-18',
    category: 'Tips & Guides',
    type: 'email_digest',
    priority: 'info',
    title: '📧 Weekly Studio Performance Digest & Groomer Leaderboard',
    message: 'Your weekly recap is ready: 48 appointments completed, $4,850 in grooming revenue, 98% 5-star satisfaction rating. Stylist of the week: Rachel Adams (18 grooms).',
    actionLabel: 'View Detailed Revenue Breakdown',
    actionUrl: 'revenue',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-19',
    category: 'Alert & Maintenance',
    type: 'system_tray_fcm',
    priority: 'warning',
    imageUrl: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80',
    title: '🔔 6 Overdue Invoices Requiring Follow-Up',
    message: '6 client invoices remain unpaid past the 7-day payment window. Send automated payment links and QR codes to client phones in 1 tap.',
    actionLabel: 'Open Invoices Manager',
    actionUrl: 'invoices',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-20',
    category: 'Promotion',
    type: 'floating_dock',
    priority: 'promotion',
    imageUrl: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&w=800&q=80',
    title: '🌟 Spring Shedding Special: De-Shedding Treatment Campaign',
    message: 'Launch a Spring Fur Shedding blast to your top 100 Golden Retriever and Husky clients. Earn an extra $2,400 in high-margin add-ons this month.',
    actionLabel: 'Launch Client SMS Blast',
    actionUrl: 'clients',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-21',
    category: 'Alert & Maintenance',
    type: 'slack_webhook',
    priority: 'urgent',
    title: '💼 [Slack Roster] Groomer Sick Leave & Auto-Reassignment',
    message: 'Stylist Jordan Vance called in sick for Friday. 7 pet bookings have been flagged for rebooking or assignment to Senior Stylist Maya.',
    actionLabel: 'Reassign Appointments',
    actionUrl: 'calendar',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-22',
    category: 'Milestone',
    type: 'discord_webhook',
    priority: 'update',
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=80',
    title: '🏆 Studio VIP Tier Unlocked: Diamond Salon Badge',
    message: 'Your salon has processed over $50,000 in appointments this quarter. You have unlocked priority 24/7 dedicated support and custom branding themes.',
    actionLabel: 'Explore Custom Themes',
    actionUrl: 'settings',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-23',
    category: 'Feature Release',
    type: 'matrix_teams',
    priority: 'update',
    title: '🏢 Microsoft Teams / Multi-Location Sync Enabled',
    message: 'Manage your secondary salon branch from the same unified dashboard. Seamlessly transfer pet medical files and customer loyalty balances between studios.',
    actionLabel: 'View Salon Locations',
    actionUrl: 'business',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-24',
    category: 'Tips & Guides',
    type: 'telegram_bot',
    priority: 'info',
    title: '🤖 Telegram Daily Grooming Schedule Dispatch',
    message: 'Each morning at 07:30, your groomers can receive their daily dog lineup, coat notes, breed cuts, and special handling instructions right on Telegram.',
    actionLabel: 'Enable Staff Telegram Bot',
    actionUrl: 'staff',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-25',
    category: 'Alert & Maintenance',
    type: 'voice_tts',
    priority: 'urgent',
    title: '🔊 Voice Call & Audio Alert: Emergency Studio Weather Closure',
    message: 'Severe weather alert issued for your area. Notify all today booked clients via automated voice calls and reschedule appointments without penalties.',
    actionLabel: 'Send Studio Closure Alert',
    actionUrl: 'calendar',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-26',
    category: 'Feature Release',
    type: 'inbox_badge_modal',
    priority: 'update',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
    title: '📬 Studio Inbox: Client Photo Transformation Uploads',
    message: 'Clients can now view high-definition Before & After grooming transformation photos on their private invoice link and share them directly to Instagram Stories.',
    actionLabel: 'Open Transformation Gallery',
    actionUrl: 'gallery',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-27',
    category: 'Promotion',
    type: 'spotlight_card',
    priority: 'promotion',
    imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80',
    title: '🎁 Paws VIP Loyalty: Double Points Weekend Campaign',
    message: 'Activate double points weekend on all full grooming packages to fill Monday and Tuesday morning slots. Boost off-peak occupancy by 45%.',
    actionLabel: 'Activate Loyalty Promotion',
    actionUrl: 'loyalty',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-28',
    category: 'Alert & Maintenance',
    type: 'ticker',
    priority: 'warning',
    title: '⚠️ 12 Pet Rabies Certificates Expiring Next Week',
    message: 'Automated compliance reminder: 12 registered dogs require updated rabies vaccination records before their next scheduled bath or haircut.',
    actionLabel: 'Review Medical Alerts',
    actionUrl: 'alerts',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-29',
    category: 'Tips & Guides',
    type: 'drawer',
    priority: 'info',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
    title: '💡 Smart Pricing Guide: Doodles & Double Coats',
    message: 'Matting fees and blow-dry surcharge guidelines based on real data from 500+ top-earning salons. Download our free pricing worksheet.',
    actionLabel: 'Update Grooming Services',
    actionUrl: 'services',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-30',
    category: 'Milestone',
    type: 'toast_stack',
    priority: 'update',
    title: '🎉 100% 5-Star Google Review Streak Reached!',
    message: 'Your salon has earned 25 consecutive 5-star reviews this month. Your studio profile is now featured at the top of local pet searches.',
    actionLabel: 'View Client CRM',
    actionUrl: 'clients',
    actionTarget: '_self',
  },
  {
    id: 'tmpl-31',
    category: 'Alert & Maintenance',
    type: 'banner',
    priority: 'urgent',
    title: '🔒 Single-Device Security Mode Activated for Your Profile',
    message: 'Your account is configured for strict single-device access. Any new login on a separate browser or mobile will safely terminate prior active sessions.',
    actionLabel: 'Security Settings',
    actionUrl: 'settings',
    actionTarget: '_self',
  }
];
