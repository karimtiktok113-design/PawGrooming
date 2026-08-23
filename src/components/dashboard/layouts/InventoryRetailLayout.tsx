import React from 'react';
import { useDashboardSystem } from '../../../context/DashboardSystemContext';
import { InventoryAlertsWidget } from '../widgets/InventoryAlertsWidget';
import { RevenueAnalyticsWidget } from '../widgets/RevenueAnalyticsWidget';
import { KpiMetricsWidget } from '../widgets/KpiMetricsWidget';
import { QuickActionsWidget } from '../widgets/QuickActionsWidget';

export const InventoryRetailLayout: React.FC = () => {
  const { enabledSections } = useDashboardSystem();

  return (
    <div className="space-y-6">
      {/* 1. Retail & Revenue KPIs */}
      {enabledSections.kpiCards && (
        <KpiMetricsWidget />
      )}

      {/* 2. Quick Actions */}
      {enabledSections.quickActions && (
        <QuickActionsWidget />
      )}

      {/* 3. Retail Inventory & Supplies Detailed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {enabledSections.retailInventory && (
          <div className="lg:col-span-6">
            <InventoryAlertsWidget />
          </div>
        )}

        {enabledSections.revenueMiniChart && (
          <div className="lg:col-span-6">
            <RevenueAnalyticsWidget />
          </div>
        )}
      </div>
    </div>
  );
};
