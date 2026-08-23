import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Mail, Phone, ExternalLink, X, Lock } from 'lucide-react';

export const InactiveAccountModal: React.FC = () => {
  const { inactiveModalOpen, setInactiveModalOpen, inactiveProfileDetails } = useAuth();

  if (!inactiveModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      {/* Premium Glassmorphism Card */}
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-6 sm:p-8 text-[#240C0B] overflow-hidden transform transition-all animate-scaleUp">
        {/* Subtle Background Glow Accent */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#FF6B00]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-[#C9503A]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close Top Button */}
        <button
          onClick={() => setInactiveModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-[#7A6865] hover:text-[#240C0B] hover:bg-black/5 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF6B00] to-[#E8734A] flex items-center justify-center text-white shadow-lg shadow-[#FF6B00]/30 animate-bounce-subtle">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#C9503A] text-white flex items-center justify-center shadow">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <span className="inline-block px-3 py-0.5 text-[10px] font-black tracking-wider uppercase rounded-full bg-[#FEF2F2] text-[#C9503A] border border-[#FEE2E2] mb-1.5">
              Access Restricted
            </span>
            <h3 className="font-display font-black text-xl sm:text-2xl text-[#240C0B] tracking-tight">
              Account Inactive
            </h3>
          </div>
        </div>

        {/* Main Message Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-[#FFF8F5] border border-[#FFD9CE] text-center space-y-1">
          <p className="text-sm font-bold text-[#C9503A]">
            "Your account is currently inactive. Please contact support."
          </p>
          <p className="text-xs text-[#7A6865] leading-relaxed">
            Your subscription profile has been paused or requires renewal from your system administrator.
          </p>
        </div>

        {/* Profile Snapshot if available */}
        {inactiveProfileDetails && (
          <div className="mt-4 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E6DFD5] text-xs space-y-1.5">
            <div className="flex justify-between items-center text-[#7A6865]">
              <span>Profile ID:</span>
              <span className="font-bold text-[#240C0B] font-mono">{inactiveProfileDetails.profileId}</span>
            </div>
            <div className="flex justify-between items-center text-[#7A6865]">
              <span>Business:</span>
              <span className="font-bold text-[#240C0B] truncate max-w-[200px]">{inactiveProfileDetails.businessName}</span>
            </div>
            <div className="flex justify-between items-center text-[#7A6865]">
              <span>Plan:</span>
              <span className="font-bold text-[#FF6B00]">{inactiveProfileDetails.plan} Tier</span>
            </div>
            <div className="flex justify-between items-center text-[#7A6865]">
              <span>Expiry Date:</span>
              <span className="font-bold text-[#240C0B]">{inactiveProfileDetails.expiryDate}</span>
            </div>
          </div>
        )}

        {/* Support Helpdesk Details */}
        <div className="mt-5 space-y-2.5">
          <a
            href="mailto:support@parkgrooming.com?subject=Account%20Reactivation%20Request"
            className="w-full py-3 px-4 rounded-xl bg-[#240C0B] hover:bg-[#180504] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#240C0B]/20 transition-all active:scale-95"
          >
            <Mail className="w-4 h-4 text-[#FF6B00]" />
            <span>Contact Support Desk</span>
          </a>

          <button
            type="button"
            onClick={() => setInactiveModalOpen(false)}
            className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#E6DFD5] hover:bg-[#FAF8F5] text-[#240C0B] font-bold text-xs transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    </div>
  );
};
