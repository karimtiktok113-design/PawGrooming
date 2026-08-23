import { 
  DashboardThemeId, 
  ThemeDefinition, 
  DashboardLayoutDefinition, 
  ClientBusinessProfile,
  DashboardSectionKey
} from '../types/dashboardSystem';

export const DASHBOARD_THEMES: ThemeDefinition[] = [
  {
    id: 'luxury',
    name: 'Royal Velvet & Champagne Gold',
    category: 'Luxury',
    description: 'Deep forest velvet emerald background paired with 24k polished gold accents, gilded borders, and regal typography.',
    tag: 'Haute Horlogerie & Pet Spas',
    visualStyle: 'luxury',
    previewColors: {
      bg: '#0F261F',
      sidebar: '#081713',
      primary: '#D4AF37',
      accent: '#F3E5AB',
      card: '#16382E',
      text: '#F7FAFC',
      border: '#2A5A4B'
    },
    fontHeading: 'Cinzel, Playfair Display, serif',
    fontBody: 'Plus Jakarta Sans, sans-serif',
    badges: ['Gold Metallic Accents', 'Gilded Card Borders', 'Executive VIP']
  },
  {
    id: 'minimal',
    name: 'Swiss Clean Slate & Porcelain',
    category: 'Minimalist',
    description: 'Ultra-refined high-whitespace minimalist aesthetic with crisp slate typography, delicate 1px grid dividers, and monochromatic data visualization.',
    tag: 'Modern Scandinavian',
    visualStyle: 'clean',
    previewColors: {
      bg: '#F8FAFC',
      sidebar: '#FFFFFF',
      primary: '#0F172A',
      accent: '#64748B',
      card: '#FFFFFF',
      text: '#0F172A',
      border: '#E2E8F0'
    },
    fontHeading: 'Inter, -apple-system, sans-serif',
    fontBody: 'Inter, -apple-system, sans-serif',
    badges: ['Ultra Whitespace', 'High Contrast Data', 'Zero Noise']
  },
  {
    id: 'dark-modern',
    name: 'Cyber Midnight & Electric Indigo',
    category: 'Dark',
    description: 'Deep midnight obsidian dark mode with glowing indigo and neon cyan chart accents, luminous status rings, and sleek glass surfaces.',
    tag: 'Night Studio & Tech',
    visualStyle: 'dark',
    previewColors: {
      bg: '#090D16',
      sidebar: '#05070D',
      primary: '#6366F1',
      accent: '#06B6D4',
      card: '#111827',
      text: '#F9FAFB',
      border: '#1F2937'
    },
    fontHeading: 'Space Grotesk, sans-serif',
    fontBody: 'Plus Jakarta Sans, sans-serif',
    badges: ['OLED True Dark', 'Luminous Glows', 'Eye Safe']
  },
  {
    id: 'glassmorphism',
    name: 'Frosted Glass & Pastel Aurora',
    category: 'Creative',
    description: 'Multi-layered translucent frosted acrylic panels floating over a soft pastel aurora glow with blur reflections and iridescent borders.',
    tag: 'iOS & macOS Aesthetic',
    visualStyle: 'glass',
    previewColors: {
      bg: '#EDE9FE',
      sidebar: 'rgba(255, 255, 255, 0.45)',
      primary: '#7C3AED',
      accent: '#EC4899',
      card: 'rgba(255, 255, 255, 0.65)',
      text: '#1E1B4B',
      border: 'rgba(255, 255, 255, 0.7)'
    },
    fontHeading: 'Plus Jakarta Sans, sans-serif',
    fontBody: 'Plus Jakarta Sans, sans-serif',
    badges: ['Backdrop Blur 20px', 'Translucent Depth', 'Prismatic Glow']
  },
  {
    id: 'pet-soft',
    name: 'Warm Oat, Rose Paw & Botanical Sage',
    category: 'Nature',
    description: 'Comforting, gentle organic palette designed specifically for pet salons. Warm oat linen canvas, soft blush paw badges, and soothing sage accents.',
    tag: 'Cozy Boutique Pet Salon',
    visualStyle: 'soft',
    previewColors: {
      bg: '#FAF7F2',
      sidebar: '#2B2523',
      primary: '#D97706',
      accent: '#059669',
      card: '#FFFFFF',
      text: '#2B2523',
      border: '#E8E1D5'
    },
    fontHeading: 'Fredoka, Quicksand, sans-serif',
    fontBody: 'Nunito Sans, sans-serif',
    badges: ['Organic Soft Radii', 'Calm Pet Friendly', 'Warm Linen']
  },
  {
    id: 'black-gold',
    name: 'Obsidian Noir & Royal 24K Gold',
    category: 'Luxury',
    description: 'Black-tie luxury aesthetic featuring deep matte obsidian backgrounds, polished warm amber gold gradients, and high-prestige typography.',
    tag: 'Prestige Member Club',
    visualStyle: 'luxury',
    previewColors: {
      bg: '#0A0A0B',
      sidebar: '#000000',
      primary: '#EAB308',
      accent: '#F59E0B',
      card: '#141416',
      text: '#FAFAFA',
      border: '#27272A'
    },
    fontHeading: 'Cinzel, Cormorant Garamond, serif',
    fontBody: 'Plus Jakarta Sans, sans-serif',
    badges: ['24K Polished Gold', 'Matte Obsidian', 'High Prestige']
  },
  {
    id: 'business',
    name: 'Corporate Navy & Precision Steel',
    category: 'Professional',
    description: 'Enterprise-grade corporate management dashboard with crisp structured navy cards, cobalt blue KPIs, and high-density financial ledgers.',
    tag: 'Multi-Location Enterprise',
    visualStyle: 'clean',
    previewColors: {
      bg: '#F1F5F9',
      sidebar: '#0F172A',
      primary: '#2563EB',
      accent: '#0284C7',
      card: '#FFFFFF',
      text: '#0F172A',
      border: '#CBD5E1'
    },
    fontHeading: 'Plus Jakarta Sans, sans-serif',
    fontBody: 'Plus Jakarta Sans, sans-serif',
    badges: ['Enterprise Density', 'Financial Ledger Grid', 'Corporate Blue']
  },
  {
    id: 'ai-saas',
    name: 'Modern AI Studio & Hyper Purple',
    category: 'High-Tech',
    description: 'Futuristic AI SaaS aesthetic with deep cosmos canvas, hyper-violet energy accents, teal spark chips, and intelligent automation indicators.',
    tag: 'Next-Gen Autonomous Salon',
    visualStyle: 'dark',
    previewColors: {
      bg: '#0B0F19',
      sidebar: '#070A11',
      primary: '#8B5CF6',
      accent: '#14B8A6',
      card: '#131B2E',
      text: '#F8FAFC',
      border: '#1E293B'
    },
    fontHeading: 'Space Grotesk, sans-serif',
    fontBody: 'Plus Jakarta Sans, sans-serif',
    badges: ['AI Copilot Glowing Chips', 'Cosmic Gradients', 'Telemetry Radar']
  },
  {
    id: 'nordic',
    name: 'Nordic Forest Spruce & Terracotta',
    category: 'Nature',
    description: 'Scandinavian botanical aesthetic blending deep forest spruce, clean birch white, and warm terracotta artisan accents.',
    tag: 'Eco & Holistic Spa',
    visualStyle: 'soft',
    previewColors: {
      bg: '#F4F7F5',
      sidebar: '#134E4A',
      primary: '#0D9488',
      accent: '#EA580C',
      card: '#FFFFFF',
      text: '#134E4A',
      border: '#D1E7DD'
    },
    fontHeading: 'Cabinet Grotesk, Plus Jakarta Sans, sans-serif',
    fontBody: 'Plus Jakarta Sans, sans-serif',
    badges: ['Eco Spa Spruce', 'Warm Terracotta', 'Botanical Balance']
  },
  {
    id: 'sunset',
    name: 'Sunset Coral & Golden Amber',
    category: 'Creative',
    description: 'Warm, energized sunset gradient theme with vibrant coral pinks, sweet honey amber, and friendly high-spirited typography.',
    tag: 'Vibrant Day Spa',
    visualStyle: 'gradient',
    previewColors: {
      bg: '#FFFBF7',
      sidebar: '#36150F',
      primary: '#FF6B00',
      accent: '#E11D48',
      card: '#FFFFFF',
      text: '#36150F',
      border: '#FED7AA'
    },
    fontHeading: 'Fredoka, Trebuchet MS, sans-serif',
    fontBody: 'Nunito Sans, sans-serif',
    badges: ['Sunset Warmth', 'High Energy', 'Dynamic Gradients']
  },
  {
    id: 'terminal',
    name: 'Executive High-Density Terminal',
    category: 'Professional',
    description: 'Data-dense operational console designed for high-volume pet clinics and groomers. Precision monospace metrics and signal alert LEDs.',
    tag: 'High-Volume Salon Matrix',
    visualStyle: 'terminal',
    previewColors: {
      bg: '#0F172A',
      sidebar: '#020617',
      primary: '#F59E0B',
      accent: '#10B981',
      card: '#1E293B',
      text: '#E2E8F0',
      border: '#334155'
    },
    fontHeading: 'JetBrains Mono, Menlo, monospace',
    fontBody: 'Inter, sans-serif',
    badges: ['Monospace Density', 'Signal LEDs', 'Rapid Dispatch']
  },
  {
    id: 'neobrutalist',
    name: 'Neo-Brutalist Pop Studio',
    category: 'Creative',
    description: 'Bold modern Neo-Brutalist aesthetic featuring thick 2.5px solid black borders, hard shadow offsets (no blur), sunny lemon pills, and punchy lilac.',
    tag: 'Trendy Urban Salon',
    visualStyle: 'neobrutalist',
    previewColors: {
      bg: '#FFFDF5',
      sidebar: '#000000',
      primary: '#A855F7',
      accent: '#FACC15',
      card: '#FFFFFF',
      text: '#000000',
      border: '#000000'
    },
    fontHeading: 'Space Grotesk, sans-serif',
    fontBody: 'Plus Jakarta Sans, sans-serif',
    badges: ['Hard Drop Shadows', '2.5px Solid Borders', 'Pop Colors']
  },
  {
    id: 'lavender',
    name: 'Lavender Mist & Radiant Violet',
    category: 'Creative',
    description: 'Delicate soothing pastel lavender canvas with royal violet navigation and luminous turquoise status chips.',
    tag: 'Aromatherapy Pet Care',
    visualStyle: 'soft',
    previewColors: {
      bg: '#FAF8FF',
      sidebar: '#2E1065',
      primary: '#7C3AED',
      accent: '#06B6D4',
      card: '#FFFFFF',
      text: '#2E1065',
      border: '#DDD6FE'
    },
    fontHeading: 'Plus Jakarta Sans, sans-serif',
    fontBody: 'Nunito Sans, sans-serif',
    badges: ['Aromatherapy Vibe', 'Pastel Violet', 'Gentle Contrast']
  },
  {
    id: 'crimson',
    name: 'Crimson Velvet & Bordeaux Wine',
    category: 'Luxury',
    description: 'Opulent deep crimson red and vintage Bordeaux wine tones with refined sapphire blue accents for high-end boutique grooming clubs.',
    tag: 'Boutique Club Salon',
    visualStyle: 'luxury',
    previewColors: {
      bg: '#FFF6F6',
      sidebar: '#3B0A0A',
      primary: '#DC2626',
      accent: '#3B82F6',
      card: '#FFFFFF',
      text: '#3B0A0A',
      border: '#FECACA'
    },
    fontHeading: 'Cinzel, Playfair Display, serif',
    fontBody: 'Plus Jakarta Sans, sans-serif',
    badges: ['Bordeaux Velvet', 'Opulent Warmth', 'Prestige Badges']
  }
];

export const DASHBOARD_LAYOUTS: DashboardLayoutDefinition[] = [
  {
    id: 'analytics_focused',
    name: 'Analytics & Growth Intelligence',
    tagline: 'Deep Dive Metrics & Predictive Curves',
    description: 'Expansive interactive financial charts, multi-period revenue forecasts, customer cohort curves, average ticket value trends, and service category breakdowns.',
    bestFor: 'Owners & multi-store business directors focusing on margins, revenue growth, and seasonal demand forecasting.',
    defaultSections: ['kpiCards', 'revenueMiniChart', 'todaySchedule', 'groomerCapacity', 'vipClients', 'petSummaryTable'],
    columns: 3,
    highlightIcon: 'TrendingUp'
  },
  {
    id: 'booking_operations',
    name: 'Grooming Bays & Live Operations',
    tagline: 'Hydro-Bath, Tables & Dispatch Command',
    description: 'Real-time grooming station occupancy grid (Bays 1-4, Drying Stations, VIP Grooming Suites), live appointment queue, check-in action bar, and groomer workload balancing.',
    bestFor: 'Salon floor managers, receptionists, and head groomers coordinating active pet arrivals, bathing, styling, and owner pickups.',
    defaultSections: ['stationOccupancy', 'todaySchedule', 'kpiCards', 'groomerCapacity', 'quickActions', 'vaccineAlertsCard'],
    columns: 3,
    highlightIcon: 'Calendar'
  },
  {
    id: 'revenue_financials',
    name: 'Revenue, Billing & Cashflow Ledger',
    tagline: 'Invoicing, Retail Margins & Cashflow',
    description: 'Comprehensive financial matrix highlighting gross earnings, average ticket by pet breed size, invoice payment statuses (Paid, Pending, Overdue), and retail add-on margins.',
    bestFor: 'Finance managers, accountants, and owners looking at daily cash reconciliation and tips distribution.',
    defaultSections: ['revenueMiniChart', 'kpiCards', 'retailInventory', 'todaySchedule', 'petSummaryTable', 'quickActions'],
    columns: 3,
    highlightIcon: 'DollarSign'
  },
  {
    id: 'minimal_digest',
    name: 'Executive Minimalist Digest',
    tagline: 'Clean, Essential & Distraction-Free',
    description: 'Spacious high-impact 4-metric executive summary, today’s critical schedule digest, priority health alerts, and instant one-click actions with zero visual clutter.',
    bestFor: 'Busy studio owners who want immediate answers in under 5 seconds without scrolling.',
    defaultSections: ['kpiCards', 'todaySchedule', 'quickActions', 'vaccineAlertsCard'],
    columns: 2,
    highlightIcon: 'Zap'
  },
  {
    id: 'complete_360',
    name: 'Complete 360° Business Command Center',
    tagline: 'All-in-One Enterprise Master Grid',
    description: 'The master comprehensive operational dashboard displaying all core modules in a balanced, multi-column modular grid with real-time reactive updates.',
    bestFor: 'All-around daily management covering finance, pet records, health alerts, staff, queue, and retail inventory.',
    defaultSections: [
      'kpiCards', 
      'stationOccupancy', 
      'todaySchedule', 
      'revenueMiniChart', 
      'vaccineAlertsCard', 
      'groomerCapacity', 
      'retailInventory', 
      'petSummaryTable', 
      'vipClients',
      'quickActions'
    ],
    columns: 3,
    highlightIcon: 'LayoutGrid'
  },
  {
    id: 'pet_client_crm',
    name: 'VIP Furry Client & Pet CRM Center',
    tagline: 'Pet Profiles, Breed Health & Loyalty',
    description: 'Deep customer relationship view showcasing top VIP pets, breed distribution, rabies and vaccination compliance radar, pet temperament notes, and loyalty point leaderboard.',
    bestFor: 'Client experience managers, VIP coordinators, and groomers focused on customer retention and personalized pet care.',
    defaultSections: ['vipClients', 'petSummaryTable', 'vaccineAlertsCard', 'kpiCards', 'todaySchedule', 'aiSummaryWidget'],
    columns: 3,
    highlightIcon: 'HeartPulse'
  },
  {
    id: 'inventory_retail',
    name: 'Inventory, Supplies & Retail Operations',
    tagline: 'Shampoo Stock, Blades & Retail Sales',
    description: 'Operational inventory monitor tracking organic shampoo barrels, deshedding blades, ear cleaners, gourmet treats, and automated low-stock supplier reorder warnings.',
    bestFor: 'Supply coordinators and retail store managers preventing product stockouts.',
    defaultSections: ['retailInventory', 'kpiCards', 'revenueMiniChart', 'todaySchedule', 'quickActions', 'petSummaryTable'],
    columns: 3,
    highlightIcon: 'Package'
  }
];

export const INITIAL_CLIENT_PROFILES: ClientBusinessProfile[] = [
  {
    id: 'client_beverly_hills',
    name: 'Paws & Bubbles Luxury Spa',
    slug: 'paws-bubbles-beverly',
    tagline: 'Haute Canine Grooming & Hydro-Therapy',
    location: 'Rodeo Drive, Beverly Hills, CA',
    plan: 'Enterprise',
    activeTheme: 'luxury',
    activeLayout: 'complete_360',
    sidebarStyle: 'classic_left',
    headerStyle: 'live_salon_pulse',
    customLogoText: 'Paws & Bubbles Spa',
    currency: 'USD',
    groomingBaysCount: 6,
    primaryGroomer: 'Elena Rostova (Master Stylist)',
    accentBadge: 'VIP Elite Lounge',
    enabledSections: {
      kpiCards: true,
      revenueMiniChart: true,
      todaySchedule: true,
      stationOccupancy: true,
      petSummaryTable: true,
      vaccineAlertsCard: true,
      groomerCapacity: true,
      retailInventory: true,
      vipClients: true,
      quickActions: true,
      aiSummaryWidget: true,
      smsDispatchWidget: true
    }
  },
  {
    id: 'client_austin_tech',
    name: 'CyberPaws Smart Grooming Studio',
    slug: 'cyberpaws-austin',
    tagline: 'AI-Scheduled Modern Pet Salon',
    location: 'South Congress, Austin, TX',
    plan: 'Premium',
    activeTheme: 'ai-saas',
    activeLayout: 'analytics_focused',
    sidebarStyle: 'floating_dock',
    headerStyle: 'kpi_ticker',
    customLogoText: 'CyberPaws Studio',
    currency: 'USD',
    groomingBaysCount: 4,
    primaryGroomer: 'Marcus Chen (Tech Groomer)',
    accentBadge: 'AI Autonomous',
    enabledSections: {
      kpiCards: true,
      revenueMiniChart: true,
      todaySchedule: true,
      stationOccupancy: true,
      petSummaryTable: true,
      vaccineAlertsCard: true,
      groomerCapacity: true,
      retailInventory: false,
      vipClients: true,
      quickActions: true,
      aiSummaryWidget: true,
      smsDispatchWidget: true
    }
  },
  {
    id: 'client_brooklyn_minimal',
    name: 'Bark & Bath Minimalist Co.',
    slug: 'bark-bath-brooklyn',
    tagline: 'Clean Craft Pet Grooming & Deshedding',
    location: 'Williamsburg, Brooklyn, NY',
    plan: 'Pro',
    activeTheme: 'minimal',
    activeLayout: 'minimal_digest',
    sidebarStyle: 'slim_icon_rail',
    headerStyle: 'clean_search',
    customLogoText: 'Bark & Bath Co.',
    currency: 'USD',
    groomingBaysCount: 3,
    primaryGroomer: 'Sarah Jenkins',
    accentBadge: 'Clean Studio',
    enabledSections: {
      kpiCards: true,
      revenueMiniChart: false,
      todaySchedule: true,
      stationOccupancy: false,
      petSummaryTable: false,
      vaccineAlertsCard: true,
      groomerCapacity: false,
      retailInventory: false,
      vipClients: false,
      quickActions: true,
      aiSummaryWidget: false,
      smsDispatchWidget: true
    }
  },
  {
    id: 'client_london_noble',
    name: 'The Noble Hound Parlour',
    slug: 'noble-hound-london',
    tagline: 'Bespoke British Canine Styling',
    location: 'Mayfair, London, UK',
    plan: 'Enterprise',
    activeTheme: 'black-gold',
    activeLayout: 'pet_client_crm',
    sidebarStyle: 'compact_dual',
    headerStyle: 'floating_island',
    customLogoText: 'The Noble Hound',
    currency: 'GBP',
    groomingBaysCount: 5,
    primaryGroomer: 'Lord Alistair Sterling',
    accentBadge: 'Royal Warrant Tier',
    enabledSections: {
      kpiCards: true,
      revenueMiniChart: true,
      todaySchedule: true,
      stationOccupancy: true,
      petSummaryTable: true,
      vaccineAlertsCard: true,
      groomerCapacity: true,
      retailInventory: true,
      vipClients: true,
      quickActions: true,
      aiSummaryWidget: true,
      smsDispatchWidget: false
    }
  },
  {
    id: 'client_seattle_botanical',
    name: 'Evergreen Holistic Dog Spa',
    slug: 'evergreen-seattle',
    tagline: 'Botanical Baths & Anxiety-Free Deshedding',
    location: 'Ballard, Seattle, WA',
    plan: 'Pro',
    activeTheme: 'nordic',
    activeLayout: 'booking_operations',
    sidebarStyle: 'classic_left',
    headerStyle: 'live_salon_pulse',
    customLogoText: 'Evergreen Dog Spa',
    currency: 'USD',
    groomingBaysCount: 4,
    primaryGroomer: 'Chloe Rivera',
    accentBadge: 'Organic Certified',
    enabledSections: {
      kpiCards: true,
      revenueMiniChart: false,
      todaySchedule: true,
      stationOccupancy: true,
      petSummaryTable: true,
      vaccineAlertsCard: true,
      groomerCapacity: true,
      retailInventory: true,
      vipClients: false,
      quickActions: true,
      aiSummaryWidget: true,
      smsDispatchWidget: true
    }
  }
];

export const ALL_DASHBOARD_SECTIONS: { key: DashboardSectionKey; label: string; description: string; category: string }[] = [
  { key: 'kpiCards', label: 'Primary KPI Stat Cards', description: 'Gross revenue, completed appointments, active pet records, and avg ticket.', category: 'Financials' },
  { key: 'revenueMiniChart', label: 'Interactive Revenue & Forecast Chart', description: 'Visual monthly revenue curves, 30-day forecast, and grooming vs retail split.', category: 'Financials' },
  { key: 'stationOccupancy', label: 'Grooming Bays & Hydro-Bath Occupancy', description: 'Visual salon floor station capacity (Bays 1-4, Drying table, VIP Suite).', category: 'Operations' },
  { key: 'todaySchedule', label: 'Live Appointment Queue & Check-In', description: 'Today’s grooming appointment timeline with check-in, in-service & finish statuses.', category: 'Operations' },
  { key: 'groomerCapacity', label: 'Staff Workload & Commission Tracker', description: 'Groomer daily capacity bars, current commission earnings, and next availability.', category: 'Staff' },
  { key: 'petSummaryTable', label: 'Pet & Client Records Explorer', description: 'Furry client directory with breed tags, coat care notes, and owner contacts.', category: 'Clients & Pets' },
  { key: 'vaccineAlertsCard', label: 'Health & Vaccine Compliance Radar', description: 'Rabies, DHPP, Bordetella expiration flags with one-click owner reminder.', category: 'Health' },
  { key: 'vipClients', label: 'VIP Furry Leaderboard', description: 'Top loyalty clients, frequent visitors, and special VIP pet care directives.', category: 'Clients & Pets' },
  { key: 'retailInventory', label: 'Retail Inventory & Stock Alert', description: 'Shampoo bottles, brushes, organic treats inventory levels and reorder alerts.', category: 'Inventory' },
  { key: 'quickActions', label: 'Rapid Operational Action Bar', description: 'One-click shortcuts: Book Walk-in, Check In Pet, Generate Invoice, Restock.', category: 'Shortcuts' },
  { key: 'aiSummaryWidget', label: 'PawGroom AI Grooming Smart Digest', description: 'Autonomous daily summary of salon throughput, sensitive skin alerts, and VIP reminders.', category: 'AI & Automation' },
  { key: 'smsDispatchWidget', label: 'Automated Client SMS Dispatcher', description: 'Live status dispatch log sending pickup alerts and appointment confirmations.', category: 'Communications' }
];

export const SIDEBAR_STYLE_OPTIONS = [
  { id: 'classic_left', name: 'Classic Fixed Left', description: 'Standard high-usability SaaS vertical sidebar with full labels' },
  { id: 'floating_dock', name: 'Floating macOS Dock', description: 'Suspended glass pill dock with smooth icon tooltips' },
  { id: 'slim_icon_rail', name: 'Slim Icon Rail', description: 'Ultra-compact 64px width rail maximizing viewport real estate' },
  { id: 'top_navbar', name: 'Top Horizontal Navbar', description: 'Horizontal header bar for full-width horizontal workflows' },
  { id: 'compact_dual', name: 'Compact Dual Column', description: 'Split navigation separating operations from workspace settings' }
];

export const HEADER_STYLE_OPTIONS = [
  { id: 'clean_search', name: 'Clean Search & Quick Actions', description: 'Direct search input with instant action buttons' },
  { id: 'live_salon_pulse', name: 'Live Salon Floor Pulse', description: 'Active grooming station badges with today turnover metric' },
  { id: 'kpi_ticker', name: 'Real-Time Financial Ticker', description: 'Scrolling live revenue rate and booking speed counter' },
  { id: 'floating_island', name: 'Floating Island Glass Bar', description: 'Suspended translucent header with blurred acrylic backdrop' }
];

