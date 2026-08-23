import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Mail, Phone, ExternalLink, X, Lock } from 'lucide-react';

export const InactiveAccountModal: React.FC = () => {
  const { inactiveModalOpen, setInactiveModalOpen, inactiveProfileDetails } = useAuth();

  if (!inactiveModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      {/* Glassmorphism Card */}
      <div className="relative w-full max-w-md bg-[#082854] border border-[#82B8F6]/40 shadow-[0_24px_70px_rgba(12,78,164,0.35)] rounded-3xl p-6 sm:p-8 text-[#E5F0FD] overflow-hidden transform transition-all animate-scaleUp">
        {/* Ambient Glow Accents with Palette Colors */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#138AEE]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-[#82B8F6]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Top Button */}
        <button
          type="button"
          onClick={() => setInactiveModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-[#82B8F6] hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0C4EA4] to-[#138AEE] border border-[#82B8F6]/40 flex items-center justify-center text-white shadow-lg shadow-[#138AEE]/30 animate-bounce-subtle">
              <ShieldAlert className="w-8 h-8 text-[#E5F0FD]" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#138AEE] text-white flex items-center justify-center shadow">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <span className="inline-block px-3 py-0.5 text-[10px] font-black tracking-wider uppercase rounded-full bg-[#138AEE]/20 text-[#82B8F6] border border-[#82B8F6]/30 mb-1.5">
              Access Restricted
            </span>
            <h3 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight">
              Account Inactive
            </h3>
          </div>
        </div>

        {/* Main Message Banner */}
        <div className="mt-4 p-4 rounded-2xl bg-[#061F42]/90 border border-[#82B8F6]/30 text-center space-y-1">
          <p className="text-sm font-bold text-[#82B8F6]">
            "Your account is currently inactive. Please contact support."
          </p>
          <p className="text-xs text-[#E5F0FD]/80 leading-relaxed">
            Your subscription profile has been paused or requires renewal from your system administrator.
          </p>
        </div>

        {/* Profile Snapshot if available */}
        {inactiveProfileDetails && (
          <div className="mt-4 p-3.5 rounded-2xl bg-[#061F42]/60 border border-[#82B8F6]/20 text-xs space-y-1.5">
            <div className="flex justify-between items-center text-[#82B8F6]">
              <span>Profile ID:</span>
              <span className="font-bold text-white font-mono">{inactiveProfileDetails.profileId}</span>
            </div>
            <div className="flex justify-between items-center text-[#82B8F6]">
              <span>Business:</span>
              <span className="font-bold text-white truncate max-w-[200px]">{inactiveProfileDetails.businessName}</span>
            </div>
            <div className="flex justify-between items-center text-[#82B8F6]">
              <span>Plan:</span>
              <span className="font-bold text-[#138AEE]">{inactiveProfileDetails.plan} Tier</span>
            </div>
            <div className="flex justify-between items-center text-[#82B8F6]">
              <span>Expiry Date:</span>
              <span className="font-bold text-white">{inactiveProfileDetails.expiryDate}</span>
            </div>
          </div>
        )}

        {/* Support Helpdesk Details */}
        <div className="mt-5 space-y-2.5">
          <a
            href="mailto:support@parkgrooming.com?subject=Account%20Reactivation%20Request"
            className="w-full py-3 px-4 rounded-xl bg-[#138AEE] hover:bg-[#0C75D0] border border-[#82B8F6]/40 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#138AEE]/30 transition-all active:scale-95"
          >
            <Mail className="w-4 h-4 text-[#E5F0FD]" />
            <span>Contact Support Desk</span>
          </a>

          <button
            type="button"
            onClick={() => setInactiveModalOpen(false)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0C4EA4]/50 border border-[#82B8F6]/30 hover:bg-[#0C4EA4] text-[#E5F0FD] font-bold text-xs transition-colors cursor-pointer"
          >
            Return to Login
          </button>
        </div>
      </div>
    </div>
  );
};
