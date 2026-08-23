import React from 'react';
import { useDashboardSystem } from '../../../context/DashboardSystemContext';
import { KpiMetricsWidget } from '../widgets/KpiMetricsWidget';
import { RevenueAnalyticsWidget } from '../widgets/RevenueAnalyticsWidget';
import { TodayScheduleWidget } from '../widgets/TodayScheduleWidget';
import { GroomingBayStationWidget } from '../widgets/GroomingBayStationWidget';
import { PetSummaryWidget } from '../widgets/PetSummaryWidget';
import { VaccineHealthRadarWidget } from '../widgets/VaccineHealthRadarWidget';
import { StaffCapacityWidget } from '../widgets/StaffCapacityWidget';
import { InventoryAlertsWidget } from '../widgets/InventoryAlertsWidget';
import { VipClientsWidget } from '../widgets/VipClientsWidget';
import { QuickActionsWidget } from '../widgets/QuickActionsWidget';
import { AiSummaryWidget } from '../widgets/AiSummaryWidget';
import { SmsDispatchWidget } from '../widgets/SmsDispatchWidget';

export const Complete360Layout: React.FC = () => {
  const { enabledSections } = useDashboardSystem();

  return (
    <div className="space-y-6">
      {/* 1. Quick Actions */}
      {enabledSections.quickActions && (
        <QuickActionsWidget />
      )}

      {/* 2. Top Primary Stat Cards */}
      {enabledSections.kpiCards && (
        <KpiMetricsWidget />
      )}

      {/* 3. Operational Grid: Grooming Bays & Live Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {enabledSections.stationOccupancy && (
          <div className="lg:col-span-6">
            <GroomingBayStationWidget />
          </div>
        )}

        {enabledSections.todaySchedule && (
          <div className={enabledSections.stationOccupancy ? 'lg:col-span-6' : 'lg:col-span-12'}>
            <TodayScheduleWidget />
          </div>
        )}
      </div>

      {/* 4. Analytics & AI Copilot Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {enabledSections.revenueMiniChart && (
          <div className={enabledSections.aiSummaryWidget ? 'lg:col-span-8' : 'lg:col-span-12'}>
            <RevenueAnalyticsWidget />
          </div>
        )}

        {enabledSections.aiSummaryWidget && (
          <div className={enabledSections.revenueMiniChart ? 'lg:col-span-4' : 'lg:col-span-12'}>
            <AiSummaryWidget />
          </div>
        )}
      </div>

      {/* 5. Health Compliance & VIP Directory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {enabledSections.vaccineAlertsCard && (
          <div className="lg:col-span-4">
            <VaccineHealthRadarWidget />
          </div>
        )}

        {enabledSections.petSummaryTable && (
          <div className={enabledSections.vaccineAlertsCard ? 'lg:col-span-8' : 'lg:col-span-12'}>
            <PetSummaryWidget />
          </div>
        )}
      </div>

      {/* 6. Staff & Supplies Bottom Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {enabledSections.groomerCapacity && (
          <div className="lg:col-span-4">
            <StaffCapacityWidget />
          </div>
        )}

        {enabledSections.retailInventory && (
          <div className="lg:col-span-4">
            <InventoryAlertsWidget />
          </div>
        )}

        {enabledSections.smsDispatchWidget && (
          <div className="lg:col-span-4">
            <SmsDispatchWidget />
          </div>
        )}
      </div>
    </div>
  );
};
