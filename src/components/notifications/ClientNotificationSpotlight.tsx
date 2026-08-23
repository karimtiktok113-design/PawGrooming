import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { AdminNotification, NotificationPriority } from '../../types/auth';
import { Sparkles, ArrowRight, X, Flame, AlertTriangle, CheckCircle2, Bell } from 'lucide-react';

export const ClientNotificationSpotlight: React.FC = () => {
  const { clientNotifications, currentProfile, dismissPopupNotification } = useAuth();
  const { setView } = useApp();

  if (!currentProfile) return null;

  // Active undismissed 'spotlight_card' notifications
  const activeSpotlights = clientNotifications.filter(n => {
    if (n.type !== 'spotlight_card') return false;
    const dismissed = Array.isArray(n.dismissedBy) ? n.dismissedBy : [];
    return !dismissed.includes(currentProfile.profileId);
  });

  if (activeSpotlights.length === 0) return null;

  const current: AdminNotification = activeSpotlights[0];

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
    <div className="w-full mb-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-white via-white to-theme-light/40 border border-theme-subtle shadow-lg relative overflow-hidden animate-fadeIn">
      <div className="absolute top-0 right-0 w-48 h-48 bg-theme-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
        <div className="flex flex-col sm:flex-row items-start gap-4 flex-1">
          {current.imageUrl && (
            <div className="w-full sm:w-36 h-28 rounded-2xl overflow-hidden border border-[#E6DFD5] shrink-0 shadow-xs">
              <img 
                src={current.imageUrl} 
                alt={current.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-theme-primary text-white flex items-center gap-1 shadow-2xs">
                <Sparkles className="w-3 h-3" /> Spotlight Feature
              </span>
              <span className="text-[11px] font-bold text-[#A08E8B]">
                Exclusive for {currentProfile.businessName}
              </span>
            </div>

            <h3 className="font-display font-black text-lg text-[#240C0B]">
              {current.title}
            </h3>

            <p className="text-xs text-[#6E5B58] leading-relaxed max-w-2xl">
              {current.message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
          {current.actionLabel && (
            <button
              onClick={handleAction}
              className="btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-md"
            >
              <span>{current.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="p-2 rounded-xl text-[#7A6865] hover:text-[#240C0B] hover:bg-black/5 transition-all cursor-pointer"
            title="Dismiss Spotlight"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
