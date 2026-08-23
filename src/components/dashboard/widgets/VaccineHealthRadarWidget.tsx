import React from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Send, 
  HeartPulse, 
  CheckCircle2,
  Calendar,
  ChevronRight
} from 'lucide-react';

export const VaccineHealthRadarWidget: React.FC = () => {
  const { clients, showToast, openModal } = useApp();

  const alerts = [
    {
      id: 'alt-1',
      petName: clients[0]?.name || 'Bella',
      owner: clients[0]?.owner || 'Sarah Montgomery',
      vaccine: 'Rabies Booster',
      status: 'expired',
      dueDate: 'Aug 14, 2026',
      daysAgo: '9 days overdue'
    },
    {
      id: 'alt-2',
      petName: clients[1]?.name || 'Charlie',
      owner: clients[1]?.owner || 'Michael Chang',
      vaccine: 'Bordetella (Kennel Cough)',
      status: 'due_soon',
      dueDate: 'Aug 29, 2026',
      daysAgo: 'Due in 6 days'
    },
    {
      id: 'alt-3',
      petName: clients[2]?.name || 'Thor',
      owner: clients[2]?.owner || 'Emma Watson',
      vaccine: 'DHPP Core Shot',
      status: 'due_soon',
      dueDate: 'Sep 05, 2026',
      daysAgo: 'Due in 13 days'
    }
  ];

  return (
    <div id="widget-vaccine-alerts" className="card-box flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-theme-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-theme-ink font-display flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              Health & Vaccine Compliance
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/30">
              {alerts.length} Action Needed
            </span>
          </div>
          <p className="text-xs text-theme-muted mt-0.5">
            Automatic veterinary compliance verification & SMS booster triggers
          </p>
        </div>

        <button
          onClick={() => showToast('Dispatched automated SMS vaccine alerts to 3 pet owners', 'success')}
          className="text-xs font-bold text-theme-primary hover:underline flex items-center gap-1"
        >
          <Send className="w-3.5 h-3.5" />
          Send All Reminders
        </button>
      </div>

      {/* Alert Cards */}
      <div className="mt-3 space-y-2.5">
        {alerts.map((alt) => (
          <div
            key={alt.id}
            className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
              alt.status === 'expired'
                ? 'bg-rose-500/5 border-rose-500/30 hover:border-rose-500/60'
                : 'bg-amber-500/5 border-amber-500/30 hover:border-amber-500/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                alt.status === 'expired' ? 'bg-rose-500/15 text-rose-500' : 'bg-amber-500/15 text-amber-500'
              }`}>
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-theme-ink font-display">
                    {alt.petName}
                  </span>
                  <span className="text-[11px] text-theme-muted">
                    ({alt.owner})
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                    alt.status === 'expired' ? 'bg-rose-500/20 text-rose-600' : 'bg-amber-500/20 text-amber-600'
                  }`}>
                    {alt.daysAgo}
                  </span>
                </div>
                <div className="text-[11px] text-theme-muted mt-0.5">
                  Required: <strong className="text-theme-ink">{alt.vaccine}</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => showToast(`SMS booster notification dispatched to ${alt.owner}`, 'success')}
              className="px-2.5 py-1 rounded-lg bg-theme-light border border-theme-subtle text-theme-primary text-xs font-semibold hover:bg-theme-primary hover:text-black transition-all flex items-center gap-1 shrink-0"
            >
              <Send className="w-3 h-3" />
              Notify
            </button>
          </div>
        ))}
      </div>

      {/* Footer Status */}
      <div className="mt-3 pt-2.5 border-t border-theme-subtle flex items-center justify-between text-xs">
        <span className="text-emerald-500 font-semibold flex items-center gap-1">
          <ShieldCheck className="w-4 h-4" /> 94% Studio Herd Immunity
        </span>
        <span className="text-theme-muted">
          Auto-synced with PetCloud Vet DB
        </span>
      </div>
    </div>
  );
};
