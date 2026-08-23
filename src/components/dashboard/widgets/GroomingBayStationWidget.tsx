import React from 'react';
import { useApp } from '../../../context/AppContext';
import { useDashboardSystem } from '../../../context/DashboardSystemContext';
import { 
  Sparkles, 
  Clock, 
  User, 
  Scissors, 
  Wind, 
  ShowerHead, 
  CheckCircle2, 
  AlertCircle,
  Plus
} from 'lucide-react';

export const GroomingBayStationWidget: React.FC = () => {
  const { clients, staff, openModal, showToast } = useApp();
  const { activeClientProfile } = useDashboardSystem();

  const stations = [
    {
      id: 'bay-1',
      name: 'Bay 1 • Hydro-Surge Bath',
      type: 'bath',
      status: 'occupied',
      petName: clients[0]?.name || 'Bella',
      breed: clients[0]?.breed || 'Goldendoodle',
      groomer: staff[0]?.name || 'Elena Rostova',
      service: 'Oatmeal Hydro-Therapy',
      elapsedMins: 22,
      totalMins: 45,
      avatar: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=120&q=80',
      icon: ShowerHead
    },
    {
      id: 'bay-2',
      name: 'Bay 2 • Precision Styling Table',
      type: 'styling',
      status: 'occupied',
      petName: clients[1]?.name || 'Charlie',
      breed: clients[1]?.breed || 'Shih Tzu',
      groomer: staff[1]?.name || 'Marcus Chen',
      service: 'Teddy Bear Face Trim & Nails',
      elapsedMins: 38,
      totalMins: 60,
      avatar: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=120&q=80',
      icon: Scissors
    },
    {
      id: 'bay-3',
      name: 'Bay 3 • High-Velocity Turbo Dryer',
      type: 'drying',
      status: 'occupied',
      petName: clients[2]?.name || 'Thor',
      breed: clients[2]?.breed || 'Siberian Husky',
      groomer: staff[2]?.name || 'Sarah Jenkins',
      service: 'Undercoat Deshedding Blast',
      elapsedMins: 15,
      totalMins: 40,
      avatar: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=120&q=80',
      icon: Wind
    },
    {
      id: 'bay-4',
      name: 'Bay 4 • VIP Private Suite',
      type: 'vip',
      status: 'ready',
      petName: null,
      breed: null,
      groomer: 'Assigned on arrival',
      service: 'Sanitized & Ready',
      elapsedMins: 0,
      totalMins: 0,
      avatar: null,
      icon: Sparkles
    }
  ];

  return (
    <div id="widget-station-occupancy" className="card-box flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-theme-subtle">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="text-base font-bold text-theme-ink font-display">
              Salon Floor & Grooming Bays
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-theme-light text-theme-primary border border-theme-subtle">
              3/4 Bays In Use
            </span>
          </div>
          <p className="text-xs text-theme-muted mt-0.5">
            Real-time station occupancy, washbay timers & styling progress
          </p>
        </div>

        <button 
          onClick={() => showToast('All bays sanitized and temperature regulated at 72°F', 'info')}
          className="text-xs text-theme-muted hover:text-theme-ink font-semibold flex items-center gap-1"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Sanitation Verified
        </button>
      </div>

      {/* Grid of Stations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
        {stations.map((st) => {
          const Icon = st.icon;
          const percent = st.totalMins > 0 ? Math.min(100, Math.round((st.elapsedMins / st.totalMins) * 100)) : 0;

          return (
            <div
              key={st.id}
              className={`p-3.5 rounded-xl border transition-all ${
                st.status === 'occupied'
                  ? 'bg-theme-light border-theme-subtle hover:border-theme-primary'
                  : 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-theme-canvas text-theme-primary flex items-center justify-center border border-theme-subtle">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-theme-ink font-display">
                      {st.name}
                    </h4>
                    <span className="text-[11px] text-theme-muted">
                      {st.service}
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  st.status === 'occupied'
                    ? 'bg-amber-500/20 text-amber-600 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30'
                }`}>
                  {st.status === 'occupied' ? 'In Service' : 'Ready'}
                </span>
              </div>

              {st.status === 'occupied' ? (
                <div className="mt-3 pt-2.5 border-t border-theme-subtle flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img src={st.avatar!} alt={st.petName!} className="w-6 h-6 rounded-full object-cover border border-theme-subtle" />
                    <span className="font-bold text-theme-ink">{st.petName}</span>
                    <span className="text-[11px] text-theme-muted">({st.breed})</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-theme-primary font-semibold">
                    <Clock className="w-3 h-3" />
                    {st.elapsedMins}/{st.totalMins}m ({percent}%)
                  </div>
                </div>
              ) : (
                <div className="mt-3 pt-2.5 border-t border-emerald-500/20 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-emerald-600 font-medium">Ready for next walk-in</span>
                  <button 
                    onClick={() => openModal('appointment_new')}
                    className="text-[11px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> Assign Pet
                  </button>
                </div>
              )}

              {/* Progress Bar for occupied station */}
              {st.status === 'occupied' && (
                <div className="w-full bg-theme-canvas h-1.5 rounded-full mt-2.5 overflow-hidden border border-theme-subtle">
                  <div 
                    className="bg-theme-primary h-full rounded-full transition-all duration-500" 
                    style={{ width: `${percent}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
