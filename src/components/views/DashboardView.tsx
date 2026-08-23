import React from 'react';
import { useDashboardSystem } from '../../context/DashboardSystemContext';
import { Complete360Layout } from '../dashboard/layouts/Complete360Layout';
import { AnalyticsFocusedLayout } from '../dashboard/layouts/AnalyticsFocusedLayout';
import { BookingOperationsLayout } from '../dashboard/layouts/BookingOperationsLayout';
import { RevenueFinancialsLayout } from '../dashboard/layouts/RevenueFinancialsLayout';
import { MinimalDigestLayout } from '../dashboard/layouts/MinimalDigestLayout';
import { PetClientCrmLayout } from '../dashboard/layouts/PetClientCrmLayout';
import { InventoryRetailLayout } from '../dashboard/layouts/InventoryRetailLayout';
import { motion, AnimatePresence } from 'motion/react';

export const DashboardView: React.FC = () => {
  const { currentLayout, currentThemeDef, currentLayoutDef } = useDashboardSystem();

  const renderLayout = () => {
    switch (currentLayout) {
      case 'analytics_focused':
        return <AnalyticsFocusedLayout />;
      case 'booking_operations':
        return <BookingOperationsLayout />;
      case 'revenue_financials':
        return <RevenueFinancialsLayout />;
      case 'minimal_digest':
        return <MinimalDigestLayout />;
      case 'pet_crm_records':
        return <PetClientCrmLayout />;
      case 'inventory_retail':
        return <InventoryRetailLayout />;
      case 'complete_360':
      default:
        return <Complete360Layout />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${currentLayout}-${currentThemeDef.id}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full pb-16"
      >
        {renderLayout()}
      </motion.div>
    </AnimatePresence>
  );
};
