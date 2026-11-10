import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Check, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * High-precision scannable 2D QR Code component.
 * Generates an SVG or high-resolution canvas QR Code with Dayananda Sagar University color accents.
 */
export function TicketQrCode({ ticketCode, size = 180 }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!ticketCode) return;

    let isMounted = true;
    QRCode.toDataURL(ticketCode, {
      width: size * 2, // 2x resolution for high-DPI retina screens & gate laser scanners
      margin: 1.5,
      color: {
        dark: '#002B55', // DSU Official Deep Navy
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H' // High error tolerance: allows clean scanning even if crumpled or dim
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate ticket QR code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [ticketCode, size]);

  const handleCopy = () => {
    navigator.clipboard.writeText(ticketCode);
    setCopied(true);
    toast.success('Pass code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `DSU_Pass_${ticketCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR Code pass image saved');
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative p-2.5 bg-white rounded-2xl border-2 border-[#002B55]/20 shadow-md group transition-all duration-300 hover:shadow-lg apple-press">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={`DSU Pass QR Code for ${ticketCode}`}
            width={size}
            height={size}
            className="rounded-xl block select-none"
          />
        ) : (
          <div
            style={{ width: size, height: size }}
            className="flex items-center justify-center bg-slate-50 rounded-xl"
          >
            <div className="w-6 h-6 border-2 border-[#002B55] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Floating Quick Download Pill on Hover */}
        <button
          type="button"
          onClick={handleDownload}
          title="Download high-resolution QR pass image"
          aria-label="Download QR pass image"
          className="absolute -bottom-2 -right-2 p-1.5 rounded-lg bg-[#002B55] text-white hover:bg-[#001B36] shadow-md transition-transform apple-press"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <span className="font-mono text-xs font-bold text-[#002B55] bg-blue-50/80 px-2.5 py-1 rounded-md border border-blue-200/80 tracking-wider">
          {ticketCode}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          title="Copy pass code"
          className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition apple-press"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
