export type DashboardThemeId = 
  | 'luxury'
  | 'minimal'
  | 'dark-modern'
  | 'glassmorphism'
  | 'pet-soft'
  | 'black-gold'
  | 'business'
  | 'ai-saas'
  | 'nordic'
  | 'sunset'
  | 'terminal'
  | 'neobrutalist'
  | 'lavender'
  | 'crimson';

export type DashboardLayoutId = 
  | 'analytics_focused'
  | 'booking_operations'
  | 'revenue_financials'
  | 'minimal_digest'
  | 'complete_360'
  | 'pet_client_crm'
  | 'inventory_retail';

export type SidebarStyleId = 
  | 'classic_left' 
  | 'floating_dock' 
  | 'slim_icon_rail' 
  | 'top_navbar' 
  | 'compact_dual';

export type HeaderStyleId = 
  | 'clean_search' 
  | 'live_salon_pulse' 
  | 'kpi_ticker' 
  | 'floating_island';

export type DashboardSectionKey = 
  | 'kpiCards'
  | 'revenueMiniChart'
  | 'todaySchedule'
  | 'stationOccupancy'
  | 'petSummaryTable'
  | 'vaccineAlertsCard'
  | 'groomerCapacity'
  | 'retailInventory'
  | 'vipClients'
  | 'quickActions'
  | 'aiSummaryWidget'
  | 'smsDispatchWidget';

export interface ThemeDefinition {
  id: DashboardThemeId;
  name: string;
  category: 'Luxury' | 'Minimalist' | 'Dark' | 'Creative' | 'Professional' | 'Nature' | 'High-Tech';
  description: string;
  tag: string;
  visualStyle: 'clean' | 'glass' | 'dark' | 'luxury' | 'neobrutalist' | 'terminal' | 'soft' | 'gradient';
  previewColors: {
    bg: string;
    sidebar: string;
    primary: string;
    accent: string;
    card: string;
    text: string;
    border: string;
  };
  fontHeading: string;
  fontBody: string;
  badges: string[];
}

export interface DashboardLayoutDefinition {
  id: DashboardLayoutId;
  name: string;
  tagline: string;
  description: string;
  bestFor: string;
  defaultSections: DashboardSectionKey[];
  columns: number;
  highlightIcon: string;
}

export interface ClientBusinessProfile {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  location: string;
  plan: 'Starter' | 'Pro' | 'Premium' | 'Enterprise';
  activeTheme: DashboardThemeId;
  activeLayout: DashboardLayoutId;
  sidebarStyle: SidebarStyleId;
  headerStyle: HeaderStyleId;
  customLogoText: string;
  currency: string;
  groomingBaysCount: number;
  enabledSections: Record<DashboardSectionKey, boolean>;
  primaryGroomer: string;
  accentBadge: string;
}

export interface RealtimeSimulationEvent {
  id: string;
  timestamp: string;
  type: 'check_in' | 'payment' | 'booking' | 'vaccine_alert' | 'status_change' | 'inventory_restock';
  title: string;
  description: string;
  amount?: number;
  petName?: string;
  clientName?: string;
}
