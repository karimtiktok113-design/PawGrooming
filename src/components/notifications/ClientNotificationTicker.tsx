import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { AdminNotification } from '../../types/auth';
import { Flame, Sparkles, AlertTriangle, CheckCircle2, ArrowRight, X, Radio } from 'lucide-react';

export const ClientNotificationTicker: React.FC = () => {
  const { clientNotifications, currentProfile, dismissPopupNotification } = useAuth();
  const { setView } = useApp();

  if (!currentProfile) return null;

  // Active undismissed 'ticker' notifications
  const activeTickers = clientNotifications.filter(n => {
    if (n.type !== 'ticker') return false;
    const dismissed = Array.isArray(n.dismissedBy) ? n.dismissedBy : [];
    return !dismissed.includes(currentProfile.profileId);
  });

  if (activeTickers.length === 0) return null;

  const current: AdminNotification = activeTickers[0];

  const handleDismiss = async () => {
    await dismissPopupNotification(current.id);
  };

  const handleAction = async () => {
    if (current.actionUrl) {
      const isExternal = current.actionUrl.startsWith('http://') || 
                         current.actionUrl.startsWith('https://') || 
                         current.actionTarget === '_blank';

      if (isExternal) {
        window.open(current.actionUrl, '_blank', 'noopener,noreferrer');
      } else {
        const validViews = ['dashboard', 'calendar', 'invoices', 'clients', 'services', 'alerts', 'loyalty', 'staff', 'revenue', 'business', 'gallery', 'settings'];
        if (validViews.includes(current.actionUrl)) {
          setView(current.actionUrl as any);
        }
      }
    }
    await handleDismiss();
  };

  return (
    <div className="w-full bg-gradient-to-r from-[#240C0B] via-[#351412] to-[#240C0B] text-white border-b border-theme-primary/40 px-4 py-2 flex items-center justify-between gap-3 text-xs shadow-md animate-fadeIn">
      <div className="flex items-center gap-3 overflow-hidden flex-1">
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-theme-primary text-white text-[10px] font-black uppercase tracking-wider shrink-0 shadow-xs">
          <Radio className="w-3 h-3 animate-pulse" /> LIVE TICKER
        </span>

        <div className="flex items-center gap-2 truncate text-[11px] sm:text-xs">
          <strong className="text-white font-black truncate">{current.title}:</strong>
          <span className="text-[#E6DFD5] truncate">{current.message}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {current.actionLabel && (
          <button
            onClick={handleAction}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-bold border border-white/20 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
          >
            <span>{current.actionLabel}</span>
            <ArrowRight className="w-3 h-3 text-theme-primary" />
          </button>
        )}

        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
          title="Dismiss ticker"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
