import React from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  Scissors, 
  Clock, 
  Award, 
  DollarSign, 
  CheckCircle2, 
  UserCheck,
  Plus
} from 'lucide-react';

export const StaffCapacityWidget: React.FC = () => {
  const { staff, appointments, formatPrice, openModal } = useApp();

  const groomerMetrics = staff.map((member, idx) => {
    const groomerAppts = appointments.filter(a => a.staffId === member.id);
    const completedCount = groomerAppts.filter(a => a.status === 'completed').length;
    const totalDailyRevenue = groomerAppts.reduce((sum, a) => sum + (a.totalPrice || 85), 0);
    const estimatedCommission = Math.round(totalDailyRevenue * (member.commission / 100));
    const capacityRate = Math.min(100, Math.round((groomerAppts.length / 5) * 100));

    return {
      ...member,
      bookedCount: groomerAppts.length,
      completedCount,
      estimatedCommission,
      capacityRate,
      status: capacityRate >= 100 ? 'Fully Booked' : capacityRate >= 60 ? 'Active' : 'Available'
    };
  });

  return (
    <div id="widget-groomer-capacity" className="card-box flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-theme-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-theme-ink font-display flex items-center gap-2">
              <Scissors className="w-4 h-4 text-theme-primary" />
              Groomer Workload & Commissions
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-theme-light text-theme-primary border border-theme-subtle">
              {staff.length} Stylists On Floor
            </span>
          </div>
          <p className="text-xs text-theme-muted mt-0.5">
            Daily appointment loads, capacity utilization & payout tracker
          </p>
        </div>
      </div>

      {/* Groomer Cards */}
      <div className="mt-3 space-y-3">
        {groomerMetrics.map((gm) => (
          <div 
            key={gm.id}
            className="p-3 rounded-xl bg-theme-light border border-theme-subtle hover:border-theme-primary transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-sm"
                  style={{ backgroundColor: gm.color || '#D4AF37' }}
                >
                  {gm.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-theme-ink font-display">
                    {gm.name}
                  </h4>
                  <span className="text-[11px] text-theme-muted">
                    {gm.role} ({gm.commission}% Comm.)
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-extrabold text-theme-primary">
                  {formatPrice(gm.estimatedCommission)}
                </span>
                <div className="text-[10px] text-theme-muted font-medium">
                  {gm.bookedCount} pets booked
                </div>
              </div>
            </div>

            {/* Capacity Progress Bar */}
            <div className="mt-2.5">
              <div className="flex justify-between text-[10px] text-theme-muted mb-1 font-medium">
                <span>Daily Floor Capacity</span>
                <span className="font-bold text-theme-ink">{gm.capacityRate}%</span>
              </div>
              <div className="w-full bg-theme-canvas h-1.5 rounded-full overflow-hidden border border-theme-subtle">
                <div 
                  className="bg-theme-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${gm.capacityRate}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2.5 border-t border-theme-subtle flex items-center justify-between text-xs">
        <span className="text-theme-muted">
          Auto-balances appointments evenly across groomers.
        </span>
        <button
          onClick={() => openModal('staff_new')}
          className="btn-ghost px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Add Stylist
        </button>
      </div>
    </div>
  );
};
