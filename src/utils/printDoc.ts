/**
 * Print & Document Export Utility for PawBook Pro
 * Provides bulletproof printing support across sandboxed iframes, desktop browsers,
 * tablet/mobile devices, and standalone popup windows.
 */

export const STANDALONE_PRINT_STYLES = `
  @page {
    size: A4 portrait;
    margin: 8mm 10mm;
  }

  *, *::before, *::after {
    box-sizing: border-box !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  html, body {
    background: #ffffff !important;
    background-color: #ffffff !important;
    color: #240C0B !important;
    font-family: "Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
    margin: 0 !important;
    padding: 0 !important;
    font-size: 12px !important;
    line-height: 1.4 !important;
    width: 100% !important;
  }

  .font-display {
    font-family: "Fredoka", "Nunito Sans", -apple-system, sans-serif !important;
  }

  .font-mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
  }

  .no-print {
    display: none !important;
  }

  .printable-area {
    width: 100% !important;
    max-width: 800px !important;
    margin: 0 auto !important;
    background: #ffffff !important;
  }

  /* Table styling */
  table {
    width: 100% !important;
    border-collapse: collapse !important;
    margin-top: 10px !important;
    margin-bottom: 12px !important;
    page-break-inside: auto !important;
  }

  thead {
    display: table-header-group !important;
  }

  thead tr {
    background-color: #FAF8F5 !important;
    border-top: 2px solid #240C0B !important;
    border-bottom: 2px solid #240C0B !important;
  }

  th {
    padding: 8px 6px !important;
    font-size: 10px !important;
    font-weight: 800 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.06em !important;
    color: #240C0B !important;
    text-align: left !important;
  }

  th.text-right, td.text-right {
    text-align: right !important;
  }

  th.text-center, td.text-center {
    text-align: center !important;
  }

  tbody tr {
    border-bottom: 1px solid #F1EEE6 !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  tbody tr:nth-child(even) {
    background-color: #FAF8F5/50 !important;
  }

  td {
    padding: 7px 6px !important;
    font-size: 11px !important;
    vertical-align: middle !important;
  }

  /* Cards and layout grids */
  .grid {
    display: grid !important;
  }

  .grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }

  .grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
  }

  .gap-3 { gap: 12px !important; }
  .gap-4 { gap: 16px !important; }

  .kpi-card {
    border: 1px solid #E6DFD5 !important;
    border-radius: 12px !important;
    padding: 12px !important;
    background-color: #FAF8F5 !important;
  }

  .badge {
    display: inline-block !important;
    padding: 2px 8px !important;
    border-radius: 9999px !important;
    font-size: 9px !important;
    font-weight: 800 !important;
    text-transform: uppercase !important;
  }

  .badge-paid {
    background-color: #DCFCE7 !important;
    color: #166534 !important;
    border: 1px solid #BBF7D0 !important;
  }

  .badge-due {
    background-color: #FEF3C7 !important;
    color: #92400E !important;
    border: 1px solid #FDE68A !important;
  }

  .badge-cancelled {
    background-color: #FEE2E2 !important;
    color: #991B1B !important;
    border: 1px solid #FECACA !important;
  }

  /* Images */
  img.clinic-logo-img {
    width: 56px !important;
    height: 56px !important;
    max-width: 56px !important;
    max-height: 56px !important;
    object-fit: cover !important;
    border-radius: 12px !important;
    border: 2px solid #240C0B !important;
    display: block !important;
  }

  tr, td, th, div {
    break-inside: avoid !important;
  }

  .print-banner {
    background: #240C0B;
    color: #ffffff;
    padding: 12px 18px;
    border-radius: 14px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-family: "Nunito Sans", system-ui, -apple-system, sans-serif;
  }

  .print-action-btn {
    background: #FF6B00;
    color: #ffffff;
    border: none;
    font-weight: 800;
    font-size: 13px;
    padding: 8px 18px;
    border-radius: 10px;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  }

  .close-action-btn {
    background: rgba(255,255,255,0.15);
    color: #ffffff;
    border: none;
    font-weight: 700;
    font-size: 12px;
    padding: 8px 14px;
    border-radius: 10px;
    cursor: pointer;
    margin-left: 8px;
  }

  @media print {
    .print-banner { display: none !important; }
    .no-print { display: none !important; }
  }
`;

/**
 * Builds a standalone HTML wrapper document with Google Fonts & Tailwind CDN
 */
export function buildStandaloneDocumentHTML(title: string, innerHtml: string, showBanner = false): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>${title}</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700;800&family=Nunito+Sans:ital,opsz,wght@0,6..12,400..900;1,6..12,400..900&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              'theme-primary': '#FF6B00',
              'theme-light': '#FFF5EE'
            },
            fontFamily: {
              display: ['Fredoka', 'Nunito Sans', 'sans-serif'],
              sans: ['Nunito Sans', 'sans-serif'],
              mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
            }
          }
        }
      }
    </script>
    <style>
      ${STANDALONE_PRINT_STYLES}
    </style>
  </head>
  <body class="bg-white p-3 sm:p-6 text-[#240C0B]">
    ${showBanner ? `
      <div class="print-banner no-print max-w-[800px] mx-auto">
        <div style="font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
          <span>🖨️</span>
          <span><strong>${title}</strong> — Ready to Print / Save as PDF</span>
        </div>
        <div>
          <button class="print-action-btn" onclick="window.print()">Print / PDF</button>
          <button class="close-action-btn" onclick="window.close()">Close Window</button>
        </div>
      </div>
    ` : ''}
    <div class="printable-area max-w-[800px] mx-auto bg-white">
      ${innerHtml}
    </div>
    <script>
      window.onload = function() {
        setTimeout(function() {
          try {
            window.focus();
            window.print();
          } catch(e) {
            console.error('Print trigger failed', e);
          }
        }, 350);
      };
    </script>
  </body>
</html>`;
}

/**
 * Robust print trigger that handles:
 * 1. Hidden iframe print (best for sandboxed iframe environments)
 * 2. Dedicated popup print window (fallback)
 * 3. Direct window.print() (desktop/mobile tabs)
 */
export function triggerPrintDocument(
  title: string, 
  containerIdOrHtml: string, 
  options?: { isHtml?: boolean; fallbackFilename?: string }
): void {
  let contentHtml = '';

  if (options?.isHtml) {
    contentHtml = containerIdOrHtml;
  } else {
    const el = document.getElementById(containerIdOrHtml);
    if (!el) {
      console.warn(`Print container '#${containerIdOrHtml}' not found in DOM.`);
      try {
        window.focus();
        window.print();
      } catch (err) {
        console.error('Direct print failed', err);
      }
      return;
    }
    contentHtml = el.innerHTML;
  }

  const isIframe = window.self !== window.top;
  const fullHtml = buildStandaloneDocumentHTML(title, contentHtml, true);

  // Method A: Hidden Iframe Injection (100% reliable inside sandboxed iframe without popup blocker)
  try {
    const hiddenFrameId = 'pawbook-print-iframe';
    let frame = document.getElementById(hiddenFrameId) as HTMLIFrameElement | null;
    if (frame) {
      document.body.removeChild(frame);
    }
    frame = document.createElement('iframe');
    frame.id = hiddenFrameId;
    frame.style.position = 'fixed';
    frame.style.right = '0';
    frame.style.bottom = '0';
    frame.style.width = '0px';
    frame.style.height = '0px';
    frame.style.border = 'none';
    frame.style.visibility = 'hidden';
    document.body.appendChild(frame);

    const frameDoc = frame.contentWindow?.document;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(buildStandaloneDocumentHTML(title, contentHtml, false));
      frameDoc.close();

      setTimeout(() => {
        try {
          frame?.contentWindow?.focus();
          frame?.contentWindow?.print();
        } catch (e) {
          console.warn('Iframe print execution fallback:', e);
        }
      }, 400);
    }
  } catch (iframeErr) {
    console.warn('Hidden iframe print error:', iframeErr);
  }

  // Method B: If user is on a top-level tab or allowed popups, open popup
  if (!isIframe) {
    try {
      window.focus();
      window.print();
    } catch (e) {
      console.warn('Direct print warning:', e);
    }
  } else {
    try {
      const printWin = window.open('', '_blank', 'width=880,height=1050');
      if (printWin) {
        printWin.document.open();
        printWin.document.write(fullHtml);
        printWin.document.close();
      }
    } catch (popupErr) {
      console.warn('Popup print window error:', popupErr);
    }
  }
}

/**
 * Directly downloads a standalone, styled HTML document for offline printing or archival
 */
export function downloadPrintableHTML(title: string, containerIdOrHtml: string, filename: string, isHtml = false): void {
  let contentHtml = '';
  if (isHtml) {
    contentHtml = containerIdOrHtml;
  } else {
    const el = document.getElementById(containerIdOrHtml);
    if (!el) return;
    contentHtml = el.innerHTML;
  }

  const fullHtml = buildStandaloneDocumentHTML(title, contentHtml, true);
  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Formats a clean executive report printout in HTML ready for printing
 */
export function generateExecutiveReportHTML(data: {
  title: string;
  type: 'invoices' | 'revenue';
  periodLabel: string;
  clinicName: string;
  clinicOwner: string;
  clinicPhone?: string;
  clinicEmail?: string;
  clinicAddress?: string;
  currency: string;
  metrics: {
    grossTotal: number;
    groomingTotal: number;
    retailTotal: number;
    taxTotal: number;
    netProfit: number;
    profitMargin: number;
    totalCount: number;
    paidCount: number;
    dueCount: number;
    avgTicket: number;
    paidRate: number;
  };
  services: { name: string; count: number; total: number; percentage: number }[];
  staff?: { name: string; role: string; count: number; serviceRev: number; commissionPayout: number; studioNet: number }[];
  transactions: {
    invoiceNum: string;
    date: string;
    time: string;
    ownerName: string;
    petName: string;
    serviceName: string;
    groomerName: string;
    subtotal: number;
    taxAmount: number;
    total: number;
    isPaid: boolean;
    isCancelled?: boolean;
  }[];
}): string {
  const {
    title,
    type,
    periodLabel,
    clinicName,
    clinicOwner,
    clinicPhone,
    clinicEmail,
    clinicAddress,
    currency,
    metrics,
    services,
    staff,
    transactions
  } = data;

  const now = new Date();
  const dateGenerated = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return `
    <div class="space-y-6 text-[#240C0B]">
      <!-- Header Section -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #240C0B; padding-bottom: 16px;">
        <div>
          <h1 style="font-family: 'Fredoka', sans-serif; font-size: 24px; font-weight: 800; margin: 0; color: #240C0B; letter-spacing: -0.02em;">
            ${clinicName}
          </h1>
          <p style="margin: 3px 0 0 0; font-size: 11px; color: #7A6865;">
            ${clinicAddress ? `${clinicAddress} • ` : ''}${clinicPhone ? `${clinicPhone} • ` : ''}${clinicEmail || ''}
          </p>
          <div style="margin-top: 6px; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 11px; font-weight: 700; background: #FAF8F5; border: 1px solid #E6DFD5; padding: 2px 8px; border-radius: 6px;">
              Manager: ${clinicOwner || 'Master Stylist'}
            </span>
          </div>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #FF6B00; background: #FFF5EE; border: 1px solid #FFE4D6; padding: 3px 10px; border-radius: 9999px; display: inline-block;">
            Executive Financial Statement
          </span>
          <h2 style="font-size: 16px; font-weight: 800; margin: 6px 0 2px 0; color: #240C0B;">
            ${title}
          </h2>
          <p style="font-size: 11px; color: #7A6865; margin: 0;">
            Period: <strong>${periodLabel}</strong> | Generated: ${dateGenerated}
          </p>
        </div>
      </div>

      <!-- Executive KPI Cards -->
      <div class="grid grid-cols-4 gap-3">
        <div class="kpi-card">
          <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #A08E8B; display: block;">Gross Invoiced / Revenue</span>
          <div style="font-size: 18px; font-weight: 800; font-family: 'Fredoka', sans-serif; color: #240C0B; margin: 4px 0 2px 0;">
            ${currency} ${metrics.grossTotal.toFixed(2)}
          </div>
          <span style="font-size: 10px; color: #7A6865;">${metrics.totalCount} total bookings</span>
        </div>

        <div class="kpi-card" style="background-color: #F0FDF4; border-color: #DCFCE7;">
          <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #166534; display: block;">Settled & Paid</span>
          <div style="font-size: 18px; font-weight: 800; font-family: 'Fredoka', sans-serif; color: #166534; margin: 4px 0 2px 0;">
            ${metrics.paidRate.toFixed(0)}%
          </div>
          <span style="font-size: 10px; color: #15803d;">${metrics.paidCount} paid transactions</span>
        </div>

        <div class="kpi-card" style="background-color: #FFFBEB; border-color: #FEF3C7;">
          <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #92400E; display: block;">Payment Due</span>
          <div style="font-size: 18px; font-weight: 800; font-family: 'Fredoka', sans-serif; color: #92400E; margin: 4px 0 2px 0;">
            ${metrics.dueCount} Due
          </div>
          <span style="font-size: 10px; color: #B45309;">Avg: ${currency} ${metrics.avgTicket.toFixed(2)}</span>
        </div>

        <div class="kpi-card" style="background-color: #FAF8F5; border-color: #E6DFD5;">
          <span style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #A08E8B; display: block;">Net Operating Profit</span>
          <div style="font-size: 18px; font-weight: 800; font-family: 'Fredoka', sans-serif; color: #059669; margin: 4px 0 2px 0;">
            ${currency} ${metrics.netProfit.toFixed(2)}
          </div>
          <span style="font-size: 10px; color: #047857;">Margin: ${metrics.profitMargin.toFixed(1)}%</span>
        </div>
      </div>

      <!-- Services Breakdown Table -->
      ${services && services.length > 0 ? `
        <div style="margin-top: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <h3 style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #240C0B; margin: 0;">
              Service & Treatment Revenue Distribution
            </h3>
            <span style="font-size: 10px; color: #7A6865;">Grooming: ${currency} ${metrics.groomingTotal.toFixed(2)} | Retail: ${currency} ${metrics.retailTotal.toFixed(2)}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Service Name</th>
                <th class="text-center">Count</th>
                <th class="text-right">Total Generated</th>
                <th class="text-right">Revenue Share</th>
              </tr>
            </thead>
            <tbody>
              ${services.map(s => `
                <tr>
                  <td style="font-weight: 700;">${s.name}</td>
                  <td class="text-center">${s.count}</td>
                  <td class="text-right" style="font-family: monospace; font-weight: 700;">${currency} ${s.total.toFixed(2)}</td>
                  <td class="text-right">${s.percentage.toFixed(1)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      <!-- Staff Breakdown Table (if Revenue tab) -->
      ${type === 'revenue' && staff && staff.length > 0 ? `
        <div style="margin-top: 14px;">
          <h3 style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #240C0B; margin: 0 0 4px 0;">
            Stylist Production & Commission Breakdown
          </h3>
          <table>
            <thead>
              <tr>
                <th>Groomer / Staff</th>
                <th>Role</th>
                <th class="text-center">Grooms</th>
                <th class="text-right">Gross Service Rev</th>
                <th class="text-right">Commission Payout</th>
                <th class="text-right">Studio Net</th>
              </tr>
            </thead>
            <tbody>
              ${staff.map(st => `
                <tr>
                  <td style="font-weight: 700;">${st.name}</td>
                  <td style="color: #7A6865;">${st.role}</td>
                  <td class="text-center">${st.count}</td>
                  <td class="text-right" style="font-family: monospace;">${currency} ${st.serviceRev.toFixed(2)}</td>
                  <td class="text-right" style="font-family: monospace; color: #166534;">${currency} ${st.commissionPayout.toFixed(2)}</td>
                  <td class="text-right" style="font-family: monospace; font-weight: 800;">${currency} ${st.studioNet.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      <!-- Detailed Transaction Ledger Table -->
      <div style="margin-top: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <h3 style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #240C0B; margin: 0;">
            Transaction Ledger & Billing Audit (${transactions.length} Records)
          </h3>
          <span style="font-size: 11px; font-weight: 800; color: #FF6B00;">
            Total: ${currency} ${metrics.grossTotal.toFixed(2)}
          </span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date & Time</th>
              <th>Client / Pet</th>
              <th>Treatment</th>
              <th>Stylist</th>
              <th class="text-right">Subtotal</th>
              <th class="text-right">Tax</th>
              <th class="text-right">Total</th>
              <th class="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(tx => `
              <tr>
                <td style="font-family: monospace; font-weight: 800; color: #FF6B00;">${tx.invoiceNum}</td>
                <td style="color: #7A6865; white-space: nowrap;">${tx.date} ${tx.time}</td>
                <td><strong>${tx.ownerName}</strong> <span style="color: #A08E8B;">(${tx.petName})</span></td>
                <td>${tx.serviceName}</td>
                <td style="color: #7A6865;">${tx.groomerName}</td>
                <td class="text-right" style="font-family: monospace;">${currency} ${tx.subtotal.toFixed(2)}</td>
                <td class="text-right" style="font-family: monospace; color: #A08E8B;">${currency} ${tx.taxAmount.toFixed(2)}</td>
                <td class="text-right" style="font-family: monospace; font-weight: 800;">${currency} ${tx.total.toFixed(2)}</td>
                <td class="text-center">
                  <span class="badge ${tx.isPaid ? 'badge-paid' : tx.isCancelled ? 'badge-cancelled' : 'badge-due'}">
                    ${tx.isPaid ? 'PAID' : tx.isCancelled ? 'CANCELLED' : 'DUE'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Verification Footer -->
      <div style="border-top: 1px dashed #D8D3C4; padding-top: 16px; margin-top: 20px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 10px; color: #7A6865;">
        <div>
          <p style="margin: 0 0 2px 0;">Official accounting record generated by <strong>PawBook Pro</strong>.</p>
          <p style="margin: 0;">This document serves as an authorized financial ledger for tax, commission, and auditing purposes.</p>
        </div>
        <div style="text-align: right; min-width: 180px;">
          <div style="border-bottom: 1px solid #240C0B; height: 30px; margin-bottom: 4px;"></div>
          <span>Authorized Signature / Stamp</span>
        </div>
      </div>
    </div>
  `;
}
