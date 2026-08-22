import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { NotificationPriority } from '../../types/auth';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  Info, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  ExternalLink,
  ArrowRight
} from 'lucide-react';

export const ClientNotificationBanner: React.FC = () => {
  const { activeBannersForCurrentProfile, dismissPopupNotification } = useAuth();
  const { setView } = useApp();

  if (!activeBannersForCurrentProfile || activeBannersForCurrentProfile.length === 0) {
    return null;
  }

  const handleAction = (banner: any) => {
    if (!banner.actionUrl) return;

    // Check if external link or explicit _blank target
    const isExternal = banner.actionUrl.startsWith('http://') || 
                       banner.actionUrl.startsWith('https://') || 
                       banner.actionTarget === '_blank';

    if (isExternal) {
      window.open(banner.actionUrl, '_blank', 'noopener,noreferrer');
    } else {
      const validViews = ['dashboard', 'calendar', 'invoices', 'clients', 'services', 'alerts', 'loyalty', 'staff', 'revenue', 'business', 'gallery', 'settings'];
      if (validViews.includes(banner.actionUrl)) {
        setView(banner.actionUrl as any);
      }
    }
  };

  const getBannerStyling = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return {
          wrapper: 'bg-gradient-to-r from-[#3D0A0A] via-[#5A1010] to-[#3D0A0A] border-red-500/50 text-white shadow-red-950/30',
          iconBg: 'bg-red-500 text-white animate-pulse',
          icon: <Flame className="w-4 h-4" />,
          tag: 'bg-red-500/20 text-red-300 border-red-500/30',
          btn: 'bg-red-500 hover:bg-red-600 text-white shadow-md'
        };
      case 'warning':
        return {
          wrapper: 'bg-gradient-to-r from-[#3A1E05] via-[#4D2707] to-[#3A1E05] border-amber-500/50 text-white shadow-amber-950/30',
          iconBg: 'bg-amber-500 text-white',
          icon: <AlertTriangle className="w-4 h-4" />,
          tag: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
          btn: 'bg-amber-500 hover:bg-amber-600 text-white shadow-md'
        };
      case 'promotion':
        return {
          wrapper: 'bg-gradient-to-r from-[#2B0E38] via-[#3C134E] to-[#2B0E38] border-purple-500/50 text-white shadow-purple-950/30',
          iconBg: 'bg-purple-600 text-white',
          icon: <Sparkles className="w-4 h-4" />,
          tag: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
          btn: 'bg-purple-600 hover:bg-purple-700 text-white shadow-md'
        };
      case 'update':
        return {
          wrapper: 'bg-gradient-to-r from-[#0B2E24] via-[#103E31] to-[#0B2E24] border-emerald-500/50 text-white shadow-emerald-950/30',
          iconBg: 'bg-emerald-600 text-white',
          icon: <CheckCircle2 className="w-4 h-4" />,
          tag: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
          btn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
        };
      default:
        return {
          wrapper: 'bg-gradient-to-r from-[#1C0908] via-[#2D1210] to-[#1C0908] border-[#FF6B00]/50 text-white shadow-black/30',
          iconBg: 'bg-[#FF6B00] text-white',
          icon: <Bell className="w-4 h-4" />,
          tag: 'bg-[#FF6B00]/20 text-[#FF8833] border-[#FF6B00]/30',
          btn: 'bg-[#FF6B00] hover:bg-[#E55C00] text-white shadow-md'
        };
    }
  };

  return (
    <div className="w-full space-y-2 mb-4 animate-fadeIn">
      {activeBannersForCurrentProfile.map((banner) => {
        const style = getBannerStyling(banner.priority);
        const isExternal = banner.actionUrl && (
          banner.actionUrl.startsWith('http://') || 
          banner.actionUrl.startsWith('https://') || 
          banner.actionTarget === '_blank'
        );

        return (
          <div 
            key={banner.id}
            className={`w-full px-4 py-3 rounded-2xl border shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition-all ${style.wrapper}`}
          >
            {/* Left Content Area */}
            <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
              <span className={`p-1.5 rounded-xl shrink-0 ${style.iconBg} shadow-sm`}>
                {style.icon}
              </span>

              {banner.imageUrl && (
                <img 
                  src={banner.imageUrl} 
                  alt={banner.title}
                  className="w-9 h-9 rounded-xl object-cover border border-white/20 shrink-0 hidden md:block"
                />
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${style.tag}`}>
                    {banner.priority.toUpperCase()}
                  </span>
                  <span className="font-bold text-white font-display text-xs">
                    {banner.title}
                  </span>
                </div>
                <p className="text-white/80 text-[11px] leading-relaxed line-clamp-2 sm:line-clamp-1">
                  {banner.message}
                </p>
              </div>
            </div>

            {/* Right Action & Dismiss Area */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center w-full sm:w-auto justify-end pt-1 sm:pt-0 border-t border-white/10 sm:border-t-0">
              {banner.actionLabel && banner.actionUrl && (
                <button
                  type="button"
                  onClick={() => handleAction(banner)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${style.btn}`}
                  title={isExternal ? `Opens ${banner.actionUrl} in a new tab` : 'Navigate to screen'}
                >
                  <span>{banner.actionLabel}</span>
                  {isExternal ? (
                    <ExternalLink className="w-3 h-3" />
                  ) : (
                    <ArrowRight className="w-3 h-3" />
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => dismissPopupNotification(banner.id)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
                title="Dismiss announcement"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
