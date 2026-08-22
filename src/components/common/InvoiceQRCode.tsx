import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, ShieldCheck } from 'lucide-react';
import { buildInvoiceQRPayload, InvoiceQRData } from '../../utils/invoice';

interface InvoiceQRCodeProps extends InvoiceQRData {
  size?: number;
  className?: string;
  showLabels?: boolean;
}

export const InvoiceQRCode: React.FC<InvoiceQRCodeProps> = ({
  invoiceNum = 'INV-1001',
  date = '',
  clientName,
  ownerName,
  serviceOrPackage,
  subtotal = 0,
  taxRate = 0,
  taxAmount = 0,
  totalAmount = 0,
  isPaid = false,
  clinicName,
  size = 100,
  className = '',
  showLabels = true,
}) => {
  const [qrSrc, setQrSrc] = useState<string>('');

  const safeSubtotal = Number(subtotal ?? 0);
  const safeTaxRate = Number(taxRate ?? 0);
  const safeTaxAmount = Number(taxAmount ?? 0);
  const safeTotalAmount = Number(totalAmount ?? 0);

  useEffect(() => {
    let isMounted = true;

    const payload = buildInvoiceQRPayload({
      invoiceNum,
      date,
      clientName,
      ownerName,
      serviceOrPackage,
      subtotal: safeSubtotal,
      taxRate: safeTaxRate,
      taxAmount: safeTaxAmount,
      totalAmount: safeTotalAmount,
      isPaid,
      clinicName,
    });

    QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 0,
      width: Math.max(size * 3, 300), // Ultra-sharp high DPI rendering
      color: {
        dark: '#240C0B',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (isMounted) {
          setQrSrc(url);
        }
      })
      .catch((err) => {
        console.error('Error generating invoice QR code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [
    invoiceNum,
    date,
    clientName,
    ownerName,
    serviceOrPackage,
    safeSubtotal,
    safeTaxRate,
    safeTaxAmount,
    safeTotalAmount,
    isPaid,
    clinicName,
    size,
  ]);

  return (
    <div className={`flex items-center gap-3.5 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6DFD5] text-[#240C0B] ${className}`}>
      {/* Scannable QR Code Graphic - tight edge-to-edge square fit */}
      <div 
        className="qr-code-box bg-white p-0.5 rounded-lg border border-[#D8D3C4] shadow-xs flex items-center justify-center shrink-0 overflow-hidden"
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
      >
        {qrSrc ? (
          <img
            src={qrSrc}
            alt={`QR Code for Invoice ${invoiceNum}`}
            className="qr-code-img w-full h-full object-contain block aspect-square"
            style={{ 
              width: '100%', 
              height: '100%', 
              maxWidth: '100%', 
              maxHeight: '100%',
              objectFit: 'contain',
              imageRendering: 'pixelated',
              border: 'none',
              borderRadius: '0px',
              padding: '0px',
              margin: '0px',
              display: 'block'
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#A08E8B] gap-1">
            <QrCode className="w-6 h-6 animate-pulse" />
            <span className="text-[9px] font-mono">Loading...</span>
          </div>
        )}
      </div>

      {/* Label and Scannable Metadata */}
      {showLabels && (
        <div className="text-left space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#2E8A81]">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Digital Invoice QR</span>
          </div>
          <p className="text-[11px] font-bold text-[#240C0B] leading-tight truncate">
            Scan to Verify & Save
          </p>
          <p className="text-[10px] text-[#6E5B58] leading-tight">
            Encodes Invoice <strong className="text-[#240C0B] font-mono">{invoiceNum}</strong>, Subtotal (${safeSubtotal.toFixed(2)}), Tax (${safeTaxAmount.toFixed(2)}), and Total (${safeTotalAmount.toFixed(2)}).
          </p>
        </div>
      )}
    </div>
  );
};
