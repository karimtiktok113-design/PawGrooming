import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ViewMode, 
  CalendarMode, 
  Client, 
  VaccineRecord,
  Service, 
  Package, 
  Staff, 
  Appointment, 
  PurchasedRetailItem,
  InventoryItem, 
  GiftCard, 
  Expense, 
  WaitlistItem, 
  Transformation, 
  LoyaltyRedemption, 
  Settings,
  AppointmentStatus
} from '../types';
import { 
  INITIAL_CLIENTS, 
  INITIAL_SERVICES, 
  INITIAL_PACKAGES, 
  INITIAL_STAFF, 
  INITIAL_APPOINTMENTS, 
  INITIAL_INVENTORY, 
  INITIAL_GIFTCARDS, 
  INITIAL_EXPENSES, 
  INITIAL_WAITLIST, 
  INITIAL_TRANSFORMATIONS, 
  INITIAL_REDEMPTIONS,
  INITIAL_SETTINGS,
  getFixedToday,
  formatISO
} from '../data/initialData';
import { formatPrice as formatPriceUtil, getCurrencySymbol } from '../utils/format';
import { formatShortInvoiceNumber } from '../utils/invoice';
import { useAuth } from './AuthContext';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  view: ViewMode;
  setView: (v: ViewMode) => void;
  calendarMode: CalendarMode;
  setCalendarMode: (m: CalendarMode) => void;
  calendarDate: Date;
  setCalendarDate: (d: Date) => void;
  selectedStaffId: string;
  setSelectedStaffId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  
  clients: Client[];
  services: Service[];
  packages: Package[];
  staff: Staff[];
  appointments: Appointment[];
  inventory: InventoryItem[];
  giftCards: GiftCard[];
  expenses: Expense[];
  waitlist: WaitlistItem[];
  transformations: Transformation[];
  redemptions: LoyaltyRedemption[];
  settings: Settings;

  // Currency & Theme formatting helpers
  formatPrice: (amount: number) => string;
  currencySymbol: string;
  
  toasts: ToastMessage[];
  showToast: (text: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  // Modals state helper
  activeModal: string | null;
  modalData: any;
  openModal: (modalName: string, data?: any) => void;
  closeModal: () => void;
  confirmDelete: (options: {
    title?: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  }) => void;

  // CRUD Actions
  addAppointment: (appt: Omit<Appointment, 'id'>) => Appointment;
  updateAppointmentStatus: (id: string, status: AppointmentStatus, retail?: number, purchasedItems?: PurchasedRetailItem[]) => void;
  updateAppointment: (id: string, appt: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  deductInventoryStock: (items: { itemId: string; quantity: number }[]) => void;
  restoreInventoryStock: (items: { itemId: string; quantity: number }[]) => void;

  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'points' | 'photos'>) => Client;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addVaccineRecord: (clientId: string, record: Omit<VaccineRecord, 'id'>) => void;
  deleteVaccineRecord: (clientId: string, recordId: string) => void;

  addService: (svc: Omit<Service, 'id'>) => Service;
  updateService: (id: string, svc: Partial<Service>) => void;
  deleteService: (id: string) => void;

  addPackage: (pkg: Omit<Package, 'id'>) => Package;
  deletePackage: (id: string) => void;

  addStaff: (st: Omit<Staff, 'id'>) => Staff;
  updateStaff: (id: string, st: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;

  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => InventoryItem;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;

  addGiftCard: (gc: Omit<GiftCard, 'id' | 'issued'>) => GiftCard;
  redeemGiftCard: (code: string, amount: number) => { success: boolean; message: string; remainingBalance: number };
  reloadGiftCard: (id: string, additionalAmount: number) => void;
  deleteGiftCard: (id: string) => void;
  addExpense: (exp: Omit<Expense, 'id'>) => Expense;
  deleteExpense: (id: string) => void;

  addWaitlist: (wl: Omit<WaitlistItem, 'id' | 'created'>) => WaitlistItem;
  deleteWaitlist: (id: string) => void;

  addTransformation: (tr: Omit<Transformation, 'id'>) => Transformation;
  deleteTransformation: (id: string) => void;

  redeemPoints: (
    clientId: string,
    rewardTitle: string,
    pointsNeeded: number,
    discountType?: 'percent' | 'fixed' | 'free_service',
    discountValue?: number,
    setApplied?: boolean
  ) => string | null;
  createPromoCode: (
    clientId: string,
    rewardTitle: string,
    discountType: 'percent' | 'fixed' | 'free_service',
    discountValue: number,
    pointsNeeded?: number,
    setApplied?: boolean,
    customCode?: string
  ) => LoyaltyRedemption | null;
  deletePromoCode: (idOrCode: string) => void;
  setVoucherAppliedStatus: (code: string, status: 'active' | 'applied' | 'used') => void;
  applyVoucherCode: (code: string, subtotal: number, clientId?: string) => { valid: boolean; discountAmount: number; title: string; message: string; voucher?: LoyaltyRedemption };
  markVoucherAsUsed: (code: string, appointmentId: string) => void;

  updateSettings: (newSettings: Partial<Settings>) => void;
  resetToDemoData: () => void;
  clearAllData: (emptyState?: boolean) => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
}

const STORAGE_KEY = 'pawbook_pro_store_v3';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentProfile, updateClientProfile } = useAuth();

  const [view, setView] = useState<ViewMode>('dashboard');
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('week');
  const [calendarDate, setCalendarDate] = useState<Date>(getFixedToday());
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [packages, setPackages] = useState<Package[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_packages');
    return saved ? JSON.parse(saved) : INITIAL_PACKAGES;
  });

  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_inventory');
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [giftCards, setGiftCards] = useState<GiftCard[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_giftcards');
    return saved ? JSON.parse(saved) : INITIAL_GIFTCARDS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [waitlist, setWaitlist] = useState<WaitlistItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_waitlist');
    return saved ? JSON.parse(saved) : INITIAL_WAITLIST;
  });

  const [transformations, setTransformations] = useState<Transformation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_transformations');
    return saved ? JSON.parse(saved) : INITIAL_TRANSFORMATIONS;
  });

  const [redemptions, setRedemptions] = useState<LoyaltyRedemption[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_redemptions');
    return saved ? JSON.parse(saved) : INITIAL_REDEMPTIONS;
  });

  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_settings');
    if (saved) {
      try {
        return { ...INITIAL_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        return INITIAL_SETTINGS;
      }
    }
    return INITIAL_SETTINGS;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_packages', JSON.stringify(packages));
  }, [packages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_giftcards', JSON.stringify(giftCards));
  }, [giftCards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_waitlist', JSON.stringify(waitlist));
  }, [waitlist]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_transformations', JSON.stringify(transformations));
  }, [transformations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_redemptions', JSON.stringify(redemptions));
  }, [redemptions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_settings', JSON.stringify(settings));
  }, [settings]);

  // Synchronize settings with ClientProfile customSettings from Firestore
  useEffect(() => {
    if (currentProfile) {
      const cs = currentProfile.customSettings || {};
      setSettings((prev) => {
        const merged: Settings = {
          ...prev,
          name: cs.name || currentProfile.businessName || prev.name,
          salonName: cs.salonName || currentProfile.businessName || prev.salonName,
          email: cs.email || currentProfile.email || prev.email,
          phone: cs.phone || currentProfile.phoneNumber || prev.phone,
          address: cs.address !== undefined ? cs.address : prev.address,
          website: cs.website !== undefined ? cs.website : prev.website,
          photo: cs.photo || prev.photo,
          open: cs.open !== undefined ? cs.open : prev.open,
          close: cs.close !== undefined ? cs.close : prev.close,
          slot: cs.slot !== undefined ? cs.slot : prev.slot,
          currency: cs.currency || prev.currency,
          taxRate: cs.taxRate !== undefined ? cs.taxRate : prev.taxRate,
          colorTheme: (cs.colorTheme as any) || prev.colorTheme,
        };
        if (JSON.stringify(prev) === JSON.stringify(merged)) {
          return prev;
        }
        if (merged.colorTheme) {
          document.documentElement.setAttribute('data-theme', merged.colorTheme);
        }
        return merged;
      });
    }
  }, [
    currentProfile?.profileId, 
    currentProfile?.businessName,
    currentProfile?.email,
    currentProfile?.phoneNumber,
    JSON.stringify(currentProfile?.customSettings)
  ]);

  // Toast Helpers
  const showToast = (text: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = 't_' + Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Modal Helpers
  const openModal = (modalName: string, data?: any) => {
    setActiveModal(modalName);
    setModalData(data || null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  const confirmDelete = ({
    title = 'Confirm Deletion',
    message,
    confirmLabel = 'Delete',
    onConfirm,
  }: {
    title?: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  }) => {
    openModal('confirmModal', {
      title,
      message,
      confirmLabel,
      onConfirm,
    });
  };

  // Single source-of-truth helper for adjusting inventory stock by exact delta
  const adjustInventoryByDelta = (
    prevItems: PurchasedRetailItem[] = [],
    newItems: PurchasedRetailItem[] = []
  ) => {
    // Map of item identifier to net quantity change: (newQty - oldQty)
    const deltaMap = new Map<string, number>();

    // Subtract old quantities
    (prevItems || []).forEach((item) => {
      const key = item.itemId || item.name;
      if (key) {
        const qty = item.quantity || 1;
        deltaMap.set(key, (deltaMap.get(key) || 0) - qty);
      }
    });

    // Add new quantities
    (newItems || []).forEach((item) => {
      const key = item.itemId || item.name;
      if (key) {
        const qty = item.quantity || 1;
        deltaMap.set(key, (deltaMap.get(key) || 0) + qty);
      }
    });

    // Only update inventory if there is an actual net difference
    const nonZeroDeltas = Array.from(deltaMap.entries()).filter(([_, delta]) => delta !== 0);
    if (nonZeroDeltas.length === 0) return;

    setInventory((currentInv) => {
      return currentInv.map((invItem) => {
        let itemDelta = 0;
        for (const [key, delta] of nonZeroDeltas) {
          if (
            invItem.id === key ||
            invItem.name.toLowerCase() === key.toLowerCase()
          ) {
            itemDelta += delta;
          }
        }

        if (itemDelta !== 0) {
          // If delta > 0 (more bought), subtract from stock. If delta < 0 (returned/cancelled), add to stock.
          const newStock = Math.max(0, invItem.stock - itemDelta);
          return { ...invItem, stock: newStock };
        }
        return invItem;
      });
    });
  };

  const deductInventoryStock = (items: { itemId: string; quantity: number }[]) => {
    adjustInventoryByDelta([], items as PurchasedRetailItem[]);
  };

  const restoreInventoryStock = (items: { itemId: string; quantity: number }[]) => {
    adjustInventoryByDelta(items as PurchasedRetailItem[], []);
  };

  // CRUD Functions
  const addAppointment = (apptData: Omit<Appointment, 'id'>) => {
    const id = 'ap_' + Date.now();
    const retailTotal = apptData.purchasedItems && apptData.purchasedItems.length > 0
      ? apptData.purchasedItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)
      : (apptData.retail || 0);

    const newAppt: Appointment = { 
      id, 
      ...apptData,
      retail: retailTotal,
      invoiceNumber: apptData.invoiceNumber || formatShortInvoiceNumber({ id, ...apptData })
    };

    // Deduct stock exactly once for any purchased items
    if (newAppt.purchasedItems && newAppt.purchasedItems.length > 0) {
      adjustInventoryByDelta([], newAppt.purchasedItems);
    }

    // Add loyalty points if completed
    if (newAppt.status === 'completed') {
      const earned = Math.floor((newAppt.price + (newAppt.retail || 0)) * settings.ppd);
      if (earned > 0) {
        setClients((prev) =>
          prev.map((c) => (c.id === newAppt.clientId ? { ...c, points: (c.points || 0) + earned } : c))
        );
      }
    }

    setAppointments((prev) => [newAppt, ...prev]);

    const client = clients.find((c) => c.id === newAppt.clientId);
    const petName = client ? client.name : 'Pet';
    showToast(`Appointment booked for ${petName}!`, 'success');
    return newAppt;
  };

  const updateAppointmentStatus = (
    id: string, 
    status: AppointmentStatus, 
    retail?: number, 
    purchasedItems?: PurchasedRetailItem[]
  ) => {
    const existing = appointments.find((a) => a.id === id);
    if (existing && purchasedItems !== undefined) {
      adjustInventoryByDelta(existing.purchasedItems || [], purchasedItems);
    }

    if (existing && status === 'completed' && existing.status !== 'completed') {
      const retailTotal = purchasedItems !== undefined
        ? purchasedItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)
        : (retail !== undefined ? retail : existing.retail || 0);
      const earned = Math.floor((existing.price + retailTotal) * settings.ppd);
      if (earned > 0) {
        setClients((cList) =>
          cList.map((c) => (c.id === existing.clientId ? { ...c, points: (c.points || 0) + earned } : c))
        );
      }
    }

    setAppointments((prev) => {
      return prev.map((a) => {
        if (a.id === id) {
          const retailTotal = purchasedItems !== undefined
            ? purchasedItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)
            : (retail !== undefined ? retail : a.retail);

          return { 
            ...a, 
            status, 
            retail: retailTotal,
            purchasedItems: purchasedItems !== undefined ? purchasedItems : a.purchasedItems
          };
        }
        return a;
      });
    });
    showToast(`Appointment status updated to ${status}`, 'info');
  };

  const updateAppointment = (id: string, apptData: Partial<Appointment>) => {
    const existing = appointments.find((a) => a.id === id);
    if (existing && apptData.purchasedItems !== undefined) {
      adjustInventoryByDelta(existing.purchasedItems || [], apptData.purchasedItems);
    }

    if (existing && apptData.status === 'completed' && existing.status !== 'completed') {
      const retailTotal = apptData.purchasedItems !== undefined
        ? apptData.purchasedItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)
        : (apptData.retail !== undefined ? apptData.retail : existing.retail || 0);
      const servicePrice = apptData.price !== undefined ? apptData.price : existing.price;
      const earned = Math.floor((servicePrice + retailTotal) * settings.ppd);
      if (earned > 0) {
        setClients((cList) =>
          cList.map((c) => (c.id === existing.clientId ? { ...c, points: (c.points || 0) + earned } : c))
        );
      }
    }

    setAppointments((prev) => {
      return prev.map((a) => {
        if (a.id === id) {
          const retailTotal = apptData.purchasedItems !== undefined
            ? apptData.purchasedItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)
            : (apptData.retail !== undefined ? apptData.retail : a.retail);

          return { ...a, ...apptData, retail: retailTotal };
        }
        return a;
      });
    });
    showToast('Appointment updated', 'success');
  };

  const deleteAppointment = (id: string) => {
    const existing = appointments.find((a) => a.id === id);
    if (existing?.purchasedItems && existing.purchasedItems.length > 0) {
      adjustInventoryByDelta(existing.purchasedItems, []);
    }
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    showToast('Appointment cancelled/removed', 'info');
  };

  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'points' | 'photos'>) => {
    const id = 'cl_' + Date.now();
    const newClient: Client = {
      id,
      ...clientData,
      points: 50, // Welcome bonus points
      photos: [],
      createdAt: formatISO(getFixedToday()),
    };
    setClients((prev) => [newClient, ...prev]);
    showToast(`Client ${newClient.name} (${newClient.owner}) added!`, 'success');
    return newClient;
  };

  const updateClient = (id: string, clientData: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...clientData } : c)));
    showToast('Client details updated', 'success');
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    setAppointments((prev) => prev.filter((a) => a.clientId !== id));
    showToast('Client deleted', 'info');
  };

  const addVaccineRecord = (clientId: string, recordData: Omit<VaccineRecord, 'id'>) => {
    const id = 'vax_' + Date.now();
    const newRecord: VaccineRecord = { id, ...recordData };
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          const updatedSchedule = [newRecord, ...(c.vaccinationSchedule || [])];
          // Also update rabiesExpiry if this vaccine is Rabies
          const isRabies = recordData.vaccineName.toLowerCase().includes('rabies');
          return {
            ...c,
            vaccinationSchedule: updatedSchedule,
            ...(isRabies ? { rabiesExpiry: recordData.nextDueDate } : {})
          };
        }
        return c;
      })
    );
    showToast(`Vaccination schedule added for ${newRecord.vaccineName}!`, 'success');
  };

  const deleteVaccineRecord = (clientId: string, recordId: string) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          return {
            ...c,
            vaccinationSchedule: (c.vaccinationSchedule || []).filter((v) => v.id !== recordId)
          };
        }
        return c;
      })
    );
    showToast('Vaccine record removed', 'info');
  };

  const addService = (svcData: Omit<Service, 'id'>) => {
    const id = 'sv_' + Date.now();
    const newSvc: Service = { id, ...svcData };
    setServices((prev) => [...prev, newSvc]);
    showToast(`Service "${newSvc.name}" added`, 'success');
    return newSvc;
  };

  const updateService = (id: string, svcData: Partial<Service>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...svcData } : s)));
    showToast('Service updated', 'success');
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    showToast('Service removed', 'info');
  };

  const addPackage = (pkgData: Omit<Package, 'id'>) => {
    const id = 'pk_' + Date.now();
    const newPkg: Package = { id, ...pkgData };
    setPackages((prev) => [...prev, newPkg]);
    showToast(`Package "${newPkg.name}" created`, 'success');
    return newPkg;
  };

  const deletePackage = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
    showToast('Package deleted', 'info');
  };

  const addStaff = (stData: Omit<Staff, 'id'>) => {
    const id = 'st_' + Date.now();
    const newSt: Staff = { id, ...stData };
    setStaff((prev) => [...prev, newSt]);
    showToast(`Staff member ${newSt.name} added`, 'success');
    return newSt;
  };

  const updateStaff = (id: string, stData: Partial<Staff>) => {
    setStaff((prev) => prev.map((st) => (st.id === id ? { ...st, ...stData } : st)));
    showToast('Staff schedule updated', 'success');
  };

  const deleteStaff = (id: string) => {
    setStaff((prev) => prev.filter((st) => st.id !== id));
    showToast('Staff member removed', 'info');
  };

  const addInventoryItem = (itemData: Omit<InventoryItem, 'id'>) => {
    const id = 'in_' + Date.now();
    const newItem: InventoryItem = { id, ...itemData };
    setInventory((prev) => [...prev, newItem]);
    showToast(`Product "${newItem.name}" added`, 'success');
    return newItem;
  };

  const updateInventoryItem = (id: string, itemData: Partial<InventoryItem>) => {
    setInventory((prev) => prev.map((item) => (item.id === id ? { ...item, ...itemData } : item)));
    showToast('Inventory updated', 'success');
  };

  const deleteInventoryItem = (id: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
    showToast('Product removed', 'info');
  };

  const addGiftCard = (gcData: Omit<GiftCard, 'id' | 'issued'>) => {
    const id = 'gc_' + Date.now();
    const newGc: GiftCard = {
      id,
      ...gcData,
      issued: formatISO(getFixedToday()),
    };
    setGiftCards((prev) => [newGc, ...prev]);
    showToast(`Gift card ${newGc.code} generated!`, 'success');
    return newGc;
  };

  const redeemGiftCard = (code: string, amount: number) => {
    if (!code || !code.trim()) {
      return { success: false, message: 'Please enter a valid gift card code', remainingBalance: 0 };
    }
    const cleanCode = code.trim().toUpperCase();
    const found = giftCards.find((g) => g.code.toUpperCase() === cleanCode);
    if (!found) {
      return { success: false, message: `Gift card "${code}" was not found`, remainingBalance: 0 };
    }
    if (found.balance <= 0) {
      return { success: false, message: `Gift card ${found.code} has zero remaining balance`, remainingBalance: 0 };
    }

    const deductAmount = Math.min(found.balance, amount);
    const newBalance = Math.round((found.balance - deductAmount) * 100) / 100;

    setGiftCards((prev) =>
      prev.map((g) => (g.id === found.id ? { ...g, balance: newBalance } : g))
    );

    showToast(
      `Applied ${formatPrice(deductAmount)} from Gift Card ${found.code} (Remaining balance: ${formatPrice(newBalance)})`,
      'success'
    );

    return {
      success: true,
      message: `Deducted ${formatPrice(deductAmount)}`,
      remainingBalance: newBalance,
    };
  };

  const reloadGiftCard = (id: string, additionalAmount: number) => {
    setGiftCards((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const newBal = Math.round((g.balance + additionalAmount) * 100) / 100;
          const newTotal = Math.round((g.amount + additionalAmount) * 100) / 100;
          return { ...g, balance: newBal, amount: newTotal };
        }
        return g;
      })
    );
    showToast(`Added ${formatPrice(additionalAmount)} to gift card balance!`, 'success');
  };

  const deleteGiftCard = (id: string) => {
    setGiftCards((prev) => prev.filter((g) => g.id !== id));
    showToast('Gift card deleted', 'info');
  };

  const addExpense = (expData: Omit<Expense, 'id'>) => {
    const id = 'ex_' + Date.now();
    const newExp: Expense = { id, ...expData };
    setExpenses((prev) => [newExp, ...prev]);
    showToast(`Expense recorded ($${newExp.amount.toFixed(2)})`, 'success');
    return newExp;
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast('Expense removed', 'info');
  };

  const addWaitlist = (wlData: Omit<WaitlistItem, 'id' | 'created'>) => {
    const id = 'wl_' + Date.now();
    const newWl: WaitlistItem = {
      id,
      ...wlData,
      created: formatISO(getFixedToday()),
    };
    setWaitlist((prev) => [newWl, ...prev]);
    showToast('Added to waitlist', 'success');
    return newWl;
  };

  const deleteWaitlist = (id: string) => {
    setWaitlist((prev) => prev.filter((w) => w.id !== id));
    showToast('Removed from waitlist', 'info');
  };

  const addTransformation = (trData: Omit<Transformation, 'id'>) => {
    const id = 'tr_' + Date.now();
    const newTr: Transformation = { id, ...trData };
    setTransformations((prev) => [newTr, ...prev]);
    showToast('New Transformation photo added to gallery!', 'success');
    return newTr;
  };

  const deleteTransformation = (id: string) => {
    setTransformations((prev) => prev.filter((t) => t.id !== id));
    showToast('Gallery entry deleted', 'info');
  };

  const formatPrice = (amount: number) => {
    return formatPriceUtil(amount, settings.currency);
  };

  const currencySymbol = getCurrencySymbol(settings.currency);

  const redeemPoints = (
    clientId: string,
    rewardTitle: string,
    pointsNeeded: number,
    discountType: 'percent' | 'fixed' | 'free_service' = 'fixed',
    discountValue: number = 10,
    setApplied: boolean = true
  ) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) {
      showToast('Client / Dog not found', 'error');
      return null;
    }
    if ((client.points || 0) < pointsNeeded) {
      showToast(`Insufficient points! Client has ${client.points || 0} pts, needs ${pointsNeeded} pts.`, 'warning');
      return null;
    }

    // Determine discount value based on title if not explicitly passed
    let discType = discountType;
    let discVal = discountValue;
    if (rewardTitle.includes('%')) {
      discType = 'percent';
      const match = rewardTitle.match(/(\d+)%/);
      discVal = match ? parseInt(match[1], 10) : 10;
    } else if (rewardTitle.includes('$') || rewardTitle.toLowerCase().includes('off')) {
      discType = 'fixed';
      const match = rewardTitle.match(/\$(\d+)/);
      discVal = match ? parseInt(match[1], 10) : (pointsNeeded / 10);
    } else if (rewardTitle.toLowerCase().includes('free teeth')) {
      discType = 'fixed';
      discVal = 12;
    } else if (rewardTitle.toLowerCase().includes('facial') || rewardTitle.toLowerCase().includes('spa')) {
      discType = 'fixed';
      discVal = 18;
    }

    // Deduct points
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, points: Math.max(0, (c.points || 0) - pointsNeeded) } : c))
    );

    const clientPrefix = client.name.toUpperCase().replace(/[^A-Z]/g, '') || 'PERK';
    const voucherCode = `${clientPrefix}-${discType === 'percent' ? `${discVal}OFF` : Math.floor(1000 + Math.random() * 9000)}`;
    
    const newRedemption: LoyaltyRedemption = {
      id: 'red_' + Date.now(),
      clientId,
      rewardTitle,
      points: pointsNeeded,
      code: voucherCode,
      date: formatISO(getFixedToday()),
      discountType: discType,
      discountValue: discVal,
      status: setApplied ? 'applied' : 'active',
      isAutoApplied: setApplied,
    };

    setRedemptions((prev) => [newRedemption, ...prev]);
    showToast(`Redeemed "${rewardTitle}" for ${client.name}! Code ${voucherCode} is set to ${setApplied ? 'APPLIED in checkout' : 'ACTIVE'}.`, 'success');
    return voucherCode;
  };

  const createPromoCode = (
    clientId: string,
    rewardTitle: string,
    discountType: 'percent' | 'fixed' | 'free_service' = 'percent',
    discountValue: number = 15,
    pointsNeeded: number = 0,
    setApplied: boolean = true,
    customCode?: string
  ) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) {
      showToast('Client / Dog not found', 'error');
      return null;
    }

    if (pointsNeeded > 0 && (client.points || 0) < pointsNeeded) {
      showToast(`Insufficient points! Client has ${client.points || 0} pts, needs ${pointsNeeded} pts.`, 'warning');
      return null;
    }

    if (pointsNeeded > 0) {
      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? { ...c, points: Math.max(0, (c.points || 0) - pointsNeeded) } : c))
      );
    }

    const clientPrefix = client.name.toUpperCase().replace(/[^A-Z]/g, '') || 'PROMO';
    const cleanCode = (customCode && customCode.trim())
      ? customCode.trim().toUpperCase()
      : `${clientPrefix}-${discountType === 'percent' ? `${discountValue}OFF` : Math.floor(1000 + Math.random() * 9000)}`;

    const newRedemption: LoyaltyRedemption = {
      id: 'red_' + Date.now(),
      clientId,
      rewardTitle,
      points: pointsNeeded,
      code: cleanCode,
      date: formatISO(getFixedToday()),
      discountType,
      discountValue,
      status: setApplied ? 'applied' : 'active',
      isAutoApplied: setApplied,
    };

    setRedemptions((prev) => [newRedemption, ...prev]);
    showToast(
      `Created promo code ${cleanCode} for ${client.name} (${discountType === 'percent' ? `${discountValue}% Off` : `$${discountValue} Off`}) - Set to ${setApplied ? 'APPLIED in checkout' : 'ACTIVE'}!`,
      'success'
    );
    return newRedemption;
  };

  const setVoucherAppliedStatus = (code: string, status: 'active' | 'applied' | 'used') => {
    const cleanCode = code.trim().toUpperCase();
    setRedemptions((prev) =>
      prev.map((r) =>
        r.code.toUpperCase() === cleanCode ? { ...r, status, isAutoApplied: status === 'applied' } : r
      )
    );
  };

  const applyVoucherCode = (code: string, subtotal: number, clientId?: string) => {
    if (!code || !code.trim()) {
      return { valid: false, discountAmount: 0, title: '', message: 'Please enter a promo code' };
    }
    const cleanCode = code.trim().toUpperCase();

    // Check existing redemptions first
    const found = redemptions.find((r) => r.code.toUpperCase() === cleanCode);
    if (found) {
      if (found.status === 'used') {
        return { valid: false, discountAmount: 0, title: found.rewardTitle, message: `Promo code ${cleanCode} has already been redeemed` };
      }
      if (clientId && found.clientId !== clientId) {
        return { valid: false, discountAmount: 0, title: found.rewardTitle, message: `Promo code ${cleanCode} is specific to another dog/client profile` };
      }

      let discount = 0;
      if (found.discountType === 'percent') {
        discount = Math.round(subtotal * (found.discountValue / 100) * 100) / 100;
      } else {
        discount = Math.min(subtotal, found.discountValue);
      }
      return {
        valid: true,
        discountAmount: discount,
        title: found.rewardTitle,
        message: `Promo applied: ${found.rewardTitle} (-${formatPrice(discount)})`,
        voucher: found,
      };
    }

    // Built-in standard promo codes support
    if (cleanCode === 'WELCOME10' || cleanCode === 'PAWS10') {
      const discount = Math.round(subtotal * 0.1 * 100) / 100;
      return {
        valid: true,
        discountAmount: discount,
        title: '10% Welcome Promo Discount',
        message: `Promo applied: 10% Off (-${formatPrice(discount)})`,
      };
    }

    if (cleanCode === 'SPADAY25' || cleanCode === 'VIP25') {
      const discount = Math.min(subtotal, 25);
      return {
        valid: true,
        discountAmount: discount,
        title: '$25 Spa Day Voucher',
        message: `Promo applied: $25 Off (-${formatPrice(discount)})`,
      };
    }

    return { valid: false, discountAmount: 0, title: '', message: `Invalid or unassigned promo code "${code}"` };
  };

  const deletePromoCode = (idOrCode: string) => {
    setRedemptions((prev) =>
      prev.filter(
        (r) => r.id !== idOrCode && r.code.toUpperCase() !== idOrCode.toUpperCase()
      )
    );
    showToast('Promo code removed from active rewards', 'info');
  };

  const markVoucherAsUsed = (code: string, appointmentId: string) => {
    if (!code) return;
    const cleanCode = code.trim().toUpperCase();
    // A promo code can only be used once: automatically delete it from rewards list
    setRedemptions((prev) => prev.filter((r) => r.code.toUpperCase() !== cleanCode));
    showToast(`Promo code ${cleanCode} applied & archived (single-use)`, 'success');
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    const merged = { ...settings, ...newSettings };
    if (merged.colorTheme) {
      document.documentElement.setAttribute('data-theme', merged.colorTheme);
    }
    setSettings(merged);

    // Synchronize with Firebase Firestore profile customSettings
    if (currentProfile?.profileId) {
      const customSettingsUpdate: Record<string, any> = {
        ...(currentProfile.customSettings || {}),
      };
      if (merged.name !== undefined) customSettingsUpdate.name = merged.name;
      if (merged.salonName || merged.name) customSettingsUpdate.salonName = merged.salonName || merged.name;
      if (merged.email !== undefined) customSettingsUpdate.email = merged.email;
      if (merged.phone !== undefined) customSettingsUpdate.phone = merged.phone;
      if (merged.address !== undefined) customSettingsUpdate.address = merged.address;
      if (merged.website !== undefined) customSettingsUpdate.website = merged.website;
      if (merged.photo !== undefined) customSettingsUpdate.photo = merged.photo;
      if (merged.open !== undefined) customSettingsUpdate.open = merged.open;
      if (merged.close !== undefined) customSettingsUpdate.close = merged.close;
      if (merged.slot !== undefined) customSettingsUpdate.slot = merged.slot;
      if (merged.currency !== undefined) customSettingsUpdate.currency = merged.currency;
      if (merged.taxRate !== undefined) customSettingsUpdate.taxRate = merged.taxRate;
      if (merged.colorTheme !== undefined) customSettingsUpdate.colorTheme = merged.colorTheme;

      updateClientProfile(currentProfile.profileId, {
        businessName: merged.salonName || merged.name || currentProfile.businessName,
        phoneNumber: merged.phone || currentProfile.phoneNumber,
        email: merged.email || currentProfile.email,
        customSettings: customSettingsUpdate
      }).catch((err) => {
        console.warn('Could not sync settings to Firestore ClientProfile:', err);
      });
    }

    showToast('Shop & studio settings saved & synchronized with Firestore!', 'success');
  };

  const resetToDemoData = () => {
    setClients(INITIAL_CLIENTS);
    setServices(INITIAL_SERVICES);
    setPackages(INITIAL_PACKAGES);
    setStaff(INITIAL_STAFF);
    setAppointments(INITIAL_APPOINTMENTS);
    setInventory(INITIAL_INVENTORY);
    setGiftCards(INITIAL_GIFTCARDS);
    setExpenses(INITIAL_EXPENSES);
    setWaitlist(INITIAL_WAITLIST);
    setTransformations(INITIAL_TRANSFORMATIONS);
    setRedemptions(INITIAL_REDEMPTIONS);
    setSettings(INITIAL_SETTINGS);
    
    // Clear storage keys
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(STORAGE_KEY)) {
        localStorage.removeItem(key);
      }
    });

    showToast('Reset to original PawBook Pro demo dataset!', 'info');
  };

  const clearAllData = (emptyState: boolean = true) => {
    if (emptyState) {
      setClients([]);
      setServices([]);
      setPackages([]);
      setStaff([]);
      setAppointments([]);
      setInventory([]);
      setGiftCards([]);
      setExpenses([]);
      setWaitlist([]);
      setTransformations([]);
      setRedemptions([]);
      setSettings(INITIAL_SETTINGS);
    } else {
      setClients(INITIAL_CLIENTS);
      setServices(INITIAL_SERVICES);
      setPackages(INITIAL_PACKAGES);
      setStaff(INITIAL_STAFF);
      setAppointments(INITIAL_APPOINTMENTS);
      setInventory(INITIAL_INVENTORY);
      setGiftCards(INITIAL_GIFTCARDS);
      setExpenses(INITIAL_EXPENSES);
      setWaitlist(INITIAL_WAITLIST);
      setTransformations(INITIAL_TRANSFORMATIONS);
      setRedemptions(INITIAL_REDEMPTIONS);
      setSettings(INITIAL_SETTINGS);
    }
    
    // Clear all localStorage entries
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('Failed to clear localStorage:', e);
    }

    showToast(emptyState ? 'All website data cleared completely!' : 'Reset to original demo dataset!', 'info');
  };

  const exportDataJSON = () => {
    const fullData = {
      clients,
      services,
      packages,
      staff,
      appointments,
      inventory,
      giftCards,
      expenses,
      waitlist,
      transformations,
      redemptions,
      settings,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(fullData, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.clients && parsed.services && parsed.appointments) {
        setClients(parsed.clients);
        setServices(parsed.services);
        if (parsed.packages) setPackages(parsed.packages);
        if (parsed.staff) setStaff(parsed.staff);
        setAppointments(parsed.appointments);
        if (parsed.inventory) setInventory(parsed.inventory);
        if (parsed.giftCards) setGiftCards(parsed.giftCards);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.waitlist) setWaitlist(parsed.waitlist);
        if (parsed.transformations) setTransformations(parsed.transformations);
        if (parsed.redemptions) setRedemptions(parsed.redemptions);
        if (parsed.settings) setSettings(parsed.settings);
        showToast('Successfully imported database!', 'success');
        return true;
      }
      showToast('Invalid data file format', 'error');
      return false;
    } catch (e) {
      showToast('Failed to parse JSON file', 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        view,
        setView,
        calendarMode,
        setCalendarMode,
        calendarDate,
        setCalendarDate,
        selectedStaffId,
        setSelectedStaffId,
        searchQuery,
        setSearchQuery,
        clients,
        services,
        packages,
        staff,
        appointments,
        inventory,
        giftCards,
        expenses,
        waitlist,
        transformations,
        redemptions,
        settings,
        toasts,
        showToast,
        removeToast,
        activeModal,
        modalData,
        openModal,
        closeModal,
        confirmDelete,
        addAppointment,
        updateAppointmentStatus,
        updateAppointment,
        deleteAppointment,
        deductInventoryStock,
        restoreInventoryStock,
        addClient,
        updateClient,
        deleteClient,
        addVaccineRecord,
        deleteVaccineRecord,
        addService,
        updateService,
        deleteService,
        addPackage,
        deletePackage,
        addStaff,
        updateStaff,
        deleteStaff,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addGiftCard,
        redeemGiftCard,
        reloadGiftCard,
        deleteGiftCard,
        addExpense,
        deleteExpense,
        addWaitlist,
        deleteWaitlist,
        addTransformation,
        deleteTransformation,
        redeemPoints,
        createPromoCode,
        deletePromoCode,
        setVoucherAppliedStatus,
        applyVoucherCode,
        markVoucherAsUsed,
        formatPrice,
        currencySymbol,
        updateSettings,
        resetToDemoData,
        clearAllData,
        exportDataJSON,
        importDataJSON,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
