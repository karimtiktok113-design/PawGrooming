import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { AdminNotification, NotificationPriority } from '../../types/auth';
import { 
  Bell, 
  X, 
  Sparkles, 
  Flame, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink,
  MessageCircle,
  Maximize2
} from 'lucide-react';

export const ClientNotificationFloatingWidget: React.FC = () => {
  const { clientNotifications, currentProfile, dismissPopupNotification } = useAuth();
  const { setView } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  if (!currentProfile) return null;

  // Active undismissed floating badge notifications
  const activeFloating = clientNotifications.filter(n => {
    if (n.type !== 'floating_badge') return false;
    const dismissed = Array.isArray(n.dismissedBy) ? n.dismissedBy : [];
    return !dismissed.includes(currentProfile.profileId);
  });

  if (activeFloating.length === 0) return null;

  const current: AdminNotification = activeFloating[0];

  const handleDismiss = async () => {
    await dismissPopupNotification(current.id);
    setIsOpen(false);
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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Expanded Preview Card */}
      {isOpen && (
        <div className="w-80 sm:w-96 p-5 rounded-3xl bg-white/95 backdrop-blur-lg border border-[#E6DFD5] shadow-2xl space-y-3 animate-scaleUp text-[#240C0B]">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-theme-light text-theme-primary border border-theme-primary/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Live Studio Highlight
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-[#7A6865] hover:text-[#240C0B] hover:bg-[#FAF8F5]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {current.imageUrl && (
            <div className="w-full h-32 rounded-2xl overflow-hidden border border-[#E6DFD5]">
              <img 
                src={current.imageUrl} 
                alt={current.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          <div>
            <h4 className="font-display font-black text-sm text-[#240C0B]">
              {current.title}
            </h4>
            <p className="text-xs text-[#6E5B58] mt-1 leading-relaxed line-clamp-3">
              {current.message}
            </p>
          </div>

          <div className="pt-2 border-t border-[#E6DFD5] flex items-center justify-between gap-2">
            <button
              onClick={handleDismiss}
              className="text-xs font-bold text-[#7A6865] hover:text-red-600 cursor-pointer"
            >
              Don't show again
            </button>

            {current.actionLabel ? (
              <button
                onClick={handleAction}
                className="btn-primary px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <span>{current.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => setIsOpen(false)}
                className="px-3.5 py-1.5 bg-[#FAF8F5] border border-[#E6DFD5] hover:bg-white text-xs font-bold text-[#240C0B] rounded-xl"
              >
                Got It
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Trigger Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="relative group flex items-center gap-2 p-3.5 bg-theme-primary hover:filter hover:brightness-110 text-white rounded-full shadow-xl theme-glow active:scale-95 transition-all cursor-pointer"
        title={current.title}
      >
        <Bell className="w-5 h-5 animate-bounce" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-xs font-bold pl-0 group-hover:pl-1 pr-1">
          {current.title}
        </span>
        <span className="w-3 h-3 rounded-full bg-white border-2 border-theme-primary absolute -top-0.5 -right-0.5 animate-ping" />
        <span className="w-3 h-3 rounded-full bg-white border-2 border-theme-primary absolute -top-0.5 -right-0.5" />
      </button>
    </div>
  );
};
