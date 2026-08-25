import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { isSectionAllowed } from '../../data/permissionPresets';
import { 
  Receipt, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Scissors, 
  Printer, 
  Share2, 
  Copy, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  Plus, 
  QrCode, 
  ArrowUpDown, 
  SlidersHorizontal, 
  X, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  LayoutList,
  LayoutGrid
} from 'lucide-react';
import { Appointment } from '../../types';
import { formatShortInvoiceNumber, calculateAppointmentInvoice } from '../../utils/invoice';
import { InvoiceQRCode } from '../common/InvoiceQRCode';
import { openWhatsAppInvoice } from '../../utils/whatsapp';
import { PremiumReportModal } from '../modals/PremiumReportModal';
import { generatePremiumInvoicesCSV, downloadCSV, InvoiceReportItem } from '../../utils/reportExport';

export const InvoicesView: React.FC = () => {
  const { 
    appointments, 
    clients, 
    services, 
    packages, 
    staff, 
    settings, 
    redemptions,
    openModal, 
    updateAppointment, 
    showToast, 
    formatPrice 
  } = useApp();
  const { currentProfile } = useAuth();

  const showSummaryCards = isSectionAllowed(currentProfile?.permissions, 'invoices', 'summaryCards');
  const showSearchAndFilters = isSectionAllowed(currentProfile?.permissions, 'invoices', 'searchAndFilters');
  const showInvoiceTable = isSectionAllowed(currentProfile?.permissions, 'invoices', 'invoiceTable');
  const showExportButtons = isSectionAllowed(currentProfile?.permissions, 'invoices', 'exportButtons');
  const showActionButtons = isSectionAllowed(currentProfile?.permissions, 'invoices', 'actionButtons');

  // Filter & Search State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'due' | 'cancelled'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [amountRange, setAmountRange] = useState<'all' | 'under50' | '50to100' | 'over100'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'invoice_asc'>('date_desc');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedQRAppt, setSelectedQRAppt] = useState<Appointment | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const taxRate = settings?.taxRate !== undefined ? settings.taxRate : 8.5;
  const clinicName = settings?.salonName || settings?.name || 'PawBook Pro Grooming Studio';

  // Helper to compute calculated invoice numbers & financials for an appointment
  const getInvoiceData = (appt: Appointment) => {
    const client = clients.find((c) => c.id === appt.clientId);
    const service = services.find((s) => s.id === appt.serviceId);
    const pkg = appt.packageId 
      ? packages.find((p) => p.id === appt.packageId)
      : (appt.packageName ? packages.find(p => p.name.toLowerCase() === appt.packageName?.toLowerCase()) : null);
    const groomer = staff.find((st) => st.id === appt.staffId);
    const calculated = calculateAppointmentInvoice(appt, { services, packages, settings, redemptions });

    return {
      appt,
      client,
      service,
      pkg,
      groomer,
      invoiceNum: calculated.invoiceNum,
      servicePrice: calculated.servicePrice,
      retailAddon: calculated.retailAddon,
      groomingRevenue: calculated.groomingRevenue,
      retailRevenue: calculated.retailRevenue,
      grossSubtotal: calculated.grossSubtotal,
      discount: calculated.discountAmount,
      taxableSubtotal: calculated.taxableSubtotal,
      subtotal: calculated.taxableSubtotal,
      tax: calculated.taxAmount,
      taxAmount: calculated.taxAmount,
      total: calculated.totalAmount,
      totalAmount: calculated.totalAmount,
      taxRate: calculated.taxRate,
      isPaid: calculated.isPaid,
      isCancelled: appt.status === 'cancelled' || appt.status === 'noshow',
      serviceName: calculated.serviceOrPackageName,
      serviceOrPackage: calculated.serviceOrPackageName,
      ownerName: client?.owner || 'Valued Client',
      petName: client?.name || 'Pet',
      clientName: client?.name || 'Pet',
      petBreed: client?.breed || 'Dog',
      groomerName: groomer?.name || 'Assigned Stylist',
      clinicName,
      date: appt.date,
    };
  };

  // Filtered and Sorted Invoices
  const invoiceList = useMemo(() => {
    const todayStr = new Date().toISOString().substring(0, 10);
    const today = new Date();

    return appointments
      .map(getInvoiceData)
      .filter((inv) => {
        // Status Filter
        if (statusFilter === 'paid' && !inv.isPaid) return false;
        if (statusFilter === 'due' && (inv.isPaid || inv.isCancelled)) return false;
        if (statusFilter === 'cancelled' && !inv.isCancelled) return false;

        // Staff Filter
        if (staffFilter !== 'all' && inv.appt.staffId !== staffFilter) return false;

        // Amount Filter
        if (amountRange === 'under50' && inv.total >= 50) return false;
        if (amountRange === '50to100' && (inv.total < 50 || inv.total > 100)) return false;
        if (amountRange === 'over100' && inv.total <= 100) return false;

        // Date Filter
        if (dateFilter === 'today') {
          if (inv.appt.date !== todayStr) return false;
        } else if (dateFilter === 'week') {
          const invDate = new Date(inv.appt.date);
          const diffDays = (today.getTime() - invDate.getTime()) / (1000 * 3600 * 24);
          if (diffDays < -1 || diffDays > 7) return false;
        } else if (dateFilter === 'month') {
          const invDate = new Date(inv.appt.date);
          if (invDate.getFullYear() !== today.getFullYear() || invDate.getMonth() !== today.getMonth()) {
            return false;
          }
        } else if (dateFilter === 'custom') {
          if (customDateStart && inv.appt.date < customDateStart) return false;
          if (customDateEnd && inv.appt.date > customDateEnd) return false;
        }

        // Text Search (Invoice #, Owner, Dog, Service, Groomer, Phone, Date)
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const matchInvoice = inv.invoiceNum.toLowerCase().includes(q);
          const matchOwner = inv.ownerName.toLowerCase().includes(q);
          const matchPet = inv.petName.toLowerCase().includes(q);
          const matchBreed = inv.petBreed.toLowerCase().includes(q);
          const matchService = inv.serviceName.toLowerCase().includes(q);
          const matchGroomer = inv.groomerName.toLowerCase().includes(q);
          const matchPhone = inv.client?.phone?.toLowerCase().includes(q) || false;
          const matchDate = inv.appt.date.toLowerCase().includes(q);

          if (!matchInvoice && !matchOwner && !matchPet && !matchBreed && !matchService && !matchGroomer && !matchPhone && !matchDate) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return b.appt.date.localeCompare(a.appt.date) || b.appt.start.localeCompare(a.appt.start);
        if (sortBy === 'date_asc') return a.appt.date.localeCompare(b.appt.date) || a.appt.start.localeCompare(b.appt.start);
        if (sortBy === 'amount_desc') return b.total - a.total;
        if (sortBy === 'amount_asc') return a.total - b.total;
        if (sortBy === 'invoice_asc') return a.invoiceNum.localeCompare(b.invoiceNum);
        return 0;
      });
  }, [
    appointments, 
    clients, 
    services, 
    packages, 
    staff, 
    taxRate, 
    search, 
    statusFilter, 
    dateFilter, 
    customDateStart, 
    customDateEnd, 
    staffFilter, 
    amountRange, 
    sortBy
  ]);

  // Overall Financial Stats for Invoices
  const stats = useMemo(() => {
    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let paidCount = 0;
    let pendingCount = 0;

    appointments.forEach((appt) => {
      const { total, isPaid, isCancelled } = getInvoiceData(appt);
      if (isCancelled) return;
      totalInvoiced += total;
      if (isPaid) {
        totalPaid += total;
        paidCount++;
      } else {
        totalPending += total;
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
    };
  }, [appointments, clients, services, packages, staff, taxRate]);

  // Export Filtered Invoices as Premium CSV
  const handleExportCSV = () => {
    if (!invoiceList.length) {
      showToast('No invoices match the selected filter to export.', 'warning');
      return;
    }

    const items: InvoiceReportItem[] = invoiceList.map((inv) => ({
      invoiceNum: inv.invoiceNum,
      date: inv.appt.date,
      time: inv.appt.start,
      status: inv.appt.status,
      isPaid: inv.isPaid,
      isCancelled: inv.isCancelled,
      ownerName: inv.ownerName,
      phone: inv.client?.phone || 'N/A',
      email: inv.client?.email || 'N/A',
      petName: inv.petName,
      petBreed: inv.petBreed,
      petSize: inv.client?.size || 'medium',
      serviceName: inv.serviceName,
      groomerName: inv.groomerName,
      subtotal: inv.taxableSubtotal,
      groomingRev: inv.groomingRevenue,
      retailRev: inv.retailRevenue,
      discountAmount: inv.discount,
      discountCode: inv.appt.discountCode || '',
      taxRate: taxRate,
      taxAmount: inv.tax,
      retailTotal: inv.retailRevenue,
      total: inv.total,
      notes: inv.appt.notes || '',
    }));

    const dateFilterLabel = dateFilter === 'all' ? 'All Dates' : dateFilter === 'today' ? 'Today' : dateFilter === 'week' ? 'Past 7 Days' : dateFilter === 'month' ? 'This Month' : `${customDateStart} to ${customDateEnd}`;
    const csvContent = generatePremiumInvoicesCSV(items, settings, {
      periodLabel: dateFilterLabel,
      statusLabel: statusFilter.toUpperCase(),
      staffLabel: staffFilter !== 'all' ? staff.find(s => s.id === staffFilter)?.name : 'All Stylists',
    });

    downloadCSV(csvContent, `PawBook_Invoices_Export_${new Date().toISOString().substring(0, 10)}.csv`);
    showToast(`Exported ${invoiceList.length} invoices to premium CSV!`, 'success');
  };

  // 1-Click Copy Invoice Summary
  const handleCopyInvoice = (inv: ReturnType<typeof getInvoiceData>) => {
    const summary = [
      `INVOICE: ${inv.invoiceNum}`,
      `Studio: ${clinicName}`,
      `Date: ${inv.appt.date} (${inv.appt.start})`,
      `Client: ${inv.ownerName} (Pet: ${inv.petName} - ${inv.petBreed})`,
      `Service: ${inv.serviceName}`,
      `Stylist: ${inv.groomerName}`,
      `Subtotal: $${inv.taxableSubtotal.toFixed(2)}`,
      `Tax (${taxRate}%): $${inv.tax.toFixed(2)}`,
      `TOTAL: $${inv.total.toFixed(2)}`,
      `Status: ${inv.isPaid ? 'PAID IN FULL' : 'PAYMENT DUE'}`
    ].join('\n');

    navigator.clipboard.writeText(summary);
    showToast(`Copied ${inv.invoiceNum} summary to clipboard!`, 'info');
  };

  // 1-Click WhatsApp Share
  const handleShareWhatsApp = (inv: ReturnType<typeof getInvoiceData>) => {
    if (!inv.client) {
      showToast('Client details not found for WhatsApp share.', 'warning');
      return;
    }
    const ok = openWhatsAppInvoice({
      invoiceNum: inv.invoiceNum,
      client: inv.client,
      appointment: inv.appt,
      clinicSettings: settings,
      serviceName: inv.serviceName,
      packageName: inv.pkg?.name || inv.appt.packageName,
      groomerName: inv.groomerName,
      servicePrice: inv.servicePrice,
      retailAddon: inv.retailAddon,
      discountAmount: inv.discount,
      taxRate,
      tax: inv.tax,
      total: inv.total,
      pointsEarned: Math.floor(inv.total),
      isPaid: inv.isPaid,
    });

    if (ok) {
      showToast('Opened WhatsApp with official invoice receipt!', 'success');
    }
  };

  // Toggle Paid / Status
  const handleToggleStatus = (apptId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'booked' : 'completed';
    updateAppointment(apptId, { status: newStatus as any });
    showToast(
      newStatus === 'completed' 
        ? 'Invoice marked as PAID in full!' 
        : 'Invoice marked as PAYMENT DUE.',
      'success'
    );
  };

  const hasActiveFilters = search || statusFilter !== 'all' || dateFilter !== 'all' || staffFilter !== 'all' || amountRange !== 'all';

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setDateFilter('all');
    setCustomDateStart('');
    setCustomDateEnd('');
    setStaffFilter('all');
    setAmountRange('all');
    setSortBy('date_desc');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-white border border-[#E6DFD5] p-4 sm:p-6 rounded-3xl shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#240C0B] text-white flex items-center justify-center shadow-xs shrink-0">
              <Receipt className="w-4 h-4 text-theme-primary" />
            </div>
            <h1 className="font-display font-extrabold text-lg sm:text-2xl text-[#240C0B] tracking-tight">
              Invoices & Digital Receipts
            </h1>
          </div>
          <p className="text-xs text-[#7A6865]">
            Browse, search, verify, and print client tax invoices with scannable QR codes.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {showExportButtons && (
            <>
              <button
                onClick={() => setReportModalOpen(true)}
                className="flex-1 sm:flex-initial px-3.5 py-2 bg-white hover:bg-[#FAF8F5] text-theme-primary border border-theme-primary/30 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                title="Open Executive Reports & Graphs"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Executive Reports</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="flex-1 sm:flex-initial px-3.5 py-2 bg-[#FAF8F5] hover:bg-[#F0ECE1] text-[#240C0B] border border-[#D8D3C4] rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                title="Download formatted CSV ledger of filtered invoices"
              >
                <Download className="w-3.5 h-3.5 text-[#5C716C]" />
                <span>Export CSV</span>
              </button>
            </>
          )}

          <button
            onClick={() => openModal('appointmentForm')}
            className="flex-1 sm:flex-initial px-4 py-2 bg-theme-primary hover:opacity-90 text-white rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      {/* 2. Premium Minimalist KPI Metric Strip with glowing borders & radiant shadows */}
      {showSummaryCards && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {/* Metric 1: Total Invoiced */}
          <div className="kpi-card p-3.5 sm:p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[#7A6865] uppercase tracking-wider">
              <span>Total Invoiced</span>
              <Receipt className="w-3.5 h-3.5 text-[#240C0B]" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-display font-black text-xl sm:text-2xl text-[#240C0B]">
                {formatPrice(stats.totalInvoiced)}
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-[#A08E8B] mt-0.5">
              Across {stats.totalCount} bookings
            </div>
          </div>

          {/* Metric 2: Settled & Paid */}
          <div className="kpi-card-emerald p-3.5 sm:p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[#166534] uppercase tracking-wider">
              <span>Settled & Paid</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5 sm:gap-2">
              <span className="font-display font-black text-xl sm:text-2xl text-[#166534]">
                {formatPrice(stats.totalPaid)}
              </span>
              <span className="text-[9px] sm:text-[10px] font-black bg-[#DCFCE7] text-[#166534] px-1 sm:px-1.5 py-0.5 rounded-md">
                {stats.paidRate}%
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-[#15803d]/80 mt-0.5">
              {stats.paidCount} paid invoices
            </div>
          </div>

          {/* Metric 3: Payment Due */}
          <div className="kpi-card-amber p-3.5 sm:p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[#92400E] uppercase tracking-wider">
              <span>Payment Due</span>
              <Clock className="w-3.5 h-3.5 text-[#D97706]" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-display font-black text-xl sm:text-2xl text-[#92400E]">
                {formatPrice(stats.totalPending)}
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-[#B45309]/80 mt-0.5">
              {stats.pendingCount} pending payment
            </div>
          </div>

          {/* Metric 4: Average Invoice */}
          <div className="kpi-card-teal p-3.5 sm:p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-[#2E8A81] uppercase tracking-wider">
              <span>Avg Invoice</span>
              <TrendingUp className="w-3.5 h-3.5 text-[#2E8A81]" />
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="font-display font-black text-xl sm:text-2xl text-[#240C0B]">
                {formatPrice(stats.avgInvoice)}
              </span>
            </div>
            <div className="text-[10px] sm:text-[11px] text-[#A08E8B] mt-0.5">
              Per grooming session
            </div>
          </div>
        </div>
      )}

      {/* 3. Comprehensive Search & Multi-Filter Control Hub */}
      {showSearchAndFilters && (
        <div className="bg-white border border-[#E6DFD5] rounded-3xl p-4 sm:p-5 space-y-4 shadow-xs">
          {/* Row 1: Search Input + Status Pills + View Mode */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Universal Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A08E8B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Invoice # (e.g. INV-101), client, dog, breed..."
              className="w-full pl-9 pr-9 py-2 sm:py-2.5 bg-[#FAF8F5] border border-[#E6DFD5] rounded-2xl text-xs text-[#240C0B] placeholder-[#A08E8B] focus:bg-white focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 outline-none transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A08E8B] hover:text-[#240C0B]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Quick Filter Buttons */}
          <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-2xl border border-[#E6DFD5] shrink-0 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-[#240C0B] text-white shadow-xs'
                  : 'text-[#7A6865] hover:text-[#240C0B]'
              }`}
            >
              All ({appointments.length})
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'paid'
                  ? 'bg-[#10B981] text-white shadow-xs'
                  : 'text-[#7A6865] hover:text-[#10B981]'
              }`}
            >
              Paid ({stats.paidCount})
            </button>
            <button
              onClick={() => setStatusFilter('due')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'due'
                  ? 'bg-[#F59E0B] text-white shadow-xs'
                  : 'text-[#7A6865] hover:text-[#F59E0B]'
              }`}
            >
              Due ({stats.pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'cancelled'
                  ? 'bg-[#64748B] text-white shadow-xs'
                  : 'text-[#7A6865] hover:text-[#64748B]'
              }`}
            >
              Cancelled
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-end gap-1 bg-[#FAF8F5] p-1 rounded-2xl border border-[#E6DFD5] shrink-0 self-end lg:self-auto">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-[#240C0B] shadow-2xs' : 'text-[#A08E8B] hover:text-[#240C0B]'
              }`}
              title="Table Ledger View"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-[#240C0B] shadow-2xs' : 'text-[#A08E8B] hover:text-[#240C0B]'
              }`}
              title="Receipt Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 2: Secondary Dropdown Filters & Sorting */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-[#F0ECE1] text-xs">
          {/* Time Period Filter */}
          <div>
            <label className="block text-[10px] font-bold text-[#A08E8B] uppercase tracking-wider mb-1">
              Time Period
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#240C0B] focus:border-[#FF6B00] outline-none cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="today">Today Only</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Date Range...</option>
            </select>
          </div>

          {/* Stylist / Groomer Filter */}
          <div>
            <label className="block text-[10px] font-bold text-[#A08E8B] uppercase tracking-wider mb-1">
              Stylist / Groomer
            </label>
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#240C0B] focus:border-[#FF6B00] outline-none cursor-pointer"
            >
              <option value="all">All Groomers</option>
              {staff.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.role})
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-[10px] font-bold text-[#A08E8B] uppercase tracking-wider mb-1">
              Invoice Amount
            </label>
            <select
              value={amountRange}
              onChange={(e) => setAmountRange(e.target.value as any)}
              className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#240C0B] focus:border-[#FF6B00] outline-none cursor-pointer"
            >
              <option value="all">Any Amount</option>
              <option value="under50">Under $50</option>
              <option value="50to100">$50 to $100</option>
              <option value="over100">Over $100</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-bold text-[#A08E8B] uppercase tracking-wider mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#240C0B] focus:border-[#FF6B00] outline-none cursor-pointer"
            >
              <option value="date_desc">Date: Newest First</option>
              <option value="date_asc">Date: Oldest First</option>
              <option value="amount_desc">Amount: High to Low</option>
              <option value="amount_asc">Amount: Low to High</option>
              <option value="invoice_asc">Invoice Number (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Picker if Selected */}
        {dateFilter === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 p-3 bg-[#FAF8F5] rounded-2xl border border-[#E6DFD5]">
            <span className="text-xs font-bold text-[#240C0B]">Date Range:</span>
            <input
              type="date"
              value={customDateStart}
              onChange={(e) => setCustomDateStart(e.target.value)}
              className="bg-white border border-[#D8D3C4] rounded-xl px-3 py-1 text-xs text-[#240C0B]"
            />
            <span className="text-xs text-[#A08E8B]">to</span>
            <input
              type="date"
              value={customDateEnd}
              onChange={(e) => setCustomDateEnd(e.target.value)}
              className="bg-white border border-[#D8D3C4] rounded-xl px-3 py-1 text-xs text-[#240C0B]"
            />
          </div>
        )}

        {/* Active Filter Badges & Results Counter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#240C0B]">
              Showing <strong className="text-[#FF6B00]">{invoiceList.length}</strong> of {appointments.length} invoices
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-[11px] font-bold text-[#FF6B00] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>
        </div>
      </div>
      )}

      {/* 4. Invoices Display: Table View or Card Grid */}
      {showInvoiceTable && (
        invoiceList.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-[#E6DFD5] rounded-3xl p-12 text-center space-y-4">
            <div className="w-14 h-14 bg-[#FAF8F5] border border-[#E6DFD5] rounded-2xl flex items-center justify-center mx-auto text-[#A08E8B]">
              <Receipt className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-base text-[#240C0B]">
                No invoices found
              </h3>
              <p className="text-xs text-[#7A6865] max-w-sm mx-auto">
                {hasActiveFilters
                  ? 'No invoices match your current search query or filter criteria. Try clearing some filters.'
                  : 'No appointments or invoices have been recorded yet.'}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-[#240C0B] text-white rounded-xl text-xs font-bold hover:bg-[#3D1816] transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : viewMode === 'list' ? (
        /* Dense Minimalist Table View */
        <div className="bg-white border border-[#E6DFD5] rounded-3xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E6DFD5] bg-[#FAF8F5] text-[10px] font-bold uppercase tracking-wider text-[#7A6865]">
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Client & Patient</th>
                  <th className="py-3.5 px-4">Treatment / Service</th>
                  <th className="py-3.5 px-4">Stylist</th>
                  <th className="py-3.5 px-4 text-right">Subtotal</th>
                  <th className="py-3.5 px-4 text-right">Total Amount</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">QR Code</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE1] text-xs">
                {invoiceList.map((inv) => (
                  <tr 
                    key={inv.appt.id} 
                    className="hover:bg-[#FAF8F5]/80 transition-colors group cursor-pointer"
                    onClick={() => openModal('invoiceModal', { appointment: inv.appt })}
                  >
                    {/* Invoice Number */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-[#240C0B] bg-[#FAF8F5] border border-[#D8D3C4] px-2 py-0.5 rounded-md text-[11px] group-hover:border-[#FF6B00] transition-colors">
                        {inv.invoiceNum}
                      </span>
                    </td>

                    {/* Date & Time */}
                    <td className="py-3 px-4 text-[#240C0B]">
                      <div className="font-medium text-xs">{inv.appt.date}</div>
                      <div className="text-[10px] text-[#A08E8B]">{inv.appt.start}</div>
                    </td>

                    {/* Client & Pet */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#240C0B] leading-tight">
                        {inv.petName}
                      </div>
                      <div className="text-[10px] text-[#7A6865] flex items-center gap-1 mt-0.5">
                        <span>{inv.ownerName}</span>
                        <span className="text-[#D8D3C4]">•</span>
                        <span className="truncate max-w-[100px]">{inv.petBreed}</span>
                      </div>
                    </td>

                    {/* Treatment / Service */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#240C0B] truncate max-w-[160px]">
                        {inv.serviceName}
                      </div>
                      {inv.retailAddon > 0 && (
                        <span className="text-[9px] text-[#2E8A81] font-bold bg-[#E6F4F1] px-1.5 py-0.2 rounded-sm inline-block mt-0.5">
                          +{formatPrice(inv.retailAddon)} retail
                        </span>
                      )}
                    </td>

                    {/* Groomer */}
                    <td className="py-3 px-4 text-[#7A6865] text-[11px]">
                      {inv.groomerName}
                    </td>

                    {/* Subtotal */}
                    <td className="py-3 px-4 text-right text-[#7A6865] font-mono text-[11px]">
                      {formatPrice(inv.taxableSubtotal)}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3 px-4 text-right">
                      <span className="font-display font-black text-sm text-[#240C0B]">
                        {formatPrice(inv.total)}
                      </span>
                      <span className="block text-[9px] text-[#A08E8B] font-mono">
                        incl. ${inv.tax.toFixed(2)} tax
                      </span>
                    </td>

                    {/* Status Pill */}
                    <td className="py-3 px-4 text-center">
                      {inv.isPaid ? (
                        <span className="inline-flex items-center gap-1 bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      ) : inv.isCancelled ? (
                        <span className="inline-flex items-center gap-1 bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          Cancelled
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(inv.appt.id, inv.appt.status);
                          }}
                          className="inline-flex items-center gap-1 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] border border-[#FDE68A] px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                          title="Click to mark as paid in full"
                        >
                          <Clock className="w-3 h-3 text-[#D97706]" /> Due (Pay)
                        </button>
                      )}
                    </td>

                    {/* Mini Scannable QR Code */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedQRAppt(inv.appt);
                        }}
                        className="p-1 rounded-lg border border-[#E6DFD5] bg-white hover:border-[#FF6B00] hover:bg-[#FFF8F3] transition-colors inline-block cursor-pointer shadow-2xs"
                        title="Click to enlarge scannable QR Code"
                      >
                        <QrCode className="w-4 h-4 text-[#240C0B]" />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        {/* View / Print PDF Invoice */}
                        <button
                          onClick={() => openModal('invoiceModal', { appointment: inv.appt })}
                          className="p-1.5 text-[#240C0B] hover:text-[#FF6B00] hover:bg-[#FFF3EB] rounded-lg transition-colors cursor-pointer"
                          title="Print / View Official PDF Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* WhatsApp Share */}
                        <button
                          onClick={() => handleShareWhatsApp(inv)}
                          className="p-1.5 text-[#2E8A81] hover:bg-[#E6F4F1] rounded-lg transition-colors cursor-pointer"
                          title="Send receipt to Client via WhatsApp"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        {/* Copy Summary */}
                        <button
                          onClick={() => handleCopyInvoice(inv)}
                          className="p-1.5 text-[#7A6865] hover:text-[#240C0B] hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer"
                          title="Copy Invoice Text"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Visual Receipt Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {invoiceList.map((inv) => (
            <div 
              key={inv.appt.id}
              onClick={() => openModal('invoiceModal', { appointment: inv.appt })}
              className="bg-white border border-[#E6DFD5] rounded-3xl p-5 hover:border-[#FF6B00] transition-all hover:shadow-md cursor-pointer flex flex-col justify-between space-y-4 group"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 border-b border-[#F0ECE1] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-xs text-[#240C0B] bg-[#FAF8F5] border border-[#D8D3C4] px-2 py-0.5 rounded-md group-hover:border-[#FF6B00]">
                      {inv.invoiceNum}
                    </span>
                    <span className="text-[11px] text-[#7A6865] font-medium">
                      {inv.appt.date} • {inv.appt.start}
                    </span>
                  </div>
                  <h3 className="font-display font-extrabold text-base text-[#240C0B] mt-1.5">
                    {inv.petName} <span className="text-xs font-normal text-[#7A6865]">({inv.ownerName})</span>
                  </h3>
                </div>

                <div>
                  {inv.isPaid ? (
                    <span className="inline-flex items-center gap-1 bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3" /> Paid
                    </span>
                  ) : inv.isCancelled ? (
                    <span className="inline-flex items-center gap-1 bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      Cancelled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                      <Clock className="w-3 h-3 text-[#D97706]" /> Due
                    </span>
                  )}
                </div>
              </div>

              {/* Card Content & Treatment */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-[#7A6865]">
                  <span>Service Treatment:</span>
                  <span className="font-bold text-[#240C0B] text-right truncate max-w-[170px]">
                    {inv.serviceName}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[#7A6865]">
                  <span>Stylist:</span>
                  <span className="font-medium text-[#240C0B]">{inv.groomerName}</span>
                </div>
                <div className="flex justify-between items-center text-[#7A6865]">
                  <span>Subtotal + Tax ({taxRate}%):</span>
                  <span className="font-mono text-[11px] text-[#240C0B]">
                    ${inv.taxableSubtotal.toFixed(2)} + ${inv.tax.toFixed(2)}
                  </span>
                </div>
                <div className="border-t border-[#F0ECE1] pt-2 flex justify-between items-baseline">
                  <span className="font-display font-bold text-xs uppercase tracking-wider text-[#240C0B]">
                    Total Amount:
                  </span>
                  <span className="font-display font-black text-xl text-[#240C0B]">
                    {formatPrice(inv.total)}
                  </span>
                </div>
              </div>

              {/* Embedded Tight Scannable QR Graphic Strip */}
              <div className="pt-2 border-t border-[#F0ECE1]">
                <InvoiceQRCode
                  invoiceNum={inv.invoiceNum}
                  date={inv.appt.date}
                  clientName={inv.petName}
                  ownerName={inv.ownerName}
                  serviceOrPackage={inv.serviceName}
                  subtotal={inv.taxableSubtotal}
                  taxRate={taxRate}
                  taxAmount={inv.tax}
                  totalAmount={inv.total}
                  isPaid={inv.isPaid}
                  clinicName={clinicName}
                  size={76}
                  className="w-full"
                />
              </div>

              {/* Card Action Footer */}
              <div className="flex items-center justify-between pt-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => openModal('invoiceModal', { appointment: inv.appt })}
                  className="px-3 py-1.5 bg-[#240C0B] hover:bg-[#3D1816] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>PDF Invoice</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleShareWhatsApp(inv)}
                    className="p-1.5 text-[#2E8A81] hover:bg-[#E6F4F1] rounded-xl transition-colors cursor-pointer"
                    title="Send via WhatsApp"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleCopyInvoice(inv)}
                    className="p-1.5 text-[#7A6865] hover:text-[#240C0B] hover:bg-[#FAF8F5] rounded-xl transition-colors cursor-pointer"
                    title="Copy Summary"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* 5. QR Code Quick View / Verification Popover Modal */}
      {selectedQRAppt && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedQRAppt(null)}
        >
          <div 
            className="bg-white border border-[#E6DFD5] rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E6DFD5]">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#240C0B]">
                <ShieldCheck className="w-4 h-4 text-[#2E8A81]" />
                <span>Invoice QR Verification</span>
              </div>
              <button
                onClick={() => setSelectedQRAppt(null)}
                className="p-1 text-[#A08E8B] hover:text-[#240C0B] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Large Scannable QR Code */}
            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E6DFD5] flex flex-col items-center">
              <InvoiceQRCode
                {...getInvoiceData(selectedQRAppt)}
                size={160}
                showLabels={false}
                className="border-none bg-transparent p-0 justify-center"
              />
              <p className="text-xs font-mono font-bold text-[#240C0B] mt-3">
                {formatShortInvoiceNumber(selectedQRAppt)}
              </p>
              <p className="text-[11px] text-[#7A6865] mt-0.5">
                Scan with any mobile camera or barcode scanner
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => {
                  const appt = selectedQRAppt;
                  setSelectedQRAppt(null);
                  openModal('invoiceModal', { appointment: appt });
                }}
                className="w-full py-2.5 bg-[#FF6B00] hover:bg-[#E55C00] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#FF6B00]/20 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Open Full PDF Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Executive Report & Visual Graphs Modal */}
      {reportModalOpen && (
        <PremiumReportModal 
          initialTab="invoices" 
          onClose={() => setReportModalOpen(false)} 
        />
      )}
    </div>
  );
};
