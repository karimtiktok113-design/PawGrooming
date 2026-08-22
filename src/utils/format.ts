export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  CAD: 'C$',
  AUD: 'A$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  INR: '₹',
  AED: 'AED ',
  SAR: 'SAR ',
  CHF: 'CHF ',
};

export function getCurrencySymbol(currency?: string): string {
  if (!currency) return '$';
  return CURRENCY_SYMBOLS[currency] || (currency.length <= 3 ? currency + ' ' : '$');
}

export function formatPrice(amount: number, currency?: string): string {
  const symbol = getCurrencySymbol(currency);
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const formatted = num.toLocaleString(undefined, {
    minimumFractionDigits: Number.isInteger(num) ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

export function formatISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
