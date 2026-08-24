import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { isSectionAllowed } from '../../data/permissionPresets';
import { formatISO, getFixedToday } from '../../data/initialData';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  CreditCard, 
  Download, 
  PieChart as PieIcon, 
  BarChart3,
  LineChart as LineChartIcon,
  Calendar,
  Sparkles,
  FileSpreadsheet,
  Receipt,
  CheckCircle2,
  Clock,
  Scissors,
  Users,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, BarChart, Bar } from 'recharts';
import { PremiumReportModal } from '../modals/PremiumReportModal';
import { generatePremiumRevenueCSV, downloadCSV, RevenueDailyItem, RevenueServiceItem, RevenueStaffItem } from '../../utils/reportExport';
import { calculateAppointmentInvoice } from '../../utils/invoice';

export const RevenueView: React.FC = () => {
  const { 
    appointments, 
    expenses, 
    services, 
    packages,
    staff, 
    clients, 
    settings, 
    redemptions,
    formatPrice, 
    currencySymbol, 
    showToast 
  } = useApp();

  const [chartMode, setChartMode] = useState<'line' | 'area'>('line');
  const [lineBreakdown, setLineBreakdown] = useState<'total' | 'breakdown'>('breakdown');
  const [timePeriod, setTimePeriod] = useState<'all' | 'month' | 'week' | 'today'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'due'>('all');
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const { currentProfile } = useAuth();
  const showFinancialOverview = isSectionAllowed(currentProfile?.permissions, 'revenue', 'financialOverview');
  const showProfitReports = isSectionAllowed(currentProfile?.permissions, 'revenue', 'profitReports');
  const showExportAccounting = isSectionAllowed(currentProfile?.permissions, 'revenue', 'exportAccounting');

  const today = getFixedToday();
  const currentMonthLabel = today.toLocaleDateString('en-US', { month: 'long' });
  const currentYear = today.getFullYear();
  const todayStr = formatISO(today);
  const currentMonthStr = todayStr.slice(0, 7);

  // Synchronized item calculation for each appointment using unified invoice calculator
  const invoiceCalculations = useMemo(() => {
    return appointments.map((appt) => {
      const inv = calculateAppointmentInvoice(appt, { services, packages, settings, redemptions });
      const client = clients.find((c) => c.id === appt.clientId);
      const service = services.find((s) => s.id === appt.serviceId);
      const stylist = staff.find((s) => s.id === appt.staffId);
      return {
        appt,
        inv,
        client,
        service,
        stylist,
        isCancelled: appt.status === 'cancelled' || appt.status === 'noshow',
        isPaid: inv.isPaid,
        total: inv.totalAmount,
        groomingRev: inv.groomingRevenue,
        retailRev: inv.retailRevenue,
        discount: inv.discountAmount,
        tax: inv.taxAmount,
        date: appt.date,
      };
    });
  }, [appointments, services, packages, staff, clients, settings, redemptions]);

  // Filtered appointments according to active timeframe and status filter
  const filteredCalculations = useMemo(() => {
    return invoiceCalculations.filter((item) => {
      if (item.isCancelled) return false;

      // Status filter
      if (filterStatus === 'completed' && !item.isPaid) return false;
      if (filterStatus === 'due' && item.isPaid) return false;

      // Timeframe filter
      if (timePeriod === 'today') {
        if (item.date !== todayStr) return false;
      } else if (timePeriod === 'week') {
        const itemDate = new Date(item.date);
        const diffDays = (today.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays < -1 || diffDays > 7) return false;
      } else if (timePeriod === 'month') {
        if (!item.date.startsWith(currentMonthStr)) return false;
      }

      return true;
    });
  }, [invoiceCalculations, filterStatus, timePeriod, todayStr, currentMonthStr, today]);

  // Overall Financial Stats (Synchronized 100% with InvoicesView)
  const allTimeStats = useMemo(() => {
    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let totalGrooming = 0;
    let totalRetail = 0;
    let totalTax = 0;
    let totalDiscounts = 0;

    invoiceCalculations.forEach((item) => {
      if (item.isCancelled) return;
      totalInvoiced += item.total;
      totalGrooming += item.groomingRev;
      totalRetail += item.retailRev;
      totalTax += item.tax;
      totalDiscounts += item.discount;

      if (item.isPaid) {
        totalPaid += item.total;
        paidCount++;
      } else {
        totalPending += item.total;
        pendingCount++;
      }
    });

    const totalValidCount = paidCount + pendingCount;
    const avgInvoice = totalValidCount > 0 ? totalInvoiced / totalValidCount : 0;
    const paidRate = totalValidCount > 0 ? Math.round((paidCount / totalValidCount) * 100) : 100;

    return {
      totalInvoiced,
      totalPaid,
      totalPending,
      paidCount,
      pendingCount,
      totalCount: appointments.length,
      avgInvoice,
      paidRate,
      totalGrooming,
      totalRetail,
      totalTax,
      totalDiscounts,
    };
  }, [invoiceCalculations, appointments.length]);

  // Active period financial stats
  const activeStats = useMemo(() => {
    let grossRev = 0;
    let paidRev = 0;
    let pendingRev = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let totalGrooming = 0;
    let totalRetail = 0;

    filteredCalculations.forEach((item) => {
      grossRev += item.total;
      totalGrooming += item.groomingRev;
      totalRetail += item.retailRev;
      if (item.isPaid) {
        paidRev += item.total;
        paidCount++;
      } else {
        pendingRev += item.total;
        pendingCount++;
      }
    });

    const validCount = paidCount + pendingCount;
    const avgTicket = validCount > 0 ? grossRev / validCount : 0;
    const paidRate = validCount > 0 ? Math.round((paidCount / validCount) * 100) : 100;

    // Filter expenses matching active timeframe
    const activeExpenses = expenses.filter((e) => {
      if (timePeriod === 'today') return e.date === todayStr;
      if (timePeriod === 'month') return e.date.startsWith(currentMonthStr);
      return true;
    });
    const totalExpenses = activeExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = grossRev - totalExpenses;
    const profitMargin = grossRev > 0 ? Math.round((netProfit / grossRev) * 100) : 0;

    return {
      grossRev,
      paidRev,
      pendingRev,
      paidCount,
      pendingCount,
      validCount,
      avgTicket,
      paidRate,
      totalGrooming,
      totalRetail,
      totalExpenses,
      netProfit,
      profitMargin,
    };
  }, [filteredCalculations, expenses, timePeriod, todayStr, currentMonthStr]);

  // Today's Synchronized Revenue
  const todayRevenue = useMemo(() => {
    return invoiceCalculations
      .filter((item) => item.date === todayStr && !item.isCancelled)
      .reduce((sum, item) => sum + item.total, 0);
  }, [invoiceCalculations, todayStr]);

  // Daily revenue chart data for all days of the current month
  const chartData = useMemo(() => {
    const map: Record<string, { date: string; fullDate: string; grooming: number; retail: number; total: number }> = {};
    const [yearStr, monthStr] = currentMonthStr.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Fill days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const iso = `${yearStr}-${monthStr}-${dayStr}`;
      const label = `Day ${day}`;
      map[iso] = { date: label, fullDate: iso, grooming: 0, retail: 0, total: 0 };
    }

    invoiceCalculations.forEach((item) => {
      if (item.isCancelled) return;
      if (map[item.date]) {
        map[item.date].grooming += item.groomingRev;
        map[item.date].retail += item.retailRev;
        map[item.date].total += item.total;
      }
    });

    return Object.values(map).sort((a, b) => a.fullDate.localeCompare(b.fullDate));
  }, [invoiceCalculations, currentMonthStr]);

  // Top Grossing Services calculated with exact invoice service prices
  const topServicesData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredCalculations.forEach((item) => {
      const name = item.inv.serviceOrPackageName || item.service?.name || 'Grooming Treatment';
      map[name] = (map[name] || 0) + item.groomingRev;
    });

    return Object.entries(map)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [filteredCalculations]);

  // Peak Earning Day in active chart
  const peakDay = useMemo(() => {
    if (chartData.length === 0) return { date: 'N/A', amount: 0 };
    return chartData.reduce((max, d) => (d.total > max.amount ? { date: d.date, amount: d.total } : max), { date: chartData[0].date, amount: chartData[0].total });
  }, [chartData]);

  // Stylist performance breakdown
  const staffBreakdown = useMemo(() => {
    return staff.map((st) => {
      const stItems = filteredCalculations.filter((i) => i.appt.staffId === st.id);
      const serviceRev = stItems.reduce((sum, i) => sum + i.groomingRev, 0);
      const totalRev = stItems.reduce((sum, i) => sum + i.total, 0);
      const cRate = st.commission || 50;
      const cPayout = (serviceRev * cRate) / 100;
      const studioNet = totalRev - cPayout;
      return {
        id: st.id,
        name: st.name,
        role: st.role,
        count: stItems.length,
        serviceRev,
        totalRev,
        commissionRate: cRate,
        commissionPayout: cPayout,
        studioNet,
      };
    });
  }, [staff, filteredCalculations]);

  const handleExportCSV = () => {
    const dailyItems: RevenueDailyItem[] = chartData.map((d) => ({
      date: d.fullDate,
      dayName: d.date,
      count: invoiceCalculations.filter(a => a.date === d.fullDate && !a.isCancelled).length,
      groomingRev: d.grooming,
      retailRev: d.retail,
      totalRev: d.total,
      avgTicket: invoiceCalculations.filter(a => a.date === d.fullDate && !a.isCancelled).length > 0 
        ? d.total / invoiceCalculations.filter(a => a.date === d.fullDate && !a.isCancelled).length 
        : 0,
    }));

    const serviceItems: RevenueServiceItem[] = topServicesData.map((s) => ({
      name: s.name,
      category: 'Grooming',
      count: filteredCalculations.filter(a => (a.inv.serviceOrPackageName || a.service?.name) === s.name).length,
      totalRev: s.total,
      percentage: activeStats.grossRev > 0 ? (s.total / activeStats.grossRev) * 100 : 0,
    }));

    const staffItems: RevenueStaffItem[] = staffBreakdown.map((st) => ({
      name: st.name,
      role: st.role,
      count: st.count,
      serviceRev: st.serviceRev,
      commissionRate: st.commissionRate,
      commissionPayout: st.commissionPayout,
      studioNet: st.studioNet,
    }));

    const transactions = filteredCalculations.map((item) => ({
      id: item.appt.id,
      date: item.appt.date,
      time: item.appt.start,
      client: item.client?.owner || 'Client',
      pet: item.client?.name || 'Pet',
      service: item.inv.serviceOrPackageName || 'Service',
      staff: item.stylist?.name || 'Stylist',
      groomPrice: item.groomingRev,
      retailPrice: item.retailRev,
      total: item.total,
      status: item.appt.status,
    }));

    const csvContent = generatePremiumRevenueCSV(
      {
        periodLabel: timePeriod === 'all' ? 'All Recorded Invoices' : `${currentMonthLabel} ${currentYear}`,
        grossRev: activeStats.grossRev,
        groomRev: activeStats.totalGrooming,
        retailRev: activeStats.totalRetail,
        expenses: activeStats.totalExpenses,
        netProfit: activeStats.netProfit,
        profitMargin: activeStats.profitMargin,
        totalAppts: filteredCalculations.length,
        avgTicket: activeStats.avgTicket,
        peakDayLabel: peakDay.date,
        peakDayAmount: peakDay.amount,
      },
      dailyItems,
      serviceItems,
      staffItems,
      transactions,
      settings
    );

    downloadCSV(csvContent, `PawBook_Revenue_Report_${new Date().toISOString().substring(0, 10)}.csv`);
    showToast('Exported synchronized revenue CSV report!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar with Filter Toggles */}
      <div className="card-box p-3.5 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-base sm:text-lg text-[#240C0B]">
              Revenue & Financial Analytics
            </h2>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Synchronized with Invoices
            </span>
          </div>
          <p className="text-xs text-[#7A6865] mt-0.5">
            Real-time financial performance, settled revenue, product sales, and profit analytics.
          </p>
        </div>

        {/* Timeframe & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Timeframe selector */}
          <div className="flex items-center gap-1 bg-[#F1EEE6] p-1 rounded-full border border-[#D8D3C4]">
            <button
              onClick={() => setTimePeriod('all')}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                timePeriod === 'all' ? 'bg-[#240C0B] text-white shadow-xs' : 'text-[#7A6865] hover:text-[#240C0B]'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimePeriod('month')}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                timePeriod === 'month' ? 'bg-[#240C0B] text-white shadow-xs' : 'text-[#7A6865] hover:text-[#240C0B]'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimePeriod('today')}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                timePeriod === 'today' ? 'bg-[#240C0B] text-white shadow-xs' : 'text-[#7A6865] hover:text-[#240C0B]'
              }`}
            >
              Today
            </button>
          </div>

          {/* Status selector */}
          <div className="hidden sm:flex items-center gap-1 bg-[#F1EEE6] p-1 rounded-full border border-[#D8D3C4]">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                filterStatus === 'all' ? 'bg-theme-primary text-white shadow-xs' : 'text-[#7A6865] hover:text-theme-primary'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-2.5 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                filterStatus === 'completed' ? 'bg-theme-primary text-white shadow-xs' : 'text-[#7A6865] hover:text-theme-primary'
              }`}
            >
              Paid Only
            </button>
          </div>

          {showExportAccounting && (
            <>
              <button
                onClick={() => setReportModalOpen(true)}
                className="px-3.5 py-2 rounded-full border border-[#E6DFD5] bg-white hover:bg-[#FAF8F5] text-[#240C0B] text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-all active:scale-95 shrink-0"
                title="Open Executive Reports & Visual Analytics"
              >
                <TrendingUp className="w-3.5 h-3.5 text-theme-primary" />
                <span>Reports</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="btn-primary text-xs px-3.5 sm:px-4 py-2 rounded-full flex items-center justify-center gap-1.5 font-bold shadow-xs cursor-pointer shrink-0"
                title="Download formatted CSV report"
              >
                <Download className="w-4 h-4" /> 
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">CSV</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. Synchronized 5 Primary Financial KPI Cards (Exact match with Store & Inventory and Invoices) */}
      {showFinancialOverview && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
            
            {/* Metric 1: Total Revenue / Total Invoiced */}
            <div className="bg-[#FAF8F5] border border-[#E6DFD5] p-3.5 sm:p-4 rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[#7A6865] uppercase tracking-wider">
                <span>{timePeriod === 'all' ? 'Total Revenue' : 'Period Revenue'}</span>
                <Receipt className="w-3.5 h-3.5 text-[#240C0B]" />
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="font-display font-black text-xl sm:text-2xl text-[#240C0B]">
                  {formatPrice(timePeriod === 'all' ? allTimeStats.totalInvoiced : activeStats.grossRev)}
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#A08E8B] mt-0.5 truncate">
                {formatPrice(timePeriod === 'all' ? allTimeStats.totalGrooming : activeStats.totalGrooming)} svc + {formatPrice(timePeriod === 'all' ? allTimeStats.totalRetail : activeStats.totalRetail)} retail
              </div>
            </div>

            {/* Metric 2: Retail Add-ons & Store Revenue (Synchronized with Activity & Store section) */}
            <div className="bg-[#FAF8F5] border border-[#D8D3C4] p-3.5 sm:p-4 rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[#2E8A81] uppercase tracking-wider">
                <span>Retail Add-ons</span>
                <ShoppingBag className="w-3.5 h-3.5 text-[#2E8A81]" />
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="font-display font-black text-xl sm:text-2xl text-[#2E8A81]">
                  {formatPrice(timePeriod === 'all' ? allTimeStats.totalRetail : activeStats.totalRetail)}
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#5C716C] mt-0.5 truncate" title="Synced with Store & Inventory">
                Synced with Store & Inventory
              </div>
            </div>

            {/* Metric 3: Grooming Services Revenue */}
            <div className="bg-[#FAF8F5] border border-[#E6DFD5] p-3.5 sm:p-4 rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[#FF6B00] uppercase tracking-wider">
                <span>Grooming Services</span>
                <Scissors className="w-3.5 h-3.5 text-[#FF6B00]" />
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="font-display font-black text-xl sm:text-2xl text-[#173E39]">
                  {formatPrice(timePeriod === 'all' ? allTimeStats.totalGrooming : activeStats.totalGrooming)}
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#A08E8B] mt-0.5 truncate">
                From service bookings
              </div>
            </div>

            {/* Metric 4: Settled & Paid Revenue */}
            <div className="bg-[#F0FDF4] border border-[#DCFCE7] p-3.5 sm:p-4 rounded-2xl shadow-2xs">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[#166534] uppercase tracking-wider">
                <span>Settled & Paid</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" />
              </div>
              <div className="mt-1.5 flex items-baseline gap-1.5 sm:gap-2">
                <span className="font-display font-black text-xl sm:text-2xl text-[#166534]">
                  {formatPrice(timePeriod === 'all' ? allTimeStats.totalPaid : activeStats.paidRev)}
                </span>
                <span className="text-[9px] sm:text-[10px] font-black bg-[#DCFCE7] text-[#166534] px-1.5 py-0.5 rounded-md">
                  {timePeriod === 'all' ? allTimeStats.paidRate : activeStats.paidRate}%
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#15803d]/80 mt-0.5">
                {timePeriod === 'all' ? `${allTimeStats.paidCount} paid invoices` : `${activeStats.paidCount} completed`}
              </div>
            </div>

            {/* Metric 5: Payment Due / Pending Invoices */}
            <div className="bg-[#FFFBEB] border border-[#FEF3C7] p-3.5 sm:p-4 rounded-2xl shadow-2xs col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[#92400E] uppercase tracking-wider">
                <span>Payment Due</span>
                <Clock className="w-3.5 h-3.5 text-[#D97706]" />
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="font-display font-black text-xl sm:text-2xl text-[#92400E]">
                  {formatPrice(timePeriod === 'all' ? allTimeStats.totalPending : activeStats.pendingRev)}
                </span>
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#B45309]/80 mt-0.5">
                {timePeriod === 'all' ? `${allTimeStats.pendingCount} pending payment` : `${activeStats.pendingCount} unpaid`}
              </div>
            </div>
          </div>

          {/* 3. Secondary Metrics: Today's Revenue & Net Operating Profit Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* Today's Live Invoiced Revenue */}
            <div className="card-box p-4 bg-gradient-to-br from-theme-light via-white to-[#FAF8F5] border border-theme-subtle">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-theme-primary" />
                  <span className="text-xs font-bold text-[#240C0B] uppercase tracking-wider">
                    Today's Invoiced Revenue ({today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                  </span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-2xl sm:text-3xl font-display font-black text-[#240C0B] tracking-tight mt-1.5">
                {formatPrice(todayRevenue)}
              </div>
              <p className="text-xs text-[#7A6865] mt-1">
                Calculated in real-time from today's client bookings, retail add-ons, and taxes.
              </p>
            </div>

            {/* Net Operating Profit Margin */}
            <div className="card-box p-4 bg-[#F0FDF4] border border-[#DCFCE7]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Net Operating Margin ({timePeriod === 'all' ? 'All Time' : currentMonthLabel})
                  </span>
                </div>
                <span className="text-xs font-black text-emerald-700 bg-emerald-200/70 px-2 py-0.5 rounded-full">
                  {activeStats.profitMargin}% Margin
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-display font-black text-emerald-900 tracking-tight mt-1.5">
                {formatPrice(activeStats.netProfit)}
              </div>
              <p className="text-xs text-emerald-800/80 mt-1">
                Gross revenue minus {formatPrice(activeStats.totalExpenses)} operational studio expenses.
              </p>
            </div>
          </div>
        </>
      )}

      {/* 4. Daily Earnings Chart & Breakdown */}
      {showProfitReports && (
        <>
          <div className="card-box p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6DFD5] pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-[#240C0B] flex items-center gap-2">
                  <LineChartIcon className="w-5 h-5 text-theme-primary" />
                  Daily {currentMonthLabel} {currentYear} Earnings Matrix
                </h3>
                <p className="text-xs text-[#7A6865] mt-0.5">
                  Visualizing daily revenue trajectory across grooming services and retail merchandise.
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap bg-[#F1EEE6]/80 p-1.5 rounded-2xl border border-[#D8D3C4]">
                {/* Breakdown Toggle Group */}
                <div className="flex items-center gap-1 bg-white/80 p-1 rounded-xl border border-[#D8D3C4]/60">
                  <button
                    type="button"
                    onClick={() => setLineBreakdown('breakdown')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      lineBreakdown === 'breakdown'
                        ? 'bg-[#240C0B] text-white shadow-xs'
                        : 'text-[#7A6865] hover:text-[#240C0B]'
                    }`}
                  >
                    <PieIcon className="w-3.5 h-3.5 text-theme-primary" />
                    <span>Grooming vs Retail</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLineBreakdown('total')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      lineBreakdown === 'total'
                        ? 'bg-[#240C0B] text-white shadow-xs'
                        : 'text-[#7A6865] hover:text-[#240C0B]'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Total Daily</span>
                  </button>
                </div>

                {/* Chart Type Toggle */}
                <div className="flex items-center gap-1 bg-white/80 p-1 rounded-xl border border-[#D8D3C4]/60">
                  <button
                    type="button"
                    onClick={() => setChartMode('line')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      chartMode === 'line'
                        ? 'bg-theme-primary text-white shadow-xs'
                        : 'text-[#7A6865] hover:text-[#240C0B]'
                    }`}
                    title="Line View"
                  >
                    <LineChartIcon className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Line</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMode('area')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      chartMode === 'area'
                        ? 'bg-theme-primary text-white shadow-xs'
                        : 'text-[#7A6865] hover:text-[#240C0B]'
                    }`}
                    title="Area Fill View"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">Area</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recharts Chart Canvas Container */}
            <div className="h-[280px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {chartMode === 'line' ? (
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E6DFD5" vertical={false} />
                    <XAxis dataKey="date" stroke="#7A6865" fontSize={10} tickLine={false} interval={2} />
                    <YAxis stroke="#7A6865" fontSize={11} tickLine={false} tickFormatter={(v) => formatPrice(v)} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#240C0B',
                        borderColor: '#4A2A28',
                        color: '#ffffff',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                      formatter={(val: any, name: any) => [formatPrice(val), name]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

                    {lineBreakdown === 'breakdown' ? (
                      <>
                        <Line 
                          type="monotone" 
                          dataKey="grooming" 
                          name="Grooming Services" 
                          stroke="#2E8A81" 
                          strokeWidth={3} 
                          dot={{ r: 3, fill: '#2E8A81' }} 
                          activeDot={{ r: 6, fill: '#2E8A81', stroke: '#fff', strokeWidth: 2 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="retail" 
                          name="Retail Products" 
                          stroke="#EA580C" 
                          strokeWidth={2} 
                          strokeDasharray="4 4"
                          dot={{ r: 2, fill: '#EA580C' }} 
                        />
                      </>
                    ) : (
                      <Line 
                        type="monotone" 
                        dataKey="total" 
                        name="Total Revenue" 
                        stroke="#240C0B" 
                        strokeWidth={3.5} 
                        dot={{ r: 4, fill: '#240C0B' }} 
                        activeDot={{ r: 7, fill: '#EA580C' }} 
                      />
                    )}
                  </LineChart>
                ) : (
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGrooming" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2E8A81" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#2E8A81" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRetail" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EA580C" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#EA580C" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E6DFD5" vertical={false} />
                    <XAxis dataKey="date" stroke="#7A6865" fontSize={10} interval={2} />
                    <YAxis stroke="#7A6865" fontSize={11} tickFormatter={(v) => formatPrice(v)} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#240C0B', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                      formatter={(val: any) => formatPrice(val)}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="grooming" name="Grooming Revenue" stroke="#2E8A81" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGrooming)" />
                    <Area type="monotone" dataKey="retail" name="Retail Revenue" stroke="#EA580C" strokeWidth={2} fillOpacity={1} fill="url(#colorRetail)" />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* 5. Two-Column Matrix: Top Grossing Services & Staff Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Grossing Services Card */}
            <div className="card-box p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base text-[#240C0B] flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-theme-primary" />
                  Top Grossing Grooming Services
                </h3>
                <span className="text-xs text-[#7A6865]">
                  {timePeriod === 'all' ? 'All Time' : currentMonthLabel}
                </span>
              </div>

              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topServicesData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <XAxis type="number" stroke="#7A6865" fontSize={10} tickFormatter={(v) => formatPrice(v)} />
                    <YAxis dataKey="name" type="category" stroke="#7A6865" fontSize={11} width={130} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#240C0B', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                      formatter={(val: any) => formatPrice(val)}
                    />
                    <Bar dataKey="total" fill="#EA580C" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Staff Performance & Commission Table */}
            <div className="card-box p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base text-[#240C0B] flex items-center gap-2">
                  <Users className="w-4 h-4 text-theme-primary" />
                  Groomer Production & Payout
                </h3>
                <span className="text-xs text-[#7A6865]">
                  {staffBreakdown.length} Stylists
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E6DFD5] text-[#7A6865] font-bold">
                      <th className="pb-2">Stylist</th>
                      <th className="pb-2 text-center">Grooms</th>
                      <th className="pb-2 text-right">Service Rev</th>
                      <th className="pb-2 text-right">Commission</th>
                      <th className="pb-2 text-right">Studio Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6DFD5]/60">
                    {staffBreakdown.map((st) => (
                      <tr key={st.id} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="py-2.5 font-bold text-[#240C0B]">
                          {st.name}
                          <span className="block text-[10px] text-[#A08E8B] font-normal">{st.role}</span>
                        </td>
                        <td className="py-2.5 text-center font-bold text-[#7A6865]">{st.count}</td>
                        <td className="py-2.5 text-right font-bold text-[#240C0B]">{formatPrice(st.serviceRev)}</td>
                        <td className="py-2.5 text-right font-medium text-emerald-700">
                          {formatPrice(st.commissionPayout)}
                          <span className="text-[9px] text-[#A08E8B] ml-1 font-mono">({st.commissionRate}%)</span>
                        </td>
                        <td className="py-2.5 text-right font-extrabold text-[#240C0B]">{formatPrice(st.studioNet)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Executive Report & Visual Graphs Modal */}
      {reportModalOpen && (
        <PremiumReportModal 
          initialTab="revenue" 
          onClose={() => setReportModalOpen(false)} 
        />
      )}
    </div>
  );
};
