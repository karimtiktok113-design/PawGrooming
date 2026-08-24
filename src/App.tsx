import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ViewMode } from './types';
import { isScreenAllowed } from './data/permissionPresets';
import { Sidebar, SidebarMode } from './components/Sidebar';
import { FloatingSidebarTrigger } from './components/common/FloatingSidebarTrigger';
import { Header } from './components/Header';
import { DashboardView } from './components/views/DashboardView';
import { CalendarView } from './components/views/CalendarView';
import { InvoicesView } from './components/views/InvoicesView';
import { ClientsView } from './components/views/ClientsView';
import { ServicesView } from './components/views/ServicesView';
import { StaffView } from './components/views/StaffView';
import { LoyaltyView } from './components/views/LoyaltyView';
import { AlertsView } from './components/views/AlertsView';
import { RevenueView } from './components/views/RevenueView';
import { BusinessView } from './components/views/BusinessView';
import { GalleryView } from './components/views/GalleryView';
import { SettingsView } from './components/views/SettingsView';
import { FeatureLockedScreen } from './components/common/FeatureLockedScreen';
import { ModalContainer } from './components/modals/ModalContainer';
import { Toast } from './components/Toast';
import { MobileNav } from './components/MobileNav';
import { ClientLoginPage as ClientLogin } from './components/auth/ClientLoginPage';
import { AdminLoginPage as AdminLogin } from './components/auth/AdminLoginPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { InactiveAccountModal } from './components/auth/InactiveAccountModal';
import { DeletedAccountModal } from './components/auth/DeletedAccountModal';
import { ClientNotificationRenderer } from './components/notifications/ClientNotificationRenderer';
import { ArrowLeft } from 'lucide-react';

const MainApp: React.FC = () => {
  const { view, settings } = useApp();
  const { currentProfile, isAdmin, returnToAdmin } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Persistent Sidebar Mode (expanded | collapsed | hidden)
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>(() => {
    try {
      const saved = localStorage.getItem('pawbook_sidebar_mode');
      if (saved === 'expanded' || saved === 'collapsed' || saved === 'hidden') {
        return saved;
      }
    } catch (e) {
      // Fallback
    }
    return 'expanded';
  });

  const handleSetSidebarMode = (mode: SidebarMode) => {
    setSidebarMode(mode);
    try {
      localStorage.setItem('pawbook_sidebar_mode', mode);
    } catch (e) {}
  };

  // Keyboard Shortcuts (⌘B or Ctrl+B or [ to toggle sidebar, Esc to close drawers)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSidebarOpen(false);
      }

      // ⌘B or Ctrl+B or '[' to toggle sidebar collapse/expand
      if ((e.metaKey || e.ctrlKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        handleSetSidebarMode(
          sidebarMode === 'expanded' ? 'collapsed' : sidebarMode === 'collapsed' ? 'expanded' : 'expanded'
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarMode]);

  const screenTitles: Record<ViewMode, string> = {
    dashboard: 'Dashboard',
    calendar: 'Appointments Calendar',
    invoices: 'Invoices & Billing',
    clients: 'Pet & Client Records',
    services: 'Services & Add-ons',
    staff: 'Groomers & Staff',
    loyalty: 'Paws Loyalty & Rewards',
    alerts: 'Health & Vaccine Alerts',
    revenue: 'Revenue & Financial Analytics',
    business: 'Activity & Retail Store',
    gallery: 'Transformations Photo Gallery',
    settings: 'Studio Settings',
  };

  const renderView = () => {
    // Check if the current view is permitted for this profile
    if (!isScreenAllowed(currentProfile?.permissions, view)) {
      return <FeatureLockedScreen screenId={view} screenTitle={screenTitles[view]} />;
    }

    switch (view) {
      case 'dashboard':
        return <DashboardView />;
      case 'calendar':
        return <CalendarView />;
      case 'invoices':
        return <InvoicesView />;
      case 'clients':
        return <ClientsView />;
      case 'services':
        return <ServicesView />;
      case 'staff':
        return <StaffView />;
      case 'loyalty':
        return <LoyaltyView />;
      case 'alerts':
        return <AlertsView />;
      case 'revenue':
        return <RevenueView />;
      case 'business':
        return <BusinessView />;
      case 'gallery':
        return <GalleryView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  // Calculate layout offset classes based on sidebar state
  const sidebarOffsetClass = 
    sidebarMode === 'expanded' 
      ? 'lg:pl-[256px]' 
      : sidebarMode === 'collapsed' 
        ? 'lg:pl-[74px]' 
        : 'lg:pl-0';

  return (
    <div 
      data-theme={settings.colorTheme || 'terracotta'} 
      className="min-h-screen w-full flex flex-col antialiased selection:bg-[#FF6B00] selection:text-white transition-colors duration-300 print:bg-white print:p-0 print:m-0 print:block print:min-h-0 print:w-full print:border-none print:shadow-none"
      style={{ backgroundColor: 'var(--app-bg, #FAF8F5)' }}
    >
      {/* Toast Notification Container */}
      <Toast />

      {/* Floating Edge Trigger when desktop sidebar is in Hidden mode */}
      <FloatingSidebarTrigger 
        sidebarMode={sidebarMode} 
        setSidebarMode={handleSetSidebarMode} 
      />

      {/* Interactive Push & Broadcast Notification Orchestration */}
      <ClientNotificationRenderer />

      {/* Admin Impersonation Top Floating Banner */}
      {isAdmin && (
        <div className="w-full px-3 sm:px-8 py-2 bg-[#240C0B] text-white border-b border-white/10 flex items-center justify-between text-xs animate-fadeIn sticky top-0 z-40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 max-w-7xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#2E8A81] animate-pulse shrink-0" />
              <span className="font-bold text-[#4ECDC4] shrink-0">Admin Preview:</span>
              <span className="text-white font-medium truncate">
                <strong className="text-theme-primary">{currentProfile?.businessName || 'Client Studio'}</strong> ({currentProfile?.profileId})
              </span>
            </div>
            <button
              onClick={returnToAdmin}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#2E8A81] hover:bg-[#236F68] text-white font-bold rounded-xl transition-all cursor-pointer text-xs shrink-0 self-end sm:self-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Admin</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Studio App Structure */}
      <div 
        id="main-app-container"
        className="w-full flex-1 flex flex-col md:flex-row relative min-h-screen text-[#240C0B] transition-colors duration-300 print:hidden"
        style={{ backgroundColor: 'var(--app-bg, #FAF8F5)' }}
      >
        {/* Sliding Side Navigation Bar (Desktop fixed & mobile drawer) */}
        <Sidebar 
          mobileOpen={isSidebarOpen} 
          setMobileOpen={setIsSidebarOpen}
          sidebarMode={sidebarMode}
          setSidebarMode={handleSetSidebarMode}
        />

        {/* Main Content Area (Smooth dynamic offset transition) */}
        <div className={`flex-1 flex flex-col min-w-0 min-h-full pb-20 lg:pb-0 transition-[padding] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${sidebarOffsetClass}`}>
          <Header 
            onMenuClick={() => setIsSidebarOpen((prev) => !prev)} 
            isSidebarOpen={isSidebarOpen}
            sidebarMode={sidebarMode}
            setSidebarMode={handleSetSidebarMode}
          />

          <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-4 sm:space-y-6">
            {/* Rendered View or Feature Locked Screen */}
            {renderView()}
          </main>
        </div>

        {/* Mobile & Tablet Floating Bottom Navigation */}
        <MobileNav 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
        />
      </div>

      {/* Global Modals Container */}
      <ModalContainer />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, authView, isAdmin } = useAuth();

  return (
    <>
      {/* Inactive Account Alert Modal */}
      <InactiveAccountModal />

      {/* Real-time Deleted Account Alert Modal */}
      <DeletedAccountModal />

      {/* Routing based on authView */}
      {authView === 'client_login' && <ClientLogin />}
      {authView === 'admin_login' && <AdminLogin />}
      {authView === 'admin_dashboard' && <AdminDashboard />}
      {authView === 'app' && <MainApp />}
    </>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
