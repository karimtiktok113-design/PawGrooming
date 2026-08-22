import { Client, Appointment, Settings, PurchasedRetailItem } from '../types';

export interface WhatsAppInvoiceData {
  invoiceNum: string;
  client: Client;
  appointment: Appointment;
  clinicSettings: Settings;
  serviceName?: string;
  packageName?: string;
  groomerName?: string;
  servicePrice: number;
  retailAddon?: number;
  purchasedItems?: PurchasedRetailItem[];
  discountAmount?: number;
  discountCode?: string;
  discountTitle?: string;
  taxRate: number;
  tax: number;
  total: number;
  pointsEarned: number;
  isPaid: boolean;
}

export function generateWhatsAppInvoiceText(data: WhatsAppInvoiceData): string {
  const {
    invoiceNum,
    client,
    appointment,
    clinicSettings,
    serviceName,
    packageName,
    groomerName,
    servicePrice,
    retailAddon = 0,
    purchasedItems,
    discountAmount = 0,
    discountCode = '',
    discountTitle = '',
    taxRate,
    tax,
    total,
    pointsEarned,
    isPaid
  } = data;

  const clinicName = clinicSettings?.name || clinicSettings?.salonName || 'PawBook Pro Grooming Studio';
  const clinicPhone = clinicSettings?.phone || '(555) 123-PAWS';
  const clinicEmail = clinicSettings?.email || 'care@pawbookpro.com';
  const clinicWebsite = clinicSettings?.website || 'www.pawbookpro.com';
  const clinicAddress = clinicSettings?.address || '100 Bark Avenue, Suite 4, San Francisco, CA 94107';

  const currencySymbol = clinicSettings?.currency === 'EUR' ? '€' : clinicSettings?.currency === 'GBP' ? '£' : '$';
  const fmt = (n?: number | null) => `${currencySymbol}${Number(n ?? 0).toFixed(2)}`;

  const lines: string[] = [
    `🐾 *${clinicName.toUpperCase()}* 🐾`,
    `*Official Pet Grooming Invoice & Receipt*`,
    `----------------------------------------`,
    `📄 *Invoice #:* ${invoiceNum}`,
    `📅 *Date:* ${appointment.date} at ${appointment.start}`,
    `👤 *Pet Parent:* ${client.owner}`,
    `🐶 *Patient:* ${client.name} (${client.breed || 'Canine'}, ${client.size || 'Standard'})`,
    `✂️ *Stylist:* ${groomerName || 'Master Groomer'}`,
    `----------------------------------------`,
  ];

  if (packageName) {
    lines.push(`✨ *Spa Package:* ${packageName} (Luxury Package Bundle)`);
    lines.push(`⏳ *Duration:* ${appointment.duration} mins`);
    lines.push(`💵 *Package Rate:* ${fmt(servicePrice)}`);
  } else {
    lines.push(`✨ *Service:* ${serviceName || 'Full Grooming Treatment'}`);
    lines.push(`⏳ *Duration:* ${appointment.duration} mins`);
    lines.push(`💵 *Service Rate:* ${fmt(servicePrice)}`);
  }

  const items = (purchasedItems && purchasedItems.length > 0) 
    ? purchasedItems 
    : (appointment.purchasedItems && appointment.purchasedItems.length > 0 ? appointment.purchasedItems : []);

  if (items.length > 0) {
    lines.push(`🛍️ *Retail Products Purchased:*`);
    items.forEach((item) => {
      lines.push(`   • ${item.name} (${item.quantity}x @ ${fmt(item.price)}) — ${fmt(item.price * item.quantity)}`);
    });
    if (items.length > 1) {
      lines.push(`   *Retail Products Total:* ${fmt(retailAddon || items.reduce((s, i) => s + i.price * i.quantity, 0))}`);
    }
  } else if (retailAddon > 0) {
    lines.push(`🛍️ *Retail Add-on:* Botanical Care & Spa (+${fmt(retailAddon)})`);
  }

  if (discountAmount > 0) {
    const promoLabel = discountCode ? ` (${discountCode})` : discountTitle ? ` (${discountTitle})` : '';
    lines.push(`🎉 *Promo Code Savings:* -${fmt(discountAmount)}${promoLabel}`);
  }

  lines.push(`📊 *Taxable Subtotal:* ${fmt(Math.max(0, servicePrice + retailAddon - discountAmount))}`);
  lines.push(`🏛️ *Sales Tax (${taxRate}%):* +${fmt(tax)}`);
  lines.push(`----------------------------------------`);
  lines.push(`💰 *TOTAL AMOUNT:* ${fmt(total)} ${isPaid ? '✅ (PAID IN FULL)' : '⏳ (PAYMENT DUE)'}`);
  lines.push(`⭐ *Paw Loyalty Points Earned:* +${pointsEarned} pts (Total: ${(client.points || 0) + (isPaid ? 0 : pointsEarned)} pts)`);
  lines.push(`----------------------------------------`);
  lines.push(`📍 *Studio Address:* ${clinicAddress}`);
  lines.push(`📞 *Phone:* ${clinicPhone}`);
  lines.push(`🌐 *Website:* ${clinicWebsite}`);
  lines.push(`📧 *Email:* ${clinicEmail}`);
  lines.push(``);
  lines.push(`Thank you for trusting ${clinicName} with ${client.name}'s care! 🐾❤️`);

  return lines.join('\n');
}

export function openWhatsAppInvoice(data: WhatsAppInvoiceData): boolean {
  try {
    const message = generateWhatsAppInvoiceText(data);
    const rawPhone = data.client.phone || '';
    // Strip non-numeric characters
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');

    // Format target URL
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
    return true;
  } catch (err) {
    console.error('Failed to launch WhatsApp:', err);
    return false;
  }
}
