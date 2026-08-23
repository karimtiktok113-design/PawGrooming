import React from 'react';
import { useDashboardSystem } from '../../../context/DashboardSystemContext';
import { KpiMetricsWidget } from '../widgets/KpiMetricsWidget';
import { RevenueAnalyticsWidget } from '../widgets/RevenueAnalyticsWidget';
import { TodayScheduleWidget } from '../widgets/TodayScheduleWidget';
import { StaffCapacityWidget } from '../widgets/StaffCapacityWidget';
import { VipClientsWidget } from '../widgets/VipClientsWidget';
import { PetSummaryWidget } from '../widgets/PetSummaryWidget';
import { AiSummaryWidget } from '../widgets/AiSummaryWidget';
import { QuickActionsWidget } from '../widgets/QuickActionsWidget';

export const AnalyticsFocusedLayout: React.FC = () => {
  const { enabledSections } = useDashboardSystem();

  return (
    <div className="space-y-6">
      {/* 1. Primary Stat Cards */}
      {enabledSections.kpiCards && (
        <KpiMetricsWidget />
      )}

      {/* 2. Hero Interactive Analytics Full Width */}
      {enabledSections.revenueMiniChart && (
        <div className="w-full">
          <RevenueAnalyticsWidget />
        </div>
      )}

      {/* 3. Secondary Analytics: VIP Retention & AI Copilot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {enabledSections.aiSummaryWidget && (
          <div className="lg:col-span-6">
            <AiSummaryWidget />
          </div>
        )}

        {enabledSections.vipClients && (
          <div className="lg:col-span-6">
            <VipClientsWidget />
          </div>
        )}
      </div>

      {/* 4. Operations & Staff Capacity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {enabledSections.groomerCapacity && (
          <div className="lg:col-span-5">
            <StaffCapacityWidget />
          </div>
        )}

        {enabledSections.todaySchedule && (
          <div className="lg:col-span-7">
            <TodayScheduleWidget />
          </div>
        )}
      </div>

      {/* 5. Pet Records */}
      {enabledSections.petSummaryTable && (
        <PetSummaryWidget />
      )}
    </div>
  );
};
