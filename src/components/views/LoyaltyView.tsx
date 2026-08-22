import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { isSectionAllowed } from '../../data/permissionPresets';
import { Award, Gift, Sparkles, Search, Trash2 } from 'lucide-react';

export const LoyaltyView: React.FC = () => {
  const { clients, redemptions, openModal, settings, deletePromoCode, confirmDelete } = useApp();
  const { currentProfile } = useAuth();

  const showStatsOverview = isSectionAllowed(currentProfile?.permissions, 'loyalty', 'statsOverview');
  const showRulesConfig = isSectionAllowed(currentProfile?.permissions, 'loyalty', 'rulesConfig');
  const showTierManagement = isSectionAllowed(currentProfile?.permissions, 'loyalty', 'tierManagement');
  const showRedemptionsHistory = isSectionAllowed(currentProfile?.permissions, 'loyalty', 'redemptionsHistory');

  const [query, setQuery] = useState('');

  const rewards = [
    { title: '$10 Off Next Groom', pts: 100, desc: 'Discount voucher on any full grooming service.' },
    { title: 'Free Teeth Brushing', pts: 120, desc: 'Fresh mint enzymatic teeth cleaning add-on.' },
    { title: 'Free Nail Grind', pts: 180, desc: 'Smooth nail grind and paw balm treatment.' },
    { title: '$25 Spa Day Voucher', pts: 250, desc: 'Premium discount voucher for full spa day.' },
    { title: 'Free De-shed Upgrade', pts: 300, desc: 'Undercoat blow-out & de-shed treatment.' },
  ];

  // Search clients for leaderboard
  const searchedClients = React.useMemo(() => {
    return clients
      .filter((c) => {
        const q = query.toLowerCase();
        return !q || c.name.toLowerCase().includes(q) || c.owner.toLowerCase().includes(q);
      })
      .sort((a, b) => (b.points || 0) - (a.points || 0));
  }, [clients, query]);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      {showStatsOverview && (
        <div className="card-box bg-gradient-to-br from-[#184540] via-[#0F2E2B] to-[#173E39] text-white p-6 rounded-3xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="text-xs font-extrabold tracking-widest text-[#F4B98A] uppercase flex items-center gap-1.5">
              <Award className="w-4 h-4" /> PAWS & REWARDS LOYALTY PROGRAM
            </div>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-white">
              Client Appreciation & Points Engine
            </h2>
            <p className="text-xs md:text-sm text-[#DCE9E5]">
              ${settings.ppd} spent = 1 pt • {settings.redeem} pts = $1 off • Birthday month ×{settings.bday} points bonus!
            </p>
          </div>
        </div>
      )}

      {/* Rewards Catalog */}
      {showRulesConfig && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-display font-bold text-lg text-[#173E39] flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#E7A93C]" />
              Available Reward Catalog
            </h3>
            <button
              onClick={() => openModal('redeemModal', { mode: 'custom' })}
              className="btn-ghost text-xs px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border border-[#2E8A81]/40 text-[#2E8A81] hover:bg-[#E1F0E7] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
              <span>+ Create Custom Promo Code</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((r, idx) => (
              <div
                key={idx}
                className="card-box bg-white border border-[#E7A93C]/30 p-4 flex flex-col justify-between hover:border-[#E7A93C] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-base text-[#173E39]">
                      {r.title}
                    </span>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-[#FFFBEB] text-[#C98A22] border border-[#E7A93C]/40">
                      {r.pts} PTS
                    </span>
                  </div>
                  <p className="text-xs text-[#5C716C] mt-2">
                    {r.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#D8D3C4] flex items-center justify-end">
                  <button
                    onClick={() => openModal('redeemModal', { reward: r, mode: 'points' })}
                    className="btn-primary text-xs px-3.5 py-1.5 rounded-full font-bold"
                  >
                    Redeem Reward
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Client Leaderboard & Points Search */}
      {showTierManagement && (
        <div className="card-box space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-lg text-[#173E39]">
                Client Points Leaderboard
              </h3>
              <p className="text-xs text-[#5C716C]">
                Select a client to redeem vouchers or adjust points.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5C716C]" />
              <input
                type="text"
                placeholder="Search dog or owner..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-white border border-[#D8D3C4] rounded-xl w-full outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#D8D3C4] text-[#5C716C] uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Pet Name</th>
                  <th className="py-2.5 px-3">Owner</th>
                  <th className="py-2.5 px-3">Points Balance</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8D3C4]">
                {searchedClients.map((client) => (
                  <tr key={client.id} className="hover:bg-[#F1EEE6]/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-[#173E39]">
                      {client.name} <span className="text-[10px] text-[#5C716C] font-normal">({client.breed})</span>
                    </td>
                    <td className="py-3 px-3 text-[#5C716C]">{client.owner}</td>
                    <td className="py-3 px-3">
                      <span className="font-display font-bold text-sm text-[#C98A22] bg-[#FFFBEB] px-2.5 py-1 rounded-full border border-[#E7A93C]/30">
                        {client.points || 0} pts
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => openModal('redeemModal', { client })}
                        className="btn-teal text-xs px-3 py-1 rounded-xl font-bold cursor-pointer"
                      >
                        Redeem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Generated Vouchers History Section */}
      {showRedemptionsHistory && (
        <div className="card-box space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-lg text-[#173E39]">
                Generated Reward Vouchers & Promo Codes
              </h3>
              <p className="text-xs text-[#5C716C]">
                Apply these voucher codes directly in any invoice or checkout to apply automatic discounts.
              </p>
            </div>
            <span className="text-xs font-extrabold px-3 py-1 bg-[#FFF8E7] text-[#C98A22] rounded-full border border-[#E7A93C]/30">
              {redemptions.length} Issued
            </span>
          </div>

          {redemptions.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#5C716C] bg-[#FAF8F5] rounded-2xl border border-dashed border-[#D8D3C4]">
              No reward vouchers generated yet. Click "Redeem Reward" above to generate a discount voucher code.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {redemptions.map((red) => {
                const client = clients.find(c => c.id === red.clientId);
                const isUsed = red.used;
                const isApplied = red.status === 'applied';

                return (
                  <div 
                    key={red.id}
                    className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                      isUsed 
                        ? 'bg-[#F1EEE6]/60 border-[#D8D3C4] opacity-70' 
                        : isApplied
                          ? 'bg-[#F0FDF4] border-[#10B981] shadow-xs'
                          : 'bg-white border-[#2E8A81]/40 shadow-xs hover:border-[#2E8A81]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-sm px-2.5 py-1 bg-[#F1EEE6] text-[#173E39] rounded-lg tracking-wider">
                        {red.code}
                      </span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                        isUsed 
                          ? 'bg-[#EAE7DC] text-[#7A6865]' 
                          : isApplied
                            ? 'bg-[#10B981] text-white shadow-2xs'
                            : 'bg-[#E1F0E7] text-[#357A54]'
                      }`}>
                        {isUsed ? 'Redeemed' : isApplied ? 'Applied in Checkout' : 'Active'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-xs text-[#240C0B]">{red.reward}</h4>
                      <div className="text-[11px] font-semibold text-[#2E8A81]">
                        {red.discountType === 'percent' ? `${red.discountValue}% Off Invoice` : `$${red.discountValue} Off Invoice`}
                      </div>
                      <p className="text-[11px] text-[#5C716C] mt-0.5">
                        Target Pet: <strong className="text-[#173E39]">{client ? `${client.name} (${client.owner})` : 'Client'}</strong> • {red.date}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#D8D3C4]/60 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-[#5C716C] font-semibold">
                        {red.pts > 0 ? `${red.pts} pts redeemed` : 'Promotional Code'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {!isUsed && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(red.code);
                            }}
                            className="text-[10px] font-extrabold px-2 py-1 bg-[#173E39] text-white rounded-lg hover:bg-[#2E8A81] transition-colors cursor-pointer"
                          >
                            Copy
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            confirmDelete({
                              title: 'Delete Promo Code',
                              message: `Permanently remove promo code "${red.code}" (${red.reward}) from rewards?`,
                              confirmLabel: 'Delete Promo',
                              onConfirm: () => deletePromoCode(red.id),
                            });
                          }}
                          className="p-1 text-[#C9503A] hover:bg-[#FEF2F2] rounded-lg transition-colors cursor-pointer"
                          title="Delete Promo Code"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
