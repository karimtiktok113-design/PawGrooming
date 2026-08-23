import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  DashboardThemeId, 
  DashboardLayoutId, 
  SidebarStyleId, 
  HeaderStyleId, 
  DashboardSectionKey, 
  ClientBusinessProfile,
  RealtimeSimulationEvent,
  ThemeDefinition,
  DashboardLayoutDefinition
} from '../types/dashboardSystem';
import { 
  DASHBOARD_THEMES, 
  DASHBOARD_LAYOUTS, 
  INITIAL_CLIENT_PROFILES, 
  ALL_DASHBOARD_SECTIONS 
} from '../data/dashboardThemesData';
import { useApp } from './AppContext';
import confetti from 'canvas-confetti';

interface DashboardSystemContextType {
  // Theme & Layout state
  currentTheme: DashboardThemeId;
  setTheme: (themeId: DashboardThemeId) => void;
  currentThemeDef: ThemeDefinition;
  
  currentLayout: DashboardLayoutId;
  setLayout: (layoutId: DashboardLayoutId) => void;
  currentLayoutDef: DashboardLayoutDefinition;

  sidebarStyle: SidebarStyleId;
  setSidebarStyle: (style: SidebarStyleId) => void;

  headerStyle: HeaderStyleId;
  setHeaderStyle: (style: HeaderStyleId) => void;

  // Multi-Client Profile State
  clientProfiles: ClientBusinessProfile[];
  activeClientProfile: ClientBusinessProfile;
  switchClientProfile: (profileId: string) => void;
  updateActiveClientProfile: (updates: Partial<ClientBusinessProfile>) => void;
  saveProfilePreset: (profileId: string, theme: DashboardThemeId, layout: DashboardLayoutId) => void;

  // Dynamic Section Toggles
  enabledSections: Record<DashboardSectionKey, boolean>;
  toggleSection: (sectionKey: DashboardSectionKey) => void;
  setAllSections: (sections: Record<DashboardSectionKey, boolean>) => void;
  resetSectionsToLayoutDefault: () => void;

  // Real-time Database Synchronization & Event Simulator
  realtimeEvents: RealtimeSimulationEvent[];
  triggerSimulationEvent: (type: 'check_in' | 'payment' | 'booking' | 'vaccine_alert' | 'status_change' | 'inventory_restock') => void;
  clearEvents: () => void;

  // Admin Studio Drawer / Modal state
  isAdminStudioOpen: boolean;
  setIsAdminStudioOpen: (open: boolean) => void;
  activeStudioTab: 'themes' | 'layouts' | 'sections' | 'clients' | 'simulator' | 'architecture';
  setActiveStudioTab: (tab: 'themes' | 'layouts' | 'sections' | 'clients' | 'simulator' | 'architecture') => void;

  // Theme preview modal
  previewThemeModal: ThemeDefinition | null;
  setPreviewThemeModal: (theme: ThemeDefinition | null) => void;
}

const DashboardSystemContext = createContext<DashboardSystemContextType | undefined>(undefined);

export const DashboardSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    showToast, 
    addAppointment, 
    updateAppointmentStatus, 
    appointments, 
    clients, 
    services, 
    staff, 
    inventory,
    restoreInventoryStock
  } = useApp();

  const [clientProfiles, setClientProfiles] = useState<ClientBusinessProfile[]>(INITIAL_CLIENT_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState<string>('client_beverly_hills');

  const activeClientProfile = clientProfiles.find(p => p.id === activeProfileId) || clientProfiles[0];

  const [currentTheme, setCurrentThemeState] = useState<DashboardThemeId>(activeClientProfile.activeTheme);
  const [currentLayout, setCurrentLayoutState] = useState<DashboardLayoutId>(activeClientProfile.activeLayout);
  const [sidebarStyle, setSidebarStyle] = useState<SidebarStyleId>(activeClientProfile.sidebarStyle);
  const [headerStyle, setHeaderStyle] = useState<HeaderStyleId>(activeClientProfile.headerStyle);
  const [enabledSections, setEnabledSections] = useState<Record<DashboardSectionKey, boolean>>(activeClientProfile.enabledSections);

  const [isAdminStudioOpen, setIsAdminStudioOpen] = useState(false);
  const [activeStudioTab, setActiveStudioTab] = useState<'themes' | 'layouts' | 'sections' | 'clients' | 'simulator' | 'architecture'>('themes');
  const [previewThemeModal, setPreviewThemeModal] = useState<ThemeDefinition | null>(null);

  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeSimulationEvent[]>([
    {
      id: 'ev-init-1',
      timestamp: 'Just now',
      type: 'check_in',
      title: 'Pet Arrival Checked In',
      description: 'Bella (Goldendoodle) arrived at Station Bay 1 for Royal Hydro-Bath.',
      petName: 'Bella',
      clientName: 'Sarah Montgomery'
    },
    {
      id: 'ev-init-2',
      timestamp: '2 mins ago',
      type: 'payment',
      title: 'Real-time Payment Synchronized',
      description: 'Invoice #INV-8924 for $145.00 settled via contactless card.',
      amount: 145.00,
      clientName: 'David Miller'
    }
  ]);

  // Apply theme to document element
  const applyThemeToDOM = useCallback((themeId: string) => {
    document.documentElement.setAttribute('data-theme', themeId);
  }, []);

  useEffect(() => {
    applyThemeToDOM(currentTheme);
  }, [currentTheme, applyThemeToDOM]);

  // Set Theme function
  const setTheme = (themeId: DashboardThemeId) => {
    setCurrentThemeState(themeId);
    applyThemeToDOM(themeId);
    // Update active profile in state
    setClientProfiles(prev => prev.map(p => p.id === activeProfileId ? { ...p, activeTheme: themeId } : p));
    showToast(`Theme activated: ${DASHBOARD_THEMES.find(t => t.id === themeId)?.name || themeId}`, 'success');
  };

  // Set Layout function
  const setLayout = (layoutId: DashboardLayoutId) => {
    setCurrentLayoutState(layoutId);
    const layoutDef = DASHBOARD_LAYOUTS.find(l => l.id === layoutId);
    if (layoutDef) {
      // Auto enable default sections of this layout
      const newSections = { ...enabledSections };
      ALL_DASHBOARD_SECTIONS.forEach(s => {
        newSections[s.key] = layoutDef.defaultSections.includes(s.key);
      });
      setEnabledSections(newSections);
    }
    setClientProfiles(prev => prev.map(p => p.id === activeProfileId ? { ...p, activeLayout: layoutId } : p));
    showToast(`Layout switched: ${layoutDef?.name || layoutId}`, 'info');
  };

  // Switch Client Profile
  const switchClientProfile = (profileId: string) => {
    const target = clientProfiles.find(p => p.id === profileId);
    if (target) {
      setActiveProfileId(profileId);
      setCurrentThemeState(target.activeTheme);
      setCurrentLayoutState(target.activeLayout);
      setSidebarStyle(target.sidebarStyle);
      setHeaderStyle(target.headerStyle);
      setEnabledSections(target.enabledSections);
      applyThemeToDOM(target.activeTheme);
      showToast(`Switched client workspace: ${target.name}`, 'info');
    }
  };

  // Update profile
  const updateActiveClientProfile = (updates: Partial<ClientBusinessProfile>) => {
    setClientProfiles(prev => prev.map(p => p.id === activeProfileId ? { ...p, ...updates } : p));
    if (updates.activeTheme) {
      setCurrentThemeState(updates.activeTheme);
      applyThemeToDOM(updates.activeTheme);
    }
    if (updates.activeLayout) setCurrentLayoutState(updates.activeLayout);
    if (updates.sidebarStyle) setSidebarStyle(updates.sidebarStyle);
    if (updates.headerStyle) setHeaderStyle(updates.headerStyle);
    if (updates.enabledSections) setEnabledSections(updates.enabledSections);
    showToast('Client profile preferences updated', 'success');
  };

  // Save profile preset
  const saveProfilePreset = (profileId: string, theme: DashboardThemeId, layout: DashboardLayoutId) => {
    setClientProfiles(prev => prev.map(p => p.id === profileId ? { ...p, activeTheme: theme, activeLayout: layout } : p));
    showToast('Saved theme & layout preset to client profile', 'success');
  };

  // Toggle Section
  const toggleSection = (sectionKey: DashboardSectionKey) => {
    setEnabledSections(prev => {
      const updated = { ...prev, [sectionKey]: !prev[sectionKey] };
      // Sync back to active profile
      setClientProfiles(profiles => profiles.map(p => p.id === activeProfileId ? {
        ...p,
        enabledSections: updated
      } : p));
      return updated;
    });
  };

  const setAllSections = (sections: Record<DashboardSectionKey, boolean>) => {
    setEnabledSections(sections);
    setClientProfiles(profiles => profiles.map(p => p.id === activeProfileId ? {
      ...p,
      enabledSections: sections
    } : p));
  };

  const resetSectionsToLayoutDefault = () => {
    const layoutDef = DASHBOARD_LAYOUTS.find(l => l.id === currentLayout);
    if (layoutDef) {
      const newSections: Record<DashboardSectionKey, boolean> = {} as any;
      ALL_DASHBOARD_SECTIONS.forEach(s => {
        newSections[s.key] = layoutDef.defaultSections.includes(s.key);
      });
      setEnabledSections(newSections);
      showToast('Reset sections to layout defaults', 'info');
    }
  };

  // Real-time Event Simulator: Mutates live DB data to prove real-time synchronization
  const triggerSimulationEvent = (type: 'check_in' | 'payment' | 'booking' | 'vaccine_alert' | 'status_change' | 'inventory_restock') => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const randomId = 'sim-' + Math.random().toString(36).substring(2, 7);

    if (type === 'check_in') {
      const pendingAppt = appointments.find(a => a.status === 'booked' || a.status === 'confirmed');
      const pet = clients.find(c => c.id === pendingAppt?.clientId) || clients[0];
      if (pendingAppt) {
        updateAppointmentStatus(pendingAppt.id, 'confirmed');
      }
      const newEvent: RealtimeSimulationEvent = {
        id: randomId,
        timestamp: nowStr,
        type: 'check_in',
        title: 'Pet Arrival Checked In',
        description: `${pet?.name || 'Milo'} (${pet?.breed || 'Golden Retriever'}) just arrived and was checked into Hydro-Bath Station 2.`,
        petName: pet?.name || 'Milo',
        clientName: pet?.owner || 'Jessica Vance'
      };
      setRealtimeEvents(prev => [newEvent, ...prev.slice(0, 19)]);
      showToast(`Real-Time Sync: ${newEvent.description}`, 'success');
    } else if (type === 'payment') {
      const amount = Math.floor(Math.random() * 90) + 85;
      const pet = clients[Math.floor(Math.random() * clients.length)];
      const newEvent: RealtimeSimulationEvent = {
        id: randomId,
        timestamp: nowStr,
        type: 'payment',
        title: 'Live Payment Reconciled',
        description: `Payment of $${amount}.00 settled for ${pet.name}'s Full Groom & Spa Package.`,
        amount: amount,
        petName: pet.name,
        clientName: pet.owner
      };
      setRealtimeEvents(prev => [newEvent, ...prev.slice(0, 19)]);
      showToast(`Real-Time Sync: +$${amount}.00 synchronized to revenue metrics`, 'success');
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 }
        });
      } catch (e) {
        // ignore
      }
    } else if (type === 'booking') {
      const randomClient = clients[Math.floor(Math.random() * clients.length)];
      const randomService = services[0];
      const randomStaff = staff[0];
      const todayISO = new Date().toISOString().split('T')[0];
      addAppointment({
        clientId: randomClient.id,
        serviceId: randomService.id,
        staffId: randomStaff.id,
        date: todayISO,
        start: '15:30',
        end: '16:45',
        status: 'booked',
        notes: 'Live instant booking via online client portal'
      });
      const newEvent: RealtimeSimulationEvent = {
        id: randomId,
        timestamp: nowStr,
        type: 'booking',
        title: 'New Online Walk-in Booked',
        description: `New appointment created for ${randomClient.name} (${randomClient.owner}) at 3:30 PM today.`,
        petName: randomClient.name,
        clientName: randomClient.owner
      };
      setRealtimeEvents(prev => [newEvent, ...prev.slice(0, 19)]);
      showToast(`Real-Time Sync: Appointment queue updated instantaneously`, 'info');
    } else if (type === 'vaccine_alert') {
      const pet = clients.find(c => c.rabiesExpiry) || clients[0];
      const newEvent: RealtimeSimulationEvent = {
        id: randomId,
        timestamp: nowStr,
        type: 'vaccine_alert',
        title: 'Rabies Booster Compliance Flag',
        description: `Automatic health alert flagged for ${pet.name}. SMS booster reminder dispatched to ${pet.owner}.`,
        petName: pet.name,
        clientName: pet.owner
      };
      setRealtimeEvents(prev => [newEvent, ...prev.slice(0, 19)]);
      showToast(`Health Alert: Rabies compliance sync flagged for ${pet.name}`, 'warning');
    } else if (type === 'inventory_restock') {
      const restockItem = inventory[0];
      if (restockItem) {
        restoreInventoryStock([{ itemId: restockItem.id, quantity: 12 }]);
      }
      const newEvent: RealtimeSimulationEvent = {
        id: randomId,
        timestamp: nowStr,
        type: 'inventory_restock',
        title: 'Inventory Supply Restocked',
        description: `Restocked 12 units of ${restockItem?.name || 'Organic Oatmeal Shampoo'}. Stock level safe.`,
      };
      setRealtimeEvents(prev => [newEvent, ...prev.slice(0, 19)]);
      showToast(`Real-Time Sync: Inventory stock updated automatically`, 'success');
    } else if (type === 'status_change') {
      const activeAppt = appointments.find(a => a.status === 'confirmed') || appointments[0];
      if (activeAppt) {
        updateAppointmentStatus(activeAppt.id, 'completed');
      }
      const pet = clients.find(c => c.id === activeAppt?.clientId) || clients[0];
      const newEvent: RealtimeSimulationEvent = {
        id: randomId,
        timestamp: nowStr,
        type: 'status_change',
        title: 'Grooming Finished - Ready for Pickup',
        description: `${pet.name}'s styling is complete. Auto SMS sent to ${pet.owner} for pickup.`,
        petName: pet.name,
        clientName: pet.owner
      };
      setRealtimeEvents(prev => [newEvent, ...prev.slice(0, 19)]);
      showToast(`Operational Update: ${pet.name} is ready for pickup!`, 'success');
    }
  };

  const clearEvents = () => setRealtimeEvents([]);

  const currentThemeDef = DASHBOARD_THEMES.find(t => t.id === currentTheme) || DASHBOARD_THEMES[0];
  const currentLayoutDef = DASHBOARD_LAYOUTS.find(l => l.id === currentLayout) || DASHBOARD_LAYOUTS[0];

  return (
    <DashboardSystemContext.Provider
      value={{
        currentTheme,
        setTheme,
        currentThemeDef,
        currentLayout,
        setLayout,
        currentLayoutDef,
        sidebarStyle,
        setSidebarStyle,
        headerStyle,
        setHeaderStyle,
        clientProfiles,
        activeClientProfile,
        switchClientProfile,
        updateActiveClientProfile,
        saveProfilePreset,
        enabledSections,
        toggleSection,
        setAllSections,
        resetSectionsToLayoutDefault,
        realtimeEvents,
        triggerSimulationEvent,
        clearEvents,
        isAdminStudioOpen,
        setIsAdminStudioOpen,
        activeStudioTab,
        setActiveStudioTab,
        previewThemeModal,
        setPreviewThemeModal
      }}
    >
      {children}
    </DashboardSystemContext.Provider>
  );
};

export const useDashboardSystem = () => {
  const context = useContext(DashboardSystemContext);
  if (!context) {
    throw new Error('useDashboardSystem must be used within a DashboardSystemProvider');
  }
  return context;
};
