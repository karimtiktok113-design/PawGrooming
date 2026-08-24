import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { isSectionAllowed } from '../../data/permissionPresets';
import { formatISO } from '../../data/initialData';
import { calculateAppointmentInvoice } from '../../utils/invoice';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Plus, 
  ChevronRight,
  Check,
  Printer,
  FileText,
  Clock,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  HeartPulse,
  Award,
  Phone,
  Search,
  User,
  Scissors,
  Camera,
  Layers,
  ArrowRight,
  CheckCircle2,
  Info,
  Receipt,
  ShoppingBag
} from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { ClientNotificationSpotlight } from '../notifications/ClientNotificationSpotlight';

// Pet avatar fallbacks
const PET_AVATARS: Record<string, string> = {
  cl1: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=120&q=80',
  cl2: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=120&q=80',
  cl3: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=120&q=80',
  cl4: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=120&q=80',
  cl5: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=120&q=80',
  cl6: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=120&q=80',
  cl7: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=120&q=80',
};

const DEFAULT_DOG_AVATAR = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=120&q=80';

export const DashboardView: React.FC = () => {
  const { 
    clients, 
    appointments, 
    services, 
    packages,
    staff, 
    transformations,
    redemptions,
    updateAppointmentStatus, 
    openModal, 
    setView, 
    showToast,
    formatPrice,
    settings
  } = useApp();
  const { currentProfile } = useAuth();

  const showKpis = isSectionAllowed(currentProfile?.permissions, 'dashboard', 'kpiCards');
  const showQuickActions = isSectionAllowed(currentProfile?.permissions, 'dashboard', 'quickActions');
  const showTodaySchedule = isSectionAllowed(currentProfile?.permissions, 'dashboard', 'todaySchedule');
  const showPetSummaryTable = isSectionAllowed(currentProfile?.permissions, 'dashboard', 'petSummaryTable');
  const showRevenueMiniChart = isSectionAllowed(currentProfile?.permissions, 'dashboard', 'revenueMiniChart');
  const showVaccineAlertsCard = isSectionAllowed(currentProfile?.permissions, 'dashboard', 'vaccineAlertsCard');

  const today = new Date();
  const todayStr = formatISO(today);
  const currentMonthStr = todayStr.slice(0, 7);
  const formattedTodayLabel = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const formattedMonthLabel = today.toLocaleDateString('en-US', { month: 'long' });
  const currentYear = today.getFullYear();

  // Toggle for Appointments operations: 'today' vs 'upcoming' vs 'completed'
  const [apptFilter, setApptFilter] = useState<'today' | 'upcoming' | 'completed'>('today');

  // Pet Data Summary Filter & Search States
  const [petSummaryTab, setPetSummaryTab] = useState<'all' | 'vaccine' | 'special' | 'vip'>('all');
  const [petSummarySearch, setPetSummarySearch] = useState('');

  // Hover tooltip state for daily revenue matrix bar chart
  const [hoveredDay, setHoveredDay] = useState<{ day: number; dateStr: string; rev: number; count: number } | null>(null);

  // Today's appointments sorted by start time
  const todaysAppts = React.useMemo(() => {
    return appointments
      .filter((a) => a.date === todayStr && a.status !== 'cancelled' && a.status !== 'noshow')
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [appointments, todayStr]);

  // Today's revenue
  const todayRevenue = React.useMemo(() => {
    return todaysAppts.reduce((sum, a) => {
      const inv = calculateAppointmentInvoice(a, { services, packages, settings, redemptions });
      return sum + inv.totalAmount;
    }, 0);
  }, [todaysAppts, services, packages, settings, redemptions]);

  // Month-To-Date Revenue
  const mtdRevenue = React.useMemo(() => {
    return appointments
      .filter((a) => a.status !== 'cancelled' && a.status !== 'noshow' && a.date.startsWith(currentMonthStr))
      .reduce((sum, a) => {
        const inv = calculateAppointmentInvoice(a, { services, packages, settings, redemptions });
        return sum + inv.totalAmount;
      }, 0);
  }, [appointments, currentMonthStr, services, packages, settings, redemptions]);

  // Synchronized Financial Metrics across all views (Revenue, Invoices, Executive Reports, Store & Inventory)
  const financialStats = React.useMemo(() => {
    let totalRevenue = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let totalGrooming = 0;
    let totalRetail = 0;
    let totalTax = 0;
    let totalDiscounts = 0;

    appointments.forEach((appt) => {
      // Exclude cancelled and noshow appointments to match 100% with Invoices, Executive Reports, and Revenue View
      if (appt.status === 'cancelled' || appt.status === 'noshow') return;

      const inv = calculateAppointmentInvoice(appt, { services, packages, settings, redemptions });
      totalRevenue += inv.totalAmount;
      totalGrooming += inv.groomingRevenue;
      totalRetail += inv.retailRevenue;
      totalTax += inv.taxAmount;
      totalDiscounts += inv.discountAmount;

      if (inv.isPaid) {
        totalPaid += inv.totalAmount;
        paidCount++;
      } else {
        totalPending += inv.totalAmount;
        pendingCount++;
      }
    });

    const totalValidCount = paidCount + pendingCount;
    const paidRate = totalValidCount > 0 ? Math.round((paidCount / totalValidCount) * 100) : 100;
    const avgInvoice = totalValidCount > 0 ? totalRevenue / totalValidCount : 0;

    return {
      totalRevenue,
      totalPaid,
      totalPending,
      paidCount,
      pendingCount,
      totalValidCount,
      paidRate,
      totalGrooming,
      totalRetail,
      totalTax,
      totalDiscounts,
      avgInvoice,
    };
  }, [appointments, services, packages, settings, redemptions]);

  // Featured pet names for morning greeting
  const featuredPetsText = React.useMemo(() => {
    const todayPetNames = todaysAppts
      .map(a => clients.find(c => c.id === a.clientId)?.name)
      .filter(Boolean);
    if (todayPetNames.length >= 2) {
      return `${todayPetNames[0]} & ${todayPetNames[1]}`;
    } else if (todayPetNames.length === 1) {
      return `${todayPetNames[0]} & friends`;
    } else if (clients.length >= 2) {
      return `${clients[0].name} & ${clients[1].name}`;
    }
    return 'your pet clients';
  }, [todaysAppts, clients]);

  // Upcoming Appointments List (dates after today)
  const upcomingApptsList = React.useMemo(() => {
    return appointments
      .filter(a => a.status !== 'cancelled' && a.date > todayStr)
      .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  }, [appointments, todayStr]);

  // Completed Appointments today
  const completedApptsList = React.useMemo(() => {
    return appointments
      .filter(a => a.status === 'completed')
      .sort((a, b) => (b.date + b.start).localeCompare(a.date + a.start));
  }, [appointments]);

  // List of appointments to display in the main floor
  const displayedCardAppts = React.useMemo(() => {
    if (apptFilter === 'today') return todaysAppts;
    if (apptFilter === 'upcoming') return upcomingApptsList;
    return completedApptsList;
  }, [apptFilter, todaysAppts, upcomingApptsList, completedApptsList]);

  // Comprehensive Pets Data Summary with Clinic, Client, and Shop Owner analytics
  const petDataSummary = React.useMemo(() => {
    const today = new Date();
    return clients.map(client => {
      let healthStatus: 'Valid' | 'Due Soon' | 'Expired' = 'Valid';
      let statusBg = 'bg-[#10B981] text-white';
      let diffDays = 365;

      if (client.rabiesExpiry) {
        const exp = new Date(client.rabiesExpiry);
        diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));
        if (diffDays < 0) {
          healthStatus = 'Expired';
          statusBg = 'bg-[#EF4444] text-white';
        } else if (diffDays <= 30) {
          healthStatus = 'Due Soon';
          statusBg = 'bg-[#F59E0B] text-white';
        }
      }

      const clientAppts = appointments
        .filter(a => a.clientId === client.id && a.status !== 'cancelled')
        .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));

      const completedAppts = clientAppts.filter(a => a.status === 'completed');
      const totalVisits = completedAppts.length;
      const lifetimeSpend = completedAppts.reduce((sum, a) => {
        const inv = calculateAppointmentInvoice(a, { services, packages, settings, redemptions });
        return sum + inv.totalAmount;
      }, 0);

      const nextAppt = clientAppts.find(a => a.date >= todayStr);
      const lastAppt = completedAppts[completedAppts.length - 1];

      const nextApptStr = nextAppt 
        ? `${nextAppt.date.split('-').slice(1).join('/')} @ ${nextAppt.start}` 
        : 'None Scheduled';

      const lastVisitStr = lastAppt
        ? `${lastAppt.date.split('-').slice(1).join('/')}`
        : 'First Visit Pending';

      const preferredService = services.find(s => s.id === client.fav) || services[0];
      const preferredStaff = staff.find(st => st.id === client.staffId) || staff[0];

      const hasSpecialCare = Boolean(
        (client.behaviorNotes && client.behaviorNotes.length > 0) ||
        client.sensitivities ||
        client.allergies ||
        client.medicalNotes
      );

      const isVip = (client.points || 0) >= 150 || totalVisits >= 3;

      return {
        client,
        petId: client.id.toUpperCase(),
        healthStatus,
        statusBg,
        diffDays,
        totalVisits,
        lifetimeSpend,
        nextAppt,
        nextApptStr,
        lastVisitStr,
        preferredService,
        preferredStaff,
        hasSpecialCare,
        isVip,
      };
    });
  }, [clients, appointments, services, staff, todayStr]);

  // Filtered pet data summary list based on user search & tab
  const filteredPetSummary = React.useMemo(() => {
    let list = petDataSummary;

    if (petSummaryTab === 'vaccine') {
      list = list.filter(p => p.healthStatus === 'Expired' || p.healthStatus === 'Due Soon');
    } else if (petSummaryTab === 'special') {
      list = list.filter(p => p.hasSpecialCare);
    } else if (petSummaryTab === 'vip') {
      list = list.filter(p => p.isVip);
    }

    if (petSummarySearch.trim()) {
      const q = petSummarySearch.toLowerCase();
      list = list.filter(p => 
        p.client.name.toLowerCase().includes(q) ||
        p.client.breed.toLowerCase().includes(q) ||
        p.client.owner.toLowerCase().includes(q)
      );
    }

    return list;
  }, [petDataSummary, petSummaryTab, petSummarySearch]);

  // Current Month Daily Revenue Breakdown Array
  const augustDailyData = React.useMemo(() => {
    const [yearStr, monthStr] = todayStr.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();

    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1;
      const dateStr = `${yearStr}-${monthStr}-${String(dayNum).padStart(2, '0')}`;
      const dayAppts = appointments.filter(a => a.date === dateStr && a.status !== 'cancelled');
      const rev = dayAppts.reduce((sum, a) => {
        const inv = calculateAppointmentInvoice(a, { services, packages, settings, redemptions });
        return sum + inv.totalAmount;
      }, 0);
      return { day: dayNum, dateStr, rev, count: dayAppts.length };
    });
    const maxRev = Math.max(...days.map(d => d.rev), 100);
    return { days, maxRev };
  }, [appointments, todayStr, services, packages, settings, redemptions]);

  // Service Category Breakdown Ratios for Health & Care Radial
  const careCategoryRatio = React.useMemo(() => {
    const totals: Record<string, number> = { fullgroom: 0, bath: 0, deshed: 0, nails: 0, other: 0 };
    let grandTotal = 0;

    appointments.forEach(a => {
      const svc = services.find(s => s.id === a.serviceId);
      const cat = svc?.category || 'other';
      if (cat in totals) {
        totals[cat] += 1;
      } else {
        totals.other += 1;
      }
      grandTotal += 1;
    });

    if (grandTotal === 0) grandTotal = 1;

    return {
      fullgroom: Math.round((totals.fullgroom / grandTotal) * 100) || 45,
      bath: Math.round((totals.bath / grandTotal) * 100) || 30,
      deshed: Math.round((totals.deshed / grandTotal) * 100) || 15,
      nails: Math.round((totals.nails / grandTotal) * 100) || 10,
    };
  }, [appointments, services]);

  const handleComplete = (id: string, petName: string) => {
    updateAppointmentStatus(id, 'completed');
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FF6B00', '#A855F7', '#10B981'],
    });
    showToast(`Completed grooming for ${petName}!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Playful Hero Greeting Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        {/* Playful Hero Greeting Banner & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-[#240C0B] tracking-tight flex items-center gap-2">
              GOOD MORNING GUYS <span className="text-3xl sm:text-4xl">🐕</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#7A6865] font-semibold mt-1">
              Salon operations overview for <span className="text-[#FF6B00] font-bold">{featuredPetsText}</span>.
            </p>
          </div>

          {showQuickActions && (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => openModal('transformationForm')}
                className="px-4 py-2.5 bg-white hover:bg-[#FAF8F5] text-[#240C0B] border border-[#D8D3C4] rounded-full text-xs font-extrabold shadow-2xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>Add Transformation</span>
              </button>
              <button
                onClick={() => openModal('appointmentForm', { date: todayStr })}
                className="px-5 py-2.5 bg-[#240C0B] hover:bg-[#381514] text-white rounded-full text-xs font-extrabold shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4 text-[#FF6B00]" />
                <span>New Booking</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Spotlight Notification Hero Card */}
      <ClientNotificationSpotlight />

      {/* Synchronized 4 Primary Financial & Operational KPI Cards with matching borders, light shadows & hover animation */}
      {showKpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total number of appointments today */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            whileHover={{ y: -3, scale: 1.01 }}
            onClick={() => setView('calendar')}
            className="bg-[#FAF8F5] border border-[#E6DFD5] p-3.5 sm:p-4 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[#7A6865] uppercase tracking-wider">
              <span>Appointments Today</span>
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF6B00]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display font-black text-2xl sm:text-3xl text-[#240C0B] tracking-tight">
                {todaysAppts.length}
              </span>
              {todaysAppts.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#FFF0E6] text-[#FF6B00] rounded-md shrink-0">
                  {todaysAppts.filter((a) => a.status === 'completed').length} completed
                </span>
              )}
            </div>
            <div className="text-[10px] sm:text-[11px] text-[#7A6865] mt-1 truncate">
              {appointments.filter((a) => a.status !== 'cancelled' && a.status !== 'noshow').length} total active bookings
            </div>
          </motion.div>

          {/* Card 2: Total revenue today (with total revenue this month beneath) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            whileHover={{ y: -3, scale: 1.01 }}
            onClick={() => setView('revenue')}
            className="bg-[#FAF8F5] border border-[#E6DFD5] p-3.5 sm:p-4 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[#7A6865] uppercase tracking-wider">
              <span>Revenue Today</span>
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#357A54]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display font-black text-2xl sm:text-3xl text-[#357A54] tracking-tight">
                {formatPrice(todayRevenue)}
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-[#7A6865] mt-1 truncate">
              <span className="font-bold text-[#173E39]">This Month:</span> {formatPrice(mtdRevenue)}
            </div>
          </motion.div>

          {/* Card 3: Total number of clients */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.15 }}
            whileHover={{ y: -3, scale: 1.01 }}
            onClick={() => setView('clients')}
            className="bg-[#FAF8F5] border border-[#E6DFD5] p-3.5 sm:p-4 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[#7A6865] uppercase tracking-wider">
              <span>Total Clients</span>
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2E8A81]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display font-black text-2xl sm:text-3xl text-[#240C0B] tracking-tight">
                {clients.length}
              </span>
              {clients.filter((c) => (c.points || 0) > 0).length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[#E6F4F2] text-[#2E8A81] rounded-md shrink-0">
                  {clients.filter((c) => (c.points || 0) > 0).length} rewards
                </span>
              )}
            </div>
            <div className="text-[10px] sm:text-[11px] text-[#7A6865] mt-1 truncate">
              Registered pet owners & members
            </div>
          </motion.div>

          {/* Card 4: Total revenue of all time */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.2 }}
            whileHover={{ y: -3, scale: 1.01 }}
            onClick={() => setView('revenue')}
            className="bg-[#FAF8F5] border border-[#E6DFD5] p-3.5 sm:p-4 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[#7A6865] uppercase tracking-wider">
              <span>Total Revenue (All Time)</span>
              <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#240C0B]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display font-black text-2xl sm:text-3xl text-[#240C0B] tracking-tight">
                {formatPrice(financialStats.totalRevenue)}
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-[#7A6865] mt-1 truncate">
              {formatPrice(financialStats.totalGrooming)} svc + {formatPrice(financialStats.totalRetail)} retail
            </div>
          </motion.div>
        </div>
      )}

      {/* Center Operational Hub: Cohesive 2-Column Balanced Architecture */}
      {(showTodaySchedule || showPetSummaryTable) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Col: Today's Grooming Operations & Live Queue */}
        {showTodaySchedule && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className={`${showPetSummaryTable ? 'lg:col-span-7' : 'lg:col-span-12'} bg-white text-[#240C0B] p-6 rounded-[28px] border border-[#E6DFD5] shadow-xs space-y-5 flex flex-col justify-between`}
        >
          {/* Header & Filter Switcher */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6DFD5]">
              <div>
                <h2 className="font-display font-black text-xl text-[#240C0B] flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-[#FF6B00]" />
                  <span>Grooming Floor Operations</span>
                </h2>
                <p className="text-xs text-[#7A6865] font-semibold mt-0.5">
                  Live appointments, instant checkout, and WhatsApp invoice dispatch.
                </p>
              </div>

              <button
                onClick={() => openModal('appointmentForm', { date: todayStr })}
                className="self-start sm:self-center px-3.5 py-1.5 bg-[#FF6B00] hover:bg-[#E55C00] text-white text-xs font-black rounded-full shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> Book Groom
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 mt-3 bg-[#FAF8F5] p-1 rounded-2xl border border-[#E6DFD5]">
              <button
                onClick={() => setApptFilter('today')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center ${
                  apptFilter === 'today' 
                    ? 'bg-[#240C0B] text-white shadow-xs' 
                    : 'text-[#7A6865] hover:text-[#240C0B]'
                }`}
              >
                Today ({todaysAppts.length})
              </button>
              <button
                onClick={() => setApptFilter('upcoming')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center ${
                  apptFilter === 'upcoming' 
                    ? 'bg-[#240C0B] text-white shadow-xs' 
                    : 'text-[#7A6865] hover:text-[#240C0B]'
                }`}
              >
                Upcoming ({upcomingApptsList.length})
              </button>
              <button
                onClick={() => setApptFilter('completed')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center ${
                  apptFilter === 'completed' 
                    ? 'bg-[#240C0B] text-white shadow-xs' 
                    : 'text-[#7A6865] hover:text-[#240C0B]'
                }`}
              >
                Completed ({completedApptsList.length})
              </button>
            </div>
          </div>

          {/* Session Cards List */}
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {displayedCardAppts.length === 0 ? (
              <div className="p-8 text-center text-[#7A6865] text-xs space-y-3 bg-[#FAF8F5] rounded-2xl border border-[#E6DFD5]">
                <p className="font-bold text-sm text-[#240C0B]">No appointments in this view</p>
                <p className="text-xs text-[#7A6865]">Create a new appointment to schedule pet styling.</p>
                <button
                  onClick={() => openModal('appointmentForm', { date: todayStr })}
                  className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E55C00] text-white text-xs font-black rounded-full shadow-sm"
                >
                  Book Appointment
                </button>
              </div>
            ) : (
              displayedCardAppts.map((item) => {
                const client = clients.find(c => c.id === item.clientId);
                const service = services.find(s => s.id === item.serviceId);
                const stylist = staff.find(st => st.id === item.staffId);
                const petAvatar = client?.photo || PET_AVATARS[item.clientId] || DEFAULT_DOG_AVATAR;
                const isCompleted = item.status === 'completed';

                let statusBadgeStyle = 'bg-[#FFF3EB] text-[#FF6B00] border border-[#FFD0B3]';
                if (isCompleted) {
                  statusBadgeStyle = 'bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]';
                } else if (item.status === 'confirmed') {
                  statusBadgeStyle = 'bg-[#ECE5FF] text-[#3B1F70] border border-[#D3C0FF]';
                }

                return (
                  <div 
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#FAF8F5] hover:bg-white border border-[#E6DFD5] hover:border-[#D8D3C4] hover:shadow-xs transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Pet & Owner Details */}
                      <div 
                        onClick={() => openModal('appointmentForm', { appointment: item })}
                        className="flex items-center gap-3 cursor-pointer min-w-0"
                      >
                        <div className="relative shrink-0">
                          <img 
                            src={petAvatar} 
                            alt={client?.name || 'Pet'} 
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-xs"
                          />
                          {isCompleted ? (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#10B981] text-white flex items-center justify-center text-[9px]">
                              ✓
                            </div>
                          ) : (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#FF6B00] border-2 border-white" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-display font-black text-base text-[#240C0B] truncate">
                              {client?.name || 'Unknown Pet'}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#7A6865] border border-[#E6DFD5] shrink-0">
                              {client?.breed || 'Dog'}
                            </span>
                          </div>
                          <p className="text-xs text-[#6E5B58] font-medium truncate mt-0.5">
                            Owner: <strong className="text-[#240C0B]">{client?.owner || 'Client'}</strong> • {client?.phone || '(555) 019-2831'}
                          </p>
                        </div>
                      </div>

                      {/* Status & Timing Chip */}
                      <div className="text-right shrink-0">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${statusBadgeStyle}`}>
                          {item.status}
                        </span>
                        <div className="text-[11px] font-extrabold text-[#240C0B] mt-1 flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3 text-[#FF6B00]" />
                          <span>{item.date === todayStr ? 'Today' : item.date.slice(5)} @ {item.start}</span>
                        </div>
                      </div>
                    </div>

                    {/* Service & Groomer Highlights */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2.5 bg-white rounded-xl border border-[#E6DFD5] text-xs">
                      <div>
                        <span className="text-[10px] text-[#A08E8B] font-bold block uppercase">Treatment</span>
                        <span className="font-extrabold text-[#240C0B] truncate block">
                          {item.packageName || service?.name || 'Full Grooming'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#A08E8B] font-bold block uppercase">Assigned Stylist</span>
                        <span className="font-extrabold text-[#240C0B] truncate block">
                          {stylist?.name || 'Dani Brooks'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#A08E8B] font-bold block uppercase">Total Amount</span>
                        {(() => {
                          const itemInv = calculateAppointmentInvoice(item, { services, packages, settings, redemptions });
                          return (
                            <span className="font-black text-sm text-[#FF6B00] block">
                              {formatPrice(itemInv.totalAmount)}
                              <span className="text-[10px] font-normal text-[#A08E8B] ml-1">(incl. tax)</span>
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Interactive Action Controls */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="text-[11px] text-[#7A6865] font-semibold">
                        {item.duration} min session
                      </div>

                      <div className="flex items-center gap-2">
                        {/* 1-Click Invoice Modal */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal('invoiceModal', { 
                              appointment: item,
                              retailAddon: item.retail || 0,
                              discountAmount: item.discountAmount || 0,
                              discountCode: item.discountCode,
                              discountTitle: item.discountTitle,
                              packageId: item.packageId,
                              packageName: item.packageName,
                            });
                          }}
                          className="px-3 py-1.5 bg-[#FFF3EB] hover:bg-[#FFE0CD] text-[#FF6B00] border border-[#FFD0B3] text-xs font-extrabold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
                          title="Print A4 Invoice or Share on WhatsApp"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Invoice & WhatsApp</span>
                        </button>

                        {/* Complete Groom Button */}
                        {!isCompleted && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleComplete(item.id, client?.name || 'Pet');
                            }}
                            className="px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-black rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-2xs active:scale-95"
                            title="Complete and Award Loyalty Points"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Done</span>
                          </button>
                        )}

                        {/* Edit Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openModal('appointmentForm', { appointment: item });
                          }}
                          className="px-2.5 py-1.5 bg-white hover:bg-[#FAF8F5] text-[#240C0B] border border-[#D8D3C4] text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
        )}

        {/* Right Col: Pet Health & VIP Directory */}
        {showPetSummaryTable && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className={`${showTodaySchedule ? 'lg:col-span-5' : 'lg:col-span-12'} bg-white text-[#240C0B] p-6 rounded-[28px] border border-[#E6DFD5] shadow-xs space-y-4 flex flex-col justify-between`}
        >
          {/* Header */}
          <div>
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E6DFD5]">
              <div>
                <h2 className="font-display font-black text-xl text-[#240C0B]">
                  Pet Health & VIP Dogs
                </h2>
                <p className="text-xs text-[#7A6865] font-semibold mt-0.5">
                  {clients.length} Registered Dogs • Vaccine & Care Status
                </p>
              </div>

              <button 
                onClick={() => setView('clients')}
                className="text-xs font-bold text-[#FF6B00] hover:underline cursor-pointer bg-[#FFF3EB] px-3 py-1 rounded-full border border-[#FFD0B3] shrink-0"
              >
                Directory →
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 text-[11px] font-bold">
              <button
                onClick={() => setPetSummaryTab('all')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                  petSummaryTab === 'all' 
                    ? 'bg-[#240C0B] text-white shadow-2xs' 
                    : 'bg-[#FAF8F5] text-[#7A6865] hover:bg-[#E6DFD5]'
                }`}
              >
                All ({clients.length})
              </button>
              <button
                onClick={() => setPetSummaryTab('vaccine')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  petSummaryTab === 'vaccine' 
                    ? 'bg-[#EF4444] text-white shadow-2xs' 
                    : 'bg-[#FEF2F2] text-[#DC2626] hover:bg-[#FEE2E2]'
                }`}
              >
                <ShieldAlert className="w-3 h-3" />
                Vaccines ({petDataSummary.filter(p => p.healthStatus !== 'Valid').length})
              </button>
              <button
                onClick={() => setPetSummaryTab('special')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  petSummaryTab === 'special' 
                    ? 'bg-[#D97706] text-white shadow-2xs' 
                    : 'bg-[#FFFBEB] text-[#D97706] hover:bg-[#FEF3C7]'
                }`}
              >
                <HeartPulse className="w-3 h-3" />
                Care Notes ({petDataSummary.filter(p => p.hasSpecialCare).length})
              </button>
              <button
                onClick={() => setPetSummaryTab('vip')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  petSummaryTab === 'vip' 
                    ? 'bg-[#3B1F70] text-white shadow-2xs' 
                    : 'bg-[#ECE5FF] text-[#3B1F70] hover:bg-[#E1D4FF]'
                }`}
              >
                <Award className="w-3 h-3" />
                VIP ({petDataSummary.filter(p => p.isVip).length})
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative mt-2.5">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#A08E8B]" />
              <input
                type="text"
                placeholder="Search dog, breed, or owner..."
                value={petSummarySearch}
                onChange={(e) => setPetSummarySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl outline-none text-[#240C0B] placeholder:text-[#A08E8B] focus:bg-white focus:border-[#FF6B00]"
              />
            </div>
          </div>

          {/* Dogs Data Cards List */}
          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {filteredPetSummary.length === 0 ? (
              <div className="p-6 text-center text-[#7A6865] text-xs space-y-1 bg-[#FAF8F5] rounded-2xl border border-[#E6DFD5]">
                <p className="font-bold">No pets match this filter</p>
                <button
                  onClick={() => { setPetSummaryTab('all'); setPetSummarySearch(''); }}
                  className="text-[11px] text-[#FF6B00] underline font-bold cursor-pointer"
                >
                  Clear Filter
                </button>
              </div>
            ) : (
              filteredPetSummary.map((item) => {
                const avatar = item.client.photo || PET_AVATARS[item.client.id] || DEFAULT_DOG_AVATAR;
                return (
                  <div
                    key={item.client.id}
                    className="bg-[#FAF8F5] hover:bg-white p-3.5 rounded-2xl border border-[#E6DFD5] transition-all space-y-2.5 shadow-2xs"
                  >
                    {/* Dog Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={avatar}
                          alt={item.client.name}
                          className="w-10 h-10 rounded-2xl object-cover border border-[#E6DFD5] shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-sm text-[#240C0B]">
                              {item.client.name}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-white text-[#7A6865] border border-[#E6DFD5]">
                              {item.client.size} • {item.client.weight || '15'} lbs
                            </span>
                            {item.isVip && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-[#FEF3C7] text-[#92400E] flex items-center gap-0.5">
                                ⭐ VIP
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#7A6865] font-medium">
                            {item.client.breed} • Owner: <span className="font-bold text-[#240C0B]">{item.client.owner}</span>
                          </p>
                        </div>
                      </div>

                      {/* Rabies Status Badge */}
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 shadow-2xs ${item.statusBg}`}>
                        Rabies {item.healthStatus}
                      </span>
                    </div>

                    {/* Care Highlights */}
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] bg-white p-2 rounded-xl border border-[#E6DFD5]">
                      <div>
                        <span className="text-[#A08E8B] font-bold block">Next Session</span>
                        <span className="font-extrabold text-[#240C0B] truncate block">
                          {item.nextApptStr}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#A08E8B] font-bold block">Visits & Loyalty</span>
                        <span className="font-extrabold text-[#240C0B] block">
                          {item.totalVisits} visits • {item.client.points || 0} pts
                        </span>
                      </div>
                    </div>

                    {/* Care Notes Tag */}
                    {item.hasSpecialCare && (
                      <div className="flex flex-wrap gap-1 items-center">
                        <span className="text-[9px] font-bold text-[#B45309] flex items-center gap-0.5">
                          <AlertTriangle className="w-2.5 h-2.5" /> Care:
                        </span>
                        {item.client.behaviorNotes?.map((n, i) => (
                          <span key={i} className="text-[9px] font-bold px-1.5 py-0.2 bg-[#FEF3C7] text-[#92400E] rounded-md">
                            {n}
                          </span>
                        ))}
                        {item.client.sensitivities && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#FEE2E2] text-[#991B1B] rounded-md">
                            {item.client.sensitivities}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Direct Pet Actions */}
                    <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-[#E6DFD5]">
                      <button
                        onClick={() => openModal('clientHistory', { client: item.client })}
                        className="px-2.5 py-1 bg-white hover:bg-[#FAF8F5] text-[#240C0B] text-[10px] font-bold rounded-lg border border-[#D8D3C4] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3 h-3 text-[#FF6B00]" /> Full Record
                      </button>
                      <button
                        onClick={() => openModal('appointmentForm', { clientId: item.client.id })}
                        className="px-2.5 py-1 bg-[#240C0B] hover:bg-[#381514] text-white text-[10px] font-black rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Calendar className="w-3 h-3 text-[#FF6B00]" /> Book Groom
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
        )}
      </div>
      )}

      {/* Dog Before & After Transformation Gallery Bar */}
      {showVaccineAlertsCard && (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-white p-6 rounded-[28px] border border-[#E6DFD5] shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E6DFD5]">
          <div>
            <h3 className="font-display font-black text-xl text-[#240C0B] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF6B00]" />
              <span>Real Dog Transformations (Before & After)</span>
            </h3>
            <p className="text-xs text-[#7A6865] font-semibold mt-0.5">
              Genuine salon styling transformations with before/after photos and scissor cut notes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openModal('transformationForm')}
              className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E55C00] text-white text-xs font-black rounded-full shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> Upload Transformation
            </button>
            <button
              onClick={() => setView('gallery')}
              className="px-3.5 py-2 bg-[#FAF8F5] hover:bg-[#E6DFD5] text-[#240C0B] text-xs font-extrabold rounded-full border border-[#D8D3C4] transition-all cursor-pointer"
            >
              View Full Gallery →
            </button>
          </div>
        </div>

        {/* 3 Showcase Transformations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {transformations.slice(0, 3).map((tr) => (
            <div 
              key={tr.id}
              className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E6DFD5] space-y-3 hover:border-[#FF6B00] transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-display font-black text-base text-[#240C0B]">
                      {tr.petName}
                    </h4>
                    <span className="text-xs font-bold text-[#FF6B00]">
                      {tr.breed} • Owner: {tr.ownerName}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#7A6865] border border-[#E6DFD5]">
                    {tr.date}
                  </span>
                </div>

                {/* Side-by-side Before & After Photos */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-wider block text-center px-1 py-0.5 rounded-md bg-[#240C0B] text-white">
                      Before
                    </span>
                    <div className="aspect-square rounded-xl overflow-hidden bg-[#EAE7DC] border border-[#D8D3C4]">
                      <img 
                        src={tr.beforeImg || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80'} 
                        alt="Before Groom" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-wider block text-center px-1 py-0.5 rounded-md bg-[#059669] text-white">
                      After Groom
                    </span>
                    <div className="aspect-square rounded-xl overflow-hidden bg-[#D1FAE5] border border-[#A7F3D0]">
                      <img 
                        src={tr.afterImg || 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80'} 
                        alt="After Groom" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Style Notes */}
                <div className="mt-3 bg-white p-2.5 rounded-xl border border-[#E6DFD5] text-[11px] text-[#6E5B58]">
                  <strong className="text-[#240C0B] font-extrabold">Style Cut: </strong>
                  {tr.styleNotes}
                </div>
              </div>

              <div className="pt-2 border-t border-[#E6DFD5] flex items-center justify-between text-xs text-[#7A6865]">
                <span>Stylist: <strong className="text-[#240C0B]">{tr.groomerName}</strong></span>
                <span className="text-[10px] text-[#FF6B00] font-extrabold">{tr.serviceName}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      )}

      {/* Bottom Row: Care & Services Radial Index & Monthly Revenue Matrix */}
      {showRevenueMiniChart && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Care & Services Index Radial Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          className="bg-white p-6 rounded-[28px] border border-[#E6DFD5] shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-display font-extrabold text-lg text-[#240C0B]">
              Services Index
            </h3>
            <span className="text-[10px] text-[#A08E8B] font-bold">Studio Breakdown</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2 text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B1F70]" /> 
                Full Groom ({careCategoryRatio.fullgroom}%)
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" /> 
                Bath & Brush ({careCategoryRatio.bath}%)
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3BB221]" /> 
                De-shed ({careCategoryRatio.deshed}%)
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF9F00]" /> 
                Nails & Trim ({careCategoryRatio.nails}%)
              </div>
            </div>

            {/* SVG Dynamic Radial Rings */}
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="#F1EEE6" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="50" cy="50" r="42" 
                  stroke="#3B1F70" strokeWidth="8" 
                  strokeDasharray="264" 
                  strokeDashoffset={264 - (264 * careCategoryRatio.fullgroom) / 100} 
                  fill="transparent" strokeLinecap="round" 
                />
                <circle 
                  cx="50" cy="50" r="32" 
                  stroke="#FF6B00" strokeWidth="8" 
                  strokeDasharray="200" 
                  strokeDashoffset={200 - (200 * careCategoryRatio.bath) / 100} 
                  fill="transparent" strokeLinecap="round" 
                />
                <circle 
                  cx="50" cy="50" r="22" 
                  stroke="#3BB221" strokeWidth="8" 
                  strokeDasharray="138" 
                  strokeDashoffset={138 - (138 * careCategoryRatio.deshed) / 100} 
                  fill="transparent" strokeLinecap="round" 
                />
              </svg>
              <div className="absolute w-8 h-8 rounded-full bg-[#FFF8E7] border border-[#FFE7B3] flex items-center justify-center text-[#FF6B00] text-sm">
                🐾
              </div>
            </div>
          </div>
        </motion.div>

        {/* Monthly Revenue Matrix Bar Chart Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="lg:col-span-2 bg-white p-6 rounded-[28px] border border-[#E6DFD5] shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-extrabold text-lg text-[#240C0B]">
                Monthly Revenue Matrix
              </h3>
              <p className="text-[11px] text-[#A08E8B]">{formattedMonthLabel} {currentYear} Daily Revenue Graph</p>
            </div>
            <button
              onClick={() => setView('revenue')}
              className="text-xs font-extrabold text-[#3B1F70] bg-[#ECE5FF] hover:bg-[#DCD0FF] px-3 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              {formatPrice(mtdRevenue)} MTD Revenue
            </button>
          </div>

          {/* Dynamic Interactive Bar Visualizer */}
          <div className="pt-2 relative">
            {hoveredDay && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#240C0B] text-white text-[10px] font-extrabold px-3 py-1 rounded-lg shadow-md z-20 whitespace-nowrap">
                {formattedMonthLabel.slice(0, 3)} {hoveredDay.day}: {formatPrice(hoveredDay.rev)} ({hoveredDay.count} grooms)
              </div>
            )}

            <div className="overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none">
              <div className="min-w-[380px] sm:min-w-0 flex gap-1 h-32 items-end justify-between">
                {augustDailyData.days.map((item) => {
                  const heightPct = item.rev > 0 
                    ? Math.max(12, Math.round((item.rev / augustDailyData.maxRev) * 100))
                    : 6;

                  const isToday = item.dateStr === todayStr;

                  return (
                    <div 
                      key={item.day} 
                      className="flex-1 flex flex-col items-center gap-1 h-full justify-end group cursor-pointer"
                      onMouseEnter={() => setHoveredDay(item)}
                      onMouseLeave={() => setHoveredDay(null)}
                      onClick={() => setView('revenue')}
                    >
                      <div 
                        className={`w-full rounded-md transition-all ${
                          isToday
                            ? 'bg-[#FF6B00] shadow-sm ring-1 ring-[#FF6B00]/40'
                            : item.rev > 0
                            ? 'bg-[#3B1F70] group-hover:bg-[#FF6B00]'
                            : 'bg-[#F1EEE6]'
                        }`} 
                        style={{ height: `${heightPct}%` }}
                        title={`${formattedMonthLabel.slice(0, 3)} ${item.day}: ${formatPrice(item.rev)}`}
                      />
                      <span className={`text-[7.5px] font-extrabold ${isToday ? 'text-[#FF6B00]' : 'text-[#A08E8B]'}`}>
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </div>
  );
};
