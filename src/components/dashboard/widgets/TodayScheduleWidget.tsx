import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useDashboardSystem } from '../../../context/DashboardSystemContext';
import { 
  Calendar, 
  Clock, 
  Check, 
  Scissors, 
  Sparkles, 
  Phone, 
  Printer, 
  Plus, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  User,
  ShieldAlert
} from 'lucide-react';
import { formatISO } from '../../../data/initialData';

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

export const TodayScheduleWidget: React.FC = () => {
  const { 
    appointments, 
    clients, 
    services, 
    staff, 
    updateAppointmentStatus, 
    openModal, 
    formatPrice,
    showToast 
  } = useApp();
  
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const todayStr = formatISO(new Date());

  const todaysAppts = appointments
    .filter(a => a.date === todayStr && a.status !== 'cancelled')
    .sort((a, b) => a.start.localeCompare(b.start));

  const filteredAppts = todaysAppts.filter(a => {
    if (filter === 'in_progress') return a.status === 'booked' || a.status === 'confirmed';
    if (filter === 'completed') return a.status === 'completed';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Ready / Done</span>;
      case 'confirmed':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 border border-amber-500/30 flex items-center gap-1"><Scissors className="w-3 h-3 animate-pulse" /> On Table / Bathing</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-600 border border-blue-500/30 flex items-center gap-1"><Clock className="w-3 h-3" /> Checked In</span>;
    }
  };

  return (
    <div id="widget-today-schedule" className="card-box flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-theme-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-theme-ink font-display flex items-center gap-2">
              <Calendar className="w-4 h-4 text-theme-primary" />
              Live Grooming Queue & Schedule
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-theme-light text-theme-primary border border-theme-subtle">
              {todaysAppts.length} Today
            </span>
          </div>
          <p className="text-xs text-theme-muted mt-0.5">
            Real-time grooming station dispatch and checkout pipeline
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex bg-theme-light p-0.5 rounded-lg border border-theme-subtle text-xs font-semibold">
          {(['all', 'in_progress', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filter === f
                  ? 'bg-theme-primary text-black shadow-sm font-bold'
                  : 'text-theme-muted hover:text-theme-ink'
              }`}
            >
              {f === 'all' ? 'All' : f === 'in_progress' ? 'Active' : 'Finished'}
            </button>
          ))}
        </div>
      </div>

      {/* Appointment Cards List */}
      <div className="mt-3 space-y-2.5 overflow-y-auto max-h-[340px] pr-1">
        {filteredAppts.length === 0 ? (
          <div className="py-8 text-center text-sm text-theme-muted">
            No appointments matching filter.
          </div>
        ) : (
          filteredAppts.map((appt) => {
            const pet = clients.find(c => c.id === appt.clientId) || {
              name: 'Max',
              owner: 'Client',
              phone: '555-0192',
              breed: 'Golden Retriever',
              photos: []
            };
            const service = services.find(s => s.id === appt.serviceId) || { name: 'Full Groom & Spa', price: 95 };
            const groomer = staff.find(st => st.id === appt.staffId) || { name: 'Lead Groomer' };
            const avatarUrl = DOG_AVATARS[appt.clientId] || DEFAULT_AVATAR;

            return (
              <div
                key={appt.id}
                id={`appt-row-${appt.id}`}
                className="p-3 rounded-xl bg-theme-light border border-theme-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-theme-primary transition-all group"
              >
                {/* Pet and Owner info */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src={avatarUrl} 
                      alt={pet.name} 
                      className="w-11 h-11 rounded-xl object-cover border border-theme-subtle"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-theme-primary text-black text-[9px] font-bold flex items-center justify-center border border-white">
                      🐾
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-theme-ink font-display">
                        {pet.name}
                      </span>
                      <span className="text-xs text-theme-muted">
                        ({pet.breed})
                      </span>
                      {getStatusBadge(appt.status)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-theme-muted mt-0.5">
                      <span className="font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-theme-primary" />
                        {appt.start} - {appt.end}
                      </span>
                      <span>•</span>
                      <span className="text-theme-primary font-semibold">
                        {service.name} ({formatPrice(appt.totalPrice || service.price)})
                      </span>
                      <span>•</span>
                      <span className="text-theme-muted">
                        Stylist: {groomer.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interactive Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {appt.status === 'booked' && (
                    <button
                      onClick={() => {
                        updateAppointmentStatus(appt.id, 'confirmed');
                        showToast(`${pet.name} checked in to Grooming Bay 1!`, 'success');
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-theme-primary text-black hover:brightness-110 flex items-center gap-1 shadow-sm transition-all"
                    >
                      <Scissors className="w-3 h-3" />
                      Start Bath
                    </button>
                  )}

                  {appt.status === 'confirmed' && (
                    <button
                      onClick={() => {
                        updateAppointmentStatus(appt.id, 'completed');
                        showToast(`${pet.name} marked completed! Auto SMS sent.`, 'success');
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 flex items-center gap-1 shadow-sm transition-all"
                    >
                      <Check className="w-3 h-3" />
                      Finish & Pickup
                    </button>
                  )}

                  <button
                    onClick={() => openModal('checkout', { appointment: appt })}
                    className="p-1.5 rounded-lg bg-theme-canvas text-theme-muted hover:text-theme-ink border border-theme-subtle text-xs"
                    title="Invoice & Payment"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Quick Action */}
      <div className="mt-3 pt-3 border-t border-theme-subtle flex items-center justify-between">
        <span className="text-xs text-theme-muted">
          All appointments automatically synchronize with client SMS portal.
        </span>
        <button
          onClick={() => openModal('appointment_new')}
          className="btn-primary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Walk-in
        </button>
      </div>
    </div>
  );
};
