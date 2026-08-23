import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { AdminNotification } from '../../types/auth';
import { Sparkles, ArrowRight, X, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ClientNotificationTakeover: React.FC = () => {
  const { clientNotifications, currentProfile, dismissPopupNotification } = useAuth();
  const { setView } = useApp();

  if (!currentProfile) return null;

  // Active undismissed 'modal_takeover' notifications
  const activeTakeovers = clientNotifications.filter(n => {
    if (n.type !== 'modal_takeover') return false;
    const dismissed = Array.isArray(n.dismissedBy) ? n.dismissedBy : [];
    return !dismissed.includes(currentProfile.profileId);
  });

  if (activeTakeovers.length === 0) return null;

  const current: AdminNotification = activeTakeovers[0];

  const handleDismiss = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    await dismissPopupNotification(current.id);
  };

  const handleAction = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (current.actionUrl) {
      const url = current.actionUrl.trim();
      const isExternal = url.startsWith('http://') || 
                         url.startsWith('https://') || 
                         url.startsWith('//') ||
                         url.startsWith('mailto:') ||
                         url.startsWith('tel:') ||
                         current.actionTarget === '_blank';

      if (isExternal) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        const cleanTarget = url.replace(/^\//, '').toLowerCase();
        const validViews = ['dashboard', 'calendar', 'invoices', 'clients', 'services', 'alerts', 'loyalty', 'staff', 'revenue', 'business', 'gallery', 'settings'];
        if (validViews.includes(cleanTarget)) {
          setView(cleanTarget as any);
        } else {
          window.open(`https://${url}`, '_blank', 'noopener,noreferrer');
        }
      }
    }
    await handleDismiss(e);
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-[#FAF8F5] text-[#240C0B] rounded-3xl border border-white/20 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 animate-scaleUp relative overflow-hidden my-auto">
        <div className="absolute top-4 right-4">
          <button
            type="button"
            onClick={(e) => handleDismiss(e)}
            className="p-2 rounded-full bg-[#E6DFD5] hover:bg-[#D8D3C4] text-[#240C0B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hero Image if available */}
        {current.imageUrl && (
          <div className="w-full h-52 sm:h-64 rounded-2xl overflow-hidden border border-[#E6DFD5] shadow-sm">
            <img 
              src={current.imageUrl} 
              alt={current.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <div className="space-y-3 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-theme-light text-theme-primary border border-theme-primary/30">
            <Sparkles className="w-4 h-4" /> Official Platform Announcement
          </span>

          <h2 className="font-display font-black text-2xl sm:text-3xl text-[#240C0B] leading-tight">
            {current.title}
          </h2>

          <div className="text-sm text-[#5C4A47] leading-relaxed max-h-60 overflow-y-auto p-4 bg-white rounded-2xl border border-[#E6DFD5] text-left shadow-2xs whitespace-pre-line">
            {current.message}
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {current.actionLabel && (
            <button
              type="button"
              onClick={(e) => handleAction(e)}
              className="btn-primary w-full sm:w-auto px-8 py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <span>{current.actionLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={(e) => handleDismiss(e)}
            className="w-full sm:w-auto px-6 py-3 rounded-full border border-[#E6DFD5] bg-white hover:bg-[#FAF8F5] text-[#7A6865] hover:text-[#240C0B] text-sm font-bold transition-all cursor-pointer"
          >
            Continue to Studio
          </button>
        </div>
      </div>
    </div>
  );
};
