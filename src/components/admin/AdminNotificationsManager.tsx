import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  AdminNotification, 
  NotificationType, 
  NotificationPriority, 
  ClientProfile,
  isClientProfileOnline
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
  Copy,
  CheckSquare,
  Square,
  CheckCheck,
  UserCheck,
  Target
} from 'lucide-react';

export const AdminNotificationsManager: React.FC<{
  onSendSuccess?: (msg: string) => void;
  preselectedProfileId?: string | string[] | null;
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
  
  // Filters for Broadcasts
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTarget, setFilterTarget] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [templateCategory, setTemplateCategory] = useState<string>('all');
  const [templateSearchTerm, setTemplateSearchTerm] = useState('');
  const [quickBroadcastSuccess, setQuickBroadcastSuccess] = useState<string | null>(null);

  // Form State for creating notification
  const [targetType, setTargetType] = useState<'all' | 'specific'>('all');
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);
  const [clientPickerSearch, setClientPickerSearch] = useState('');
  const [clientPickerFilter, setClientPickerFilter] = useState<'all' | 'active' | 'online' | 'Starter' | 'Pro' | 'Premium' | 'Enterprise'>('all');

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

  // Handle incoming preselected profile(s)
  useEffect(() => {
    if (preselectedProfileId) {
      setTargetType('specific');
      if (Array.isArray(preselectedProfileId)) {
        setSelectedProfileIds(preselectedProfileId);
      } else {
        setSelectedProfileIds([preselectedProfileId]);
      }
      setCreateModalOpen(true);
    }
  }, [preselectedProfileId]);

  // Filtered clients for multi-select picker
  const filteredClientsForPicker = useMemo(() => {
    return authDatabase.profiles.filter(p => {
      const matchSearch = 
        p.businessName.toLowerCase().includes(clientPickerSearch.toLowerCase()) ||
        p.ownerName.toLowerCase().includes(clientPickerSearch.toLowerCase()) ||
        p.profileId.toLowerCase().includes(clientPickerSearch.toLowerCase()) ||
        p.email.toLowerCase().includes(clientPickerSearch.toLowerCase());

      let matchFilter = true;
      if (clientPickerFilter === 'active') matchFilter = p.status === 'active';
      else if (clientPickerFilter === 'online') matchFilter = isClientProfileOnline(p);
      else if (['Starter', 'Pro', 'Premium', 'Enterprise'].includes(clientPickerFilter)) {
        matchFilter = p.plan === clientPickerFilter;
      }

      return matchSearch && matchFilter;
    });
  }, [authDatabase.profiles, clientPickerSearch, clientPickerFilter]);

  const toggleSelectProfile = (profileId: string) => {
    setSelectedProfileIds(prev => 
      prev.includes(profileId) ? prev.filter(id => id !== profileId) : [...prev, profileId]
    );
  };

  const handleSelectAllFiltered = () => {
    const ids = filteredClientsForPicker.map(p => p.profileId);
    setSelectedProfileIds(prev => Array.from(new Set([...prev, ...ids])));
  };

  const handleDeselectAll = () => {
    setSelectedProfileIds([]);
  };

  const handleSelectActiveOnly = () => {
    const activeIds = authDatabase.profiles.filter(p => p.status === 'active').map(p => p.profileId);
    setSelectedProfileIds(activeIds);
  };

  const handleSelectOnlineOnly = () => {
    const onlineIds = authDatabase.profiles.filter(p => isClientProfileOnline(p)).map(p => p.profileId);
    setSelectedProfileIds(onlineIds);
  };

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
      setSelectedProfileIds([]);
    }
  };

  // 1-Click Instant Broadcast directly from template card
  const handleQuickBroadcastTemplate = async (tmpl: NotificationTemplate, targetProfiles?: string[]) => {
    try {
      const hasSpecific = targetProfiles && targetProfiles.length > 0;
      let targetBusinessName = 'All Client Studios (Global)';
      if (hasSpecific) {
        if (targetProfiles.length === 1) {
          const found = authDatabase.profiles.find(p => p.profileId === targetProfiles[0]);
          targetBusinessName = found ? `${found.businessName} (${found.profileId})` : targetProfiles[0];
        } else {
          const names = authDatabase.profiles
            .filter(p => targetProfiles.includes(p.profileId))
            .map(p => p.businessName);
          targetBusinessName = `${targetProfiles.length} Specific Clients (${names.slice(0, 2).join(', ')}${targetProfiles.length > 2 ? ` +${targetProfiles.length - 2} more` : ''})`;
        }
      }

      await createAdminNotification({
        targetType: hasSpecific ? 'specific' : 'all',
        targetProfileId: hasSpecific ? targetProfiles[0] : 'all',
        targetProfileIds: hasSpecific ? targetProfiles : undefined,
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

  const handleOpenCreateModal = (specificProfileIds?: string[] | string, initialTemplate?: NotificationTemplate) => {
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

    if (specificProfileIds) {
      setTargetType('specific');
      setSelectedProfileIds(Array.isArray(specificProfileIds) ? specificProfileIds : [specificProfileIds]);
    } else if (preselectedProfileId) {
      setTargetType('specific');
      setSelectedProfileIds(Array.isArray(preselectedProfileId) ? preselectedProfileId : [preselectedProfileId]);
    } else {
      setTargetType('all');
      setSelectedProfileIds([]);
    }
    
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Please provide both a notification title and message.');
      return;
    }

    if (targetType === 'specific' && selectedProfileIds.length === 0) {
      alert('Please select at least one specific client profile to receive this notification.');
      return;
    }

    setIsSubmitting(true);
    try {
      let targetBusinessName = 'All Client Studios (Global)';
      if (targetType === 'specific') {
        if (selectedProfileIds.length === 1) {
          const found = authDatabase.profiles.find(p => p.profileId === selectedProfileIds[0]);
          targetBusinessName = found ? `${found.businessName} (${found.profileId})` : selectedProfileIds[0];
        } else {
          const selectedNames = authDatabase.profiles
            .filter(p => selectedProfileIds.includes(p.profileId))
            .map(p => p.businessName);
          targetBusinessName = `${selectedProfileIds.length} Selected Clients (${selectedNames.slice(0, 2).join(', ')}${selectedProfileIds.length > 2 ? ` +${selectedProfileIds.length - 2} more` : ''})`;
        }
      }

      await createAdminNotification({
        targetType,
        targetProfileId: targetType === 'specific' ? selectedProfileIds[0] : 'all',
        targetProfileIds: targetType === 'specific' ? selectedProfileIds : undefined,
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
        onSendSuccess(`Notification broadcasted to ${targetBusinessName}!`);
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
      (n.targetBusinessName && n.targetBusinessName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (n.targetProfileId && n.targetProfileId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (n.targetProfileIds && n.targetProfileIds.some(id => id.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchType = filterType === 'all' || n.type === filterType;
    
    let matchTarget = true;
    if (filterTarget === 'global') {
      matchTarget = n.targetType === 'all';
    } else if (filterTarget === 'specific') {
      matchTarget = n.targetType === 'specific';
    } else if (filterTarget === 'multi_specific') {
      matchTarget = n.targetType === 'specific' && !!n.targetProfileIds && n.targetProfileIds.length > 1;
    } else if (filterTarget === 'single_specific') {
      matchTarget = n.targetType === 'specific' && (!n.targetProfileIds || n.targetProfileIds.length <= 1);
    }

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
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"><CheckCircle2 className="w-3 h-3" /> UPDATE</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-orange-500/20 text-[#FF8833] border border-orange-500/30"><Info className="w-3 h-3" /> INFO</span>;
    }
  };

  const getTypeBadge = (t: NotificationType) => {
    switch (t) {
      case 'popup':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30"><Layout className="w-3 h-3" /> Pop-up Modal</span>;
      case 'banner':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30"><MessageSquare className="w-3 h-3" /> Top Banner</span>;
      case 'ticker':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30"><Radio className="w-3 h-3" /> Breaking Ticker</span>;
      case 'drawer':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"><Layers className="w-3 h-3" /> Action Sheet Tray</span>;
      case 'floating_badge':
      case 'floating_dock':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30"><Sparkles className="w-3 h-3" /> Floating Widget</span>;
      case 'spotlight_card':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"><Sparkles className="w-3 h-3" /> Spotlight Hero</span>;
      case 'toast_stack':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"><Bell className="w-3 h-3" /> Corner Toast</span>;
      case 'modal_takeover':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30"><Flame className="w-3 h-3" /> Full Takeover</span>;
      case 'sms_text':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"><Smartphone className="w-3 h-3" /> SMS Notice</span>;
      case 'whatsapp_msg':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-green-500/20 text-green-300 border border-green-500/30"><MessageCircle className="w-3 h-3" /> WhatsApp Bot</span>;
      case 'email_digest':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30"><Mail className="w-3 h-3" /> Email Digest</span>;
      case 'voice_tts':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30"><Volume2 className="w-3 h-3" /> Voice Broadcast</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"><Bell className="w-3 h-3" /> Push Alert & Inbox</span>;
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
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1C0908] via-[#2A100E] to-[#1C0908] border border-[#FF6B00]/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 rounded-xl bg-[#FF6B00]/20 text-[#FF6B00]">
              <Bell className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-white font-display">
              Push Notifications, Banners & Interactive Pop-ups
            </h2>
          </div>
          <p className="text-xs text-[#A08E8B] max-w-2xl">
            Dispatch announcements, promotional modals, urgent breaking news tickers, WhatsApp alerts, and SMS updates to all client salons or specific accounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setActiveSubView('templates')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
              activeSubView === 'templates'
                ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-md shadow-[#FF6B00]/30'
                : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#FFA052]" />
            <span>Delivery Templates ({READY_MADE_NOTIFICATION_TEMPLATES.length})</span>
          </button>

          <button
            onClick={() => handleOpenCreateModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E55C00] text-white rounded-2xl text-xs font-black shadow-lg shadow-[#FF6B00]/30 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Compose Broadcast</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Switcher Tabs */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setActiveSubView('broadcasts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubView === 'broadcasts'
              ? 'bg-white/15 text-white shadow-sm'
              : 'text-[#A08E8B] hover:text-white hover:bg-white/5'
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
              ? 'bg-[#FF6B00] text-white shadow-sm'
              : 'text-[#A08E8B] hover:text-white hover:bg-white/5'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          <span>Ready-Made Delivery Templates ({READY_MADE_NOTIFICATION_TEMPLATES.length} Pre-built)</span>
          <span className="px-1.5 py-0.2 bg-amber-400/20 text-amber-300 text-[9px] font-black rounded-md uppercase">
            Popular
          </span>
        </button>
      </div>

      {/* VIEW 1: READY-MADE DELIVERY TEMPLATES LIBRARY */}
      {activeSubView === 'templates' && (
        <div className="space-y-4">
          {/* Templates Header Filter Controls */}
          <div className="bg-[#1C0908] p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#A08E8B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search templates by feature, category, or format..."
                value={templateSearchTerm}
                onChange={(e) => setTemplateSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#7A6865] focus:border-[#FF6B00] outline-none"
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
                      ? 'bg-[#FF6B00] text-white'
                      : 'bg-white/5 text-[#A08E8B] hover:text-white border border-white/5'
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
                className="p-4 rounded-2xl bg-[#1C0908] border border-white/10 hover:border-[#FF6B00]/50 flex flex-col justify-between transition-all group shadow-lg hover:shadow-2xl hover:shadow-[#FF6B00]/10"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {getPriorityBadge(tmpl.priority)}
                      {getTypeBadge(tmpl.type)}
                    </div>
                    <span className="text-[10px] text-[#FFA052] font-bold px-2 py-0.5 rounded-md bg-white/5">
                      {tmpl.category}
                    </span>
                  </div>

                  {tmpl.imageUrl && (
                    <div className="w-full h-32 rounded-xl overflow-hidden border border-white/10 relative">
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
                    <p className="text-xs text-[#C5B7B4] leading-relaxed line-clamp-3">
                      {tmpl.message}
                    </p>
                  </div>

                  {tmpl.actionLabel && (
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 font-bold bg-amber-400/10 px-2 py-1 rounded-lg border border-amber-400/20">
                        <Link className="w-3 h-3" />
                        CTA: "{tmpl.actionLabel}" ({tmpl.actionUrl || '_self'})
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewNotification(tmpl as any)}
                      className="px-2.5 py-1.5 bg-white/5 hover:bg-white/15 text-[#C5B7B4] hover:text-white text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                      title="Preview how clients will see this notification"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#4ECDC4]" />
                      <span>Preview</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenCreateModal(undefined, tmpl)}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                        title="Customize title, image, or target recipient before broadcasting"
                      >
                        <span>Edit & Send</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleQuickBroadcastTemplate(tmpl)}
                        className="px-3 py-1.5 bg-[#FF6B00] hover:bg-[#E55C00] text-white text-xs font-black rounded-xl shadow-md shadow-[#FF6B00]/20 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
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
          <div className="p-4 rounded-2xl bg-[#1C0908] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#FF6B00]" />
                <span>Featured Ready-Made Delivery Templates (Click to Instant Broadcast or Customize)</span>
              </span>
              <button
                onClick={() => setActiveSubView('templates')}
                className="text-[11px] text-[#FFA052] hover:underline flex items-center gap-1 font-bold"
              >
                <span>View all {READY_MADE_NOTIFICATION_TEMPLATES.length} templates</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {READY_MADE_NOTIFICATION_TEMPLATES.slice(0, 4).map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FF6B00]/40 transition-all flex flex-col justify-between gap-2 text-left"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[9px] font-black uppercase text-[#FFA052]">{tmpl.category}</span>
                      <span className="text-[9px] text-[#A08E8B]">{tmpl.type}</span>
                    </div>
                    <p className="text-xs font-bold text-white line-clamp-1">{tmpl.title}</p>
                    <p className="text-[10px] text-[#A08E8B] line-clamp-1 mt-0.5">{tmpl.message}</p>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => handleOpenCreateModal(undefined, tmpl)}
                      className="text-[10px] text-[#4ECDC4] font-bold hover:underline cursor-pointer"
                    >
                      Customize
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickBroadcastTemplate(tmpl)}
                      className="text-[10px] bg-[#FF6B00] hover:bg-[#E55C00] text-white px-2 py-0.5 rounded-lg font-black cursor-pointer"
                    >
                      Instant Broadcast
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filter and Search Bar for Broadcasts */}
          <div className="bg-[#1C0908] p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#A08E8B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search active broadcasts by title, message, or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#7A6865] focus:border-[#FF6B00] outline-none"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white outline-none cursor-pointer focus:border-[#FF6B00]"
              >
                <option value="all" className="bg-[#1C0908]">All Delivery Formats</option>
                <option value="popup" className="bg-[#1C0908]">🚨 Dashboard Pop-up Modal</option>
                <option value="banner" className="bg-[#1C0908]">📌 Top Announcement Banner</option>
                <option value="ticker" className="bg-[#1C0908]">📻 Live Breaking Ticker</option>
                <option value="drawer" className="bg-[#1C0908]">📥 Bottom Action Tray / Sheet</option>
                <option value="floating_badge" className="bg-[#1C0908]">🔮 Floating Action Widget</option>
                <option value="spotlight_card" className="bg-[#1C0908]">⭐ Dashboard Spotlight Card</option>
                <option value="toast_stack" className="bg-[#1C0908]">🔔 Corner Toast Stack</option>
                <option value="modal_takeover" className="bg-[#1C0908]">🎭 Fullscreen Immersive Takeover</option>
                <option value="sms_text" className="bg-[#1C0908]">📱 SMS Text Notice</option>
                <option value="whatsapp_msg" className="bg-[#1C0908]">💬 WhatsApp Message Bot</option>
                <option value="email_digest" className="bg-[#1C0908]">📧 Email Performance Digest</option>
                <option value="voice_tts" className="bg-[#1C0908]">🔊 Voice Audio Alert</option>
                <option value="push" className="bg-[#1C0908]">📣 Push Notice & Activity Inbox</option>
              </select>

              <select
                value={filterTarget}
                onChange={(e) => setFilterTarget(e.target.value)}
                className="px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white outline-none cursor-pointer focus:border-[#FF6B00]"
              >
                <option value="all" className="bg-[#1C0908]">All Targets</option>
                <option value="global" className="bg-[#1C0908]">Global Broadcasts (All Clients)</option>
                <option value="specific" className="bg-[#1C0908]">All Targeted (Specific Clients)</option>
                <option value="multi_specific" className="bg-[#1C0908]">🎯 Multiple Specific Clients</option>
                <option value="single_specific" className="bg-[#1C0908]">👤 Single Client Targeted</option>
              </select>
            </div>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center bg-[#1C0908] rounded-3xl border border-white/10">
              <Bell className="w-12 h-12 text-[#A08E8B]/40 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No Sent Broadcast Notifications Found</h3>
              <p className="text-xs text-[#A08E8B] max-w-sm mx-auto mb-4">
                Choose a pre-built template from our library or compose a custom broadcast notification.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setActiveSubView('templates')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold border border-white/10 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#FFA052]" />
                  <span>Browse {READY_MADE_NOTIFICATION_TEMPLATES.length} Ready Templates</span>
                </button>
                <button
                  onClick={() => handleOpenCreateModal()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B00] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#E55C00] cursor-pointer"
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
                      ? 'bg-[#1C0908] border-white/10 hover:border-white/20 shadow-lg' 
                      : 'bg-[#140606] border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getPriorityBadge(notif.priority)}
                      {getTypeBadge(notif.type)}

                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-white/10 text-white">
                        {notif.targetType === 'all' ? (
                          <>
                            <Users className="w-3 h-3 text-[#2E8A81]" />
                            <span>All Clients (Global Broadcast)</span>
                          </>
                        ) : notif.targetProfileIds && notif.targetProfileIds.length > 1 ? (
                          <>
                            <Target className="w-3 h-3 text-[#FF6B00]" />
                            <span>Targeted: <strong className="text-[#FF6B00]">{notif.targetProfileIds.length} Selected Clients</strong></span>
                            <span className="text-[9px] text-[#A08E8B] bg-black/40 px-1.5 py-0.2 rounded">
                              {notif.targetProfileIds.slice(0, 3).join(', ')}{notif.targetProfileIds.length > 3 ? '...' : ''}
                            </span>
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 text-[#FF6B00]" />
                            <span>Target: <strong className="text-[#FF6B00]">{notif.targetBusinessName || notif.targetProfileId}</strong></span>
                          </>
                        )}
                      </span>

                      <span className="text-[10px] text-[#A08E8B] flex items-center gap-1 ml-auto md:ml-0">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Status & Control Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setPreviewNotification(notif)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-xs text-white font-medium transition-colors cursor-pointer"
                        title="Preview as Client"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#4ECDC4]" />
                        <span>Preview</span>
                      </button>

                      <button
                        onClick={() => handleToggle(notif.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          notif.isActive 
                            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' 
                            : 'bg-white/10 text-[#A08E8B] hover:bg-white/20'
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
                      <div className="w-24 h-24 rounded-xl overflow-hidden border border-white/10 shrink-0 hidden sm:block">
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
                      <p className="text-xs text-[#C5B7B4] whitespace-pre-line leading-relaxed">
                        {notif.message}
                      </p>

                      {notif.actionLabel && (
                        <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30 rounded-xl text-[11px] font-bold">
                            <Link className="w-3 h-3" />
                            CTA: "{notif.actionLabel}" {notif.actionUrl ? `→ ${notif.actionUrl}` : ''}
                          </span>
                          {notif.actionTarget === '_blank' && (
                            <span className="text-[10px] text-white/50 flex items-center gap-0.5">
                              <ExternalLink className="w-2.5 h-2.5" /> Opens new tab
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-4 text-[10px] text-[#A08E8B]">
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
          <div className="bg-[#1C0908] text-white rounded-3xl border border-white/20 shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-fadeIn my-6 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#FF6B00] text-white">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-white">
                    Compose Broadcast Notification / Delivery Notice
                  </h3>
                  <p className="text-[11px] text-[#A08E8B]">
                    Configure targeting, rich visuals, external link CTA buttons, or load from a pre-made template.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-[#A08E8B] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 flex-1 overflow-y-auto pr-1">
              
              {/* Quick Template Picker dropdown */}
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>⚡ Quick Template Autofill (Optional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setCreateModalOpen(false);
                      setActiveSubView('templates');
                    }}
                    className="text-[10px] text-[#FFA052] hover:underline font-bold"
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
                  className="w-full px-3 py-2 text-xs bg-white/5 border border-amber-400/30 rounded-xl text-white outline-none focus:border-[#FF6B00]"
                >
                  <option value="" className="bg-[#1C0908]">-- Select a Ready-Made Template to populate fields --</option>
                  {READY_MADE_NOTIFICATION_TEMPLATES.map(t => (
                    <option key={t.id} value={t.id} className="bg-[#1C0908]">
                      [{t.category}] {t.title.slice(0, 60)} ({t.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Audience */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-[#A08E8B] uppercase tracking-wider block">
                    Target Recipient Audience *
                  </label>
                  {targetType === 'specific' && (
                    <span className="text-[11px] font-bold text-[#FF6B00]">
                      {selectedProfileIds.length} of {authDatabase.profiles.length} Clients Selected
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('all');
                      setSelectedProfileIds([]);
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      targetType === 'all' 
                        ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-md shadow-[#FF6B00]/20' 
                        : 'bg-white/5 text-[#A08E8B] border-white/10 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>All Clients (Global Broadcast)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('specific');
                      if (selectedProfileIds.length === 0 && authDatabase.profiles.length > 0) {
                        setSelectedProfileIds([authDatabase.profiles[0].profileId]);
                      }
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      targetType === 'specific' 
                        ? 'bg-[#FF6B00] text-white border-[#FF6B00] shadow-md shadow-[#FF6B00]/20' 
                        : 'bg-white/5 text-[#A08E8B] border-white/10 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Target className="w-4 h-4" />
                    <span>Select Specific Clients (Multiple)</span>
                  </button>
                </div>

                {targetType === 'specific' && (
                  <div className="p-3.5 bg-white/5 rounded-2xl border border-[#FF6B00]/30 space-y-3">
                    {/* Header & Quick Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-[#FF6B00]" />
                        <span className="text-xs font-bold text-white">
                          Select Client Profiles ({selectedProfileIds.length} chosen)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={handleSelectAllFiltered}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center gap-1"
                          title="Select all clients currently shown in filtered list"
                        >
                          <CheckSquare className="w-3 h-3 text-[#4ECDC4]" />
                          <span>Select Filtered ({filteredClientsForPicker.length})</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSelectActiveOnly}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 transition-colors cursor-pointer flex items-center gap-1"
                          title="Select only active client accounts"
                        >
                          <CheckCheck className="w-3 h-3 text-emerald-400" />
                          <span>Select Active ({authDatabase.profiles.filter(p => p.status === 'active').length})</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSelectOnlineOnly}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 transition-colors cursor-pointer flex items-center gap-1"
                          title="Select only clients currently active/online"
                        >
                          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                          <span>Online Only ({authDatabase.profiles.filter(p => isClientProfileOnline(p)).length})</span>
                        </button>

                        {selectedProfileIds.length > 0 && (
                          <button
                            type="button"
                            onClick={handleDeselectAll}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-red-500/15 hover:bg-red-500/25 text-red-300 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            <span>Clear Selection</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Search & Filter pills */}
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-[#A08E8B] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search clients by studio name, owner, profile ID, or email..."
                          value={clientPickerSearch}
                          onChange={(e) => setClientPickerSearch(e.target.value)}
                          className="w-full pl-8.5 pr-8 py-1.5 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#7A6865] focus:border-[#FF6B00] outline-none"
                        />
                        {clientPickerSearch && (
                          <button
                            type="button"
                            onClick={() => setClientPickerSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A08E8B] hover:text-white cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Quick filter pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
                        {[
                          { id: 'all', label: `All (${authDatabase.profiles.length})` },
                          { id: 'active', label: `Active (${authDatabase.profiles.filter(p => p.status === 'active').length})` },
                          { id: 'online', label: `Online Now (${authDatabase.profiles.filter(p => isClientProfileOnline(p)).length})` },
                          { id: 'Starter', label: `Starter (${authDatabase.profiles.filter(p => p.plan === 'Starter').length})` },
                          { id: 'Pro', label: `Pro (${authDatabase.profiles.filter(p => p.plan === 'Pro').length})` },
                          { id: 'Premium', label: `Premium (${authDatabase.profiles.filter(p => p.plan === 'Premium').length})` },
                          { id: 'Enterprise', label: `Enterprise (${authDatabase.profiles.filter(p => p.plan === 'Enterprise').length})` },
                        ].map((filterTab) => (
                          <button
                            key={filterTab.id}
                            type="button"
                            onClick={() => setClientPickerFilter(filterTab.id as any)}
                            className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
                              clientPickerFilter === filterTab.id
                                ? 'bg-[#FF6B00] text-white'
                                : 'bg-white/5 text-[#A08E8B] hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {filterTab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Selected Client Chips Preview Tray */}
                    {selectedProfileIds.length > 0 && (
                      <div className="p-2 bg-black/30 rounded-xl border border-white/5 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-[#A08E8B]">
                          <span>Active Recipients ({selectedProfileIds.length}):</span>
                          <button
                            type="button"
                            onClick={handleDeselectAll}
                            className="text-red-400 hover:underline cursor-pointer"
                          >
                            Remove All
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                          {selectedProfileIds.map((id) => {
                            const client = authDatabase.profiles.find(p => p.profileId === id);
                            return (
                              <span
                                key={id}
                                className="inline-flex items-center gap-1 pl-2 pr-1.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#FF6B00]/20 text-[#FFA052] border border-[#FF6B00]/30"
                              >
                                <span>{client?.businessName || id}</span>
                                <button
                                  type="button"
                                  onClick={() => toggleSelectProfile(id)}
                                  className="hover:bg-[#FF6B00]/40 rounded p-0.5 transition-colors cursor-pointer text-white"
                                  title="Remove client from broadcast"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Checkbox List */}
                    <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 divide-y divide-white/5">
                      {filteredClientsForPicker.length === 0 ? (
                        <div className="p-6 text-center text-xs text-[#A08E8B]">
                          No client profiles match your search criteria.
                        </div>
                      ) : (
                        filteredClientsForPicker.map((p) => {
                          const isSelected = selectedProfileIds.includes(p.profileId);
                          const isOnline = isClientProfileOnline(p);

                          return (
                            <div
                              key={p.profileId}
                              onClick={() => toggleSelectProfile(p.profileId)}
                              className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none ${
                                isSelected
                                  ? 'bg-[#FF6B00]/15 border-[#FF6B00] shadow-sm'
                                  : 'bg-white/5 border-transparent hover:border-white/10 hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                                  isSelected 
                                    ? 'bg-[#FF6B00] border-[#FF6B00] text-white' 
                                    : 'border-white/30 bg-black/30 text-transparent'
                                }`}>
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-[#FAF8F5]'}`}>
                                      {p.businessName}
                                    </span>
                                    <span className="text-[10px] text-[#A08E8B] font-mono bg-black/40 px-1.5 py-0.2 rounded">
                                      {p.profileId}
                                    </span>
                                    {isOnline && (
                                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-full border border-emerald-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span>Online</span>
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-[#A08E8B] truncate mt-0.5">
                                    <span>{p.ownerName}</span>
                                    <span>•</span>
                                    <span className="truncate">{p.email}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                                  p.plan === 'Enterprise' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                                  p.plan === 'Premium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                  p.plan === 'Pro' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                  'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                                }`}>
                                  {p.plan}
                                </span>

                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                  p.status === 'active' 
                                    ? 'bg-emerald-500/20 text-emerald-300' 
                                    : 'bg-red-500/20 text-red-300'
                                }`}>
                                  {p.status}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {selectedProfileIds.length === 0 && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Please select at least one client profile from the list above.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Delivery Format & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#A08E8B] uppercase tracking-wider block mb-1.5">
                    Delivery Format
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as NotificationType)}
                    className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#FF6B00]"
                  >
                    <option value="popup" className="bg-[#1C0908]">🚨 Dashboard Pop-up Modal</option>
                    <option value="banner" className="bg-[#1C0908]">📌 Top Announcement Banner</option>
                    <option value="ticker" className="bg-[#1C0908]">📻 Live Breaking News Ticker Strip</option>
                    <option value="drawer" className="bg-[#1C0908]">📥 Bottom Action Tray / Sheet</option>
                    <option value="floating_badge" className="bg-[#1C0908]">🔮 Floating Action Bubble Widget</option>
                    <option value="spotlight_card" className="bg-[#1C0908]">⭐ Dashboard Spotlight Hero Card</option>
                    <option value="toast_stack" className="bg-[#1C0908]">🔔 Corner Toast Notification Stack</option>
                    <option value="modal_takeover" className="bg-[#1C0908]">🎭 Fullscreen Immersive Takeover Modal</option>
                    <option value="sms_text" className="bg-[#1C0908]">📱 SMS Text Alert Notice</option>
                    <option value="whatsapp_msg" className="bg-[#1C0908]">💬 WhatsApp Automated Notice Card</option>
                    <option value="email_digest" className="bg-[#1C0908]">📧 Email Studio Digest Card</option>
                    <option value="voice_tts" className="bg-[#1C0908]">🔊 Voice Audio Alert Notice</option>
                    <option value="push" className="bg-[#1C0908]">📣 Push Notice & Studio Inbox</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#A08E8B] uppercase tracking-wider block mb-1.5">
                    Priority / Tone
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as NotificationPriority)}
                    className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#FF6B00]"
                  >
                    <option value="info" className="bg-[#1C0908]">ℹ️ Information (Standard)</option>
                    <option value="urgent" className="bg-[#1C0908]">🔥 Urgent Announcement (Red)</option>
                    <option value="warning" className="bg-[#1C0908]">⚠️ Warning / Alert (Amber)</option>
                    <option value="promotion" className="bg-[#1C0908]">⭐ Offer / Promo (Purple)</option>
                    <option value="update" className="bg-[#1C0908]">✅ System Feature Update (Green)</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-[11px] font-bold text-[#A08E8B] uppercase tracking-wider block mb-1.5">
                  Notification Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Important Studio Announcement or New Feature"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#7A6865] focus:border-[#FF6B00] outline-none"
                />
              </div>

              {/* Message */}
              <div>
                <label className="text-[11px] font-bold text-[#A08E8B] uppercase tracking-wider block mb-1.5">
                  Notification Message Content *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Type the announcement or notice message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#7A6865] focus:border-[#FF6B00] outline-none"
                />
              </div>

              {/* Image URL with Preset Picker */}
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#FF6B00]" />
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
                  className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#7A6865] focus:border-[#FF6B00] outline-none"
                />

                {/* Preset image buttons */}
                <div>
                  <span className="text-[10px] text-[#A08E8B] block mb-1">Or choose preset visual asset:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {imagePresets.slice(0, 5).map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(img.url)}
                        className={`px-2 py-1 rounded-lg text-[10px] border transition-all cursor-pointer ${
                          imageUrl === img.url 
                            ? 'bg-[#FF6B00] text-white border-[#FF6B00]' 
                            : 'bg-white/5 text-[#A08E8B] hover:text-white border-white/10'
                        }`}
                      >
                        {img.label}
                      </button>
                    ))}
                  </div>
                </div>

                {imageUrl && (
                  <div className="w-full h-24 rounded-xl overflow-hidden border border-white/10 mt-2">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Clickable Button & Link Options */}
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-2.5">
                <label className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Link className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Clickable Action Button & Link (Optional)</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-[10px] text-[#A08E8B] block mb-1">Button Label:</span>
                    <input
                      type="text"
                      placeholder="e.g., Claim Offer, Open Calendar, View Guide"
                      value={actionLabel}
                      onChange={(e) => setActionLabel(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#7A6865] focus:border-[#FF6B00] outline-none"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-[#A08E8B] block mb-1">Target URL or Screen ID:</span>
                    <input
                      type="text"
                      placeholder="e.g. https://... or calendar, revenue, invoices"
                      value={actionUrl}
                      onChange={(e) => setActionUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#7A6865] focus:border-[#FF6B00] outline-none"
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
                        className="accent-[#FF6B00]"
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
                        className="accent-[#FF6B00]"
                      />
                      <span>Navigate Inside App Screen (_self)</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#A08E8B] hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-[#FF6B00] hover:bg-[#E55C00] text-white shadow-lg shadow-[#FF6B00]/30 active:scale-95 transition-all cursor-pointer"
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
          <div className="bg-[#FAF8F5] text-[#240C0B] rounded-3xl border border-black/10 shadow-2xl max-w-md w-full p-6 space-y-4 animate-fadeIn relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6DFD5]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#FF6B00]/15 text-[#FF6B00]">
                  <Eye className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#A08E8B]">
                  Client Pop-up Preview Mode
                </span>
              </div>
              <button
                onClick={() => setPreviewNotification(null)}
                className="p-1.5 rounded-full bg-[#E6DFD5]/50 hover:bg-[#E6DFD5] text-[#240C0B] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {previewNotification.imageUrl && (
              <div className="w-full h-40 rounded-2xl overflow-hidden border border-[#E6DFD5]">
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
              <h3 className="font-display font-black text-lg text-[#240C0B] mb-2">
                {previewNotification.title}
              </h3>
              <p className="text-xs text-[#5C4A47] whitespace-pre-line leading-relaxed px-2 bg-white/70 p-3 rounded-xl border border-[#E6DFD5]">
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
                  className="w-full py-2.5 px-4 bg-[#FF6B00] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{previewNotification.actionLabel}</span>
                  {previewNotification.actionUrl?.startsWith('http') && <ExternalLink className="w-3 h-3" />}
                </button>
              )}
              <button
                type="button"
                onClick={() => setPreviewNotification(null)}
                className="w-full py-2 px-4 bg-[#E6DFD5]/60 hover:bg-[#E6DFD5] text-[#240C0B] font-bold text-xs rounded-xl transition-colors cursor-pointer"
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
