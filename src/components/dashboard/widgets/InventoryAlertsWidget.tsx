import React from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  RotateCcw, 
  CheckCircle2, 
  ShoppingBag,
  ExternalLink
} from 'lucide-react';

export const InventoryAlertsWidget: React.FC = () => {
  const { inventory, formatPrice, restoreInventoryStock, showToast } = useApp();

  const handleRestock = (itemId: string, name: string) => {
    restoreInventoryStock([{ itemId, quantity: 12 }]);
    showToast(`Restocked 12 units of ${name}!`, 'success');
  };

  return (
    <div id="widget-retail-inventory" className="card-box flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-theme-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-theme-ink font-display flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-theme-primary" />
              Supplies & Retail Inventory
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-theme-light text-theme-primary border border-theme-subtle">
              {inventory.length} SKUs Tracked
            </span>
          </div>
          <p className="text-xs text-theme-muted mt-0.5">
            Salon grooming supplies stock levels & boutique retail items
          </p>
        </div>
      </div>

      {/* Item list */}
      <div className="mt-3 space-y-2.5">
        {inventory.slice(0, 4).map((item) => {
          const isLowStock = item.stock <= (item.lowStockThreshold || 5);
          const percent = Math.min(100, Math.round((item.stock / 25) * 100));

          return (
            <div 
              key={item.id}
              className={`p-3 rounded-xl border transition-all ${
                isLowStock 
                  ? 'bg-amber-500/5 border-amber-500/30' 
                  : 'bg-theme-light border-theme-subtle hover:border-theme-primary'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-theme-ink font-display">
                      {item.name}
                    </span>
                    {isLowStock && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-600 border border-amber-500/30 flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" /> Low Stock
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-theme-muted mt-0.5">
                    Retail Price: <strong className="text-theme-ink">{formatPrice(item.price)}</strong> • Category: {item.category || 'Shampoo'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right mr-1">
                    <span className={`text-xs font-bold ${isLowStock ? 'text-amber-500' : 'text-theme-ink'}`}>
                      {item.stock} left
                    </span>
                  </div>
                  {isLowStock && (
                    <button
                      onClick={() => handleRestock(item.id, item.name)}
                      className="px-2.5 py-1 rounded-lg bg-theme-primary text-black font-bold text-xs hover:brightness-110 flex items-center gap-1 shadow-sm transition-all"
                    >
                      <RotateCcw className="w-3 h-3" /> Reorder
                    </button>
                  )}
                </div>
              </div>

              {/* Stock Bar */}
              <div className="w-full bg-theme-canvas h-1.5 rounded-full mt-2 overflow-hidden border border-theme-subtle">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${isLowStock ? 'bg-amber-500' : 'bg-theme-primary'}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2.5 border-t border-theme-subtle flex items-center justify-between text-xs">
        <span className="text-emerald-500 font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Automated Supplier Sync Active
        </span>
        <span className="text-theme-muted">
          Supplier: Bio-Groom Global
        </span>
      </div>
    </div>
  );
};
