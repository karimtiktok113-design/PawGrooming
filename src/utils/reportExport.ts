import { Appointment, Client, Service, Staff, Expense, Settings } from '../types';
import { calculateAppointmentInvoice } from './invoice';

export interface InvoiceReportItem {
  invoiceNum: string;
  date: string;
  time: string;
  status: string;
  isPaid: boolean;
  isCancelled: boolean;
  ownerName: string;
  phone: string;
  email: string;
  petName: string;
  petBreed: string;
  petSize: string;
  serviceName: string;
  groomerName: string;
  subtotal: number;
  groomingRev?: number;
  retailRev?: number;
  discountAmount: number;
  discountCode: string;
  taxRate: number;
  taxAmount: number;
  retailTotal: number;
  total: number;
  notes: string;
}

export interface RevenueDailyItem {
  date: string;
  dayName: string;
  count: number;
  groomingRev: number;
  retailRev: number;
  totalRev: number;
  avgTicket: number;
}

export interface RevenueServiceItem {
  name: string;
  category: string;
  count: number;
  totalRev: number;
  percentage: number;
}

export interface RevenueStaffItem {
  name: string;
  role: string;
  count: number;
  serviceRev: number;
  commissionRate: number;
  commissionPayout: number;
  studioNet: number;
}

/**
 * Downloads a raw string as a .csv file with UTF-8 BOM support for Excel
 */
export function downloadCSV(csvContent: string, fileName: string): void {
  // \uFEFF BOM ensures Excel properly recognizes UTF-8 symbols and currency
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName.endsWith('.csv') ? fileName : `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escape CSV field to handle quotes, commas, and line breaks safely
 */
function escapeCSV(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Generates an executive-grade, beautifully formatted CSV report for Invoices & Billing
 */
export function generatePremiumInvoicesCSV(
  invoices: InvoiceReportItem[],
  settings: Settings,
  filterInfo: {
    periodLabel?: string;
    statusLabel?: string;
    staffLabel?: string;
  } = {}
): string {
  const salonName = settings.salonName || settings.name || 'PawBook Pro Studio';
  const ownerName = settings.name || 'Salon Manager';
  const phone = settings.phone || '(555) 000-0000';
  const email = settings.email || 'care@pawbookpro.com';
  const currency = settings.currency || 'USD';
  const generatedAt = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const totalCount = invoices.length;
  const paidCount = invoices.filter((i) => i.isPaid).length;
  const dueCount = invoices.filter((i) => !i.isPaid && !i.isCancelled).length;
  const cancelledCount = invoices.filter((i) => i.isCancelled).length;

  const grossInvoiced = invoices.reduce((sum, i) => sum + i.total, 0);
  const totalTax = invoices.reduce((sum, i) => sum + i.taxAmount, 0);
  const totalGrooming = invoices.reduce((sum, i) => sum + (i.groomingRev !== undefined ? i.groomingRev : i.subtotal), 0);
  const totalRetail = invoices.reduce((sum, i) => sum + (i.retailRev !== undefined ? i.retailRev : i.retailTotal), 0);
  const avgTicket = totalCount > 0 ? grossInvoiced / totalCount : 0;

  const lines: string[] = [];

  // 1. Executive Metadata Header Banner
  lines.push(`"# ==========================================================================="`);
  lines.push(`"# PAWBOOK PRO - EXECUTIVE INVOICE & BILLING LEDGER REPORT"`);
  lines.push(`"# Studio: ${salonName} | Owner: ${ownerName}"`);
  lines.push(`"# Contact: ${phone} | ${email}"`);
  lines.push(`"# Generated: ${generatedAt} | Currency: ${currency}"`);
  if (filterInfo.periodLabel) lines.push(`"# Reporting Period: ${filterInfo.periodLabel}"`);
  if (filterInfo.statusLabel) lines.push(`"# Status Filter: ${filterInfo.statusLabel}"`);
  if (filterInfo.staffLabel) lines.push(`"# Stylist Filter: ${filterInfo.staffLabel}"`);
  lines.push(`"# ==========================================================================="`);
  lines.push(`"# FINANCIAL SUMMARY MATRIX:"`);
  lines.push(`"# Total Invoices: ${totalCount} | Paid: ${paidCount} | Pending Due: ${dueCount} | Cancelled: ${cancelledCount}"`);
  lines.push(`"# Gross Invoiced: ${currency} ${grossInvoiced.toFixed(2)} | Grooming Services: ${currency} ${totalGrooming.toFixed(2)} | Retail Products: ${currency} ${totalRetail.toFixed(2)}"`);
  lines.push(`"# Total Tax Collected: ${currency} ${totalTax.toFixed(2)} | Average Ticket: ${currency} ${avgTicket.toFixed(2)}"`);
  lines.push(`"# ==========================================================================="`);
  lines.push(``);

  // 2. Data Column Headers
  const headers = [
    'Invoice Number',
    'Date',
    'Time',
    'Status',
    'Payment State',
    'Client Owner',
    'Contact Phone',
    'Contact Email',
    'Pet Name',
    'Breed',
    'Dog Size',
    'Service / Package',
    'Assigned Stylist',
    `Subtotal (${currency})`,
    `Discount (${currency})`,
    'Discount Code',
    'Tax Rate (%)',
    `Tax Amount (${currency})`,
    `Retail Items (${currency})`,
    `Total Amount (${currency})`,
    'Client Notes / Special Instructions'
  ];
  lines.push(headers.map(h => escapeCSV(h)).join(','));

  // 3. Data Rows
  invoices.forEach((inv) => {
    const row = [
      inv.invoiceNum,
      inv.date,
      inv.time,
      inv.status.toUpperCase(),
      inv.isPaid ? 'PAID IN FULL' : inv.isCancelled ? 'CANCELLED' : 'PAYMENT DUE',
      inv.ownerName,
      inv.phone,
      inv.email,
      inv.petName,
      inv.petBreed,
      inv.petSize,
      inv.serviceName,
      inv.groomerName,
      inv.subtotal.toFixed(2),
      inv.discountAmount > 0 ? inv.discountAmount.toFixed(2) : '0.00',
      inv.discountCode || 'NONE',
      `${inv.taxRate}%`,
      inv.taxAmount.toFixed(2),
      inv.retailTotal.toFixed(2),
      inv.total.toFixed(2),
      inv.notes || 'None'
    ];
    lines.push(row.map(r => escapeCSV(r)).join(','));
  });

  return lines.join('\n');
}

/**
 * Generates an executive-grade, multi-section financial CSV report for Revenue & Earnings
 */
export function generatePremiumRevenueCSV(
  summary: {
    periodLabel: string;
    grossRev: number;
    groomRev: number;
    retailRev: number;
    expenses: number;
    netProfit: number;
    profitMargin: number;
    totalAppts: number;
    avgTicket: number;
    peakDayLabel: string;
    peakDayAmount: number;
  },
  dailyData: RevenueDailyItem[],
  servicesData: RevenueServiceItem[],
  staffData: RevenueStaffItem[],
  transactions: Array<{
    id: string;
    date: string;
    time: string;
    client: string;
    pet: string;
    service: string;
    staff: string;
    groomPrice: number;
    retailPrice: number;
    total: number;
    status: string;
  }>,
  settings: Settings
): string {
  const salonName = settings.salonName || settings.name || 'PawBook Pro Studio';
  const ownerName = settings.name || 'Salon Manager';
  const currency = settings.currency || 'USD';
  const generatedAt = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const lines: string[] = [];

  // 1. Executive Financial Banner
  lines.push(`"# ==========================================================================="`);
  lines.push(`"# PAWBOOK PRO - EXECUTIVE REVENUE & FINANCIAL ANALYTICS REPORT"`);
  lines.push(`"# Studio: ${salonName} | Owner: ${ownerName}"`);
  lines.push(`"# Reporting Period: ${summary.periodLabel} | Generated: ${generatedAt}"`);
  lines.push(`"# Currency Standard: ${currency}"`);
  lines.push(`"# ==========================================================================="`);
  lines.push(`"# EXECUTIVE FINANCIAL PERFORMANCE INDICATORS:"`);
  lines.push(`"# Gross Total Revenue: ${currency} ${summary.grossRev.toFixed(2)}"`);
  lines.push(`"# Grooming Services Sales: ${currency} ${summary.groomRev.toFixed(2)} (${summary.grossRev > 0 ? ((summary.groomRev / summary.grossRev) * 100).toFixed(1) : 0}%)"`);
  lines.push(`"# Retail Product Sales: ${currency} ${summary.retailRev.toFixed(2)} (${summary.grossRev > 0 ? ((summary.retailRev / summary.grossRev) * 100).toFixed(1) : 0}%)"`);
  lines.push(`"# Total Operational Expenses: ${currency} ${summary.expenses.toFixed(2)}"`);
  lines.push(`"# Net Operating Profit: ${currency} ${summary.netProfit.toFixed(2)} | Operating Profit Margin: ${summary.profitMargin.toFixed(1)}%"`);
  lines.push(`"# Total Transactions: ${summary.totalAppts} | Average Ticket Size: ${currency} ${summary.avgTicket.toFixed(2)}"`);
  lines.push(`"# Peak Earning Day: ${summary.peakDayLabel} (${currency} ${summary.peakDayAmount.toFixed(2)})"`);
  lines.push(`"# ==========================================================================="`);
  lines.push(``);

  // 2. Section: Daily Financial Matrix
  lines.push(`"# ---------------------------------------------------------------------------"`);
  lines.push(`"# SECTION 1: DAILY REVENUE & VOLUME BREAKDOWN"`);
  lines.push(`"# ---------------------------------------------------------------------------"`);
  const dailyHeaders = [
    'Date (ISO)',
    'Day / Label',
    'Completed Groomings',
    `Grooming Revenue (${currency})`,
    `Retail Revenue (${currency})`,
    `Daily Total Revenue (${currency})`,
    `Daily Average Ticket (${currency})`
  ];
  lines.push(dailyHeaders.map(h => escapeCSV(h)).join(','));

  dailyData.forEach((d) => {
    const row = [
      d.date,
      d.dayName,
      d.count,
      d.groomingRev.toFixed(2),
      d.retailRev.toFixed(2),
      d.totalRev.toFixed(2),
      d.avgTicket.toFixed(2)
    ];
    lines.push(row.map(r => escapeCSV(r)).join(','));
  });
  lines.push(``);

  // 3. Section: Service Composition
  lines.push(`"# ---------------------------------------------------------------------------"`);
  lines.push(`"# SECTION 2: SERVICE & TREATMENT REVENUE RANKING"`);
  lines.push(`"# ---------------------------------------------------------------------------"`);
  const serviceHeaders = [
    'Service / Add-on Name',
    'Category',
    'Bookings Count',
    `Total Gross Revenue (${currency})`,
    'Share of Total Sales (%)'
  ];
  lines.push(serviceHeaders.map(h => escapeCSV(h)).join(','));

  servicesData.forEach((s) => {
    const row = [
      s.name,
      s.category.toUpperCase(),
      s.count,
      s.totalRev.toFixed(2),
      `${s.percentage.toFixed(1)}%`
    ];
    lines.push(row.map(r => escapeCSV(r)).join(','));
  });
  lines.push(``);

  // 4. Section: Staff Groomer Performance & Commission
  lines.push(`"# ---------------------------------------------------------------------------"`);
  lines.push(`"# SECTION 3: STYLIST PERFORMANCE & COMMISSION SUMMARY"`);
  lines.push(`"# ---------------------------------------------------------------------------"`);
  const staffHeaders = [
    'Staff Groomer Name',
    'Role',
    'Completed Sessions',
    `Service Revenue Generated (${currency})`,
    'Commission Rate (%)',
    `Commission Payout (${currency})`,
    `Studio Net Revenue (${currency})`
  ];
  lines.push(staffHeaders.map(h => escapeCSV(h)).join(','));

  staffData.forEach((st) => {
    const row = [
      st.name,
      st.role,
      st.count,
      st.serviceRev.toFixed(2),
      `${st.commissionRate}%`,
      st.commissionPayout.toFixed(2),
      st.studioNet.toFixed(2)
    ];
    lines.push(row.map(r => escapeCSV(r)).join(','));
  });
  lines.push(``);

  // 5. Section: Transaction Ledger
  lines.push(`"# ---------------------------------------------------------------------------"`);
  lines.push(`"# SECTION 4: INDIVIDUAL TRANSACTION AUDIT LEDGER"`);
  lines.push(`"# ---------------------------------------------------------------------------"`);
  const txHeaders = [
    'Appointment ID',
    'Date',
    'Time',
    'Client Owner',
    'Pet Name',
    'Service Performed',
    'Stylist',
    `Service Price (${currency})`,
    `Retail Addon (${currency})`,
    `Total Transaction (${currency})`,
    'Status'
  ];
  lines.push(txHeaders.map(h => escapeCSV(h)).join(','));

  transactions.forEach((tx) => {
    const row = [
      tx.id,
      tx.date,
      tx.time,
      tx.client,
      tx.pet,
      tx.service,
      tx.staff,
      tx.groomPrice.toFixed(2),
      tx.retailPrice.toFixed(2),
      tx.total.toFixed(2),
      tx.status.toUpperCase()
    ];
    lines.push(row.map(r => escapeCSV(r)).join(','));
  });

  return lines.join('\n');
}
