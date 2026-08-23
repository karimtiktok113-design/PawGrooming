import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  Users, 
  Search, 
  Heart, 
  ShieldCheck, 
  ShieldAlert, 
  Phone, 
  ChevronRight, 
  Plus, 
  Star,
  Award,
  Sparkles
} from 'lucide-react';

const DOG_AVATARS: Record<string, string> = {
  cl1: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=120&q=80',
  cl2: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=120&q=80',
  cl3: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=120&q=80',
  cl4: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=120&q=80',
  cl5: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=120&q=80',
  cl6: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=120&q=80',
  cl7: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=120&q=80',
};

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=120&q=80';

export const PetSummaryWidget: React.FC = () => {
  const { clients, openModal, setView } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTag, setActiveTag] = useState<'all' | 'vip' | 'sensitive'>('all');

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.breed.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    if (activeTag === 'vip') return (client.points || 0) > 300;
    if (activeTag === 'sensitive') return client.sensitivities && client.sensitivities.length > 0;
    return true;
  });

  return (
    <div id="widget-pet-summary-table" className="card-box flex flex-col justify-between h-full">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-theme-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-theme-ink font-display flex items-center gap-2">
              <Users className="w-4 h-4 text-theme-primary" />
              Pet & Client Directory
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-theme-light text-theme-primary border border-theme-subtle">
              {clients.length} Registered
            </span>
          </div>
          <p className="text-xs text-theme-muted mt-0.5">
            Client records, sensitivities, coat care notes & loyalty points
          </p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted" />
          <input
            type="text"
            placeholder="Search pet, owner, breed..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-48 pl-8 pr-3 py-1.5 rounded-lg bg-theme-light border border-theme-subtle text-xs text-theme-ink focus:outline-none focus:border-theme-primary placeholder:text-theme-muted"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 my-2.5">
        {(['all', 'vip', 'sensitive'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTag(tab)}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTag === tab
                ? 'bg-theme-primary text-black font-bold'
                : 'bg-theme-light text-theme-muted hover:text-theme-ink border border-theme-subtle'
            }`}
          >
            {tab === 'all' ? 'All Pets' : tab === 'vip' ? '⭐ VIP Tier' : '⚠️ Sensitive Coat'}
          </button>
        ))}
      </div>

      {/* Pet Roster List */}
      <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
        {filteredClients.slice(0, 6).map((client) => {
          const avatarUrl = DOG_AVATARS[client.id] || DEFAULT_AVATAR;
          const isVip = (client.points || 0) > 300;

          return (
            <div
              key={client.id}
              onClick={() => openModal('client_edit', { client })}
              className="p-2.5 rounded-xl bg-theme-light border border-theme-subtle flex items-center justify-between hover:border-theme-primary transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <img 
                  src={avatarUrl} 
                  alt={client.name} 
                  className="w-10 h-10 rounded-xl object-cover border border-theme-subtle" 
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-theme-ink font-display group-hover:text-theme-primary transition-colors">
                      {client.name}
                    </span>
                    <span className="text-[11px] text-theme-muted">
                      ({client.breed})
                    </span>
                    {isVip && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-500 font-bold border border-amber-500/30">
                        VIP
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-theme-muted flex items-center gap-2 mt-0.5">
                    <span>Owner: {client.owner}</span>
                    <span>•</span>
                    <span className="font-semibold text-theme-primary">{client.points || 120} pts</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {client.sensitivities ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-semibold border border-rose-500/20 hidden sm:inline-block">
                    {client.sensitivities}
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold border border-emerald-500/20 hidden sm:inline-block">
                    Healthy Coat
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-theme-muted group-hover:translate-x-0.5 group-hover:text-theme-primary transition-all" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2.5 border-t border-theme-subtle flex items-center justify-between">
        <button
          onClick={() => setView('clients')}
          className="text-xs font-bold text-theme-primary hover:underline flex items-center gap-1"
        >
          View Full Client Database <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => openModal('client_new')}
          className="btn-primary px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Pet
        </button>
      </div>
    </div>
  );
};
