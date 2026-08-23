import React from 'react';
import { useDashboardSystem } from '../../../context/DashboardSystemContext';
import { KpiMetricsWidget } from '../widgets/KpiMetricsWidget';
import { TodayScheduleWidget } from '../widgets/TodayScheduleWidget';
import { AiSummaryWidget } from '../widgets/AiSummaryWidget';
import { QuickActionsWidget } from '../widgets/QuickActionsWidget';

export const MinimalDigestLayout: React.FC = () => {
  const { enabledSections } = useDashboardSystem();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Essential KPIs */}
      {enabledSections.kpiCards && (
        <KpiMetricsWidget />
      )}

      {/* 2. AI Executive Digest & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {enabledSections.aiSummaryWidget && (
          <div className="md:col-span-7">
            <AiSummaryWidget />
          </div>
        )}

        {enabledSections.quickActions && (
          <div className="md:col-span-5">
            <QuickActionsWidget />
          </div>
        )}
      </div>

      {/* 3. Streamlined Today's Schedule */}
      {enabledSections.todaySchedule && (
        <TodayScheduleWidget />
      )}
    </div>
  );
};
