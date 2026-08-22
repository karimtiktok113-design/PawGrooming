export type ViewMode = 
  | 'dashboard' 
  | 'calendar' 
  | 'invoices'
  | 'clients' 
  | 'services' 
  | 'staff' 
  | 'loyalty' 
  | 'alerts' 
  | 'revenue' 
  | 'business' 
  | 'gallery' 
  | 'settings';

export type CalendarMode = 'day' | 'week' | 'month';

export type DogSize = 'toy' | 'small' | 'medium' | 'large' | 'giant';

export type AppointmentStatus = 'booked' | 'confirmed' | 'completed' | 'noshow' | 'cancelled';

export interface VaccineRecord {
  id: string;
  vaccineName: string; // e.g. Rabies, DHPP, Bordetella, Parvovirus, Lyme
  dateAdministered?: string; // 'YYYY-MM-DD'
  nextDueDate: string; // 'YYYY-MM-DD'
  veterinarian?: string;
  batchNo?: string;
  notes?: string;
  status?: 'up_to_date' | 'due_soon' | 'expired';
}

export interface Client {
  id: string;
  name: string; // Dog's name
  owner: string;
  phone: string;
  email: string;
  birthday?: string;
  address?: string;
  breed: string;
  size: DogSize;
  coat: string;
  weight?: string;
  behaviorNotes: string[];
  sensitivities: string;
  careNotes?: string;
  allergies?: string;
  medicalNotes?: string;
  lastCut: string;
  rabiesExpiry: string; // ISO date string
  vaccinationSchedule?: VaccineRecord[];
  freqWeeks: number;
  staffId: string; // Preferred groomer ID
  fav: string; // Preferred service ID
  points: number;
  photos: string[];
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  category: 'fullgroom' | 'bath' | 'tidy' | 'deshed' | 'nails' | 'puppy' | 'addon';
  duration: number; // minutes
  price: number;
  buffer: number; // minutes
  staffIds: string[];
}

export interface Package {
  id: string;
  name: string;
  serviceIds: string[];
  price: number;
  duration: number;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  services: string[];
  commission: number; // percentage (e.g. 45 = 45%)
  salary: number;
  color: string;
  avail: Record<number, [number, number] | null>; // day index (0=Sun, 1=Mon, ...) -> [startHour, endHour] or null
}

export interface PurchasedRetailItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Appointment {
  id: string;
  clientId: string;
  serviceId: string;
  packageId?: string;
  packageName?: string;
  staffId: string;
  date: string; // ISO format 'YYYY-MM-DD'
  start: string; // 'HH:MM'
  duration: number; // minutes
  price: number;
  status: AppointmentStatus;
  retail?: number;
  purchasedItems?: PurchasedRetailItem[];
  notes?: string;
  discountAmount?: number;
  discountCode?: string;
  discountTitle?: string;
  discountType?: 'percent' | 'fixed' | 'free_service';
  discountValue?: number;
  taxRate?: number;
  taxAmount?: number;
  totalAmount?: number;
  invoiceNumber?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  lowAt: number;
}

export interface GiftCard {
  id: string;
  code: string;
  amount: number;
  balance: number;
  note: string;
  issued: string;
}

export interface Expense {
  id: string;
  date: string;
  category: 'supplies' | 'equipment' | 'vehicle' | 'insurance' | 'marketing' | 'other';
  desc: string;
  amount: number;
}

export interface WaitlistItem {
  id: string;
  clientId: string;
  serviceId: string;
  staffId: string;
  pref: string;
  created: string;
}

export interface Transformation {
  id: string;
  petName: string;
  breed: string;
  ownerName: string;
  serviceName: string;
  date: string;
  groomerName: string;
  styleNotes: string;
  beforeImg?: string;
  afterImg?: string;
}

export interface LoyaltyRedemption {
  id: string;
  clientId: string;
  rewardTitle: string;
  points: number;
  code: string;
  date: string;
  discountType: 'percent' | 'fixed' | 'free_service';
  discountValue: number;
  status: 'active' | 'applied' | 'used';
  usedInAppointmentId?: string;
  isAutoApplied?: boolean;
}

export type ColorTheme = 
  | 'terracotta' 
  | 'emerald' 
  | 'ocean' 
  | 'plum' 
  | 'coral' 
  | 'slate'
  | 'nordic'
  | 'lavender'
  | 'rose'
  | 'gold'
  | 'crimson'
  | 'monochrome';

export interface Settings {
  name: string;
  salonName?: string;
  email?: string; // Clinic Email
  website?: string; // Clinic Website
  photo?: string; // Clinic Photo / Logo URL or Base64
  tagline?: string;
  address?: string;
  phone: string;
  open: number; // e.g. 8 (8 AM)
  close: number; // e.g. 18 (6 PM)
  slot: number; // 30 minutes
  ppd: number; // points per dollar
  redeem: number; // points needed per $1 off
  bday: number; // birthday multiplier
  theme: 'light' | 'dark';
  colorTheme?: ColorTheme;
  accent: 'clay' | 'teal' | 'plum' | 'honey';
  invSeq: number;
  taxRate?: number; // 0% to 20% US sales tax rate applied on invoices
  currency: 'USD' | 'GBP' | 'EUR' | 'CAD' | 'AUD' | 'JPY' | 'INR' | 'CHF' | 'AED' | 'SAR' | string;
  onboarded: number;
  mobile: number;
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}
