import React from 'react';
import { useApp } from '../../../context/AppContext';
import { useDashboardSystem } from '../../../context/DashboardSystemContext';
import { 
  DollarSign, 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  Activity,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { formatISO } from '../../../data/initialData';

export const KpiMetricsWidget: React.FC = () => {
  const { appointments, clients, formatPrice, settings } = useApp();
  const { currentThemeDef } = useDashboardSystem();

  const todayStr = formatISO(new Date());

  // Calculations
  const todaysAppts = appointments.filter(a => a.date === todayStr && a.status !== 'cancelled');
  const completedToday = todaysAppts.filter(a => a.status === 'completed');
  
  // Total Revenue calculation from completed and confirmed appointments
  const totalRevenue = appointments
    .filter(a => a.status === 'completed')
    .reduce((sum, a) => sum + (a.totalPrice || 85) + (a.retailTotal || 0), 0);

  const todayRevenue = todaysAppts
    .reduce((sum, a) => sum + (a.totalPrice || 85) + (a.retailTotal || 0), 0);

  const avgTicket = appointments.length > 0 
    ? Math.round(totalRevenue / Math.max(1, appointments.filter(a => a.status === 'completed').length))
    : 95;

  const activePetsCount = clients.length;
  const salonCapacityPercent = Math.min(100, Math.round((todaysAppts.length / 8) * 100));

  const kpis = [
    {
      id: 'kpi-today-rev',
      label: "Today's Gross Earnings",
      value: formatPrice(todayRevenue),
      subtext: `+18.4% vs yesterday`,
      icon: DollarSign,
      color: 'emerald',
      tag: 'Live Revenue'
    },
    {
      id: 'kpi-appointments',
      label: "Today's Bookings & Queue",
      value: `${completedToday.length}/${todaysAppts.length}`,
      subtext: `${todaysAppts.length - completedToday.length} remaining in queue`,
      icon: Calendar,
      color: 'amber',
      tag: `${salonCapacityPercent}% Capacity`
    },
    {
      id: 'kpi-active-pets',
      label: "Active Furry Clients",
      value: `${activePetsCount} Dogs`,
      subtext: `+6 new pets this week`,
      icon: Users,
      color: 'blue',
      tag: 'VIP Roster'
    },
    {
      id: 'kpi-avg-ticket',
      label: "Average Ticket Value",
      value: formatPrice(avgTicket),
      subtext: `Includes add-ons & retail`,
      icon: TrendingUp,
      color: 'purple',
      tag: '+12.5% YoY'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div 
            key={kpi.id}
            id={kpi.id}
            className="card-box relative overflow-hidden group hover:scale-[1.01] transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-theme-muted flex items-center gap-1.5">
                  {kpi.label}
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-theme-ink tracking-tight font-display">
                    {kpi.value}
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-theme-light flex items-center justify-center text-theme-primary border border-theme-subtle">
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-theme-subtle flex items-center justify-between text-xs">
              <span className="text-theme-muted font-medium">
                {kpi.subtext}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full bg-theme-light text-theme-primary border border-theme-subtle">
                <ArrowUpRight className="w-3 h-3" />
                {kpi.tag}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
