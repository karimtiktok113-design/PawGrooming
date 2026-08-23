import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Volume2, 
  Bot, 
  Hash, 
  Bell, 
  ExternalLink, 
  X, 
  Check, 
  Sparkles,
  Smartphone,
  Play,
  Pause,
  Layers,
  Inbox,
  ArrowRight,
  Radio,
  Share2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AdminNotification } from '../../types/auth';

export const ClientNotificationNewFormats: React.FC = () => {
  const { clientNotifications, currentProfile, markNotificationAsRead, dismissPopupNotification } = useAuth();
  const { setView } = useApp();
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [expandedDigest, setExpandedDigest] = useState<string | null>(null);

  if (!clientNotifications || clientNotifications.length === 0 || !currentProfile) return null;

  const profileId = currentProfile.profileId;

  // Filter helper: must not be dismissed by current profile
  const isNotDismissed = (n: AdminNotification) => {
    const dismissed = Array.isArray(n.dismissedBy) ? n.dismissedBy : [];
    return !dismissed.includes(profileId);
  };

  // Filter formats
  const dockNotifs = clientNotifications.filter(n => n.type === 'floating_dock' && isNotDismissed(n));
  const whatsappNotifs = clientNotifications.filter(n => n.type === 'whatsapp_msg' && isNotDismissed(n));
  const voiceNotifs = clientNotifications.filter(n => n.type === 'voice_tts' && isNotDismissed(n));
  const emailNotifs = clientNotifications.filter(n => n.type === 'email_digest' && isNotDismissed(n));
  const smsNotifs = clientNotifications.filter(n => n.type === 'sms_text' && isNotDismissed(n));
  const telegramNotifs = clientNotifications.filter(n => n.type === 'telegram_bot' && isNotDismissed(n));
  const discordNotifs = clientNotifications.filter(n => n.type === 'discord_webhook' && isNotDismissed(n));
  const slackNotifs = clientNotifications.filter(n => n.type === 'slack_webhook' && isNotDismissed(n));
  const teamsNotifs = clientNotifications.filter(n => n.type === 'matrix_teams' && isNotDismissed(n));
  const fcmNotifs = clientNotifications.filter(n => n.type === 'system_tray_fcm' && isNotDismissed(n));

  const handleActionClick = async (notif: AdminNotification, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    await markNotificationAsRead(notif.id);
    if (notif.actionUrl) {
      const url = notif.actionUrl.trim();
      const isExternal = url.startsWith('http://') || 
                         url.startsWith('https://') || 
                         url.startsWith('//') ||
                         url.startsWith('mailto:') ||
                         url.startsWith('tel:') ||
                         notif.actionTarget === '_blank';
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
    await handleDismiss(notif.id, e);
  };

  const handleDismiss = async (notifId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isPlayingAudio === notifId) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(null);
    }
    await dismissPopupNotification(notifId);
  };

  const handlePlayVoice = (notifId: string, text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isPlayingAudio === notifId) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlayingAudio(null);
      return;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(null);
      utterance.onerror = () => setIsPlayingAudio(null);
      setIsPlayingAudio(notifId);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(notifId);
      setTimeout(() => setIsPlayingAudio(null), 4000);
    }
  };

  return (
    <>
      {/* 1. FLOATING DYNAMIC ISLAND / PILL DOCK */}
      {dockNotifs.slice(0, 1).map((notif) => (
        <div 
          key={notif.id}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[92%] sm:w-auto animate-bounce-subtle pointer-events-auto"
        >
          <div className="bg-slate-900/95 backdrop-blur-xl border border-indigo-500/30 rounded-full py-2.5 px-4 sm:px-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest shrink-0">
                Dock Alert
              </span>
              <p className="text-xs font-semibold text-slate-200 truncate">
                {notif.title}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {notif.actionLabel && (
                <button
                  type="button"
                  onClick={(e) => handleActionClick(notif, e)}
                  className="px-3 py-1 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition-colors cursor-pointer active:scale-95"
                >
                  {notif.actionLabel}
                </button>
              )}
              <button
                type="button"
                onClick={(e) => handleDismiss(notif.id, e)}
                className="w-6 h-6 rounded-full hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* 2. WHATSAPP BUSINESS BUBBLE SIMULATION (Bottom Left) */}
      {whatsappNotifs.slice(0, 1).map((notif) => (
        <div 
          key={notif.id}
          className="fixed bottom-20 left-4 z-45 max-w-sm w-[92%] sm:w-80 bg-[#128C7E] text-white rounded-2xl p-4 shadow-2xl border border-emerald-400/40 animate-slideUp pointer-events-auto"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center font-black text-xs">
                WA
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Studio WhatsApp Broadcast</p>
                <span className="text-[9px] text-emerald-100 flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" /> Verified Channel
                </span>
              </div>
            </div>
            <button 
              type="button"
              onClick={(e) => handleDismiss(notif.id, e)}
              className="p-1 text-emerald-200 hover:text-white rounded-lg hover:bg-black/10 cursor-pointer"
              title="Close WhatsApp message"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-[#075E54] p-3 rounded-xl text-xs text-white/95 space-y-1.5">
            <p className="font-bold text-emerald-200">{notif.title}</p>
            <p className="text-[11px] leading-relaxed whitespace-pre-line">{notif.message}</p>
          </div>
          {notif.actionLabel && (
            <button
              type="button"
              onClick={(e) => handleActionClick(notif, e)}
              className="w-full mt-2.5 py-2 rounded-xl bg-white text-[#075E54] hover:bg-emerald-50 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>{notif.actionLabel}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}

      {/* 3. VOICE TTS AUDIO ALERT FLOATING CARD */}
      {voiceNotifs.slice(0, 1).map((notif) => (
        <div 
          key={notif.id}
          className="fixed bottom-20 right-4 z-45 max-w-xs w-full bg-slate-900/95 border border-purple-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-white space-y-3 animate-fadeIn pointer-events-auto"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-purple-600 flex items-center justify-center text-white">
                <Volume2 className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-black text-purple-400 uppercase tracking-wide">
                Voice Audio Dispatch
              </span>
            </div>
            <button 
              type="button"
              onClick={(e) => handleDismiss(notif.id, e)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              title="Close voice alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white">{notif.title}</h4>
            <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">{notif.message}</p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={(e) => handlePlayVoice(notif.id, `${notif.title}. ${notif.message}`, e)}
              className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer active:scale-95"
            >
              {isPlayingAudio === notif.id ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Audio</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Listen Audio</span>
                </>
              )}
            </button>
            {notif.actionLabel && (
              <button
                type="button"
                onClick={(e) => handleActionClick(notif, e)}
                className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer active:scale-95"
              >
                {notif.actionLabel}
              </button>
            )}
          </div>
        </div>
      ))}

      {/* 4. SMS MOBILE NOTIFICATION SNACKBAR (Top Right) */}
      {smsNotifs.slice(0, 1).map((notif) => (
        <div 
          key={notif.id}
          className="fixed top-20 right-4 z-45 max-w-sm w-full bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700 animate-slideInRight pointer-events-auto"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                <Smartphone className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider">SMS Gateway Dispatch</span>
            </div>
            <button 
              type="button" 
              onClick={(e) => handleDismiss(notif.id, e)} 
              className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs font-bold text-white mb-1">{notif.title}</p>
          <p className="text-[11px] text-slate-300 leading-relaxed">{notif.message}</p>
          {notif.actionLabel && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={(e) => handleActionClick(notif, e)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>{notif.actionLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      ))}

      {/* 5. TELEGRAM BOT POPUP */}
      {telegramNotifs.slice(0, 1).map((notif) => (
        <div 
          key={notif.id}
          className="fixed bottom-24 right-4 z-45 max-w-sm w-full bg-[#24A1DE] text-white rounded-2xl p-4 shadow-2xl border border-blue-300/40 animate-slideUp pointer-events-auto"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white text-[#24A1DE] flex items-center justify-center font-black text-xs">
                <Send className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Telegram Bot Alert</p>
                <span className="text-[9px] text-blue-100">@StudioNotificationBot</span>
              </div>
            </div>
            <button 
              type="button" 
              onClick={(e) => handleDismiss(notif.id, e)} 
              className="p-1 text-blue-100 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-[#1D82B2] p-3 rounded-xl text-xs space-y-1">
            <p className="font-bold text-white">{notif.title}</p>
            <p className="text-[11px] text-blue-50 leading-relaxed whitespace-pre-line">{notif.message}</p>
          </div>
          {notif.actionLabel && (
            <button
              type="button"
              onClick={(e) => handleActionClick(notif, e)}
              className="w-full mt-2.5 py-2 rounded-xl bg-white text-[#24A1DE] hover:bg-blue-50 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>{notif.actionLabel}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}

      {/* 6. DISCORD WEBHOOK EMBED CARD */}
      {discordNotifs.slice(0, 1).map((notif) => (
        <div 
          key={notif.id}
          className="fixed bottom-24 left-4 z-45 max-w-sm w-full bg-[#313338] text-white rounded-2xl p-4 shadow-2xl border-l-4 border-l-[#5865F2] border border-slate-700 animate-slideUp pointer-events-auto"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#5865F2] text-white text-[9px] font-black">
                DISCORD BOT
              </span>
              <span className="text-xs font-bold text-slate-200">#studio-announcements</span>
            </div>
            <button 
              type="button" 
              onClick={(e) => handleDismiss(notif.id, e)} 
              className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-[#2B2D31] p-3 rounded-xl text-xs space-y-1">
            <p className="font-bold text-[#5865F2]">{notif.title}</p>
            <p className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-line">{notif.message}</p>
          </div>
          {notif.actionLabel && (
            <button
              type="button"
              onClick={(e) => handleActionClick(notif, e)}
              className="w-full mt-2.5 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>{notif.actionLabel}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}

      {/* 7. SLACK WEBHOOK NOTIFICATION BOX */}
      {slackNotifs.slice(0, 1).map((notif) => (
        <div 
          key={notif.id}
          className="fixed top-20 left-4 z-45 max-w-sm w-full bg-[#1A1D21] text-white rounded-2xl p-4 shadow-2xl border-l-4 border-l-[#E01E5A] border border-slate-700 animate-slideDown pointer-events-auto"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#4A154B] flex items-center justify-center font-black text-[10px] text-white">
                #
              </div>
              <span className="text-xs font-bold text-slate-200">Slack Workflow Alert</span>
            </div>
            <button 
              type="button" 
              onClick={(e) => handleDismiss(notif.id, e)} 
              className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs font-bold text-[#ECB22E] mb-1">{notif.title}</p>
          <p className="text-[11px] text-slate-300 leading-relaxed">{notif.message}</p>
          {notif.actionLabel && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={(e) => handleActionClick(notif, e)}
                className="px-3 py-1.5 rounded-xl bg-[#2EB67D] hover:bg-[#259b69] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>{notif.actionLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      ))}

      {/* 8. EMAIL DIGEST EXPANDABLE MODAL */}
      {emailNotifs.slice(0, 1).map((notif) => (
        <div 
          key={notif.id}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[92%] sm:w-full bg-[#FAF8F5] text-[#240C0B] rounded-3xl p-5 shadow-2xl border border-[#E6DFD5] animate-slideUp pointer-events-auto"
        >
          <div className="flex items-center justify-between mb-3 border-b border-[#E6DFD5] pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#FF6B00]/15 text-[#FF6B00]">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-display font-black text-xs text-[#240C0B]">Email Digest Bulletin</h4>
                <p className="text-[10px] text-[#A08E8B]">Official Executive Summary</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={(e) => handleDismiss(notif.id, e)} 
              className="p-1.5 rounded-full hover:bg-[#F1EEE6] text-[#7A6865] hover:text-[#240C0B] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="font-display font-black text-sm text-[#240C0B] mb-1.5">{notif.title}</h3>
          <p className="text-xs text-[#5C4A47] leading-relaxed mb-3">{notif.message}</p>

          <div className="flex items-center justify-between pt-2 border-t border-[#E6DFD5]">
            <button
              type="button"
              onClick={(e) => handleDismiss(notif.id, e)}
              className="px-3 py-1.5 rounded-xl border border-[#E6DFD5] bg-white hover:bg-[#FAF8F5] text-xs font-bold text-[#7A6865] cursor-pointer"
            >
              Dismiss
            </button>

            {notif.actionLabel && (
              <button
                type="button"
                onClick={(e) => handleActionClick(notif, e)}
                className="btn-primary px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>{notif.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ))}

      {/* 9. MICROSOFT TEAMS / MATRIX ENTERPRISE CARD */}
      {teamsNotifs.slice(0, 1).map((notif) => (
        <div 
          key={notif.id}
          className="fixed top-24 right-4 sm:right-6 z-45 max-w-sm w-full bg-[#201F1F] text-white rounded-2xl p-4 shadow-2xl border-l-4 border-l-[#5B5FC7] border border-slate-700 animate-slideInRight pointer-events-auto"
        >
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#5B5FC7] flex items-center justify-center font-black text-[10px] text-white">
                T
              </div>
              <span className="text-xs font-bold text-[#E5F0FD]">Teams Enterprise Notice</span>
            </div>
            <button 
              type="button" 
              onClick={(e) => handleDismiss(notif.id, e)} 
              className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs font-bold text-[#82B8F6] mb-1">{notif.title}</p>
          <p className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-line">{notif.message}</p>
          {notif.actionLabel && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={(e) => handleActionClick(notif, e)}
                className="px-3 py-1.5 rounded-xl bg-[#5B5FC7] hover:bg-[#4F52B2] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>{notif.actionLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      ))}

      {/* 10. SYSTEM TRAY / FCM PUSH ALERT */}
      {fcmNotifs.slice(0, 1).map((notif) => (
        <div 
          key={notif.id}
          className="fixed bottom-6 right-6 z-45 max-w-sm w-full bg-[#082854] text-[#E5F0FD] rounded-2xl p-4 shadow-2xl border border-[#82B8F6]/40 animate-slideUp pointer-events-auto"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#138AEE]/20 text-[#138AEE]">
                <Bell className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#82B8F6]">System Tray Push</span>
            </div>
            <button 
              type="button" 
              onClick={(e) => handleDismiss(notif.id, e)} 
              className="p-1 text-[#82B8F6] hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs font-bold text-white mb-1">{notif.title}</p>
          <p className="text-[11px] text-[#E5F0FD]/80 leading-relaxed">{notif.message}</p>
          {notif.actionLabel && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={(e) => handleActionClick(notif, e)}
                className="px-3 py-1.5 rounded-xl bg-[#138AEE] hover:bg-[#0C4EA4] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-md"
              >
                <span>{notif.actionLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      ))}
    </>
  );
};
