import React from 'react';
import { useDashboardSystem } from '../../../context/DashboardSystemContext';
import { KpiMetricsWidget } from '../widgets/KpiMetricsWidget';
import { RevenueAnalyticsWidget } from '../widgets/RevenueAnalyticsWidget';
import { StaffCapacityWidget } from '../widgets/StaffCapacityWidget';
import { InventoryAlertsWidget } from '../widgets/InventoryAlertsWidget';
import { VipClientsWidget } from '../widgets/VipClientsWidget';
import { QuickActionsWidget } from '../widgets/QuickActionsWidget';

export const RevenueFinancialsLayout: React.FC = () => {
  const { enabledSections } = useDashboardSystem();

  return (
    <div className="space-y-6">
      {/* 1. Primary Financial KPIs */}
      {enabledSections.kpiCards && (
        <KpiMetricsWidget />
      )}

      {/* 2. Interactive Revenue & Cashflow Charts */}
      {enabledSections.revenueMiniChart && (
        <RevenueAnalyticsWidget />
      )}

      {/* 3. Financial Driver breakdown: Groomer Commissions vs Retail Inventory Margin */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {enabledSections.groomerCapacity && (
          <div className="lg:col-span-6">
            <StaffCapacityWidget />
          </div>
        )}

        {enabledSections.retailInventory && (
          <div className="lg:col-span-6">
            <InventoryAlertsWidget />
          </div>
        )}
      </div>

      {/* 4. High-LTV VIP Clients */}
      {enabledSections.vipClients && (
        <VipClientsWidget />
      )}
    </div>
  );
};
