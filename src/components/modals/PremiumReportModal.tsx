import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Download, 
  Printer, 
  Copy, 
  Check, 
  X, 
  FileSpreadsheet, 
  TrendingUp, 
  DollarSign, 
  Receipt, 
  Calendar, 
  Users, 
  Filter, 
  Scissors, 
  PieChart as PieIcon, 
  BarChart3, 
  Sparkles,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  InvoiceReportItem, 
  RevenueDailyItem, 
  RevenueServiceItem, 
  RevenueStaffItem, 
  generatePremiumInvoicesCSV, 
  generatePremiumRevenueCSV, 
  downloadCSV 
} from '../../utils/reportExport';
import { 
  triggerPrintDocument, 
  downloadPrintableHTML, 
  generateExecutiveReportHTML 
} from '../../utils/printDoc';
import { calculateAppointmentInvoice } from '../../utils/invoice';
import { formatISO } from '../../data/initialData';

interface PremiumReportModalProps {
  initialTab?: 'invoices' | 'revenue';
  onClose: () => void;
}

export const PremiumReportModal: React.FC<PremiumReportModalProps> = ({ 
  initialTab = 'invoices', 
  onClose 
}) => {
  const { 
    clients, 
    appointments, 
    services, 
    packages,
    staff, 
    expenses, 
    settings, 
    redemptions,
    formatPrice, 
    currencySymbol, 
    showToast 
  } = useApp();
  const { currentProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'invoices' | 'revenue'>(initialTab);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'last30' | 'year' | 'all'>('month');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'due'>('all');
  const [copied, setCopied] = useState(false);

  const today = new Date();
  const todayStr = formatISO(today);
  const currentMonthStr = todayStr.slice(0, 7);

  // Compute date boundaries
  const dateRangeBounds = useMemo(() => {
    const now = new Date();
    if (timeRange === 'today') {
      const s = formatISO(now);
      return { start: s, end: s, label: `Today (${s})` };
    }
    if (timeRange === 'week') {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return { start: formatISO(d), end: formatISO(now), label: 'Past 7 Days' };
    }
    if (timeRange === 'month') {
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const start = `${y}-${m}-01`;
      const end = `${y}-${m}-${new Date(y, now.getMonth() + 1, 0).getDate()}`;
      return { start, end, label: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) };
    }
    if (timeRange === 'last30') {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      return { start: formatISO(d), end: formatISO(now), label: 'Last 30 Days' };
    }
    if (timeRange === 'year') {
      const y = now.getFullYear();
      return { start: `${y}-01-01`, end: `${y}-12-31`, label: `Year ${y}` };
    }
    return { start: '2000-01-01', end: '2099-12-31', label: 'All Recorded Time' };
  }, [timeRange]);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      if (a.status === 'cancelled' || a.status === 'noshow') return false;
      if (a.date < dateRangeBounds.start || a.date > dateRangeBounds.end) return false;

      const isPaid = a.status === 'completed';
      if (statusFilter === 'paid' && !isPaid) return false;
      if (statusFilter === 'due' && isPaid) return false;

      return true;
    });
  }, [appointments, dateRangeBounds, statusFilter]);

  // Invoices List Preparation
  const invoiceReportData: InvoiceReportItem[] = useMemo(() => {
    const taxRate = settings.taxRate ?? 8.5;
    return filteredAppointments.map((appt) => {
      const client = clients.find((c) => c.id === appt.clientId);
      const service = services.find((s) => s.id === appt.serviceId);
      const stylist = staff.find((s) => s.id === appt.staffId);
      const inv = calculateAppointmentInvoice(appt, { services, packages, settings, redemptions });

      return {
        invoiceNum: appt.invoiceNumber || `INV-${appt.date.replace(/-/g, '').slice(2)}-${appt.id.slice(-4).toUpperCase()}`,
        date: appt.date,
        time: appt.start,
        status: appt.status,
        isPaid: appt.status === 'completed',
        isCancelled: appt.status === 'cancelled',
        ownerName: client?.owner || 'Valued Client',
        phone: client?.phone || 'N/A',
        email: client?.email || 'N/A',
        petName: client?.name || 'Pet',
        petBreed: client?.breed || 'Breed',
        petSize: client?.size || 'medium',
        serviceName: inv.serviceOrPackageName || service?.name || 'Grooming Service',
        groomerName: stylist?.name || 'Stylist',
        subtotal: inv.taxableSubtotal,
        groomingRev: inv.groomingRevenue,
        retailRev: inv.retailRevenue,
        discountAmount: inv.discountAmount,
        discountCode: inv.discountCode,
        taxRate: inv.taxRate || taxRate,
        taxAmount: inv.taxAmount,
        retailTotal: inv.retailRevenue,
        total: inv.totalAmount,
        notes: appt.notes || '',
      };
    });
  }, [filteredAppointments, clients, services, packages, staff, redemptions, settings]);

  // Financial Metrics
  const metrics = useMemo(() => {
    const totalCount = invoiceReportData.length;
    const paidCount = invoiceReportData.filter((i) => i.isPaid).length;
    const dueCount = invoiceReportData.filter((i) => !i.isPaid && !i.isCancelled).length;
    const grossTotal = invoiceReportData.reduce((acc, i) => acc + i.total, 0);
    const groomingTotal = invoiceReportData.reduce((acc, i) => acc + (i.groomingRev ?? i.subtotal), 0);
    const retailTotal = invoiceReportData.reduce((acc, i) => acc + (i.retailRev ?? i.retailTotal), 0);
    const taxTotal = invoiceReportData.reduce((acc, i) => acc + i.taxAmount, 0);
    const avgTicket = totalCount > 0 ? grossTotal / totalCount : 0;
    const paidRate = totalCount > 0 ? (paidCount / totalCount) * 100 : 0;

    // Expenses in range
    const periodExpenses = expenses.filter((e) => e.date >= dateRangeBounds.start && e.date <= dateRangeBounds.end);
    const totalExpenses = periodExpenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = grossTotal - totalExpenses;
    const profitMargin = grossTotal > 0 ? (netProfit / grossTotal) * 100 : 0;

    return {
      totalCount,
      paidCount,
      dueCount,
      grossTotal,
      groomingTotal,
      retailTotal,
      taxTotal,
      avgTicket,
      paidRate,
      totalExpenses,
      netProfit,
      profitMargin,
    };
  }, [invoiceReportData, expenses, dateRangeBounds]);

  // Daily Chart Data
  const dailyChartData = useMemo(() => {
    const map: Record<string, { date: string; fullDate: string; grooming: number; retail: number; total: number; count: number }> = {};

    // Group filtered invoices by date
    invoiceReportData.forEach((i) => {
      const d = i.date;
      if (!map[d]) {
        map[d] = {
          date: d.slice(5),
          fullDate: d,
          grooming: 0,
          retail: 0,
          total: 0,
          count: 0,
        };
      }
      map[d].grooming += i.groomingRev ?? i.subtotal;
      map[d].retail += i.retailRev ?? i.retailTotal;
      map[d].total += i.total;
      map[d].count += 1;
    });

    return Object.values(map).sort((a, b) => a.fullDate.localeCompare(b.fullDate));
  }, [invoiceReportData]);

  // Service Breakdown Data
  const servicesChartData = useMemo(() => {
    const map: Record<string, { name: string; count: number; total: number }> = {};

    invoiceReportData.forEach((i) => {
      const name = i.serviceName || 'Other Services';
      if (!map[name]) {
        map[name] = { name, count: 0, total: 0 };
      }
      map[name].count += 1;
      map[name].total += i.groomingRev ?? i.subtotal;
    });

    const list = Object.values(map).sort((a, b) => b.total - a.total);
    const totalGroomRev = list.reduce((sum, item) => sum + item.total, 0);

    return list.map((item) => ({
      ...item,
      percentage: totalGroomRev > 0 ? (item.total / totalGroomRev) * 100 : 0,
    }));
  }, [invoiceReportData]);

  // Staff Performance Data
  const staffChartData = useMemo(() => {
    const map: Record<string, { name: string; role: string; count: number; serviceRev: number; commissionRate: number; commissionPayout: number; studioNet: number }> = {};

    staff.forEach((st) => {
      map[st.id] = {
        name: st.name,
        role: st.role,
        count: 0,
        serviceRev: 0,
        commissionRate: st.commission || 50,
        commissionPayout: 0,
        studioNet: 0,
      };
    });

    filteredAppointments.forEach((a) => {
      if (map[a.staffId]) {
        const inv = calculateAppointmentInvoice(a, { services, packages, settings, redemptions });
        map[a.staffId].count += 1;
        map[a.staffId].serviceRev += inv.groomingRevenue;
      }
    });

    return Object.values(map).map((st) => {
      const commissionPayout = (st.serviceRev * st.commissionRate) / 100;
      return {
        ...st,
        commissionPayout,
        studioNet: st.serviceRev - commissionPayout,
      };
    }).sort((a, b) => b.serviceRev - a.serviceRev);
  }, [filteredAppointments, staff, services, packages, settings, redemptions]);

  // Download Handler
  const handleDownloadCSV = () => {
    if (activeTab === 'invoices') {
      const csv = generatePremiumInvoicesCSV(invoiceReportData, settings, {
        periodLabel: dateRangeBounds.label,
        statusLabel: statusFilter.toUpperCase(),
      });
      downloadCSV(csv, `PawBook_Invoices_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      showToast('Downloaded Premium Invoices CSV Report!', 'success');
    } else {
      const dailyItems: RevenueDailyItem[] = dailyChartData.map((d) => ({
        date: d.fullDate,
        dayName: d.date,
        count: d.count,
        groomingRev: d.grooming,
        retailRev: d.retail,
        totalRev: d.total,
        avgTicket: d.count > 0 ? d.total / d.count : 0,
      }));

      const serviceItems: RevenueServiceItem[] = servicesChartData.map((s) => ({
        name: s.name,
        category: 'Grooming',
        count: s.count,
        totalRev: s.total,
        percentage: s.percentage,
      }));

      const staffItems: RevenueStaffItem[] = staffChartData.map((st) => ({
        name: st.name,
        role: st.role,
        count: st.count,
        serviceRev: st.serviceRev,
        commissionRate: st.commissionRate,
        commissionPayout: st.commissionPayout,
        studioNet: st.studioNet,
      }));

      const transactions = filteredAppointments.map((a) => {
        const cl = clients.find((c) => c.id === a.clientId);
        const svc = services.find((s) => s.id === a.serviceId);
        const st = staff.find((s) => s.id === a.staffId);
        const inv = calculateAppointmentInvoice(a, { services, packages, settings, redemptions });
        return {
          id: a.id,
          date: a.date,
          time: a.start,
          client: cl?.owner || a.client || 'Client',
          pet: cl?.name || a.petName || 'Pet',
          service: a.isRetailOnly ? 'Pure Retail Merchandise' : (svc?.name || a.packageName || 'Service'),
          staff: st?.name || 'Salon Team',
          groomPrice: inv.groomingRevenue,
          retailPrice: inv.retailRevenue,
          total: inv.totalAmount,
          status: a.status,
        };
      });

      const peakDay = dailyChartData.reduce(
        (max, d) => (d.total > max.total ? d : max),
        { date: 'N/A', total: 0 }
      );

      const csv = generatePremiumRevenueCSV(
        {
          periodLabel: dateRangeBounds.label,
          grossRev: metrics.grossTotal,
          groomRev: metrics.groomingTotal,
          retailRev: metrics.retailTotal,
          expenses: metrics.totalExpenses,
          netProfit: metrics.netProfit,
          profitMargin: metrics.profitMargin,
          totalAppts: metrics.totalCount,
          avgTicket: metrics.avgTicket,
          peakDayLabel: peakDay.date,
          peakDayAmount: peakDay.total,
        },
        dailyItems,
        serviceItems,
        staffItems,
        transactions,
        settings
      );

      downloadCSV(csv, `PawBook_Revenue_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      showToast('Downloaded Premium Revenue CSV Report!', 'success');
    }
  };

  const handleCopyCSV = () => {
    let csv = '';
    if (activeTab === 'invoices') {
      csv = generatePremiumInvoicesCSV(invoiceReportData, settings, {
        periodLabel: dateRangeBounds.label,
        statusLabel: statusFilter.toUpperCase(),
      });
    } else {
      const dailyItems: RevenueDailyItem[] = dailyChartData.map((d) => ({
        date: d.fullDate,
        dayName: d.date,
        count: d.count,
        groomingRev: d.grooming,
        retailRev: d.retail,
        totalRev: d.total,
        avgTicket: d.count > 0 ? d.total / d.count : 0,
      }));

      const serviceItems: RevenueServiceItem[] = servicesChartData.map((s) => ({
        name: s.name,
        category: 'Grooming',
        count: s.count,
        totalRev: s.total,
        percentage: s.percentage,
      }));

      const staffItems: RevenueStaffItem[] = staffChartData.map((st) => ({
        name: st.name,
        role: st.role,
        count: st.count,
        serviceRev: st.serviceRev,
        commissionRate: st.commissionRate,
        commissionPayout: st.commissionPayout,
        studioNet: st.studioNet,
      }));

      const transactions = filteredAppointments.map((a) => {
        const cl = clients.find((c) => c.id === a.clientId);
        const svc = services.find((s) => s.id === a.serviceId);
        const st = staff.find((s) => s.id === a.staffId);
        const inv = calculateAppointmentInvoice(a, { services, packages, settings, redemptions });
        return {
          id: a.id,
          date: a.date,
          time: a.start,
          client: cl?.owner || a.client || 'Client',
          pet: cl?.name || a.petName || 'Pet',
          service: a.isRetailOnly ? 'Pure Retail Merchandise' : (svc?.name || a.packageName || 'Service'),
          staff: st?.name || 'Salon Team',
          groomPrice: inv.groomingRevenue,
          retailPrice: inv.retailRevenue,
          total: inv.totalAmount,
          status: a.status,
        };
      });

      const peakDay = dailyChartData.reduce(
        (max, d) => (d.total > max.total ? d : max),
        { date: 'N/A', total: 0 }
      );

      csv = generatePremiumRevenueCSV(
        {
          periodLabel: dateRangeBounds.label,
          grossRev: metrics.grossTotal,
          groomRev: metrics.groomingTotal,
          retailRev: metrics.retailTotal,
          expenses: metrics.totalExpenses,
          netProfit: metrics.netProfit,
          profitMargin: metrics.profitMargin,
          totalAppts: metrics.totalCount,
          avgTicket: metrics.avgTicket,
          peakDayLabel: peakDay.date,
          peakDayAmount: peakDay.total,
        },
        dailyItems,
        serviceItems,
        staffItems,
        transactions,
        settings
      );
    }

    navigator.clipboard.writeText(csv);
    setCopied(true);
    showToast('Report copied to clipboard in CSV format!', 'info');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrintPDF = () => {
    const reportTitle = activeTab === 'invoices' 
      ? `Executive Billing & Invoices Report (${dateRangeBounds.label})` 
      : `Executive Revenue & Analytics Report (${dateRangeBounds.label})`;
    
    const printHtml = generateExecutiveReportHTML({
      title: reportTitle,
      type: activeTab,
      periodLabel: dateRangeBounds.label,
      clinicName: currentProfile?.businessName || settings.salonName || 'PawBook Pro Studio',
      clinicOwner: currentProfile?.ownerName || settings.name || 'Master Stylist',
      clinicPhone: settings.phone,
      clinicEmail: settings.email,
      clinicAddress: settings.address,
      currency: currencySymbol || '$',
      metrics: {
        grossTotal: metrics.grossTotal,
        groomingTotal: metrics.groomingTotal,
        retailTotal: metrics.retailTotal,
        taxTotal: metrics.taxTotal,
        netProfit: metrics.netProfit,
        profitMargin: metrics.profitMargin,
        totalCount: metrics.totalCount,
        paidCount: metrics.paidCount,
        dueCount: metrics.dueCount,
        avgTicket: metrics.avgTicket,
        paidRate: metrics.paidRate,
      },
      services: servicesChartData.map((s) => ({
        name: s.name,
        count: s.count,
        total: s.total,
        percentage: s.percentage,
      })),
      staff: staffChartData.map((st) => ({
        name: st.name,
        role: st.role,
        count: st.count,
        serviceRev: st.serviceRev,
        commissionPayout: st.commissionPayout,
        studioNet: st.studioNet,
      })),
      transactions: invoiceReportData.map((inv) => ({
        invoiceNum: inv.invoiceNum,
        date: inv.date,
        time: inv.time,
        ownerName: inv.ownerName,
        petName: inv.petName,
        serviceName: inv.serviceName,
        groomerName: inv.groomerName,
        subtotal: inv.subtotal,
        taxAmount: inv.taxAmount,
        total: inv.total,
        isPaid: inv.isPaid,
        isCancelled: inv.isCancelled,
      })),
    });

    triggerPrintDocument(reportTitle, printHtml, { 
      isHtml: true, 
      fallbackFilename: `${activeTab}_report_${todayStr}.html` 
    });
    showToast('Launching print dialog...', 'info');
  };

  const handleDownloadPrintableHTML = () => {
    const reportTitle = activeTab === 'invoices' 
      ? `Executive Billing & Invoices Report (${dateRangeBounds.label})` 
      : `Executive Revenue & Analytics Report (${dateRangeBounds.label})`;
    
    const printHtml = generateExecutiveReportHTML({
      title: reportTitle,
      type: activeTab,
      periodLabel: dateRangeBounds.label,
      clinicName: currentProfile?.businessName || settings.salonName || 'PawBook Pro Studio',
      clinicOwner: currentProfile?.ownerName || settings.name || 'Master Stylist',
      clinicPhone: settings.phone,
      clinicEmail: settings.email,
      clinicAddress: settings.address,
      currency: currencySymbol || '$',
      metrics: {
        grossTotal: metrics.grossTotal,
        groomingTotal: metrics.groomingTotal,
        retailTotal: metrics.retailTotal,
        taxTotal: metrics.taxTotal,
        netProfit: metrics.netProfit,
        profitMargin: metrics.profitMargin,
        totalCount: metrics.totalCount,
        paidCount: metrics.paidCount,
        dueCount: metrics.dueCount,
        avgTicket: metrics.avgTicket,
        paidRate: metrics.paidRate,
      },
      services: servicesChartData.map((s) => ({
        name: s.name,
        count: s.count,
        total: s.total,
        percentage: s.percentage,
      })),
      staff: staffChartData.map((st) => ({
        name: st.name,
        role: st.role,
        count: st.count,
        serviceRev: st.serviceRev,
        commissionPayout: st.commissionPayout,
        studioNet: st.studioNet,
      })),
      transactions: invoiceReportData.map((inv) => ({
        invoiceNum: inv.invoiceNum,
        date: inv.date,
        time: inv.time,
        ownerName: inv.ownerName,
        petName: inv.petName,
        serviceName: inv.serviceName,
        groomerName: inv.groomerName,
        subtotal: inv.subtotal,
        taxAmount: inv.taxAmount,
        total: inv.total,
        isPaid: inv.isPaid,
        isCancelled: inv.isCancelled,
      })),
    });

    downloadPrintableHTML(
      reportTitle, 
      printHtml, 
      `PawBook_${activeTab === 'invoices' ? 'Invoices' : 'Revenue'}_Report_${todayStr}.html`, 
      true
    );
    showToast('Saved printable offline HTML report!', 'success');
  };

  const PIE_COLORS = ['#FF6B00', '#2E8A81', '#2563EB', '#9333EA', '#D97706', '#E11D48', '#0D9488'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-sm animate-fadeIn print:p-0 print:static print:bg-white">
      <div className="w-full max-w-5xl max-h-[92vh] bg-white rounded-3xl border border-[#E6DFD5] shadow-2xl flex flex-col overflow-hidden animate-scaleUp print:max-h-none print:shadow-none print:border-none">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#240C0B] via-[#351C14] to-[#240C0B] text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-theme-primary/20 border border-theme-primary/30 flex items-center justify-center text-theme-primary shrink-0 shadow-sm">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-black text-lg sm:text-xl text-white tracking-tight">
                  Executive CSV Financial & Billing Reports
                </h2>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/10 text-theme-primary border border-white/10">
                  Modern Minimalist Format
                </span>
              </div>
              <p className="text-xs text-[#A08E8B] mt-0.5">
                {currentProfile?.businessName || settings.salonName || 'PawBook Pro Studio'} • Formatted export with interactive graphs & transaction ledgers
              </p>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
            <button
              onClick={handleCopyCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
              title="Copy CSV to Clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy CSV'}</span>
            </button>

            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 no-print shadow-xs"
              title="Print or Save PDF Report"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleDownloadPrintableHTML}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 no-print"
              title="Save Printable Standalone HTML File"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-300" />
              <span>Save HTML</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-4 py-2 bg-theme-primary hover:opacity-90 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md active:scale-95"
              title="Download Formatted CSV File"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#A08E8B] hover:text-white transition-all cursor-pointer no-print ml-1"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar & Tab Selector */}
        <div className="p-3 sm:p-4 bg-[#FAF8F5] border-b border-[#E6DFD5] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0 no-print">
          
          {/* Main Tab Toggle */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#E6DFD5] shadow-2xs self-start">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'invoices'
                  ? 'bg-theme-primary text-white shadow-xs'
                  : 'text-[#7A6865] hover:text-[#240C0B]'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Invoices & Billing</span>
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'revenue'
                  ? 'bg-theme-primary text-white shadow-xs'
                  : 'text-[#7A6865] hover:text-[#240C0B]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Revenue & Analytics</span>
            </button>
          </div>

          {/* Time Range Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
            <span className="text-[11px] font-bold text-[#A08E8B] flex items-center gap-1 shrink-0">
              <Calendar className="w-3.5 h-3.5" /> Period:
            </span>
            {(['today', 'week', 'month', 'last30', 'year', 'all'] as const).map((r) => {
              const labels: Record<string, string> = {
                today: 'Today',
                week: '7 Days',
                month: 'This Month',
                last30: '30 Days',
                year: 'This Year',
                all: 'All Time'
              };
              const isSelected = timeRange === r;
              return (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#240C0B] text-white shadow-xs'
                      : 'bg-white border border-[#E6DFD5] text-[#7A6865] hover:border-[#240C0B]'
                  }`}
                >
                  {labels[r]}
                </button>
              );
            })}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#E6DFD5] shadow-2xs self-start md:self-auto text-xs">
            <span className="text-[11px] font-bold text-[#A08E8B] px-1">Status:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-0.5 rounded-lg font-bold cursor-pointer transition-all ${
                statusFilter === 'all' ? 'bg-[#240C0B] text-white' : 'text-[#7A6865]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-2.5 py-0.5 rounded-lg font-bold cursor-pointer transition-all ${
                statusFilter === 'paid' ? 'bg-emerald-600 text-white' : 'text-[#7A6865]'
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setStatusFilter('due')}
              className={`px-2.5 py-0.5 rounded-lg font-bold cursor-pointer transition-all ${
                statusFilter === 'due' ? 'bg-amber-600 text-white' : 'text-[#7A6865]'
              }`}
            >
              Due
            </button>
          </div>
        </div>

        {/* Scrollable Report Body */}
        <div id="printable-report-doc" className="printable-area flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-[#240C0B]">
          
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            <div className="p-4 rounded-2xl bg-white border border-[#E6DFD5] space-y-1 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-[#A08E8B] tracking-wider block">
                Gross Invoiced
              </span>
              <div className="text-xl sm:text-2xl font-black font-display text-[#240C0B]">
                {formatPrice(metrics.grossTotal)}
              </div>
              <div className="text-[11px] text-[#7A6865] flex items-center justify-between">
                <span>{metrics.totalCount} invoices</span>
                <span className="font-bold text-emerald-600">
                  {metrics.paidRate.toFixed(0)}% paid
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E6DFD5] space-y-1 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-[#A08E8B] tracking-wider block">
                Grooming Services
              </span>
              <div className="text-xl sm:text-2xl font-black font-display text-theme-primary">
                {formatPrice(metrics.groomingTotal)}
              </div>
              <div className="text-[11px] text-[#7A6865]">
                {servicesChartData.length} service types
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E6DFD5] space-y-1 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-[#A08E8B] tracking-wider block">
                Retail & Add-ons
              </span>
              <div className="text-xl sm:text-2xl font-black font-display text-[#2E8A81]">
                {formatPrice(metrics.retailTotal)}
              </div>
              <div className="text-[11px] text-[#7A6865] truncate" title="Synced with Store & Inventory">
                Tax: {formatPrice(metrics.taxTotal)} • Synced with Store
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#E6DFD5] space-y-1 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-[#A08E8B] tracking-wider block">
                Net Operating Profit
              </span>
              <div className="text-xl sm:text-2xl font-black font-display text-emerald-700">
                {formatPrice(metrics.netProfit)}
              </div>
              <div className="text-[11px] text-[#7A6865] flex items-center justify-between">
                <span>Margin: {metrics.profitMargin.toFixed(1)}%</span>
                <span>Avg: {formatPrice(metrics.avgTicket)}</span>
              </div>
            </div>
          </div>

          {/* Interactive Visual Charts & Graphs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Chart 1: Daily Revenue & Volume Trajectory (Span 2 cols) */}
            <div className="lg:col-span-2 p-4 sm:p-5 rounded-2xl bg-white border border-[#E6DFD5] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-sm text-[#240C0B] flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-theme-primary" />
                    Daily Revenue Performance ({dateRangeBounds.label})
                  </h3>
                  <p className="text-[11px] text-[#7A6865]">
                    Service treatments vs. product sales trends
                  </p>
                </div>
                <span className="text-[11px] font-bold text-theme-primary bg-theme-light px-2 py-0.5 rounded-full border border-theme-primary/20">
                  {dailyChartData.length} active days
                </span>
              </div>

              <div className="h-56 sm:h-64 w-full">
                {dailyChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorGroomReport" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorRetailReport" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2E8A81" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#2E8A81" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1EEE6" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#7A6865' }} stroke="#E6DFD5" />
                      <YAxis tick={{ fontSize: 10, fill: '#7A6865' }} stroke="#E6DFD5" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#240C0B', 
                          borderRadius: '12px', 
                          border: 'none', 
                          color: '#fff',
                          fontSize: '11px' 
                        }} 
                      />
                      <Area type="monotone" dataKey="grooming" stroke="#FF6B00" strokeWidth={2} fillOpacity={1} fill="url(#colorGroomReport)" name="Grooming ($)" />
                      <Area type="monotone" dataKey="retail" stroke="#2E8A81" strokeWidth={2} fillOpacity={1} fill="url(#colorRetailReport)" name="Retail ($)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-[#A08E8B]">
                    No transactions recorded for this period.
                  </div>
                )}
              </div>
            </div>

            {/* Chart 2: Treatment & Service Distribution */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6DFD5] space-y-3 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-display font-extrabold text-sm text-[#240C0B] flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-theme-primary" />
                  Service Breakdown
                </h3>
                <p className="text-[11px] text-[#7A6865]">
                  Revenue distribution across grooming treatments
                </p>
              </div>

              <div className="h-44 w-full relative flex items-center justify-center">
                {servicesChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={servicesChartData.slice(0, 5)}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="total"
                      >
                        {servicesChartData.slice(0, 5).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#240C0B', borderRadius: '8px', color: '#fff', fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <span className="text-xs text-[#A08E8B]">No service data</span>
                )}
              </div>

              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {servicesChartData.slice(0, 4).map((s, idx) => (
                  <div key={s.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 truncate">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} 
                      />
                      <span className="truncate font-semibold text-[#240C0B]">{s.name}</span>
                    </div>
                    <span className="font-bold text-[#7A6865]">{s.percentage.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Transaction / Invoice Audit Table Preview */}
          <div className="rounded-2xl bg-white border border-[#E6DFD5] overflow-hidden shadow-xs">
            <div className="p-4 bg-[#FAF8F5] border-b border-[#E6DFD5] flex items-center justify-between">
              <div>
                <h3 className="font-display font-extrabold text-sm text-[#240C0B]">
                  {activeTab === 'invoices' ? 'Invoice Transaction Ledger' : 'Financial Transactions & Appointments'}
                </h3>
                <p className="text-[11px] text-[#7A6865]">
                  Showing {invoiceReportData.length} records matching the active filter
                </p>
              </div>
              <span className="text-xs font-bold text-theme-primary">
                Total: {formatPrice(metrics.grossTotal)}
              </span>
            </div>

            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAF8F5] text-[#7A6865] font-black text-[10px] uppercase tracking-wider sticky top-0 border-b border-[#E6DFD5]">
                  <tr>
                    <th className="py-2.5 px-4">Invoice #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Client / Pet</th>
                    <th className="py-2.5 px-3">Service</th>
                    <th className="py-2.5 px-3">Stylist</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                    <th className="py-2.5 px-3 text-right">Tax</th>
                    <th className="py-2.5 px-4 text-right">Total</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1EEE6]">
                  {invoiceReportData.length > 0 ? (
                    invoiceReportData.slice(0, 50).map((inv) => (
                      <tr key={inv.invoiceNum} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="py-2.5 px-4 font-mono font-bold text-theme-primary">
                          {inv.invoiceNum}
                        </td>
                        <td className="py-2.5 px-3 text-[#7A6865] whitespace-nowrap">
                          {inv.date} ({inv.time})
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-[#240C0B]">
                          {inv.ownerName} <span className="text-[#A08E8B]">({inv.petName})</span>
                        </td>
                        <td className="py-2.5 px-3 text-[#240C0B]">
                          {inv.serviceName}
                        </td>
                        <td className="py-2.5 px-3 text-[#7A6865]">
                          {inv.groomerName}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#7A6865]">
                          {formatPrice(inv.subtotal)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-[#A08E8B]">
                          {formatPrice(inv.taxAmount)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-[#240C0B]">
                          {formatPrice(inv.total)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            inv.isPaid 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : inv.isCancelled 
                              ? 'bg-red-50 text-red-700 border border-red-200' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {inv.isPaid ? 'Paid' : inv.isCancelled ? 'Cancelled' : 'Due'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-xs text-[#A08E8B]">
                        No records match the selected date range and filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {invoiceReportData.length > 50 && (
              <div className="p-2.5 bg-[#FAF8F5] text-center text-[11px] text-[#A08E8B] border-t border-[#E6DFD5]">
                Showing first 50 records in preview. All {invoiceReportData.length} records are included in the downloadable CSV.
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#FAF8F5] border-t border-[#E6DFD5] flex items-center justify-between shrink-0 no-print flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs text-[#7A6865]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official accounting ready CSV standard</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPDF}
              className="px-3.5 py-2 bg-white hover:bg-[#F1EEE6] text-[#240C0B] border border-[#E6DFD5] hover:border-[#240C0B] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Printer className="w-4 h-4 text-theme-primary" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-[#F1EEE6] text-[#240C0B] border border-[#E6DFD5] rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleDownloadCSV}
              className="px-5 py-2 bg-theme-primary hover:opacity-90 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download Full CSV</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
