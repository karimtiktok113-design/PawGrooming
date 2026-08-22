import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { isSectionAllowed } from '../../data/permissionPresets';
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
  CheckCircle2
} from 'lucide-react';

export const BusinessView: React.FC = () => {
  const { 
    inventory, 
    giftCards, 
    expenses, 
    waitlist, 
    clients, 
    services, 
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
  const showGiftCards = isSectionAllowed(currentProfile?.permissions, 'business', 'giftCards');
  const showExpenses = isSectionAllowed(currentProfile?.permissions, 'business', 'expenses');
  const showWaitlist = isSectionAllowed(currentProfile?.permissions, 'business', 'waitlist');

  const [tab, setTab] = useState<'inventory' | 'gift' | 'expenses' | 'waitlist'>('inventory');

  useEffect(() => {
    if (tab === 'inventory' && !showInventory) {
      if (showGiftCards) setTab('gift');
      else if (showExpenses) setTab('expenses');
      else if (showWaitlist) setTab('waitlist');
    } else if (tab === 'gift' && !showGiftCards) {
      if (showInventory) setTab('inventory');
      else if (showExpenses) setTab('expenses');
      else if (showWaitlist) setTab('waitlist');
    } else if (tab === 'expenses' && !showExpenses) {
      if (showInventory) setTab('inventory');
      else if (showGiftCards) setTab('gift');
      else if (showWaitlist) setTab('waitlist');
    } else if (tab === 'waitlist' && !showWaitlist) {
      if (showInventory) setTab('inventory');
      else if (showGiftCards) setTab('gift');
      else if (showExpenses) setTab('expenses');
    }
  }, [showInventory, showGiftCards, showExpenses, showWaitlist, tab]);
  const [reloadModalCard, setReloadModalCard] = useState<any>(null);
  const [reloadAmount, setReloadAmount] = useState<number>(25);

  const [redeemModalCard, setRedeemModalCard] = useState<any>(null);
  const [redeemAmount, setRedeemAmount] = useState<number>(10);

  return (
    <div className="space-y-6">
      {/* Operations Navigation Tabs */}
      <div className="card-box p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="bg-[#EAE7DC] p-1 rounded-2xl flex items-center gap-1 w-full sm:w-auto flex-wrap">
          {showInventory && (
            <button
              onClick={() => setTab('inventory')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tab === 'inventory' ? 'bg-[#173E39] text-white shadow-xs' : 'text-[#5C716C]'
              }`}
            >
              📦 Retail Stock ({inventory.length})
            </button>
          )}
          {showGiftCards && (
            <button
              onClick={() => setTab('gift')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tab === 'gift' ? 'bg-[#173E39] text-white shadow-xs' : 'text-[#5C716C]'
              }`}
            >
              🎁 Gift Cards ({giftCards.length})
            </button>
          )}
          {showExpenses && (
            <button
              onClick={() => setTab('expenses')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tab === 'expenses' ? 'bg-[#173E39] text-white shadow-xs' : 'text-[#5C716C]'
              }`}
            >
              💸 Expenses ({expenses.length})
            </button>
          )}
          {showWaitlist && (
            <button
              onClick={() => setTab('waitlist')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                tab === 'waitlist' ? 'bg-[#173E39] text-white shadow-xs' : 'text-[#5C716C]'
              }`}
            >
              ⏳ Waitlist ({waitlist.length})
            </button>
          )}
        </div>

        <div>
          {tab === 'inventory' && showInventory && (
            <button
              onClick={() => openModal('inventoryForm')}
              className="btn-primary text-xs px-4 py-2 rounded-full font-bold shadow-md cursor-pointer"
            >
              + Add Product
            </button>
          )}
          {tab === 'gift' && showGiftCards && (
            <button
              onClick={() => openModal('giftCardForm')}
              className="btn-primary text-xs px-4 py-2 rounded-full font-bold shadow-md cursor-pointer"
            >
              + Issue Gift Card
            </button>
          )}
          {tab === 'expenses' && showExpenses && (
            <button
              onClick={() => openModal('expenseForm')}
              className="btn-primary text-xs px-4 py-2 rounded-full font-bold shadow-md cursor-pointer"
            >
              + Log Expense
            </button>
          )}
          {tab === 'waitlist' && showWaitlist && (
            <button
              onClick={() => openModal('waitlistForm')}
              className="btn-primary text-xs px-4 py-2 rounded-full font-bold shadow-md cursor-pointer"
            >
              + Add to Waitlist
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Retail Inventory */}
      {tab === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map((item) => {
            const isLow = item.stock <= item.lowAt;

            return (
              <div key={item.id} className="card-box p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display font-bold text-base text-[#173E39]">
                      {item.name}
                    </h3>
                    <span className="font-display font-bold text-base text-[#2E8A81]">
                      {formatPrice(item.price)}
                    </span>
                  </div>

                  <div className="mt-3 text-xs text-[#5C716C] space-y-1">
                    <div>Cost: {formatPrice(item.cost)} • Margin: {formatPrice(item.price - item.cost)}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${
                        isLow ? 'bg-[#FEF2F2] text-[#C9503A]' : 'bg-[#E1F0E7] text-[#357A54]'
                      }`}>
                        {item.stock} in stock {isLow ? '(LOW STOCK)' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#D8D3C4] flex items-center justify-end gap-1">
                  <button
                    onClick={() => openModal('inventoryForm', { item })}
                    className="p-1.5 text-[#5C716C] hover:text-[#2E8A81] rounded-lg text-xs cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      confirmDelete({
                        title: 'Remove Inventory Item',
                        message: `Remove "${item.name}" from inventory?`,
                        confirmLabel: 'Remove Item',
                        onConfirm: () => deleteInventoryItem(item.id),
                      });
                    }}
                    className="p-1.5 text-[#5C716C] hover:text-[#C9503A] rounded-lg text-xs cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Gift Cards */}
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

      {/* Tab 3: Expenses */}
      {tab === 'expenses' && (
        <div className="card-box space-y-3">
          <div className="divide-y divide-[#D8D3C4]">
            {expenses.map((exp) => (
              <div key={exp.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[#173E39] text-sm">{exp.desc}</div>
                  <div className="text-[#5C716C] mt-0.5">Category: {exp.category} • Date: {exp.date}</div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-display font-bold text-sm text-[#C9503A]">{formatPrice(exp.amount)}</span>
                  <button
                    onClick={() => {
                      confirmDelete({
                        title: 'Delete Expense Log',
                        message: `Delete expense log for "${exp.desc}" (${formatPrice(exp.amount)})?`,
                        confirmLabel: 'Delete Expense',
                        onConfirm: () => deleteExpense(exp.id),
                      });
                    }}
                    className="p-1 text-[#5C716C] hover:text-[#C9503A] cursor-pointer"
                    title="Delete Expense"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Waitlist */}
      {tab === 'waitlist' && (
        <div className="card-box space-y-3">
          <div className="divide-y divide-[#D8D3C4]">
            {waitlist.map((wl) => {
              const client = clients.find((c) => c.id === wl.clientId);
              const service = services.find((s) => s.id === wl.serviceId);

              return (
                <div key={wl.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#173E39] text-sm">{client?.name} ({client?.breed})</div>
                    <div className="text-[#5C716C] mt-0.5">Requested Service: {service?.name} • Preference: "{wl.pref}"</div>
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
                    className="btn-ghost text-xs px-3 py-1 rounded-xl text-[#C9503A] hover:bg-[#FEF2F2] cursor-pointer"
                  >
                    Clear Waitlist
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
