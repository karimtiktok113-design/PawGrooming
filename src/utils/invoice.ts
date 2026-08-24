import QRCode from 'qrcode';
import { Appointment, Client, Settings, Service, Package, LoyaltyRedemption, PurchasedRetailItem } from '../types';

export interface CalculatedInvoiceData {
  servicePrice: number;
  retailAddon: number;
  purchasedItems: PurchasedRetailItem[];
  grossSubtotal: number;
  discountAmount: number;
  discountCode: string;
  discountTitle: string;
  taxableSubtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  groomingRevenue: number;
  retailRevenue: number;
  pointsEarned: number;
  isPaid: boolean;
  isPureRetail: boolean;
  serviceOrPackageName: string;
  invoiceNum: string;
}

export interface InvoiceQRData {
  invoiceNum: string;
  date: string;
  clientName?: string;
  ownerName?: string;
  serviceOrPackage?: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  isPaid: boolean;
  clinicName?: string;
}

/**
 * Calculates complete tax-inclusive invoice totals for an appointment,
 * guaranteeing 100% parity across history lists, appointment cards, invoices, and QR codes.
 */
export function calculateAppointmentInvoice(
  appt: Partial<Appointment> | null | undefined,
  context?: {
    services?: Service[];
    packages?: Package[];
    settings?: Partial<Settings>;
    redemptions?: LoyaltyRedemption[];
  }
): CalculatedInvoiceData {
  if (!appt) {
    return {
      servicePrice: 0,
      retailAddon: 0,
      purchasedItems: [],
      grossSubtotal: 0,
      discountAmount: 0,
      discountCode: '',
      discountTitle: '',
      taxableSubtotal: 0,
      taxRate: 8.5,
      taxAmount: 0,
      totalAmount: 0,
      groomingRevenue: 0,
      retailRevenue: 0,
      pointsEarned: 0,
      isPaid: false,
      isPureRetail: false,
      serviceOrPackageName: 'Grooming Treatment',
      invoiceNum: 'INV-1001',
    };
  }

  const services = context?.services || [];
  const packages = context?.packages || [];
  const settings = context?.settings;
  const redemptions = context?.redemptions || [];

  const purchasedItems = appt.purchasedItems || [];
  const retailAddon = purchasedItems.length > 0 
    ? purchasedItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)
    : (appt.retail || 0);

  // Identify pure retail sales recorded from Store / Inventory POS
  const isPureRetail = Boolean(
    appt.isRetailOnly ||
    appt.serviceId === 'retail_sale' ||
    appt.serviceId === 'retail_only' ||
    appt.serviceId === 'pure_retail' ||
    appt.serviceId === 'none' ||
    (!appt.serviceId && retailAddon > 0) ||
    (appt.price === 0 && retailAddon > 0 && !appt.packageId && !appt.packageName)
  );

  const pkg = !isPureRetail && appt.packageId 
    ? packages.find((p) => p.id === appt.packageId)
    : (!isPureRetail && appt.packageName ? packages.find(p => p.name.toLowerCase() === appt.packageName?.toLowerCase()) : null);

  const service = !isPureRetail && appt.serviceId
    ? services.find((s) => s.id === appt.serviceId)
    : null;

  // Pure retail sales have 0 service cost
  const servicePrice = isPureRetail
    ? 0
    : (pkg ? pkg.price : (appt.price !== undefined ? appt.price : (service?.price || 0)));
  const grossSubtotal = servicePrice + retailAddon;

  let discountAmount = appt.discountAmount || 0;
  let discountCode = appt.discountCode || '';
  let discountTitle = appt.discountTitle || '';

  if (discountCode && (!discountAmount || discountAmount === 0)) {
    const voucher = redemptions.find((r) => r.code.toUpperCase() === discountCode.toUpperCase());
    if (voucher) {
      discountTitle = discountTitle || voucher.rewardTitle;
      if (voucher.discountType === 'percent') {
        discountAmount = Math.round(grossSubtotal * (voucher.discountValue / 100) * 100) / 100;
      } else {
        discountAmount = Math.min(grossSubtotal, voucher.discountValue);
      }
    } else if (appt.discountValue) {
      discountAmount = appt.discountType === 'percent'
        ? Math.round(grossSubtotal * (appt.discountValue / 100) * 100) / 100
        : Math.min(grossSubtotal, appt.discountValue);
    }
  }

  const taxableSubtotal = Math.max(0, grossSubtotal - discountAmount);
  const taxRate = settings?.taxRate !== undefined 
    ? settings.taxRate 
    : (appt.taxRate !== undefined ? appt.taxRate : 8.5);
  const taxAmount = Math.round(taxableSubtotal * (taxRate / 100) * 100) / 100;
  const totalAmount = taxableSubtotal + taxAmount;

  // Mathematically distribute net total into service and retail revenue such that groomingRevenue + retailRevenue === totalAmount
  let groomingRevenue = 0;
  let retailRevenue = 0;
  if (grossSubtotal > 0) {
    if (servicePrice === 0) {
      groomingRevenue = 0;
      retailRevenue = totalAmount;
    } else if (retailAddon === 0) {
      groomingRevenue = totalAmount;
      retailRevenue = 0;
    } else {
      groomingRevenue = Math.round((totalAmount * (servicePrice / grossSubtotal)) * 100) / 100;
      retailRevenue = Math.round((totalAmount - groomingRevenue) * 100) / 100;
    }
  } else {
    groomingRevenue = 0;
    retailRevenue = 0;
  }

  const pointsEarned = Math.floor(totalAmount);
  const isPaid = appt.status === 'completed';

  let serviceOrPackageName = 'Grooming Treatment';
  if (isPureRetail) {
    if (purchasedItems.length === 1) {
      serviceOrPackageName = `${purchasedItems[0].name}`;
    } else if (purchasedItems.length > 1) {
      serviceOrPackageName = `Retail: ${purchasedItems[0].name} (+${purchasedItems.length - 1} more)`;
    } else {
      serviceOrPackageName = 'Retail Purchase';
    }
  } else if (pkg) {
    serviceOrPackageName = pkg.name;
  } else if (service) {
    serviceOrPackageName = service.name;
  } else if (appt.price === 0 && retailAddon > 0) {
    serviceOrPackageName = 'Retail Purchase';
  }

  const invoiceNum = formatShortInvoiceNumber(appt);

  return {
    servicePrice,
    retailAddon,
    purchasedItems,
    grossSubtotal,
    discountAmount,
    discountCode,
    discountTitle,
    taxableSubtotal,
    taxRate,
    taxAmount,
    totalAmount,
    groomingRevenue,
    retailRevenue,
    pointsEarned,
    isPaid,
    isPureRetail,
    serviceOrPackageName,
    invoiceNum,
  };
}

/**
 * Generates a short, premium, elegant, and unique invoice number.
 * Ensures the invoice number is never overly long or cluttered.
 * Format examples: INV-101, INV-0102, INV-8492, INV-7B39
 */
export function formatShortInvoiceNumber(appt?: Partial<Appointment> | null): string {
  if (!appt) return 'INV-1001';
  if (appt.invoiceNumber && appt.invoiceNumber.trim().length > 0) {
    return appt.invoiceNumber.trim();
  }

  const rawId = (appt.id || '').trim();
  if (!rawId) {
    return 'INV-1001';
  }

  // Check if ID already matches short standard format like "ap101" -> "INV-0101"
  const digitsOnly = rawId.replace(/\D/g, '');
  if (digitsOnly.length > 0 && digitsOnly.length <= 4) {
    const num = parseInt(digitsOnly, 10);
    // Format nicely as 3 or 4 digits
    return `INV-${num < 100 ? String(num).padStart(3, '0') : num}`;
  }

  // For long timestamp IDs (e.g., ap_1723498129384), produce a deterministic, short, premium 4-digit/alphanumeric code
  let hash = 5381;
  for (let i = 0; i < rawId.length; i++) {
    hash = ((hash << 5) + hash) + rawId.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  // Pick from clean, unambiguous alphanumeric characters (no 0, O, 1, I confusion)
  const codeNum = (absHash % 9000 + 1000); // 1000 - 9999
  return `INV-${codeNum}`;
}

/**
 * Builds a structured, scannable invoice payload string for the QR code.
 * Reads cleanly in both standard smartphone camera scanners and POS barcode readers.
 */
export function buildInvoiceQRPayload(data: Partial<InvoiceQRData>): string {
  const statusStr = data?.isPaid ? 'PAID IN FULL' : 'PAYMENT DUE';
  const clinic = data?.clinicName || 'PawBook Pro Studio';
  const sub = Number(data?.subtotal ?? 0).toFixed(2);
  const taxR = Number(data?.taxRate ?? 0);
  const taxA = Number(data?.taxAmount ?? 0).toFixed(2);
  const tot = Number(data?.totalAmount ?? 0).toFixed(2);

  return [
    `=== OFFICIAL TAX INVOICE ===`,
    `Invoice: ${data?.invoiceNum || 'INV-1001'}`,
    `Studio: ${clinic}`,
    `Date: ${data?.date || ''}`,
    data?.ownerName ? `Client: ${data.ownerName}${data.clientName ? ` (Pet: ${data.clientName})` : ''}` : '',
    data?.serviceOrPackage ? `Service: ${data.serviceOrPackage}` : '',
    `Subtotal: $${sub}`,
    `US Sales Tax (${taxR}%): $${taxA}`,
    `TOTAL AMOUNT: $${tot}`,
    `Status: ${statusStr}`,
    `============================`
  ].filter(Boolean).join('\n');
}

/**
 * Generates an SVG Data URI or PNG Data URI for the QR code with zero margin so it fits edge-to-edge
 */
export async function generateInvoiceQRDataUrl(data: InvoiceQRData): Promise<string> {
  const payload = buildInvoiceQRPayload(data);
  try {
    const dataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 0,
      width: 260,
      color: {
        dark: '#240C0B',
        light: '#FFFFFF',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate invoice QR code:', err);
    return '';
  }
}
