import React from 'react';
import { ShieldAlert, LogOut, Lock, ArrowRight } from 'lucide-react';

interface RemoteLogoutNoticeModalProps {
  isOpen: boolean;
  reason: 'admin_logout' | 'single_device_conflict' | 'device_banned';
  onClose: () => void;
}

export const RemoteLogoutNoticeModal: React.FC<RemoteLogoutNoticeModalProps> = ({
  isOpen,
  reason,
  onClose
}) => {
  if (!isOpen) return null;

  const getReasonContent = () => {
    switch (reason) {
      case 'single_device_conflict':
        return {
          title: 'Logged Out: New Device Login',
          desc: 'Your account is configured for Single-Device Security Mode. A new login was initiated on another device or browser, which automatically terminated this session for your protection.',
          badge: 'Single Device Enforced',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
      case 'device_banned':
        return {
          title: 'Device Access Restricted',
          desc: 'This device credential has been inactivated and restricted from accessing this client studio by your system administrator.',
          badge: 'Device Credential Inactive',
          badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
      default:
        return {
          title: 'Remote Logout from Admin',
          desc: 'Your active studio session was safely logged out remotely from the Paw Grooming SuperAdmin Console.',
          badge: 'Admin Remote Logout',
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        };
    }
  };

  const content = getReasonContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-5 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
          <ShieldAlert className="w-8 h-8 stroke-[2.2]" />
        </div>

        <div className="space-y-2">
          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${content.badgeColor}`}>
            {content.badge}
          </span>
          <h3 className="text-xl font-display font-black text-white">
            {content.title}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
            {content.desc}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Return to Login Screen</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
