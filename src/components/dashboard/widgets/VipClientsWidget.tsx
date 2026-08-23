import React from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  Crown, 
  Star, 
  Sparkles, 
  Award, 
  Heart, 
  ChevronRight,
  Phone,
  Gift
} from 'lucide-react';

const VIP_AVATARS: Record<string, string> = {
  cl1: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=120&q=80',
  cl2: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=120&q=80',
  cl3: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=120&q=80',
  cl4: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=120&q=80',
};

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=120&q=80';

export const VipClientsWidget: React.FC = () => {
  const { clients, openModal } = useApp();

  const vipList = [...clients]
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, 4);

  return (
    <div id="widget-vip-clients" className="card-box flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-theme-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-theme-ink font-display flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              VIP Furry Clients & Loyalty Tier
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 border border-amber-500/30">
              Gold Paw Club
            </span>
          </div>
          <p className="text-xs text-theme-muted mt-0.5">
            Top returning dogs, loyalty balance & signature care preferences
          </p>
        </div>
      </div>

      {/* VIP List */}
      <div className="mt-3 space-y-2.5">
        {vipList.map((pet, idx) => {
          const avatarUrl = VIP_AVATARS[pet.id] || DEFAULT_AVATAR;

          return (
            <div
              key={pet.id}
              onClick={() => openModal('client_edit', { client: pet })}
              className="p-3 rounded-xl bg-theme-light border border-theme-subtle flex items-center justify-between hover:border-theme-primary transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={avatarUrl} alt={pet.name} className="w-10 h-10 rounded-xl object-cover border border-theme-subtle" />
                  <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-extrabold flex items-center justify-center border border-white">
                    #{idx + 1}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-theme-ink font-display group-hover:text-theme-primary transition-colors">
                      {pet.name}
                    </span>
                    <span className="text-[11px] text-theme-muted">({pet.breed})</span>
                  </div>
                  <div className="text-[11px] text-theme-muted mt-0.5 flex items-center gap-2">
                    <span>Owner: {pet.owner}</span>
                    <span>•</span>
                    <span className="text-amber-500 font-semibold flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-500" /> {pet.points || 420} Pts
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-theme-canvas text-theme-primary font-bold border border-theme-subtle">
                  Every 3 wks
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2.5 border-t border-theme-subtle flex items-center justify-between text-xs">
        <span className="text-theme-muted">
          VIPs receive complimentary blueberry facial add-on.
        </span>
        <button
          onClick={() => openModal('loyalty_redeem')}
          className="text-xs font-bold text-theme-primary hover:underline flex items-center gap-1"
        >
          <Gift className="w-3.5 h-3.5" /> Redeem Reward
        </button>
      </div>
    </div>
  );
};
