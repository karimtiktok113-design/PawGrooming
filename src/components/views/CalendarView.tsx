import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { isSectionAllowed } from '../../data/permissionPresets';
import { CalendarMode } from '../../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Filter, 
  Calendar as CalendarIcon,
  Printer
} from 'lucide-react';

import { getFixedToday } from '../../data/initialData';

export const CalendarView: React.FC = () => {
  const { 
    calendarMode, 
    setCalendarMode, 
    calendarDate, 
    setCalendarDate, 
    selectedStaffId, 
    setSelectedStaffId, 
    appointments, 
    clients, 
    services, 
    staff, 
    settings,
    openModal 
  } = useApp();
  const { currentProfile } = useAuth();

  const showViewModeToggle = isSectionAllowed(currentProfile?.permissions, 'calendar', 'viewModeToggle');
  const showStaffFilter = isSectionAllowed(currentProfile?.permissions, 'calendar', 'staffFilter');
  const showPrintSchedule = isSectionAllowed(currentProfile?.permissions, 'calendar', 'printSchedule');
  const showAppointmentGrid = isSectionAllowed(currentProfile?.permissions, 'calendar', 'appointmentGrid');

  const openHour = settings?.open ?? 8;
  const closeHour = settings?.close ?? 18;
  const hours = React.useMemo(() => {
    const end = Math.max(openHour + 1, closeHour);
    return Array.from({ length: end - openHour + 1 }, (_, i) => openHour + i);
  }, [openHour, closeHour]);

  // Format YYYY-MM-DD
  const formatISO = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Date Navigation
  const navigateDate = (dir: number) => {
    const next = new Date(calendarDate);
    if (calendarMode === 'day') {
      next.setDate(next.getDate() + dir);
    } else if (calendarMode === 'week') {
      next.setDate(next.getDate() + dir * 7);
    } else {
      next.setMonth(next.getMonth() + dir);
    }
    setCalendarDate(next);
  };

  const setToday = () => {
    setCalendarDate(new Date());
  };

  // Week days starting Monday
  const getWeekDays = (currDate: Date) => {
    const start = new Date(currDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    const monday = new Date(start.setDate(diff));

    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays(calendarDate);

  // Filtered appointments
  const getApptsForDate = (dateISO: string) => {
    return appointments.filter((a) => {
      if (a.date !== dateISO || a.status === 'cancelled') return false;
      if (selectedStaffId !== 'all' && a.staffId !== selectedStaffId) return false;
      return true;
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar: Mode Switcher, Date Nav, Staff Filter */}
      <div className="card-box p-3.5 sm:p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
        {/* Left: Mode Buttons & Today */}
        {showViewModeToggle && (
          <div className="flex items-center justify-between sm:justify-start gap-2 flex-wrap">
            <div className="bg-[#EAE7DC] p-1 rounded-xl flex items-center gap-1">
              {(['day', 'week', 'month'] as CalendarMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setCalendarMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                    calendarMode === mode
                      ? 'bg-[#173E39] text-white shadow-xs'
                      : 'text-[#5C716C] hover:text-[#173E39]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <button
              onClick={setToday}
              className="btn-ghost text-xs px-3 py-1.5 rounded-xl font-bold cursor-pointer"
            >
              Today ({new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
            </button>
          </div>
        )}

        {/* Center: Date Title Navigation */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 font-display text-base sm:text-lg font-bold text-[#173E39] order-first lg:order-none">
          <button
            onClick={() => navigateDate(-1)}
            className="p-1.5 rounded-xl bg-[#EAE7DC] hover:bg-[#D8D3C4] text-[#173E39] transition-colors cursor-pointer"
            aria-label="Previous date"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <span className="text-center px-1">
            {calendarMode === 'month'
              ? calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })
              : calendarMode === 'week'
              ? `${weekDays[0].toLocaleDateString('default', { month: 'short', day: 'numeric' })} - ${weekDays[6].toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}`
              : calendarDate.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>

          <button
            onClick={() => navigateDate(1)}
            className="p-1.5 rounded-xl bg-[#EAE7DC] hover:bg-[#D8D3C4] text-[#173E39] transition-colors cursor-pointer"
            aria-label="Next date"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Right: Staff Filter Selector & Print Schedule Button */}
        <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap sm:flex-nowrap">
          {showStaffFilter && (
            <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
              <Filter className="w-3.5 h-3.5 text-[#5C716C] shrink-0" />
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="text-xs bg-white border border-[#D8D3C4] rounded-xl px-2.5 py-1.5 font-bold outline-none w-full sm:w-auto"
              >
                <option value="all">All Stylists</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showPrintSchedule && (
            <button
              type="button"
              onClick={() => openModal('printScheduleModal', { dateISO: formatISO(calendarDate), staffId: selectedStaffId })}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white border border-[#D8D3C4] hover:bg-[#EAE7DC] text-[#173E39] rounded-xl font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer shrink-0"
              title="Print Daily Schedule PDF"
            >
              <Printer className="w-3.5 h-3.5 text-[#2E8A81]" />
              <span>Print</span>
            </button>
          )}
        </div>
      </div>

      {/* Calendar Body Grid */}
      {showAppointmentGrid && calendarMode === 'week' && (
        <div className="card-box p-0 overflow-hidden border border-[#D8D3C4]">
          <div className="text-[11px] text-[#7A6865] px-4 py-1.5 bg-[#FAF8F5] border-b border-[#D8D3C4] flex items-center justify-between lg:hidden">
            <span>👈 Swipe horizontally to view full week</span>
            <span className="font-bold text-theme-primary">7-Day View</span>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[720px] sm:min-w-[800px]">
              {/* Week Header Days */}
              <div className="grid grid-cols-8 bg-[#EAE7DC] border-b border-[#D8D3C4] text-center font-bold text-xs py-2.5 text-[#173E39]">
                <div className="p-2 border-r border-[#D8D3C4]">Time</div>
                {weekDays.map((d, idx) => {
                  const dateISO = formatISO(d);
                  const isToday = dateISO === formatISO(new Date());
                  return (
                    <div
                      key={idx}
                      className={`p-2 border-r border-[#D8D3C4] last:border-r-0 transition-colors ${
                        isToday ? 'bg-theme-primary text-white font-extrabold rounded-t-lg shadow-sm' : ''
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>{d.toLocaleDateString('default', { weekday: 'short' })}</span>
                        {isToday && (
                          <span className="text-[9px] bg-white text-theme-primary px-1 py-0.2 rounded font-black uppercase">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-extrabold">{d.getDate()}</div>
                    </div>
                  );
                })}
              </div>

              {/* Hours Rows */}
              <div className="divide-y divide-[#D8D3C4]">
                {hours.map((hour) => {
                  const hourStr = String(hour).padStart(2, '0') + ':00';
                  return (
                    <div key={hour} className="grid grid-cols-8 min-h-[65px] sm:min-h-[75px]">
                      {/* Hour Column */}
                      <div className="p-2 text-center text-xs font-bold text-[#5C716C] bg-[#F1EEE6]/50 border-r border-[#D8D3C4] flex items-center justify-center">
                        {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                      </div>

                      {/* 7 Days Grid Cells */}
                      {weekDays.map((d, dIdx) => {
                        const dateISO = formatISO(d);
                        const dayAppts = getApptsForDate(dateISO).filter((a) => {
                          const apptHour = parseInt(a.start.split(':')[0], 10);
                          return apptHour === hour;
                        });

                        return (
                          <div
                            key={dIdx}
                            onClick={() => openModal('appointmentForm', { date: dateISO, start: hourStr })}
                            className="p-1 border-r border-[#D8D3C4] last:border-r-0 hover:bg-[#EAE7DC]/40 cursor-pointer transition-colors relative min-h-[65px] sm:min-h-[75px]"
                          >
                            {dayAppts.map((a) => {
                              const client = clients.find((c) => c.id === a.clientId);
                              const service = services.find((s) => s.id === a.serviceId);
                              const groomer = staff.find((st) => st.id === a.staffId);

                              return (
                                <div
                                  key={a.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openModal('appointmentDetail', { appointment: a });
                                  }}
                                  className="p-1.5 mb-1 rounded-lg text-[11px] text-white shadow-xs font-semibold hover:scale-[1.02] transition-transform cursor-pointer"
                                  style={{ backgroundColor: groomer ? groomer.color : '#2E8A81' }}
                                >
                                  <div className="font-bold truncate">
                                    {a.start} • {client ? client.name : 'Pet'}
                                  </div>
                                  <div className="text-[10px] opacity-90 truncate">
                                    {service?.name}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Day Mode */}
      {showAppointmentGrid && calendarMode === 'day' && (
        <div className="card-box p-3.5 sm:p-5 space-y-3">
          <div className="text-xs sm:text-sm font-bold text-[#173E39] border-b pb-2.5 flex flex-wrap items-center justify-between gap-2">
            <span>
              Schedule for {calendarDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            {formatISO(calendarDate) === formatISO(new Date()) && (
              <span className="bg-theme-primary text-white text-xs px-2.5 py-0.5 rounded-full font-black uppercase shadow-2xs">
                Today
              </span>
            )}
          </div>

          <div className="divide-y divide-[#D8D3C4]">
            {hours.map((hour) => {
              const hourStr = String(hour).padStart(2, '0') + ':00';
              const dateISO = formatISO(calendarDate);
              const appts = getApptsForDate(dateISO).filter((a) => {
                const apptHour = parseInt(a.start.split(':')[0], 10);
                return apptHour === hour;
              });

              return (
                <div key={hour} className="py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4">
                  <div className="w-20 text-xs font-bold text-[#5C716C] pt-0.5 shrink-0">
                    {hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`}
                  </div>

                  <div className="flex-1 flex flex-wrap gap-2 sm:gap-3">
                    {appts.length === 0 ? (
                      <button
                        onClick={() => openModal('appointmentForm', { date: dateISO, start: hourStr })}
                        className="text-xs text-[#5C716C] hover:text-theme-primary py-1 px-3 border border-dashed border-[#D8D3C4] rounded-xl hover:border-theme-primary transition-colors cursor-pointer text-left"
                      >
                        + Book at {hourStr}
                      </button>
                    ) : (
                      appts.map((a) => {
                        const client = clients.find((c) => c.id === a.clientId);
                        const service = services.find((s) => s.id === a.serviceId);
                        const groomer = staff.find((st) => st.id === a.staffId);

                        return (
                          <div
                            key={a.id}
                            onClick={() => openModal('appointmentDetail', { appointment: a })}
                            className="p-3 rounded-xl text-white text-xs font-bold shadow-xs w-full sm:w-auto sm:min-w-[220px] cursor-pointer hover:opacity-95 transition-opacity"
                            style={{ backgroundColor: groomer ? groomer.color : '#2E8A81' }}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span>{a.start} ({a.duration}m)</span>
                              <span className="uppercase text-[9px] bg-white/20 px-1.5 py-0.5 rounded">
                                {a.status}
                              </span>
                            </div>
                            <div className="text-sm font-display mt-1">{client?.name} ({client?.breed})</div>
                            <div className="text-[11px] opacity-90 mt-0.5">{service?.name}</div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Month Mode */}
      {showAppointmentGrid && calendarMode === 'month' && (
        <div className="card-box p-3 sm:p-5">
          <div className="text-center text-xs text-[#5C716C] mb-3">
            Click any day to view detailed appointments for that date.
          </div>
          {/* Responsive month grid representation */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[11px] sm:text-xs font-bold text-[#173E39]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1 text-[#5C716C] font-extrabold">{d}</div>
            ))}
            {/* Generate days for current month view */}
            {Array.from({ length: 31 }, (_, i) => {
              const d = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), i + 1);
              const dateISO = formatISO(d);
              const dayAppts = getApptsForDate(dateISO);
              const isToday = dateISO === formatISO(new Date());

              return (
                <div
                  key={i}
                  onClick={() => {
                    setCalendarDate(d);
                    setCalendarMode('day');
                  }}
                  className={`p-1.5 sm:p-3 rounded-xl border transition-all min-h-[55px] sm:min-h-[70px] flex flex-col justify-between text-left cursor-pointer hover:bg-[#EAE7DC]/50 ${
                    isToday 
                      ? 'bg-theme-primary/10 border-theme-primary border-2 ring-2 ring-theme-primary/30 shadow-2xs font-extrabold' 
                      : 'border-[#D8D3C4] bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${isToday ? 'text-theme-primary text-xs sm:text-sm' : 'text-[#173E39]'}`}>
                      {i + 1}
                    </span>
                    {isToday && (
                      <span className="hidden sm:inline text-[9px] bg-theme-primary text-white font-black px-1.5 py-0.5 rounded-md uppercase">
                        Today
                      </span>
                    )}
                  </div>
                  {dayAppts.length > 0 && (
                    <div className="text-[9px] sm:text-[10px] bg-[#2E8A81] text-white font-bold px-1 sm:px-1.5 py-0.5 rounded-full text-center truncate">
                      {dayAppts.length} <span className="hidden sm:inline">grooms</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
