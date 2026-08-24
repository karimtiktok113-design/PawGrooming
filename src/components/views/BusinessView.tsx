import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { isSectionAllowed } from '../../data/permissionPresets';
import { calculateAppointmentInvoice } from '../../utils/invoice';
import { 
  Package, 
  Gift, 
  DollarSign, 
  Clock, 
  Plus, 
  AlertTriangle, 
  Trash2, 
  Edit,
  RotateCcw,
  CreditCard,
  CheckCircle2,
  ShoppingBag,
  Users,
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  Calendar,
  FileText,
  Download,
  X,
  Eye,
  Check
} from 'lucide-react';
import { PurchasedRetailItem } from '../../types';

interface RetailSaleRecord {
  saleId: string;
  appointmentId: string;
  invoiceNumber: string;
  date: string;
  clientId: string;
  clientName: string;
  ownerName: string;
  petName: string;
  petBreed: string;
  itemId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
  status: string;
  isPaid: boolean;
}

export const BusinessView: React.FC = () => {
  const { 
    inventory, 
    giftCards, 
    expenses, 
    waitlist, 
    clients, 
    services, 
    packages,
    staff,
    settings,
    redemptions,
    appointments,
    addAppointment,
    openModal, 
    deleteExpense, 
    deleteWaitlist, 
    deleteInventoryItem,
    redeemGiftCard,
    reloadGiftCard,
    deleteGiftCard,
    confirmDelete,
    formatPrice,
    showToast
  } = useApp();

  const { currentProfile } = useAuth();
  const showInventory = isSectionAllowed(currentProfile?.permissions, 'business', 'inventory');
  const showRetailSales = isSectionAllowed(currentProfile?.permissions, 'business', 'retailSales');
  const showGiftCards = isSectionAllowed(currentProfile?.permissions, 'business', 'giftCards');
  const showExpenses = isSectionAllowed(currentProfile?.permissions, 'business', 'expenses');
  const showWaitlist = isSectionAllowed(currentProfile?.permissions, 'business', 'waitlist');

  const [tab, setTab] = useState<'inventory' | 'sales' | 'gift' | 'expenses' | 'waitlist'>('inventory');

  // Auto-switch tabs if the current tab becomes disallowed by admin permissions
  useEffect(() => {
    if (tab === 'inventory' && !showInventory) {
      if (showRetailSales) setTab('sales');
      else if (showGiftCards) setTab('gift');
      else if (showExpenses) setTab('expenses');
      else if (showWaitlist) setTab('waitlist');
    } else if (tab === 'sales' && !showRetailSales) {
      if (showInventory) setTab('inventory');
      else if (showGiftCards) setTab('gift');
      else if (showExpenses) setTab('expenses');
      else if (showWaitlist) setTab('waitlist');
    } else if (tab === 'gift' && !showGiftCards) {
      if (showInventory) setTab('inventory');
      else if (showRetailSales) setTab('sales');
      else if (showExpenses) setTab('expenses');
      else if (showWaitlist) setTab('waitlist');
    } else if (tab === 'expenses' && !showExpenses) {
      if (showInventory) setTab('inventory');
      else if (showRetailSales) setTab('sales');
      else if (showGiftCards) setTab('gift');
      else if (showWaitlist) setTab('waitlist');
    } else if (tab === 'waitlist' && !showWaitlist) {
      if (showInventory) setTab('inventory');
      else if (showRetailSales) setTab('sales');
      else if (showGiftCards) setTab('gift');
      else if (showExpenses) setTab('expenses');
    }
  }, [showInventory, showRetailSales, showGiftCards, showExpenses, showWaitlist, tab]);

  // Gift Card Modals State
  const [reloadModalCard, setReloadModalCard] = useState<any>(null);
  const [reloadAmount, setReloadAmount] = useState<number>(25);
  const [redeemModalCard, setRedeemModalCard] = useState<any>(null);
  const [redeemAmount, setRedeemAmount] = useState<number>(10);

  // Retail Sales Filters
  const [salesSearch, setSalesSearch] = useState('');
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'today' | 'month'>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');

  // Product Buyers Modal State
  const [selectedProductForBuyers, setSelectedProductForBuyers] = useState<any>(null);

  // Quick Direct Sale Modal State
  const [isDirectSaleOpen, setIsDirectSaleOpen] = useState(false);
  const [directSaleClientId, setDirectSaleClientId] = useState(clients[0]?.id || '');
  const [directSaleItemId, setDirectSaleItemId] = useState(inventory[0]?.id || '');
  const [directSaleQty, setDirectSaleQty] = useState(1);
  const [directSaleDate, setDirectSaleDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [directSaleStatus, setDirectSaleStatus] = useState<'completed' | 'confirmed'>('completed');

  // ==========================================
  // SYNCHRONIZED RETAIL SALES ENGINE
  // ==========================================
  const allRetailSales = useMemo<RetailSaleRecord[]>(() => {
    const sales: RetailSaleRecord[] = [];

    appointments.forEach((appt) => {
      // Exclude cancelled appointments so revenue aligns 100% with Invoices and Revenue view
      if (appt.status === 'cancelled') return;

      const client = clients.find((c) => c.id === appt.clientId);
      const petName = client ? client.name : (appt.petName || 'Pet');
      const ownerName = client ? client.owner : (appt.client || 'Client');
      const petBreed = client ? client.breed : 'Dog';
      const clientName = `${petName} (${ownerName})`;
      const invoiceNumber = appt.invoiceNumber || `INV-${appt.id.replace(/\D/g, '').slice(-4).padStart(4, '0')}`;
      const isPaid = appt.status === 'completed';

      // Compute official invoice retail breakdown
      const invoiceData = calculateAppointmentInvoice(appt, {
        services,
        packages,
        settings,
        redemptions,
      });

      if (appt.purchasedItems && appt.purchasedItems.length > 0) {
        appt.purchasedItems.forEach((item, idx) => {
          const qty = item.quantity || 1;
          const price = item.price || 0;
          sales.push({
            saleId: `${appt.id}_${item.itemId || idx}`,
            appointmentId: appt.id,
            invoiceNumber,
            date: appt.date,
            clientId: appt.clientId,
            clientName,
            ownerName,
            petName,
            petBreed,
            itemId: item.itemId || 'custom_item',
            productName: item.name || 'Retail Product',
            unitPrice: price,
            quantity: qty,
            totalAmount: price * qty,
            status: appt.status,
            isPaid,
          });
        });
      } else if (invoiceData.retailRevenue > 0 || (appt.retail || 0) > 0) {
        // Fallback synchronization for appointments that logged general retail total
        const retailAmount = invoiceData.retailRevenue > 0 ? invoiceData.retailRevenue : (appt.retail || 0);
        sales.push({
          saleId: `${appt.id}_retail`,
          appointmentId: appt.id,
          invoiceNumber,
          date: appt.date,
          clientId: appt.clientId,
          clientName,
          ownerName,
          petName,
          petBreed,
          itemId: 'general_retail',
          productName: 'Salon Retail Merchandise',
          unitPrice: retailAmount,
          quantity: 1,
          totalAmount: retailAmount,
          status: appt.status,
          isPaid,
        });
      }
    });

    // Sort newest sales first
    return sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [appointments, clients, services, packages, settings, redemptions]);

  // Metrics per product
  const productPerformanceMap = useMemo(() => {
    const map = new Map<string, { unitsSold: number; revenue: number; buyers: RetailSaleRecord[] }>();

    inventory.forEach((item) => {
      map.set(item.id, { unitsSold: 0, revenue: 0, buyers: [] });
    });

    allRetailSales.forEach((sale) => {
      // Match by exact ID or name match
      let targetId = sale.itemId;
      if (!map.has(targetId)) {
        const matchedItem = inventory.find((i) => i.name.toLowerCase() === sale.productName.toLowerCase());
        if (matchedItem) targetId = matchedItem.id;
      }

      if (map.has(targetId)) {
        const curr = map.get(targetId)!;
        curr.unitsSold += sale.quantity;
        curr.revenue += sale.totalAmount;
        curr.buyers.push(sale);
      }
    });

    return map;
  }, [inventory, allRetailSales]);

  // Overall Retail Store KPIs
  const totalRetailRevenue = useMemo(() => {
    return allRetailSales.reduce((sum, s) => sum + s.totalAmount, 0);
  }, [allRetailSales]);

  const totalUnitsSold = useMemo(() => {
    return allRetailSales.reduce((sum, s) => sum + s.quantity, 0);
  }, [allRetailSales]);

  const uniqueRetailClientsCount = useMemo(() => {
    const ids = new Set(allRetailSales.map((s) => s.clientId));
    return ids.size;
  }, [allRetailSales]);

  const topSellingProduct = useMemo(() => {
    let best = { name: 'None yet', units: 0, revenue: 0 };
    inventory.forEach((item) => {
      const perf = productPerformanceMap.get(item.id);
      if (perf && perf.unitsSold > best.units) {
        best = { name: item.name, units: perf.unitsSold, revenue: perf.revenue };
      }
    });
    return best;
  }, [inventory, productPerformanceMap]);

  // Filtered Sales Ledger
  const filteredRetailSales = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const thisMonthStr = todayStr.slice(0, 7);

    return allRetailSales.filter((sale) => {
      // Search
      if (salesSearch.trim()) {
        const q = salesSearch.toLowerCase();
        const matchClient = sale.clientName.toLowerCase().includes(q);
        const matchPet = sale.petName.toLowerCase().includes(q);
        const matchOwner = sale.ownerName.toLowerCase().includes(q);
        const matchProduct = sale.productName.toLowerCase().includes(q);
        const matchInvoice = sale.invoiceNumber.toLowerCase().includes(q);
        if (!matchClient && !matchPet && !matchOwner && !matchProduct && !matchInvoice) return false;
      }

      // Product filter
      if (selectedProductFilter !== 'all') {
        const item = inventory.find((i) => i.id === selectedProductFilter);
        if (item && sale.itemId !== item.id && sale.productName.toLowerCase() !== item.name.toLowerCase()) {
          return false;
        }
      }

      // Timeframe
      if (selectedTimeframe === 'today' && sale.date !== todayStr) return false;
      if (selectedTimeframe === 'month' && !sale.date.startsWith(thisMonthStr)) return false;

      // Status
      if (selectedStatusFilter === 'completed' && !sale.isPaid) return false;
      if (selectedStatusFilter === 'pending' && sale.isPaid) return false;

      return true;
    });
  }, [allRetailSales, salesSearch, selectedProductFilter, selectedTimeframe, selectedStatusFilter, inventory]);

  // Handle Quick Direct Retail Sale submission
  const handleRecordDirectSale = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === directSaleClientId);
    const item = inventory.find((i) => i.id === directSaleItemId);

    if (!client || !item) {
      showToast('Please select a valid client and product', 'error');
      return;
    }

    if (directSaleQty <= 0) {
      showToast('Quantity must be at least 1', 'error');
      return;
    }

    const defaultService = services[0] || { id: 'srv_bath', price: 0 };
    const purchasedItem: PurchasedRetailItem = {
      itemId: item.id,
      name: item.name,
      price: item.price,
      quantity: directSaleQty,
    };

    // Add appointment with 0 service cost or quick walk-in retail purchase
    addAppointment({
      clientId: client.id,
      serviceId: defaultService.id,
      staffId: client.staffId || 'staff_sarah',
      date: directSaleDate,
      start: '10:00',
      duration: 15,
      price: 0, // Pure retail purchase
      retail: item.price * directSaleQty,
      purchasedItems: [purchasedItem],
      status: directSaleStatus,
      notes: `Direct retail purchase: ${directSaleQty}x ${item.name}`,
    });

    setIsDirectSaleOpen(false);
    showToast(`Recorded sale of ${directSaleQty}x ${item.name} for ${client.name}!`, 'success');
  };

  // CSV Export for Sales Ledger
  const handleExportSalesCsv = () => {
    if (filteredRetailSales.length === 0) {
      showToast('No sales data to export', 'info');
      return;
    }

    const headers = ['Date', 'Invoice Ref', 'Pet Name', 'Owner Name', 'Product Purchased', 'Quantity', 'Unit Price', 'Total Amount', 'Status'];
    const rows = filteredRetailSales.map((s) => [
      `"${s.date}"`,
      `"${s.invoiceNumber}"`,
      `"${s.petName}"`,
      `"${s.ownerName}"`,
      `"${s.productName}"`,
      s.quantity,
      s.unitPrice.toFixed(2),
      s.totalAmount.toFixed(2),
      `"${s.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PawBook_Retail_Sales_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Retail sales spreadsheet exported!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Operations Navigation Tabs */}
      <div className="card-box p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="bg-[#EAE7DC] p-1 rounded-2xl flex items-center gap-1 w-full sm:w-auto flex-wrap">
          {showInventory && (
            <button
              onClick={() => setTab('inventory')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tab === 'inventory' ? 'bg-[#173E39] text-white shadow-xs' : 'text-[#5C716C] hover:text-[#173E39]'
              }`}
            >
              📦 Retail Stock ({inventory.length})
            </button>
          )}
          {showRetailSales && (
            <button
              onClick={() => setTab('sales')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                tab === 'sales' ? 'bg-[#173E39] text-white shadow-xs' : 'text-[#5C716C] hover:text-[#173E39]'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Sales & Clients ({allRetailSales.length})</span>
            </button>
          )}
          {showGiftCards && (
            <button
              onClick={() => setTab('gift')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tab === 'gift' ? 'bg-[#173E39] text-white shadow-xs' : 'text-[#5C716C] hover:text-[#173E39]'
              }`}
            >
              🎁 Gift Cards ({giftCards.length})
            </button>
          )}
          {showExpenses && (
            <button
              onClick={() => setTab('expenses')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tab === 'expenses' ? 'bg-[#173E39] text-white shadow-xs' : 'text-[#5C716C] hover:text-[#173E39]'
              }`}
            >
              💸 Expenses ({expenses.length})
            </button>
          )}
          {showWaitlist && (
            <button
              onClick={() => setTab('waitlist')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tab === 'waitlist' ? 'bg-[#173E39] text-white shadow-xs' : 'text-[#5C716C] hover:text-[#173E39]'
              }`}
            >
              ⏳ Waitlist ({waitlist.length})
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {tab === 'inventory' && showInventory && (
            <>
              {showRetailSales && (
                <button
                  onClick={() => setIsDirectSaleOpen(true)}
                  className="btn-ghost text-xs px-3.5 py-2 rounded-xl font-bold border border-[#2E8A81]/40 text-[#2E8A81] hover:bg-[#E1F0E7] flex items-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  + Record Sale
                </button>
              )}
              <button
                onClick={() => openModal('inventoryForm')}
                className="btn-primary text-xs px-4 py-2 rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </>
          )}
          {tab === 'sales' && showRetailSales && (
            <>
              <button
                onClick={handleExportSalesCsv}
                className="btn-ghost text-xs px-3.5 py-2 rounded-xl font-bold border border-[#D8D3C4] text-[#173E39] hover:bg-[#EAE7DC] flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
              <button
                onClick={() => setIsDirectSaleOpen(true)}
                className="btn-primary text-xs px-4 py-2 rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                + Record Retail Sale
              </button>
            </>
          )}
          {tab === 'gift' && showGiftCards && (
            <button
              onClick={() => openModal('giftCardForm')}
              className="btn-primary text-xs px-4 py-2 rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Issue Gift Card
            </button>
          )}
          {tab === 'expenses' && showExpenses && (
            <button
              onClick={() => openModal('expenseForm')}
              className="btn-primary text-xs px-4 py-2 rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Log Expense
            </button>
          )}
          {tab === 'waitlist' && showWaitlist && (
            <button
              onClick={() => openModal('waitlistForm')}
              className="btn-primary text-xs px-4 py-2 rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add to Waitlist
            </button>
          )}
        </div>
      </div>

      {/* ==========================================
          TAB 1: RETAIL INVENTORY CATALOG & SALES
          ========================================== */}
      {tab === 'inventory' && (
        <div className="space-y-4">
          {/* Quick Store Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card-box p-3.5">
              <div className="flex items-center justify-between text-xs text-[#5C716C]">
                <span>Total Catalog Value</span>
                <Package className="w-4 h-4 text-[#2E8A81]" />
              </div>
              <div className="font-display font-black text-lg text-[#173E39] mt-1">
                {formatPrice(inventory.reduce((sum, item) => sum + item.price * item.stock, 0))}
              </div>
              <div className="text-[10px] text-[#5C716C] mt-0.5">{inventory.length} active SKUs in stock</div>
            </div>

            <div className="card-box p-3.5">
              <div className="flex items-center justify-between text-xs text-[#5C716C]">
                <span>Retail Revenue</span>
                <TrendingUp className="w-4 h-4 text-[#357A54]" />
              </div>
              <div className="font-display font-black text-lg text-[#357A54] mt-1">
                {formatPrice(totalRetailRevenue)}
              </div>
              <div className="text-[10px] text-[#5C716C] mt-0.5">{totalUnitsSold} total units sold to clients</div>
            </div>

            <div className="card-box p-3.5">
              <div className="flex items-center justify-between text-xs text-[#5C716C]">
                <span>Best-Selling Item</span>
                <ShoppingBag className="w-4 h-4 text-[#FF6B00]" />
              </div>
              <div className="font-display font-bold text-sm text-[#173E39] mt-1 truncate" title={topSellingProduct.name}>
                {topSellingProduct.name}
              </div>
              <div className="text-[10px] text-[#5C716C] mt-0.5">{topSellingProduct.units} units ({formatPrice(topSellingProduct.revenue)})</div>
            </div>

            <div className="card-box p-3.5">
              <div className="flex items-center justify-between text-xs text-[#5C716C]">
                <span>Low Stock Warnings</span>
                <AlertTriangle className="w-4 h-4 text-[#C9503A]" />
              </div>
              <div className="font-display font-black text-lg text-[#C9503A] mt-1">
                {inventory.filter((i) => i.stock <= i.lowAt).length}
              </div>
              <div className="text-[10px] text-[#5C716C] mt-0.5">Need restock reordering</div>
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventory.map((item) => {
              const isLow = item.stock <= item.lowAt;
              const perf = productPerformanceMap.get(item.id) || { unitsSold: 0, revenue: 0, buyers: [] };
              const uniqueBuyers = new Set(perf.buyers.map((b) => b.clientId)).size;

              return (
                <div key={item.id} className="card-box p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display font-bold text-base text-[#173E39]">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                            isLow ? 'bg-[#FEF2F2] text-[#C9503A] border border-[#C9503A]/30' : 'bg-[#E1F0E7] text-[#357A54]'
                          }`}>
                            {item.stock} in stock {isLow ? '(LOW STOCK)' : ''}
                          </span>
                          <span className="text-[11px] text-[#5C716C]">Reorder at: {item.lowAt}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display font-black text-lg text-[#2E8A81]">
                          {formatPrice(item.price)}
                        </div>
                        <div className="text-[10px] text-[#5C716C]">Cost: {formatPrice(item.cost)}</div>
                      </div>
                    </div>

                    {/* Synchronized Sales Performance Banner */}
                    <div className="mt-3.5 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#D8D3C4]/60 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#5C716C] font-medium flex items-center gap-1">
                          <ShoppingBag className="w-3.5 h-3.5 text-[#FF6B00]" />
                          Sales Performance:
                        </span>
                        <span className="font-bold text-[#173E39]">{perf.unitsSold} sold</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#5C716C]">Total Revenue:</span>
                        <span className="font-display font-black text-[#357A54]">{formatPrice(perf.revenue)}</span>
                      </div>
                      
                      {perf.buyers.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => setSelectedProductForBuyers(item)}
                          className="w-full mt-1.5 py-1 text-center text-[11px] font-bold text-[#173E39] bg-white hover:bg-[#EAE7DC] border border-[#D8D3C4] rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Users className="w-3 h-3 text-[#2E8A81]" />
                          View {uniqueBuyers} Client {uniqueBuyers === 1 ? 'Buyer' : 'Buyers'} ({perf.buyers.length} orders)
                        </button>
                      ) : (
                        <div className="text-[10px] text-[#7A6865] italic text-center pt-0.5">
                          No client purchases recorded yet
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-[#D8D3C4] flex items-center justify-between">
                    <div className="text-[11px] text-[#5C716C]">
                      Margin: <span className="font-bold text-[#173E39]">{formatPrice(item.price - item.cost)}</span>/unit
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openModal('inventoryForm', { item })}
                        className="px-2.5 py-1 text-[#5C716C] hover:text-[#173E39] hover:bg-[#EAE7DC] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          confirmDelete({
                            title: 'Remove Inventory Item',
                            message: `Remove "${item.name}" from inventory catalog?`,
                            confirmLabel: 'Remove Item',
                            onConfirm: () => deleteInventoryItem(item.id),
                          });
                        }}
                        className="p-1.5 text-[#5C716C] hover:text-[#C9503A] hover:bg-[#FEF2F2] rounded-lg transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 2: SYNCHRONIZED RETAIL SALES & CLIENT PURCHASES
          ========================================== */}
      {tab === 'sales' && (
        <div className="space-y-4">
          {/* Executive Retail Sales Overview Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card-box p-4 border-l-4 border-l-[#357A54]">
              <span className="text-[11px] font-bold text-[#5C716C] uppercase tracking-wider block">Retail Revenue</span>
              <div className="font-display font-black text-2xl text-[#357A54] mt-1">
                {formatPrice(totalRetailRevenue)}
              </div>
              <span className="text-[10px] text-[#5C716C] mt-0.5 block">From client store purchases</span>
            </div>

            <div className="card-box p-4 border-l-4 border-l-[#2E8A81]">
              <span className="text-[11px] font-bold text-[#5C716C] uppercase tracking-wider block">Units Sold</span>
              <div className="font-display font-black text-2xl text-[#173E39] mt-1">
                {totalUnitsSold}
              </div>
              <span className="text-[10px] text-[#5C716C] mt-0.5 block">Across all retail transactions</span>
            </div>

            <div className="card-box p-4 border-l-4 border-l-[#FF6B00]">
              <span className="text-[11px] font-bold text-[#5C716C] uppercase tracking-wider block">Top Selling Item</span>
              <div className="font-display font-bold text-base text-[#173E39] mt-1 truncate" title={topSellingProduct.name}>
                {topSellingProduct.name}
              </div>
              <span className="text-[10px] text-[#FF6B00] font-bold mt-0.5 block">{topSellingProduct.units} units sold</span>
            </div>

            <div className="card-box p-4 border-l-4 border-l-[#7A6865]">
              <span className="text-[11px] font-bold text-[#5C716C] uppercase tracking-wider block">Retail Clients</span>
              <div className="font-display font-black text-2xl text-[#173E39] mt-1">
                {uniqueRetailClientsCount}
              </div>
              <span className="text-[10px] text-[#5C716C] mt-0.5 block">Unique pet parents buying stock</span>
            </div>
          </div>

          {/* Filters and Search Bar */}
          <div className="card-box p-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5C716C]" />
              <input
                type="text"
                placeholder="Search pet, owner, product, or invoice #..."
                value={salesSearch}
                onChange={(e) => setSalesSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D8D3C4] rounded-xl outline-none focus:border-[#173E39]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Product Filter */}
              <div className="flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-[#5C716C]" />
                <select
                  value={selectedProductFilter}
                  onChange={(e) => setSelectedProductFilter(e.target.value)}
                  className="text-xs bg-white border border-[#D8D3C4] rounded-xl px-2.5 py-2 outline-none font-semibold text-[#173E39]"
                >
                  <option value="all">All Products</option>
                  {inventory.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              {/* Timeframe Filter */}
              <div className="flex items-center bg-[#EAE7DC] p-0.5 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setSelectedTimeframe('all')}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    selectedTimeframe === 'all' ? 'bg-[#173E39] text-white shadow-xs' : 'text-[#5C716C]'
                  }`}
                >
                  All Time
                </button>
                <button
                  onClick={() => setSelectedTimeframe('month')}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    selectedTimeframe === 'month' ? 'bg-[#173E39] text-white shadow-xs' : 'text-[#5C716C]'
                  }`}
                >
                  This Month
                </button>
                <button
                  onClick={() => setSelectedTimeframe('today')}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    selectedTimeframe === 'today' ? 'bg-[#173E39] text-white shadow-xs' : 'text-[#5C716C]'
                  }`}
                >
                  Today
                </button>
              </div>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                className="text-xs bg-white border border-[#D8D3C4] rounded-xl px-2.5 py-2 outline-none font-semibold text-[#173E39]"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Paid & Completed</option>
                <option value="pending">Scheduled / Pending</option>
              </select>

              {(salesSearch || selectedProductFilter !== 'all' || selectedTimeframe !== 'all' || selectedStatusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSalesSearch('');
                    setSelectedProductFilter('all');
                    setSelectedTimeframe('all');
                    setSelectedStatusFilter('all');
                  }}
                  className="p-2 text-xs text-[#C9503A] hover:bg-[#FEF2F2] rounded-xl font-bold transition-colors cursor-pointer"
                  title="Clear Filters"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Sales Ledger Table */}
          <div className="card-box overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF8F5] border-b border-[#D8D3C4] text-[#5C716C] uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-4">Date & Invoice</th>
                    <th className="py-3 px-4">Client & Pet</th>
                    <th className="py-3 px-4">Product Purchased</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Price</th>
                    <th className="py-3 px-4 text-right">Total Revenue</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8D3C4]/60">
                  {filteredRetailSales.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-[#5C716C]">
                        <ShoppingBag className="w-8 h-8 text-[#5C716C]/40 mx-auto mb-2" />
                        <p className="font-bold text-sm text-[#173E39]">No retail sales match current filters</p>
                        <p className="text-xs text-[#7A6865] mt-1">Try resetting the search filters or record a new client retail sale.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredRetailSales.map((sale) => (
                      <tr key={sale.saleId} className="hover:bg-[#FAF8F5] transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-semibold text-[#173E39]">{sale.date}</div>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#EAE7DC] text-[#5C716C]">
                            {sale.invoiceNumber}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#173E39] flex items-center gap-1.5">
                            <span>{sale.petName}</span>
                            <span className="text-[10px] font-normal text-[#5C716C]">({sale.petBreed})</span>
                          </div>
                          <div className="text-[11px] text-[#5C716C] mt-0.5">{sale.ownerName}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#173E39]">{sale.productName}</div>
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-[#173E39]">
                          {sale.quantity}
                        </td>
                        <td className="py-3 px-4 text-right text-[#5C716C]">
                          {formatPrice(sale.unitPrice)}
                        </td>
                        <td className="py-3 px-4 text-right font-display font-black text-sm text-[#357A54]">
                          {formatPrice(sale.totalAmount)}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            sale.isPaid 
                              ? 'bg-[#E1F0E7] text-[#357A54]' 
                              : 'bg-[#FFFBEB] text-[#B45309]'
                          }`}>
                            {sale.isPaid ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> Paid & Completed
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3" /> Scheduled
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              const appt = appointments.find((a) => a.id === sale.appointmentId);
                              if (appt) {
                                openModal('appointmentDetail', { appointment: appt });
                              } else {
                                showToast('Opening invoice record', 'info');
                              }
                            }}
                            className="p-1.5 text-[#5C716C] hover:text-[#173E39] hover:bg-[#EAE7DC] rounded-lg transition-colors cursor-pointer"
                            title="View Appointment Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-[#FAF8F5] border-t border-[#D8D3C4] flex items-center justify-between text-xs text-[#5C716C]">
              <span>Showing {filteredRetailSales.length} of {allRetailSales.length} total client sales records</span>
              <span className="font-bold text-[#173E39]">
                Filtered Revenue: <span className="text-[#357A54]">{formatPrice(filteredRetailSales.reduce((s, r) => s + r.totalAmount, 0))}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 3: GIFT CARDS
          ========================================== */}
      {tab === 'gift' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {giftCards.map((gc) => {
              const isDepleted = gc.balance <= 0;
              const percentLeft = Math.round((gc.balance / gc.amount) * 100);

              return (
                <div 
                  key={gc.id} 
                  className={`card-box p-5 border transition-all flex flex-col justify-between ${
                    isDepleted 
                      ? 'bg-[#FAF8F5] border-[#D8D3C4] opacity-75' 
                      : 'bg-gradient-to-br from-[#FFFDF9] via-[#FFF8EE] to-[#FDF4E7] border-[#E7A93C]/50 shadow-xs'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className={`w-4 h-4 ${isDepleted ? 'text-[#7A6865]' : 'text-[#FF6B00]'}`} />
                        <span className="font-mono font-black text-lg text-[#173E39] tracking-wider">{gc.code}</span>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        isDepleted ? 'bg-[#EAE7DC] text-[#7A6865]' : 'bg-[#E1F0E7] text-[#2E8A81]'
                      }`}>
                        {isDepleted ? 'Depleted' : 'Active'}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-[11px] text-[#7A6865] block font-semibold">Remaining Balance</span>
                        <span className="font-display font-black text-2xl text-[#173E39]">
                          {formatPrice(gc.balance)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-[#7A6865] block">Initial Value</span>
                        <span className="font-bold text-sm text-[#5C716C]">{formatPrice(gc.amount)}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#EAE7DC] h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          percentLeft > 50 ? 'bg-[#2E8A81]' : percentLeft > 20 ? 'bg-[#FF6B00]' : 'bg-[#C9503A]'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, percentLeft))}%` }}
                      />
                    </div>

                    <p className="text-xs text-[#5C716C] italic">{gc.note || 'No recipient note attached.'}</p>
                    <div className="text-[10px] text-[#7A6865] pt-2 border-t border-[#D8D3C4]/60">
                      Issued On: {gc.issued}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-[#D8D3C4] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setReloadModalCard(gc);
                          setReloadAmount(25);
                        }}
                        className="btn-ghost text-xs px-2.5 py-1 rounded-lg font-bold border border-[#2E8A81]/40 text-[#2E8A81] hover:bg-[#E1F0E7] flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Reload Funds
                      </button>
                      {!isDepleted && (
                        <button
                          type="button"
                          onClick={() => {
                            setRedeemModalCard(gc);
                            setRedeemAmount(Math.min(25, gc.balance));
                          }}
                          className="btn-primary text-xs px-3 py-1 rounded-lg font-bold cursor-pointer"
                        >
                          Quick Redeem
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        confirmDelete({
                          title: 'Delete Gift Card',
                          message: `Permanently delete gift card ${gc.code} (Remaining balance: ${formatPrice(gc.balance)})?`,
                          confirmLabel: 'Delete Card',
                          onConfirm: () => deleteGiftCard(gc.id),
                        });
                      }}
                      className="p-1 text-[#5C716C] hover:text-[#C9503A] hover:bg-[#FEF2F2] rounded-lg transition-colors cursor-pointer"
                      title="Delete Gift Card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Reload Sub-Modal / Drawer */}
          {reloadModalCard && (
            <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#10B981] space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#10B981]" />
                  <h4 className="font-display font-bold text-sm text-[#065F46]">
                    Reload Gift Card ({reloadModalCard.code})
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setReloadModalCard(null)}
                  className="text-xs text-[#065F46] font-bold hover:underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[10, 25, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setReloadAmount(amt)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border cursor-pointer ${
                      reloadAmount === amt
                        ? 'bg-[#065F46] text-white border-[#065F46]'
                        : 'bg-white text-[#065F46] border-[#A7F3D0]'
                    }`}
                  >
                    +${amt}
                  </button>
                ))}
                <div className="flex items-center gap-1 ml-2">
                  <span className="text-xs font-bold text-[#065F46]">$</span>
                  <input
                    type="number"
                    min="1"
                    value={reloadAmount}
                    onChange={(e) => setReloadAmount(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-xs font-bold rounded-lg border border-[#A7F3D0] bg-white outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (reloadAmount > 0) {
                      reloadGiftCard(reloadModalCard.id, reloadAmount);
                      setReloadModalCard(null);
                    }
                  }}
                  className="btn-teal text-xs px-4 py-1.5 rounded-xl font-bold ml-auto cursor-pointer"
                >
                  Add {formatPrice(reloadAmount)} to Balance
                </button>
              </div>
            </div>
          )}

          {/* Quick Redeem Sub-Modal / Drawer */}
          {redeemModalCard && (
            <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#F59E0B] space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#D97706]" />
                  <h4 className="font-display font-bold text-sm text-[#78350F]">
                    Redeem Balance from Gift Card ({redeemModalCard.code})
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setRedeemModalCard(null)}
                  className="text-xs text-[#78350F] font-bold hover:underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[10, 20, 25, 50].filter(amt => amt <= redeemModalCard.balance).map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setRedeemAmount(amt)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border cursor-pointer ${
                      redeemAmount === amt
                        ? 'bg-[#B45309] text-white border-[#B45309]'
                        : 'bg-white text-[#B45309] border-[#FDE68A]'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setRedeemAmount(redeemModalCard.balance)}
                  className="px-3 py-1 text-xs font-bold rounded-lg bg-white text-[#B45309] border border-[#FDE68A] cursor-pointer"
                >
                  Full ({formatPrice(redeemModalCard.balance)})
                </button>
                <div className="flex items-center gap-1 ml-2">
                  <span className="text-xs font-bold text-[#78350F]">$</span>
                  <input
                    type="number"
                    min="1"
                    max={redeemModalCard.balance}
                    value={redeemAmount}
                    onChange={(e) => setRedeemAmount(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-xs font-bold rounded-lg border border-[#FDE68A] bg-white outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (redeemAmount > 0) {
                      redeemGiftCard(redeemModalCard.code, redeemAmount);
                      setRedeemModalCard(null);
                    }
                  }}
                  className="btn-primary text-xs px-4 py-1.5 rounded-xl font-bold ml-auto cursor-pointer"
                >
                  Deduct {formatPrice(redeemAmount)}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TAB 4: EXPENSES (WITH ACCURATE DATES)
          ========================================== */}
      {tab === 'expenses' && (
        <div className="space-y-4">
          <div className="card-box p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#5C716C] uppercase tracking-wider">Total Recorded Overhead</span>
              <div className="font-display font-black text-2xl text-[#C9503A] mt-1">
                {formatPrice(expenses.reduce((sum, e) => sum + e.amount, 0))}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#5C716C]">{expenses.length} expense items logged</span>
            </div>
          </div>

          <div className="card-box space-y-3">
            <div className="divide-y divide-[#D8D3C4]">
              {expenses
                .slice()
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((exp) => (
                  <div key={exp.id} className="py-3.5 flex items-center justify-between text-xs hover:bg-[#FAF8F5] px-2 rounded-lg transition-colors">
                    <div>
                      <div className="font-bold text-[#173E39] text-sm">{exp.desc}</div>
                      <div className="text-[#5C716C] mt-0.5 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#EAE7DC] text-[#173E39] font-medium capitalize">
                          {exp.category}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-[#173E39]">
                          <Calendar className="w-3 h-3 text-[#5C716C]" /> {exp.date}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-display font-black text-base text-[#C9503A]">{formatPrice(exp.amount)}</span>
                      <button
                        onClick={() => {
                          confirmDelete({
                            title: 'Delete Expense Log',
                            message: `Delete expense log for "${exp.desc}" (${formatPrice(exp.amount)})?`,
                            confirmLabel: 'Delete Expense',
                            onConfirm: () => deleteExpense(exp.id),
                          });
                        }}
                        className="p-1.5 text-[#5C716C] hover:text-[#C9503A] hover:bg-[#FEF2F2] rounded-lg transition-colors cursor-pointer"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 5: WAITLIST
          ========================================== */}
      {tab === 'waitlist' && (
        <div className="card-box space-y-3">
          <div className="divide-y divide-[#D8D3C4]">
            {waitlist.length === 0 ? (
              <div className="py-8 text-center text-[#5C716C]">
                <Clock className="w-8 h-8 text-[#5C716C]/40 mx-auto mb-2" />
                <p className="font-bold text-sm text-[#173E39]">Waitlist is empty</p>
                <p className="text-xs text-[#7A6865] mt-1">No pet parents waiting for standby openings right now.</p>
              </div>
            ) : (
              waitlist.map((wl) => {
                const client = clients.find((c) => c.id === wl.clientId);
                const service = services.find((s) => s.id === wl.serviceId);

                return (
                  <div key={wl.id} className="py-3.5 flex items-center justify-between text-xs hover:bg-[#FAF8F5] px-2 rounded-lg transition-colors">
                    <div>
                      <div className="font-bold text-[#173E39] text-sm">{client?.name} ({client?.breed})</div>
                      <div className="text-[#5C716C] mt-0.5">
                        Owner: <span className="font-semibold text-[#173E39]">{client?.owner}</span> • Requested: <span className="font-semibold text-[#173E39]">{service?.name}</span> • Pref: "{wl.pref}"
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        confirmDelete({
                          title: 'Remove Waitlist Entry',
                          message: `Remove ${client?.name || 'client'} from the waitlist?`,
                          confirmLabel: 'Remove Entry',
                          onConfirm: () => deleteWaitlist(wl.id),
                        });
                      }}
                      className="btn-ghost text-xs px-3 py-1.5 rounded-xl text-[#C9503A] hover:bg-[#FEF2F2] font-bold cursor-pointer"
                    >
                      Clear Waitlist
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          PRODUCT BUYERS MODAL
          ========================================== */}
      {selectedProductForBuyers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-[#D8D3C4]">
            <div className="flex items-center justify-between border-b border-[#D8D3C4]/60 pb-3">
              <div>
                <h3 className="font-display font-black text-lg text-[#173E39] flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#FF6B00]" />
                  Client Purchase History
                </h3>
                <p className="text-xs text-[#5C716C] mt-0.5">
                  Clients who purchased <strong className="text-[#173E39]">{selectedProductForBuyers.name}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProductForBuyers(null)}
                className="p-1.5 text-[#5C716C] hover:text-[#173E39] hover:bg-[#EAE7DC] rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Stat Pills */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#FAF8F5] p-2.5 rounded-xl text-center border border-[#D8D3C4]/60">
                <span className="text-[10px] text-[#5C716C] uppercase font-bold block">Current Stock</span>
                <span className="font-display font-black text-base text-[#173E39]">{selectedProductForBuyers.stock} units</span>
              </div>
              <div className="bg-[#FAF8F5] p-2.5 rounded-xl text-center border border-[#D8D3C4]/60">
                <span className="text-[10px] text-[#5C716C] uppercase font-bold block">Units Sold</span>
                <span className="font-display font-black text-base text-[#173E39]">
                  {productPerformanceMap.get(selectedProductForBuyers.id)?.unitsSold || 0} units
                </span>
              </div>
              <div className="bg-[#FAF8F5] p-2.5 rounded-xl text-center border border-[#D8D3C4]/60">
                <span className="text-[10px] text-[#5C716C] uppercase font-bold block">Revenue</span>
                <span className="font-display font-black text-base text-[#357A54]">
                  {formatPrice(productPerformanceMap.get(selectedProductForBuyers.id)?.revenue || 0)}
                </span>
              </div>
            </div>

            {/* Buyers List */}
            <div className="max-h-72 overflow-y-auto space-y-2 divide-y divide-[#D8D3C4]/60">
              {(productPerformanceMap.get(selectedProductForBuyers.id)?.buyers || []).length === 0 ? (
                <p className="text-xs text-center py-6 text-[#7A6865] italic">No clients have purchased this item yet.</p>
              ) : (
                (productPerformanceMap.get(selectedProductForBuyers.id)?.buyers || []).map((sale, idx) => (
                  <div key={sale.saleId + '_' + idx} className="pt-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#173E39] flex items-center gap-1.5">
                        <span>{sale.petName}</span>
                        <span className="text-[11px] text-[#5C716C] font-normal">({sale.ownerName})</span>
                      </div>
                      <div className="text-[10px] text-[#5C716C] mt-0.5">
                        Date: {sale.date} • Ref: {sale.invoiceNumber}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-[#173E39]">{sale.quantity}x @ {formatPrice(sale.unitPrice)}</div>
                      <div className="font-display font-black text-sm text-[#357A54]">{formatPrice(sale.totalAmount)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-[#D8D3C4]/60 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setSelectedProductFilter(selectedProductForBuyers.id);
                  setSelectedProductForBuyers(null);
                  setTab('sales');
                }}
                className="btn-ghost text-xs px-3 py-1.5 rounded-xl font-bold text-[#2E8A81] border border-[#2E8A81]/30 hover:bg-[#E1F0E7] flex items-center gap-1 cursor-pointer"
              >
                Open in Full Sales Ledger <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedProductForBuyers(null)}
                className="btn-primary text-xs px-4 py-1.5 rounded-xl font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          QUICK DIRECT RETAIL SALE MODAL
          ========================================== */}
      {isDirectSaleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <form onSubmit={handleRecordDirectSale} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#D8D3C4] text-xs">
            <div className="flex items-center justify-between border-b border-[#D8D3C4]/60 pb-3">
              <div>
                <h3 className="font-display font-black text-xl text-[#173E39] flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#FF6B00]" />
                  Record Client Retail Sale
                </h3>
                <p className="text-[#5C716C] text-[11px] mt-0.5">
                  Sell merchandise or grooming supplies directly to a pet owner and deduct inventory stock
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDirectSaleOpen(false)}
                className="p-1.5 text-[#5C716C] hover:text-[#173E39] hover:bg-[#EAE7DC] rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Select Client */}
            <div>
              <label className="font-bold text-[#173E39] block mb-1">Select Pet & Client *</label>
              <select
                value={directSaleClientId}
                onChange={(e) => setDirectSaleClientId(e.target.value)}
                required
                className="w-full p-2.5 bg-white border border-[#D8D3C4] rounded-xl font-semibold text-[#173E39] outline-none focus:border-[#173E39]"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.owner} ({c.breed})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Product */}
            <div>
              <label className="font-bold text-[#173E39] block mb-1">Select Inventory Product *</label>
              <select
                value={directSaleItemId}
                onChange={(e) => setDirectSaleItemId(e.target.value)}
                required
                className="w-full p-2.5 bg-white border border-[#D8D3C4] rounded-xl font-semibold text-[#173E39] outline-none focus:border-[#173E39]"
              >
                {inventory.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — {formatPrice(item.price)} ({item.stock} in stock)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#173E39] block mb-1">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  max={inventory.find((i) => i.id === directSaleItemId)?.stock || 99}
                  value={directSaleQty}
                  onChange={(e) => setDirectSaleQty(Math.max(1, parseInt(e.target.value) || 1))}
                  required
                  className="w-full p-2.5 bg-white border border-[#D8D3C4] rounded-xl font-bold text-[#173E39] outline-none focus:border-[#173E39]"
                />
              </div>
              <div>
                <label className="font-bold text-[#173E39] block mb-1">Purchase Date *</label>
                <input
                  type="date"
                  value={directSaleDate}
                  onChange={(e) => setDirectSaleDate(e.target.value)}
                  required
                  className="w-full p-2.5 bg-white border border-[#D8D3C4] rounded-xl font-semibold text-[#173E39] outline-none focus:border-[#173E39]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#173E39] block mb-1">Payment & Order Status</label>
              <select
                value={directSaleStatus}
                onChange={(e) => setDirectSaleStatus(e.target.value as any)}
                className="w-full p-2.5 bg-white border border-[#D8D3C4] rounded-xl font-semibold text-[#173E39] outline-none focus:border-[#173E39]"
              >
                <option value="completed">💳 Paid & Completed (Instant Settlement)</option>
                <option value="confirmed">⏳ Booked / Payment Pending</option>
              </select>
            </div>

            {/* Total summary calculation */}
            {inventory.find((i) => i.id === directSaleItemId) && (
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D8D3C4]/60 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#5C716C] block">Total Purchase Value</span>
                  <span className="text-xs font-bold text-[#173E39]">
                    {directSaleQty}x {inventory.find((i) => i.id === directSaleItemId)?.name}
                  </span>
                </div>
                <div className="font-display font-black text-xl text-[#357A54]">
                  {formatPrice((inventory.find((i) => i.id === directSaleItemId)?.price || 0) * directSaleQty)}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-[#D8D3C4]/60 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDirectSaleOpen(false)}
                className="btn-ghost text-xs px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary text-xs px-5 py-2.5 rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Confirm & Record Sale
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

