import React from 'react';
import { useDashboardSystem } from '../../../context/DashboardSystemContext';
import { GroomingBayStationWidget } from '../widgets/GroomingBayStationWidget';
import { TodayScheduleWidget } from '../widgets/TodayScheduleWidget';
import { KpiMetricsWidget } from '../widgets/KpiMetricsWidget';
import { StaffCapacityWidget } from '../widgets/StaffCapacityWidget';
import { QuickActionsWidget } from '../widgets/QuickActionsWidget';
import { VaccineHealthRadarWidget } from '../widgets/VaccineHealthRadarWidget';
import { SmsDispatchWidget } from '../widgets/SmsDispatchWidget';

export const BookingOperationsLayout: React.FC = () => {
  const { enabledSections } = useDashboardSystem();

  return (
    <div className="space-y-6">
      {/* 1. Quick Actions Hub */}
      {enabledSections.quickActions && (
        <QuickActionsWidget />
      )}

      {/* 2. Top Floor Occupancy Map & Grooming Bays */}
      {enabledSections.stationOccupancy && (
        <GroomingBayStationWidget />
      )}

      {/* 3. Live Appointment Queue & Dispatch */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {enabledSections.todaySchedule && (
          <div className="lg:col-span-8">
            <TodayScheduleWidget />
          </div>
        )}

        {enabledSections.staffCapacity && (
          <div className="lg:col-span-4">
            <StaffCapacityWidget />
          </div>
        )}
      </div>

      {/* 4. Secondary Operations: Health Radar & SMS Dispatch */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {enabledSections.vaccineAlertsCard && (
          <div className="lg:col-span-6">
            <VaccineHealthRadarWidget />
          </div>
        )}

        {enabledSections.smsDispatchWidget && (
          <div className="lg:col-span-6">
            <SmsDispatchWidget />
          </div>
        )}
      </div>

      {/* 5. Metrics Overview */}
      {enabledSections.kpiCards && (
        <KpiMetricsWidget />
      )}
    </div>
  );
};
