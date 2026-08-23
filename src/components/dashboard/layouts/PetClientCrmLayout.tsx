import React from 'react';
import { useDashboardSystem } from '../../../context/DashboardSystemContext';
import { PetSummaryWidget } from '../widgets/PetSummaryWidget';
import { VipClientsWidget } from '../widgets/VipClientsWidget';
import { VaccineHealthRadarWidget } from '../widgets/VaccineHealthRadarWidget';
import { SmsDispatchWidget } from '../widgets/SmsDispatchWidget';
import { KpiMetricsWidget } from '../widgets/KpiMetricsWidget';

export const PetClientCrmLayout: React.FC = () => {
  const { enabledSections } = useDashboardSystem();

  return (
    <div className="space-y-6">
      {/* 1. Core CRM Pet Metrics */}
      {enabledSections.kpiCards && (
        <KpiMetricsWidget />
      )}

      {/* 2. Primary Directory & VIP Club */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {enabledSections.petSummaryTable && (
          <div className="lg:col-span-8">
            <PetSummaryWidget />
          </div>
        )}

        {enabledSections.vipClients && (
          <div className="lg:col-span-4">
            <VipClientsWidget />
          </div>
        )}
      </div>

      {/* 3. Health Verification & Direct Client SMS Dispatch */}
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
    </div>
  );
};
