import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { AdminNotification, NotificationPriority } from '../../types/auth';
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  Info, 
  Flame, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Inbox,
  ExternalLink,
  ArrowRight
} from 'lucide-react';

export const ClientNotificationDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { 
    clientNotifications, 
    unreadNotificationsCount, 
    markNotificationAsRead,
    currentProfile 
  } = useAuth();
  const { setView } = useApp();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const currentProfileId = currentProfile?.profileId;

  const filtered = clientNotifications.filter(n => {
    if (filter === 'unread') {
      const read = Array.isArray(n.readBy) ? n.readBy : [];
      return !currentProfileId || !read.includes(currentProfileId);
    }
    return true;
  });

  const getPriorityBadge = (p: NotificationPriority) => {
    switch (p) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-red-100 text-red-700 border border-red-200 flex items-center gap-1"><Flame className="w-2.5 h-2.5" /> URGENT</span>;
      case 'warning':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1"><AlertTriangle className="w-2.5 h-2.5" /> ALERT</span>;
      case 'promotion':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> OFFER</span>;
      case 'update':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5" /> UPDATE</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-orange-100 text-orange-800 border border-orange-200 flex items-center gap-1"><Info className="w-2.5 h-2.5" /> NOTICE</span>;
    }
  };

  const handleMarkAllRead = async () => {
    for (const notif of clientNotifications) {
      await markNotificationAsRead(notif.id);
    }
  };

  const handleAction = (notif: AdminNotification, e: React.MouseEvent) => {
    e.stopPropagation();
    markNotificationAsRead(notif.id);
    if (!notif.actionUrl) return;

    const isExternal = notif.actionUrl.startsWith('http://') || 
                       notif.actionUrl.startsWith('https://') || 
                       notif.actionTarget === '_blank';

    if (isExternal) {
      window.open(notif.actionUrl, '_blank', 'noopener,noreferrer');
    } else {
      const validViews = ['dashboard', 'calendar', 'invoices', 'clients', 'services', 'alerts', 'loyalty', 'staff', 'revenue', 'business', 'gallery', 'settings'];
      if (validViews.includes(notif.actionUrl)) {
        setView(notif.actionUrl as any);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="bg-[#FAF8F5] text-[#240C0B] w-full max-w-md h-full shadow-2xl flex flex-col border-l border-[#E6DFD5] animate-slideLeft">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#E6DFD5] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FF6B00]/15 text-[#FF6B00]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-base text-[#240C0B]">
                Push Notifications
              </h3>
              <p className="text-[11px] text-[#A08E8B]">
                {unreadNotificationsCount} unread message{unreadNotificationsCount === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F1EEE6] text-[#7A6865] hover:text-[#240C0B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Actions Subheader */}
        <div className="px-5 py-3 bg-[#FAF8F5] border-b border-[#E6DFD5] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === 'all' 
                  ? 'bg-[#240C0B] text-white' 
                  : 'bg-white border border-[#E6DFD5] text-[#7A6865] hover:text-[#240C0B]'
              }`}
            >
              All ({clientNotifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filter === 'unread' 
                  ? 'bg-[#FF6B00] text-white' 
                  : 'bg-white border border-[#E6DFD5] text-[#7A6865] hover:text-[#240C0B]'
              }`}
            >
              Unread ({unreadNotificationsCount})
            </button>
          </div>

          {unreadNotificationsCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] font-bold text-[#2E8A81] hover:text-[#236F68] flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Inbox className="w-12 h-12 text-[#A08E8B]/40 mx-auto mb-3" />
              <h4 className="font-bold text-sm text-[#240C0B] mb-1">No Notifications Yet</h4>
              <p className="text-xs text-[#A08E8B] max-w-xs mx-auto">
                Admin broadcasts, pop-ups, and special studio updates will appear here.
              </p>
            </div>
          ) : (
            filtered.map((notif) => {
              const isRead = currentProfileId ? (notif.readBy || []).includes(currentProfileId) : false;
              const isExternal = notif.actionUrl && (
                notif.actionUrl.startsWith('http://') || 
                notif.actionUrl.startsWith('https://') || 
                notif.actionTarget === '_blank'
              );

              return (
                <div
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    !isRead
                      ? 'bg-white border-[#FF6B00]/40 shadow-xs ring-1 ring-[#FF6B00]/20'
                      : 'bg-white/70 border-[#E6DFD5] opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      {getPriorityBadge(notif.priority)}
                      {!isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse" />
                      )}
                    </div>

                    <span className="text-[10px] text-[#A08E8B] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {notif.imageUrl && (
                    <div className="w-full h-32 mb-2.5 rounded-xl overflow-hidden border border-[#E6DFD5]">
                      <img 
                        src={notif.imageUrl} 
                        alt={notif.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  <h4 className="font-display font-bold text-sm text-[#240C0B] mb-1">
                    {notif.title}
                  </h4>

                  <p className="text-xs text-[#5C4A47] leading-relaxed whitespace-pre-line">
                    {notif.message}
                  </p>

                  {notif.actionLabel && notif.actionUrl && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={(e) => handleAction(notif, e)}
                        className="w-full py-2 px-3 bg-[#FF6B00] hover:bg-[#E55C00] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                      >
                        <span>{notif.actionLabel}</span>
                        {isExternal ? <ExternalLink className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                      </button>
                    </div>
                  )}

                  <div className="mt-2.5 pt-2 border-t border-[#F1EEE6] flex items-center justify-between text-[10px] text-[#A08E8B]">
                    <span>Broadcast from Admin</span>
                    {!isRead ? (
                      <span className="text-[#FF6B00] font-bold">Unread</span>
                    ) : (
                      <span className="text-[#2E8A81] flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Read
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
