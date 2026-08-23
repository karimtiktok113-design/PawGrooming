import React from 'react';
import { useApp } from '../../../context/AppContext';
import { useDashboardSystem } from '../../../context/DashboardSystemContext';
import { 
  Sparkles, 
  Bot, 
  TrendingUp, 
  ShieldAlert, 
  Sun, 
  Send,
  ArrowRight
} from 'lucide-react';

export const AiSummaryWidget: React.FC = () => {
  const { clients, appointments, showToast } = useApp();
  const { currentThemeDef } = useDashboardSystem();

  return (
    <div id="widget-ai-summary" className="card-box flex flex-col justify-between h-full relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-theme-primary/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-theme-subtle">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-theme-light flex items-center justify-center text-theme-primary border border-theme-subtle">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-theme-ink font-display">
            PawGroom AI Daily Studio Digest
          </h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 border border-purple-500/30">
          Autonomous Copilot
        </span>
      </div>

      {/* AI Bullet points */}
      <div className="mt-3 space-y-2.5 text-xs text-theme-ink">
        <div className="p-2.5 rounded-xl bg-theme-light border border-theme-subtle flex items-start gap-2.5">
          <span className="text-emerald-500 font-bold text-sm">📈</span>
          <div>
            <strong className="text-theme-ink">Optimal Capacity Reached:</strong>
            <p className="text-theme-muted mt-0.5">
              Today’s throughput is at 92% efficiency. Staff member Elena is pacing 8 minutes ahead of schedule.
            </p>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-theme-light border border-theme-subtle flex items-start gap-2.5">
          <span className="text-amber-500 font-bold text-sm">🌾</span>
          <div>
            <strong className="text-theme-ink">High Pollen Weather Warning:</strong>
            <p className="text-theme-muted mt-0.5">
              High pollen in your area today. Suggest hypoallergenic chamomile rinse add-on for incoming Doodle breeds.
            </p>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-theme-light border border-theme-subtle flex items-start gap-2.5">
          <span className="text-rose-500 font-bold text-sm">⚠️</span>
          <div>
            <strong className="text-theme-ink">Sensitive Skin Alert:</strong>
            <p className="text-theme-muted mt-0.5">
              Bella (arriving 2:00 PM) has tea tree oil sensitivity flagged in client health history.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2.5 border-t border-theme-subtle flex items-center justify-between text-xs">
        <span className="text-theme-muted">
          Updated 3 minutes ago
        </span>
        <button
          onClick={() => showToast('AI Copilot refreshed recommendations with real-time salon telemetry.', 'info')}
          className="text-xs font-bold text-theme-primary hover:underline flex items-center gap-1"
        >
          Regenerate Insights <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
