import React from 'react';
import { useApp } from '../../../context/AppContext';
import { useDashboardSystem } from '../../../context/DashboardSystemContext';
import { 
  Plus, 
  Calendar, 
  UserPlus, 
  DollarSign, 
  MessageSquare, 
  RotateCcw, 
  Sparkles, 
  Printer, 
  ShieldCheck,
  Zap,
  Layers
} from 'lucide-react';

export const QuickActionsWidget: React.FC = () => {
  const { openModal, showToast } = useApp();
  const { triggerSimulationEvent, setIsAdminStudioOpen } = useDashboardSystem();

  const actions = [
    {
      id: 'act-new-appt',
      label: 'Book Walk-in',
      sub: 'Schedule Dog',
      icon: Calendar,
      onClick: () => openModal('appointment_new'),
      variant: 'primary'
    },
    {
      id: 'act-new-client',
      label: 'Register Pet',
      sub: 'New Client',
      icon: UserPlus,
      onClick: () => openModal('client_new'),
      variant: 'ghost'
    },
    {
      id: 'act-instant-pay',
      label: 'Fast Invoice',
      sub: 'Collect Pay',
      icon: DollarSign,
      onClick: () => triggerSimulationEvent('payment'),
      variant: 'ghost'
    },
    {
      id: 'act-sim-checkin',
      label: 'Sim Check-in',
      sub: 'Trigger Event',
      icon: Zap,
      onClick: () => triggerSimulationEvent('check_in'),
      variant: 'ghost'
    },
    {
      id: 'act-open-studio',
      label: 'Admin Studio',
      sub: 'Themes & Layouts',
      icon: Layers,
      onClick: () => setIsAdminStudioOpen(true),
      variant: 'ghost'
    }
  ];

  return (
    <div id="widget-quick-actions" className="card-box flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-theme-subtle">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-theme-primary" />
          <h3 className="text-sm font-bold text-theme-ink font-display">
            Operational Quick Action Hub
          </h3>
        </div>
        <span className="text-[11px] text-theme-muted">
          1-Click Studio Triggers
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 mt-3">
        {actions.map((act) => {
          const Icon = act.icon;
          const isPrimary = act.variant === 'primary';

          return (
            <button
              key={act.id}
              onClick={act.onClick}
              className={`p-2.5 rounded-xl flex flex-col items-center text-center transition-all group ${
                isPrimary
                  ? 'btn-primary'
                  : 'bg-theme-light border border-theme-subtle hover:border-theme-primary text-theme-ink'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110 ${
                isPrimary ? 'bg-black/15 text-black' : 'bg-theme-canvas text-theme-primary border border-theme-subtle'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold leading-tight">
                {act.label}
              </span>
              <span className={`text-[10px] mt-0.5 leading-tight ${isPrimary ? 'text-black/70' : 'text-theme-muted'}`}>
                {act.sub}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
