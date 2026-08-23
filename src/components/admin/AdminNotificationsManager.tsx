import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  AdminNotification, 
  NotificationType, 
  NotificationPriority, 
  ClientProfile 
} from '../../types/auth';
import { 
  READY_MADE_NOTIFICATION_TEMPLATES, 
  NotificationTemplate 
} from '../../data/permissionPresets';
import { 
  Bell, 
  Send, 
  Plus, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Sparkles, 
  Flame, 
  ShieldAlert, 
  MessageSquare, 
  Users, 
  User, 
  Layout, 
  Clock, 
  X, 
  Check, 
  Search, 
  ExternalLink,
  Power,
  Image as ImageIcon,
  Link,
  Layers,
  ArrowRight,
  BookOpen,
  Filter,
  Smartphone,
  MessageCircle,
  Mail,
  Volume2,
  Zap,
  Bookmark,
  Radio,
  Share2,
  Copy
} from 'lucide-react';

export const AdminNotificationsManager: React.FC<{
  onSendSuccess?: (msg: string) => void;
  preselectedProfileId?: string | null;
}> = ({ onSendSuccess, preselectedProfileId }) => {
  const { 
    authDatabase, 
    notifications, 
    createAdminNotification, 
    deleteAdminNotification, 
    toggleNotificationStatus 
  } = useAuth();

  // Primary sub-view: 'broadcasts' | 'templates'
  const [activeSubView, setActiveSubView] = useState<'broadcasts' | 'templates'>('broadcasts');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [templateBrowserOpen, setTemplateBrowserOpen] = useState(false);
  const [previewNotification, setPreviewNotification] = useState<AdminNotification | NotificationTemplate | null>(null);
  
  // Filters
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTarget, setFilterTarget] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [templateCategory, setTemplateCategory] = useState<string>('all');
  const [templateSearchTerm, setTemplateSearchTerm] = useState('');
  const [quickBroadcastSuccess, setQuickBroadcastSuccess] = useState<string | null>(null);

  // Form State for creating notification
  const [targetType, setTargetType] = useState<'all' | 'specific'>('all');
  const [targetProfileId, setTargetProfileId] = useState<string>('');
  const [type, setType] = useState<NotificationType>('popup');
  const [priority, setPriority] = useState<NotificationPriority>('info');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [actionLabel, setActionLabel] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [actionTarget, setActionTarget] = useState<'_blank' | '_self'>('_blank');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // Handle incoming preselected profile
  useEffect(() => {
    if (preselectedProfileId) {
      setTargetType('specific');
      setTargetProfileId(preselectedProfileId);
      setCreateModalOpen(true);
    }
  }, [preselectedProfileId]);

  // Preset Image Options for rapid selection
  const imagePresets = [
    { label: 'AI Grooming Assistant', url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80' },
    { label: 'Special Offer / Discount', url: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80' },
    { label: 'Subscription / Billing', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80' },
    { label: 'Holiday Marketing Kit', url: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=800&q=80' },
    { label: 'Mobile & Tablet App', url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80' },
    { label: '1,000 Paws Milestone', url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80' },
    { label: 'Rabies & Medical Alert', url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=80' },
    { label: 'Masterclass Scissoring', url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80' },
    { label: 'QR Pay & Tap Checkout', url: 'https://images.unsplash.com/photo-1556742049-0a67e557b649?auto=format&fit=crop&w=800&q=80' },
    { label: 'Trial Ending Reminder', url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80' },
  ];

  // Apply a full template to compose form
  const applyTemplate = (tmpl: NotificationTemplate, keepTarget: boolean = true) => {
    setSelectedTemplateId(tmpl.id);
    setTitle(tmpl.title);
    setMessage(tmpl.message);
    setType(tmpl.type);
    setPriority(tmpl.priority);
    setImageUrl(tmpl.imageUrl || '');
    setActionLabel(tmpl.actionLabel || '');
    setActionUrl(tmpl.actionUrl || '');
    setActionTarget(tmpl.actionTarget || (tmpl.actionUrl?.startsWith('http') ? '_blank' : '_self'));
    
    if (!keepTarget) {
      setTargetType('all');
      setTargetProfileId('');
    }
  };

  // 1-Click Instant Broadcast directly from template card
  const handleQuickBroadcastTemplate = async (tmpl: NotificationTemplate, forProfileId?: string) => {
    try {
      const isSpecific = !!forProfileId;
      let targetBusinessName = 'All Client Studios (Global)';
      if (isSpecific) {
        const found = authDatabase.profiles.find(p => p.profileId === forProfileId);
        targetBusinessName = found ? `${found.businessName} (${found.profileId})` : forProfileId;
      }

      await createAdminNotification({
        targetType: isSpecific ? 'specific' : 'all',
        targetProfileId: isSpecific ? forProfileId : 'all',
        targetBusinessName,
        type: tmpl.type,
        priority: tmpl.priority,
        title: tmpl.title,
        message: tmpl.message,
        imageUrl: tmpl.imageUrl || undefined,
        actionLabel: tmpl.actionLabel || undefined,
        actionUrl: tmpl.actionUrl || undefined,
        actionTarget: tmpl.actionTarget || undefined,
        isActive: true
      });

      const successMsg = `Template "${tmpl.title.slice(0, 32)}..." broadcasted to ${targetBusinessName}!`;
      setQuickBroadcastSuccess(successMsg);
      setTimeout(() => setQuickBroadcastSuccess(null), 4000);
      if (onSendSuccess) {
        onSendSuccess(successMsg);
      }
    } catch (err) {
      console.error('Failed to instant broadcast template:', err);
      alert('Failed to send instant broadcast. Please try again.');
    }
  };

  const handleOpenCreateModal = (specificProfileId?: string, initialTemplate?: NotificationTemplate) => {
    if (initialTemplate) {
      applyTemplate(initialTemplate, true);
    } else {
      setSelectedTemplateId('');
      setTitle('');
      setMessage('');
      setImageUrl('');
      setActionLabel('');
      setActionUrl('');
      setActionTarget('_blank');
      setType('popup');
      setPriority('info');
    }

    if (specificProfileId) {
      setTargetType('specific');
      setTargetProfileId(specificProfileId);
    } else if (preselectedProfileId) {
      setTargetType('specific');
      setTargetProfileId(preselectedProfileId);
    } else {
      setTargetType('all');
      setTargetProfileId('');
    }
    
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Please provide both a notification title and message.');
      return;
    }

    if (targetType === 'specific' && !targetProfileId) {
      alert('Please select a specific client profile.');
      return;
    }

    setIsSubmitting(true);
    try {
      let targetBusinessName = 'All Client Studios';
      if (targetType === 'specific') {
        const found = authDatabase.profiles.find(p => p.profileId === targetProfileId);
        targetBusinessName = found ? `${found.businessName} (${found.profileId})` : targetProfileId;
      }

      await createAdminNotification({
        targetType,
        targetProfileId: targetType === 'specific' ? targetProfileId : 'all',
        targetBusinessName,
        type,
        priority,
        title: title.trim(),
        message: message.trim(),
        imageUrl: imageUrl.trim() || undefined,
        actionLabel: actionLabel.trim() || undefined,
        actionUrl: actionUrl.trim() || undefined,
        actionTarget: actionTarget || undefined,
        isActive: true
      });

      setCreateModalOpen(false);
      if (onSendSuccess) {
        onSendSuccess(`Notification successfully broadcasted to ${targetBusinessName}!`);
      }
    } catch (err) {
      console.error('Failed to create notification:', err);
      alert('Failed to send notification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, notifTitle: string) => {
    if (confirm(`Are you sure you want to permanently delete notification "${notifTitle}" from the database?`)) {
      await deleteAdminNotification(id);
      if (onSendSuccess) {
        onSendSuccess('Notification removed from database.');
      }
    }
  };

  const handleToggle = async (id: string) => {
    await toggleNotificationStatus(id);
    if (onSendSuccess) {
      onSendSuccess('Notification visibility status updated.');
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const matchSearch = 
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.targetBusinessName && n.targetBusinessName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchType = filterType === 'all' || n.type === filterType;
    const matchTarget = filterTarget === 'all' || n.targetType === filterTarget;

    return matchSearch && matchType && matchTarget;
  });

  const filteredTemplates = READY_MADE_NOTIFICATION_TEMPLATES.filter(tmpl => {
    const matchCat = templateCategory === 'all' || tmpl.category === templateCategory;
    const matchSearch = 
      tmpl.title.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
      tmpl.message.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
      tmpl.type.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
      tmpl.category.toLowerCase().includes(templateSearchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const getPriorityBadge = (p: NotificationPriority) => {
    switch (p) {
      case 'urgent':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30"><Flame className="w-3 h-3" /> URGENT</span>;
      case 'warning':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30"><AlertTriangle className="w-3 h-3" /> WARNING</span>;
      case 'promotion':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30"><Sparkles className="w-3 h-3" /> PROMO</span>;
      case 'update':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#138AEE]/20 text-[#82B8F6] border border-[#138AEE]/30"><CheckCircle2 className="w-3 h-3" /> UPDATE</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#138AEE]/20 text-[#82B8F6] border border-[#138AEE]/30"><Info className="w-3 h-3" /> INFO</span>;
    }
  };

  const getTypeBadge = (t: NotificationType) => {
    switch (t) {
      case 'popup':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#138AEE]/20 text-[#82B8F6] border border-[#138AEE]/30"><Layout className="w-3 h-3" /> Pop-up Modal</span>;
      case 'banner':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#82B8F6]/20 text-[#82B8F6] border border-[#82B8F6]/30"><MessageSquare className="w-3 h-3" /> Top Banner</span>;
      case 'ticker':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30"><Radio className="w-3 h-3" /> Breaking Ticker</span>;
      case 'drawer':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#0C4EA4]/40 text-[#82B8F6] border border-[#82B8F6]/30"><Layers className="w-3 h-3" /> Action Sheet Tray</span>;
      case 'floating_badge':
      case 'floating_dock':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30"><Sparkles className="w-3 h-3" /> Floating Widget</span>;
      case 'spotlight_card':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#138AEE]/20 text-[#82B8F6] border border-[#138AEE]/30"><Sparkles className="w-3 h-3" /> Spotlight Hero</span>;
      case 'toast_stack':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#82B8F6]/20 text-[#82B8F6] border border-[#82B8F6]/30"><Bell className="w-3 h-3" /> Corner Toast</span>;
      case 'modal_takeover':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#0C4EA4]/40 text-[#82B8F6] border border-[#82B8F6]/30"><Flame className="w-3 h-3" /> Full Takeover</span>;
      case 'sms_text':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"><Smartphone className="w-3 h-3" /> SMS Notice</span>;
      case 'whatsapp_msg':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-green-500/20 text-green-300 border border-green-500/30"><MessageCircle className="w-3 h-3" /> WhatsApp Bot</span>;
      case 'email_digest':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30"><Mail className="w-3 h-3" /> Email Digest</span>;
      case 'voice_tts':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30"><Volume2 className="w-3 h-3" /> Voice Broadcast</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#138AEE]/20 text-[#82B8F6] border border-[#138AEE]/30"><Bell className="w-3 h-3" /> Push Alert & Inbox</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert for Instant Broadcast */}
      {quickBroadcastSuccess && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{quickBroadcastSuccess}</span>
          </div>
          <button 
            onClick={() => setQuickBroadcastSuccess(null)}
            className="text-emerald-400 hover:text-white text-xs px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Main Hero Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0C4EA4] via-[#082854] to-[#061836] border border-[#82B8F6]/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 rounded-xl bg-[#138AEE]/20 text-[#82B8F6]">
              <Bell className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-white font-display">
              Push Notifications, Banners & Interactive Pop-ups
            </h2>
          </div>
          <p className="text-xs text-[#82B8F6] max-w-2xl">
            Dispatch announcements, promotional modals, urgent breaking news tickers, WhatsApp alerts, and SMS updates to all client salons or specific accounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setActiveSubView('templates')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
              activeSubView === 'templates'
                ? 'bg-[#138AEE] text-white border-[#82B8F6] shadow-md shadow-[#138AEE]/30'
                : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#82B8F6]" />
            <span>Delivery Templates ({READY_MADE_NOTIFICATION_TEMPLATES.length})</span>
          </button>

          <button
            onClick={() => handleOpenCreateModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#138AEE] hover:bg-[#0C4EA4] text-white rounded-2xl text-xs font-black shadow-lg shadow-[#138AEE]/30 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Compose Broadcast</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Switcher Tabs */}
      <div className="flex items-center gap-3 border-b border-[#82B8F6]/20 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubView('broadcasts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubView === 'broadcasts'
              ? 'bg-[#138AEE] text-white shadow-sm'
              : 'text-[#82B8F6] hover:text-white hover:bg-white/5'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Active Broadcasts & History ({notifications.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubView('templates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubView === 'templates'
              ? 'bg-[#138AEE] text-white shadow-sm'
              : 'text-[#82B8F6] hover:text-white hover:bg-white/5'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-[#82B8F6]" />
          <span>Ready-Made Delivery Templates ({READY_MADE_NOTIFICATION_TEMPLATES.length} Pre-built)</span>
          <span className="px-1.5 py-0.2 bg-[#82B8F6]/20 text-[#82B8F6] text-[9px] font-black rounded-md uppercase">
            Popular
          </span>
        </button>
      </div>

      {/* VIEW 1: READY-MADE DELIVERY TEMPLATES LIBRARY */}
      {activeSubView === 'templates' && (
        <div className="space-y-4">
          {/* Templates Header Filter Controls */}
          <div className="bg-[#082854] p-4 rounded-2xl border border-[#82B8F6]/20 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#82B8F6] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search templates by feature, category, or format..."
                value={templateSearchTerm}
                onChange={(e) => setTemplateSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#061836] border border-[#82B8F6]/30 rounded-xl text-white placeholder-[#82B8F6]/40 focus:border-[#138AEE] outline-none"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['all', 'Feature Release', 'Promotion', 'Alert & Maintenance', 'Tips & Guides', 'Milestone'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTemplateCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    templateCategory === cat
                      ? 'bg-[#138AEE] text-white'
                      : 'bg-[#061836] text-[#82B8F6] hover:text-white border border-[#82B8F6]/20'
                  }`}
                >
                  {cat === 'all' ? `All Categories (${READY_MADE_NOTIFICATION_TEMPLATES.length})` : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Templates Visual Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((tmpl) => (
              <div 
                key={tmpl.id}
                className="p-4 rounded-2xl bg-[#082854] border border-[#82B8F6]/20 hover:border-[#138AEE] flex flex-col justify-between transition-all group shadow-lg hover:shadow-2xl hover:shadow-[#138AEE]/10"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {getPriorityBadge(tmpl.priority)}
                      {getTypeBadge(tmpl.type)}
                    </div>
                    <span className="text-[10px] text-[#82B8F6] font-bold px-2 py-0.5 rounded-md bg-[#061836]">
                      {tmpl.category}
                    </span>
                  </div>

                  {tmpl.imageUrl && (
                    <div className="w-full h-32 rounded-xl overflow-hidden border border-[#82B8F6]/20 relative">
                      <img 
                        src={tmpl.imageUrl} 
                        alt={tmpl.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-sm text-white font-display line-clamp-2 mb-1.5">
                      {tmpl.title}
                    </h4>
                    <p className="text-xs text-[#E5F0FD] leading-relaxed line-clamp-3">
                      {tmpl.message}
                    </p>
                  </div>

                  {tmpl.actionLabel && (
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#82B8F6] font-bold bg-[#138AEE]/20 px-2 py-1 rounded-lg border border-[#138AEE]/30">
                        <Link className="w-3 h-3" />
                        CTA: "{tmpl.actionLabel}" ({tmpl.actionUrl || '_self'})
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-[#82B8F6]/20 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewNotification(tmpl as any)}
                      className="px-2.5 py-1.5 bg-[#061836] hover:bg-[#0C4EA4] text-[#82B8F6] hover:text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors cursor-pointer border border-[#82B8F6]/20"
                      title="Preview how clients will see this notification"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#82B8F6]" />
                      <span>Preview</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenCreateModal(undefined, tmpl)}
                        className="px-3 py-1.5 bg-[#0C4EA4] hover:bg-[#138AEE] text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                        title="Customize title, image, or target recipient before broadcasting"
                      >
                        <span>Edit & Send</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickBroadcastTemplate(tmpl)}
                        className="px-3 py-1.5 bg-[#138AEE] hover:bg-[#0C4EA4] text-white text-xs font-black rounded-xl shadow-md shadow-[#138AEE]/20 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                        title="Instant 1-Click Broadcast to all client dashboards"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Broadcast</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: ACTIVE BROADCASTS & SENT HISTORY */}
      {activeSubView === 'broadcasts' && (
        <div className="space-y-4">
          {/* Quick Template Strip for Rapid Selection */}
          <div className="p-4 rounded-2xl bg-[#082854] border border-[#82B8F6]/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#138AEE]" />
                <span>Featured Ready-Made Delivery Templates (Click to Instant Broadcast or Customize)</span>
              </span>
              <button
                onClick={() => setActiveSubView('templates')}
                className="text-[11px] text-[#82B8F6] hover:underline flex items-center gap-1 font-bold"
              >
                <span>View all {READY_MADE_NOTIFICATION_TEMPLATES.length} templates</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {READY_MADE_NOTIFICATION_TEMPLATES.slice(0, 4).map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="p-3 rounded-xl bg-[#061836] hover:bg-[#0C4EA4]/40 border border-[#82B8F6]/20 hover:border-[#138AEE]/60 transition-all flex flex-col justify-between gap-2 text-left"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[9px] font-black uppercase text-[#82B8F6]">{tmpl.category}</span>
                      <span className="text-[9px] text-[#82B8F6]/70">{tmpl.type}</span>
                    </div>
                    <p className="text-xs font-bold text-white line-clamp-1">{tmpl.title}</p>
                    <p className="text-[10px] text-[#82B8F6]/80 line-clamp-1 mt-0.5">{tmpl.message}</p>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[#82B8F6]/10">
                    <button
                      type="button"
                      onClick={() => handleOpenCreateModal(undefined, tmpl)}
                      className="text-[10px] text-[#82B8F6] font-bold hover:underline cursor-pointer"
                    >
                      Customize
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickBroadcastTemplate(tmpl)}
                      className="text-[10px] bg-[#138AEE] hover:bg-[#0C4EA4] text-white px-2 py-0.5 rounded-lg font-black cursor-pointer shadow-sm"
                    >
                      Instant Broadcast
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filter and Search Bar for Broadcasts */}
          <div className="bg-[#082854] p-4 rounded-2xl border border-[#82B8F6]/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#82B8F6] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search active broadcasts by title, message, or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#061836] border border-[#82B8F6]/30 rounded-xl text-white placeholder-[#82B8F6]/40 focus:border-[#138AEE] outline-none"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 text-xs bg-[#061836] border border-[#82B8F6]/30 rounded-xl text-white outline-none cursor-pointer focus:border-[#138AEE]"
              >
                <option value="all" className="bg-[#082854]">All Delivery Formats</option>
                <option value="popup" className="bg-[#082854]">🚨 Dashboard Pop-up Modal</option>
                <option value="banner" className="bg-[#082854]">📌 Top Announcement Banner</option>
                <option value="ticker" className="bg-[#082854]">📻 Live Breaking Ticker</option>
                <option value="drawer" className="bg-[#082854]">📥 Bottom Action Tray / Sheet</option>
                <option value="floating_badge" className="bg-[#082854]">🔮 Floating Action Widget</option>
                <option value="spotlight_card" className="bg-[#082854]">⭐ Dashboard Spotlight Card</option>
                <option value="toast_stack" className="bg-[#082854]">🔔 Corner Toast Stack</option>
                <option value="modal_takeover" className="bg-[#082854]">🎭 Fullscreen Immersive Takeover</option>
                <option value="sms_text" className="bg-[#082854]">📱 SMS Text Notice</option>
                <option value="whatsapp_msg" className="bg-[#082854]">💬 WhatsApp Message Bot</option>
                <option value="email_digest" className="bg-[#082854]">📧 Email Performance Digest</option>
                <option value="voice_tts" className="bg-[#082854]">🔊 Voice Audio Alert</option>
                <option value="push" className="bg-[#082854]">📣 Push Notice & Activity Inbox</option>
              </select>

              <select
                value={filterTarget}
                onChange={(e) => setFilterTarget(e.target.value)}
                className="px-3 py-2 text-xs bg-[#061836] border border-[#82B8F6]/30 rounded-xl text-white outline-none cursor-pointer focus:border-[#138AEE]"
              >
                <option value="all" className="bg-[#082854]">All Targets</option>
                <option value="all" className="bg-[#082854]">Global Broadcasts</option>
                <option value="specific" className="bg-[#082854]">Specific Clients</option>
              </select>
            </div>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center bg-[#082854] rounded-3xl border border-[#82B8F6]/20">
              <Bell className="w-12 h-12 text-[#82B8F6]/40 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No Sent Broadcast Notifications Found</h3>
              <p className="text-xs text-[#82B8F6]/80 max-w-sm mx-auto mb-4">
                Choose a pre-built template from our library or compose a custom broadcast notification.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setActiveSubView('templates')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0C4EA4] hover:bg-[#138AEE] text-white rounded-xl text-xs font-bold border border-[#82B8F6]/30 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#82B8F6]" />
                  <span>Browse {READY_MADE_NOTIFICATION_TEMPLATES.length} Ready Templates</span>
                </button>
                <button
                  onClick={() => handleOpenCreateModal()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#138AEE] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#0C4EA4] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Compose Custom Broadcast</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {filteredNotifications.map((notif) => (
                <div 
                  key={notif.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    notif.isActive 
                      ? 'bg-[#082854] border-[#82B8F6]/20 hover:border-[#138AEE]/50 shadow-lg' 
                      : 'bg-[#061836] border-[#82B8F6]/10 opacity-60'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#82B8F6]/20">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getPriorityBadge(notif.priority)}
                      {getTypeBadge(notif.type)}

                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#061836] text-[#82B8F6] border border-[#82B8F6]/20">
                        {notif.targetType === 'all' ? (
                          <>
                            <Users className="w-3 h-3 text-[#138AEE]" />
                            <span>All Clients (Global Broadcast)</span>
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 text-[#138AEE]" />
                            <span>Target: <strong className="text-white">{notif.targetBusinessName || notif.targetProfileId}</strong></span>
                          </>
                        )}
                      </span>

                      <span className="text-[10px] text-[#82B8F6]/70 flex items-center gap-1 ml-auto md:ml-0">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Status & Control Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setPreviewNotification(notif)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#061836] hover:bg-[#0C4EA4] text-xs text-[#82B8F6] hover:text-white font-medium transition-colors cursor-pointer border border-[#82B8F6]/20"
                        title="Preview as Client"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#82B8F6]" />
                        <span>Preview</span>
                      </button>

                      <button
                        onClick={() => handleToggle(notif.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          notif.isActive 
                            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' 
                            : 'bg-[#061836] text-[#82B8F6]/60 hover:bg-[#061836]/80'
                        }`}
                        title={notif.isActive ? "Deactivate Notification" : "Activate Notification"}
                      >
                        <Power className="w-3 h-3" />
                        <span>{notif.isActive ? 'Active' : 'Disabled'}</span>
                      </button>

                      <button
                        onClick={() => handleDelete(notif.id, notif.title)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                        title="Delete permanently from database"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 flex flex-col sm:flex-row gap-4">
                    {notif.imageUrl && (
                      <div className="w-24 h-24 rounded-xl overflow-hidden border border-[#82B8F6]/20 shrink-0 hidden sm:block">
                        <img 
                          src={notif.imageUrl} 
                          alt={notif.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-white font-display mb-1">
                        {notif.title}
                      </h4>
                      <p className="text-xs text-[#E5F0FD] whitespace-pre-line leading-relaxed">
                        {notif.message}
                      </p>

                      {notif.actionLabel && (
                        <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#138AEE]/20 text-[#82B8F6] border border-[#138AEE]/30 rounded-xl text-[11px] font-bold">
                            <Link className="w-3 h-3" />
                            CTA: "{notif.actionLabel}" {notif.actionUrl ? `→ ${notif.actionUrl}` : ''}
                          </span>
                          {notif.actionTarget === '_blank' && (
                            <span className="text-[10px] text-[#82B8F6]/70 flex items-center gap-0.5">
                              <ExternalLink className="w-2.5 h-2.5" /> Opens new tab
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-4 text-[10px] text-[#82B8F6]/70">
                        <span>Delivered via Live Firestore</span>
                        <span>•</span>
                        <span>Dismissed by: {Array.isArray(notif.dismissedBy) ? notif.dismissedBy.length : 0} clients</span>
                        <span>•</span>
                        <span>Read by: {Array.isArray(notif.readBy) ? notif.readBy.length : 0} clients</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE / COMPOSE NOTIFICATION MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#082854] text-white rounded-3xl border border-[#82B8F6]/30 shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-fadeIn my-6 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#82B8F6]/20 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#138AEE] text-white">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-white">
                    Compose Broadcast Notification / Delivery Notice
                  </h3>
                  <p className="text-[11px] text-[#82B8F6]">
                    Configure targeting, rich visuals, external link CTA buttons, or load from a pre-made template.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-2 rounded-xl bg-[#061836] hover:bg-[#0C4EA4] text-[#82B8F6] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 flex-1 overflow-y-auto pr-1">
              
              {/* Quick Template Picker dropdown */}
              <div className="p-3 bg-[#061836] rounded-2xl border border-[#82B8F6]/20 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#82B8F6] uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#138AEE]" />
                    <span>⚡ Quick Template Autofill (Optional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setCreateModalOpen(false);
                      setActiveSubView('templates');
                    }}
                    className="text-[10px] text-[#82B8F6] hover:underline font-bold"
                  >
                    Open Full Library ({READY_MADE_NOTIFICATION_TEMPLATES.length})
                  </button>
                </div>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => {
                    const found = READY_MADE_NOTIFICATION_TEMPLATES.find(t => t.id === e.target.value);
                    if (found) {
                      applyTemplate(found, true);
                    } else {
                      setSelectedTemplateId('');
                    }
                  }}
                  className="w-full px-3 py-2 text-xs bg-[#082854] border border-[#82B8F6]/30 rounded-xl text-white outline-none focus:border-[#138AEE]"
                >
                  <option value="" className="bg-[#082854]">-- Select a Ready-Made Template to populate fields --</option>
                  {READY_MADE_NOTIFICATION_TEMPLATES.map(t => (
                    <option key={t.id} value={t.id} className="bg-[#082854]">
                      [{t.category}] {t.title.slice(0, 60)} ({t.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Audience */}
              <div>
                <label className="text-[11px] font-bold text-[#82B8F6] uppercase tracking-wider block mb-1.5">
                  Target Recipient
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setTargetType('all')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      targetType === 'all' 
                        ? 'bg-[#138AEE] text-white border-[#82B8F6]' 
                        : 'bg-[#061836] text-[#82B8F6] border-[#82B8F6]/20 hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>All Clients (Broadcast)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetType('specific')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      targetType === 'specific' 
                        ? 'bg-[#138AEE] text-white border-[#82B8F6]' 
                        : 'bg-[#061836] text-[#82B8F6] border-[#82B8F6]/20 hover:text-white'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Specific Client Profile</span>
                  </button>
                </div>

                {targetType === 'specific' && (
                  <select
                    value={targetProfileId}
                    onChange={(e) => setTargetProfileId(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-[#061836] border border-[#82B8F6]/40 rounded-xl text-white outline-none focus:border-[#138AEE]"
                  >
                    <option value="" className="bg-[#082854]">-- Select Client Profile --</option>
                    {authDatabase.profiles.map(p => (
                      <option key={p.profileId} value={p.profileId} className="bg-[#082854]">
                        {p.businessName} ({p.profileId}) - {p.ownerName} [{p.status.toUpperCase()}]
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Delivery Format & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#82B8F6] uppercase tracking-wider block mb-1.5">
                    Delivery Format
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as NotificationType)}
                    className="w-full px-3 py-2 text-xs bg-[#061836] border border-[#82B8F6]/30 rounded-xl text-white outline-none focus:border-[#138AEE]"
                  >
                    <option value="popup" className="bg-[#082854]">🚨 Dashboard Pop-up Modal</option>
                    <option value="banner" className="bg-[#082854]">📌 Top Announcement Banner</option>
                    <option value="ticker" className="bg-[#082854]">📻 Live Breaking News Ticker Strip</option>
                    <option value="drawer" className="bg-[#082854]">📥 Bottom Action Tray / Sheet</option>
                    <option value="floating_badge" className="bg-[#082854]">🔮 Floating Action Bubble Widget</option>
                    <option value="spotlight_card" className="bg-[#082854]">⭐ Dashboard Spotlight Hero Card</option>
                    <option value="toast_stack" className="bg-[#082854]">🔔 Corner Toast Notification Stack</option>
                    <option value="modal_takeover" className="bg-[#082854]">🎭 Fullscreen Immersive Takeover Modal</option>
                    <option value="sms_text" className="bg-[#082854]">📱 SMS Text Alert Notice</option>
                    <option value="whatsapp_msg" className="bg-[#082854]">💬 WhatsApp Automated Notice Card</option>
                    <option value="email_digest" className="bg-[#082854]">📧 Email Studio Digest Card</option>
                    <option value="voice_tts" className="bg-[#082854]">🔊 Voice Audio Alert Notice</option>
                    <option value="push" className="bg-[#082854]">📣 Push Notice & Studio Inbox</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#82B8F6] uppercase tracking-wider block mb-1.5">
                    Priority / Tone
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as NotificationPriority)}
                    className="w-full px-3 py-2 text-xs bg-[#061836] border border-[#82B8F6]/30 rounded-xl text-white outline-none focus:border-[#138AEE]"
                  >
                    <option value="info" className="bg-[#082854]">ℹ️ Information (Standard)</option>
                    <option value="urgent" className="bg-[#082854]">🔥 Urgent Announcement (Red)</option>
                    <option value="warning" className="bg-[#082854]">⚠️ Warning / Alert (Amber)</option>
                    <option value="promotion" className="bg-[#082854]">⭐ Offer / Promo (Purple)</option>
                    <option value="update" className="bg-[#082854]">✅ System Feature Update (Blue)</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-[11px] font-bold text-[#82B8F6] uppercase tracking-wider block mb-1.5">
                  Notification Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Important Studio Announcement or New Feature"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#061836] border border-[#82B8F6]/30 rounded-xl text-white placeholder-[#82B8F6]/40 focus:border-[#138AEE] outline-none"
                />
              </div>

              {/* Message */}
              <div>
                <label className="text-[11px] font-bold text-[#82B8F6] uppercase tracking-wider block mb-1.5">
                  Notification Message Content *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Type the announcement or notice message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#061836] border border-[#82B8F6]/30 rounded-xl text-white placeholder-[#82B8F6]/40 focus:border-[#138AEE] outline-none"
                />
              </div>

              {/* Image URL with Preset Picker */}
              <div className="p-3 bg-[#061836] rounded-2xl border border-[#82B8F6]/20 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#138AEE]" />
                    <span>Notification Image / Visual (Optional)</span>
                  </label>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-[10px] text-red-400 hover:underline cursor-pointer"
                    >
                      Clear Image
                    </button>
                  )}
                </div>

                <input
                  type="url"
                  placeholder="Paste image URL (https://...)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#082854] border border-[#82B8F6]/30 rounded-xl text-white placeholder-[#82B8F6]/40 focus:border-[#138AEE] outline-none"
                />

                {/* Preset image buttons */}
                <div>
                  <span className="text-[10px] text-[#82B8F6] block mb-1">Or choose preset visual asset:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {imagePresets.slice(0, 5).map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(img.url)}
                        className={`px-2 py-1 rounded-lg text-[10px] border transition-all cursor-pointer ${
                          imageUrl === img.url 
                            ? 'bg-[#138AEE] text-white border-[#82B8F6]' 
                            : 'bg-[#082854] text-[#82B8F6] hover:text-white border-[#82B8F6]/20'
                        }`}
                      >
                        {img.label}
                      </button>
                    ))}
                  </div>
                </div>

                {imageUrl && (
                  <div className="w-full h-24 rounded-xl overflow-hidden border border-[#82B8F6]/20 mt-2">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Clickable Button & Link Options */}
              <div className="p-3 bg-[#061836] rounded-2xl border border-[#82B8F6]/20 space-y-2.5">
                <label className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Link className="w-3.5 h-3.5 text-[#138AEE]" />
                  <span>Clickable Action Button & Link (Optional)</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-[10px] text-[#82B8F6] block mb-1">Button Label:</span>
                    <input
                      type="text"
                      placeholder="e.g., Claim Offer, Open Calendar, View Guide"
                      value={actionLabel}
                      onChange={(e) => setActionLabel(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#082854] border border-[#82B8F6]/30 rounded-xl text-white placeholder-[#82B8F6]/40 focus:border-[#138AEE] outline-none"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-[#82B8F6] block mb-1">Target URL or Screen ID:</span>
                    <input
                      type="text"
                      placeholder="e.g. https://... or calendar, revenue, invoices"
                      value={actionUrl}
                      onChange={(e) => setActionUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#082854] border border-[#82B8F6]/30 rounded-xl text-white placeholder-[#82B8F6]/40 focus:border-[#138AEE] outline-none"
                    />
                  </div>
                </div>

                {actionUrl && (
                  <div className="flex items-center gap-4 pt-1 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer text-white">
                      <input 
                        type="radio" 
                        name="actionTarget" 
                        value="_blank"
                        checked={actionTarget === '_blank'}
                        onChange={() => setActionTarget('_blank')}
                        className="accent-[#138AEE]"
                      />
                      <span>Open in New Browser Tab (_blank)</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-white">
                      <input 
                        type="radio" 
                        name="actionTarget" 
                        value="_self"
                        checked={actionTarget === '_self'}
                        onChange={() => setActionTarget('_self')}
                        className="accent-[#138AEE]"
                      />
                      <span>Navigate Inside App Screen (_self)</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#82B8F6]/20 shrink-0">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#82B8F6] hover:text-white bg-[#061836] hover:bg-[#0C4EA4] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-[#138AEE] hover:bg-[#0C4EA4] text-white shadow-lg shadow-[#138AEE]/30 active:scale-95 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Publishing...' : 'Broadcast Notification Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewNotification && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#E5F0FD] text-[#082854] rounded-3xl border border-[#82B8F6]/30 shadow-2xl max-w-md w-full p-6 space-y-4 animate-fadeIn relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#82B8F6]/30">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#138AEE]/15 text-[#138AEE]">
                  <Eye className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#0C4EA4]">
                  Client Pop-up Preview Mode
                </span>
              </div>
              <button
                onClick={() => setPreviewNotification(null)}
                className="p-1.5 rounded-full bg-[#82B8F6]/20 hover:bg-[#82B8F6]/40 text-[#082854] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {previewNotification.imageUrl && (
              <div className="w-full h-40 rounded-2xl overflow-hidden border border-[#82B8F6]/30">
                <img 
                  src={previewNotification.imageUrl} 
                  alt={previewNotification.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="text-center py-2">
              <div className="inline-block mb-1">
                {getPriorityBadge(previewNotification.priority)}
              </div>
              <h3 className="font-display font-black text-lg text-[#082854] mb-2">
                {previewNotification.title}
              </h3>
              <p className="text-xs text-[#0C4EA4] whitespace-pre-line leading-relaxed px-2 bg-white/70 p-3 rounded-xl border border-[#82B8F6]/30">
                {previewNotification.message}
              </p>
            </div>

            <div className="space-y-2 pt-1">
              {previewNotification.actionLabel && (
                <button
                  type="button"
                  onClick={() => {
                    if (previewNotification.actionUrl) {
                      if (previewNotification.actionUrl.startsWith('http')) {
                        window.open(previewNotification.actionUrl, '_blank', 'noopener,noreferrer');
                      }
                    }
                    setPreviewNotification(null);
                  }}
                  className="w-full py-2.5 px-4 bg-[#138AEE] hover:bg-[#0C4EA4] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{previewNotification.actionLabel}</span>
                  {previewNotification.actionUrl?.startsWith('http') && <ExternalLink className="w-3 h-3" />}
                </button>
              )}
              <button
                type="button"
                onClick={() => setPreviewNotification(null)}
                className="w-full py-2 px-4 bg-[#82B8F6]/20 hover:bg-[#82B8F6]/40 text-[#082854] font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
