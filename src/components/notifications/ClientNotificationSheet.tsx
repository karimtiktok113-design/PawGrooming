import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { AdminNotification, NotificationPriority } from '../../types/auth';
import { 
  X, 
  Sparkles, 
  Flame, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink,
  ChevronUp,
  Layers,
  Bell
} from 'lucide-react';

export const ClientNotificationSheet: React.FC = () => {
  const { clientNotifications, currentProfile, dismissPopupNotification } = useAuth();
  const { setView } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  if (!currentProfile) return null;

  // Filter for active undismissed 'drawer' notifications
  const activeDrawers = clientNotifications.filter(n => {
    if (n.type !== 'drawer') return false;
    const dismissed = Array.isArray(n.dismissedBy) ? n.dismissedBy : [];
    return !dismissed.includes(currentProfile.profileId);
  });

  if (activeDrawers.length === 0) return null;

  const current: AdminNotification = activeDrawers[0];

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

  const getPriorityStyle = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return {
          pill: 'bg-red-500 text-white',
          border: 'border-red-500/30',
          btn: 'bg-red-600 hover:bg-red-700 text-white',
          icon: <Flame className="w-4 h-4 text-red-500" />
        };
      case 'warning':
        return {
          pill: 'bg-amber-500 text-white',
          border: 'border-amber-500/30',
          btn: 'bg-amber-600 hover:bg-amber-700 text-white',
          icon: <AlertTriangle className="w-4 h-4 text-amber-500" />
        };
      case 'promotion':
        return {
          pill: 'bg-purple-600 text-white',
          border: 'border-purple-500/30',
          btn: 'bg-purple-600 hover:bg-purple-700 text-white',
          icon: <Sparkles className="w-4 h-4 text-purple-500" />
        };
      case 'update':
        return {
          pill: 'bg-emerald-600 text-white',
          border: 'border-emerald-500/30',
          btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        };
      default:
        return {
          pill: 'bg-theme-primary text-white',
          border: 'border-theme-primary/30',
          btn: 'btn-primary',
          icon: <Bell className="w-4 h-4 text-theme-primary" />
        };
    }
  };

  const style = getPriorityStyle(current.priority);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-slideUp">
      <div className={`bg-white/95 backdrop-blur-md text-[#240C0B] rounded-3xl border ${style.border} shadow-2xl overflow-hidden transition-all duration-300`}>
        {/* Top Handle / Header */}
        <div className="px-5 py-3 bg-[#FAF8F5] border-b border-[#E6DFD5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${style.pill}`}>
              {current.priority} Bottom Tray
            </span>
            <span className="text-[11px] font-bold text-[#7A6865]">
              Studio Alert
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCollapsed(prev => !prev)}
              className="p-1 rounded-lg text-[#7A6865] hover:text-[#240C0B] hover:bg-black/5"
              title={collapsed ? "Expand" : "Collapse"}
            >
              <ChevronUp className={`w-4 h-4 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-[#7A6865] hover:text-red-600 hover:bg-red-50"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Body */}
        {!collapsed && (
          <div className="p-5 flex flex-col sm:flex-row items-start gap-4">
            {current.imageUrl && (
              <div className="w-full sm:w-28 h-24 rounded-2xl overflow-hidden shrink-0 border border-[#E6DFD5]">
                <img 
                  src={current.imageUrl} 
                  alt={current.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="flex-1 min-w-0 space-y-1.5">
              <h4 className="font-display font-black text-base text-[#240C0B] leading-snug">
                {current.title}
              </h4>
              <p className="text-xs text-[#5C4A47] leading-relaxed line-clamp-3">
                {current.message}
              </p>

              <div className="pt-2 flex items-center gap-2 flex-wrap">
                {current.actionLabel && (
                  <button
                    onClick={handleAction}
                    className={`px-4 py-1.5 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all ${style.btn}`}
                  >
                    <span>{current.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={handleDismiss}
                  className="px-3 py-1.5 text-xs font-bold text-[#7A6865] hover:text-[#240C0B] hover:bg-[#FAF8F5] rounded-xl border border-[#E6DFD5] transition-all cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
