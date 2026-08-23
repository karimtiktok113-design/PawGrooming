import React, { useState, useEffect } from 'react';
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
  Clock
} from 'lucide-react';

export const ClientNotificationToastStack: React.FC = () => {
  const { clientNotifications, currentProfile, dismissPopupNotification } = useAuth();
  const { setView } = useApp();
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  if (!currentProfile) return null;

  // Active undismissed toast notifications
  const activeToasts = clientNotifications.filter(n => {
    if (n.type !== 'toast_stack') return false;
    const dismissed = Array.isArray(n.dismissedBy) ? n.dismissedBy : [];
    return !dismissed.includes(currentProfile.profileId);
  }).slice(0, 3); // show up to 3 stacked toasts

  if (activeToasts.length === 0) return null;

  const handleDismiss = async (id: string) => {
    await dismissPopupNotification(id);
  };

  const handleAction = async (toast: AdminNotification) => {
    if (toast.actionUrl) {
      const isExternal = toast.actionUrl.startsWith('http://') || 
                         toast.actionUrl.startsWith('https://') || 
                         toast.actionTarget === '_blank';

      if (isExternal) {
        window.open(toast.actionUrl, '_blank', 'noopener,noreferrer');
      } else {
        const validViews = ['dashboard', 'calendar', 'invoices', 'clients', 'services', 'alerts', 'loyalty', 'staff', 'revenue', 'business', 'gallery', 'settings'];
        if (validViews.includes(toast.actionUrl)) {
          setView(toast.actionUrl as any);
        }
      }
    }
    await handleDismiss(toast.id);
  };

  const getPriorityStyle = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return {
          icon: <Flame className="w-4 h-4 text-red-500" />,
          border: 'border-red-500/40',
          badge: 'bg-red-100 text-red-700',
          btn: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
          border: 'border-amber-500/40',
          badge: 'bg-amber-100 text-amber-800',
          btn: 'bg-amber-600 hover:bg-amber-700 text-white'
        };
      case 'promotion':
        return {
          icon: <Sparkles className="w-4 h-4 text-purple-500" />,
          border: 'border-purple-500/40',
          badge: 'bg-purple-100 text-purple-700',
          btn: 'bg-purple-600 hover:bg-purple-700 text-white'
        };
      case 'update':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
          border: 'border-emerald-500/40',
          badge: 'bg-emerald-100 text-emerald-700',
          btn: 'bg-emerald-600 hover:bg-emerald-700 text-white'
        };
      default:
        return {
          icon: <Bell className="w-4 h-4 text-theme-primary" />,
          border: 'border-theme-primary/30',
          badge: 'bg-theme-light text-theme-primary',
          btn: 'btn-primary'
        };
    }
  };

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {activeToasts.map((toast, index) => {
        const style = getPriorityStyle(toast.priority);
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl bg-white/95 backdrop-blur-md border ${style.border} shadow-xl space-y-2.5 animate-slideInRight text-[#240C0B] transition-all`}
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#FAF8F5] border border-[#E6DFD5]">
                  {style.icon}
                </div>
                <div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${style.badge}`}>
                    {toast.priority}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDismiss(toast.id)}
                className="p-1 rounded-lg text-[#7A6865] hover:text-[#240C0B] hover:bg-[#FAF8F5] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <h5 className="font-display font-bold text-xs text-[#240C0B]">
                {toast.title}
              </h5>
              <p className="text-[11px] text-[#6E5B58] mt-0.5 leading-snug line-clamp-2">
                {toast.message}
              </p>
            </div>

            {toast.actionLabel && (
              <div className="pt-1 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleAction(toast)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all ${style.btn}`}
                >
                  <span>{toast.actionLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
