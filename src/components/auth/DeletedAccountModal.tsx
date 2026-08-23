import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserX, ShieldAlert, X, ArrowRight, LogIn } from 'lucide-react';

export const DeletedAccountModal: React.FC = () => {
  const { deletedAccountNotice, setDeletedAccountNotice, setAuthView } = useAuth();

  if (!deletedAccountNotice) return null;

  const handleAcknowledge = () => {
    setDeletedAccountNotice(false);
    setAuthView('client_login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#1C0908] text-white border border-[#C9503A]/40 shadow-2xl rounded-3xl p-6 sm:p-8 overflow-hidden transform transition-all animate-scaleUp">
        {/* Glow Accent */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#C9503A]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-[#FF6B00]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleAcknowledge}
          className="absolute top-4 right-4 p-2 text-[#A08E8B] hover:text-white hover:bg-white/10 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#C9503A] to-[#E8734A] flex items-center justify-center text-white shadow-lg shadow-[#C9503A]/30">
              <UserX className="w-8 h-8" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1C0908] border-2 border-[#C9503A] text-[#C9503A] flex items-center justify-center shadow">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <span className="inline-block px-3 py-0.5 text-[10px] font-black tracking-wider uppercase rounded-full bg-[#C9503A]/20 text-[#FFA494] border border-[#C9503A]/40 mb-1.5">
              Simultaneous Auto-Logout Enforced
            </span>
            <h3 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight">
              Profile Removed
            </h3>
          </div>
        </div>

        {/* Description */}
        <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1.5">
          <p className="text-sm font-bold text-[#FFA494]">
            This profile was deleted from the central database.
          </p>
          <p className="text-xs text-[#A08E8B] leading-relaxed">
            Your active session was instantly terminated in real-time to preserve database integrity and security.
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={handleAcknowledge}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-[#C9503A] hover:bg-[#B34330] text-white font-bold rounded-2xl shadow-lg shadow-[#C9503A]/30 active:scale-95 transition-all cursor-pointer text-xs uppercase tracking-wider"
          >
            <LogIn className="w-4 h-4" />
            <span>Return to Client Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};
