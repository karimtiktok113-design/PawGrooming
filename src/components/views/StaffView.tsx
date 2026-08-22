import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { isSectionAllowed } from '../../data/permissionPresets';
import { Staff } from '../../types';
import { UserCheck, Calendar, DollarSign, Plus, Edit, Trash2, Clock } from 'lucide-react';

export const StaffView: React.FC = () => {
  const { staff, services, appointments, openModal, deleteStaff, confirmDelete } = useApp();
  const { currentProfile } = useAuth();

  const showStaffList = isSectionAllowed(currentProfile?.permissions, 'staff', 'staffList');
  const showAddStaffButton = isSectionAllowed(currentProfile?.permissions, 'staff', 'addStaffButton');
  const showScheduleEditor = isSectionAllowed(currentProfile?.permissions, 'staff', 'scheduleEditor');
  const showPerformanceMetrics = isSectionAllowed(currentProfile?.permissions, 'staff', 'performanceMetrics');

  const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="card-box p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-lg text-[#173E39]">
            Grooming Team & Stylists
          </h2>
          <p className="text-xs text-[#5C716C]">
            Manage groomer schedules, commission rates, and assigned service qualifications.
          </p>
        </div>

        {showAddStaffButton && (
          <button
            onClick={() => openModal('staffForm')}
            className="btn-primary text-xs px-4 py-2 rounded-full flex items-center gap-1.5 font-bold shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Stylist
          </button>
        )}
      </div>

      {/* Staff Cards */}
      {showStaffList && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {staff.map((st) => {
            // Calculate monthly appt count and revenue
            const staffAppts = appointments.filter(
              (a) => a.staffId === st.id && a.status === 'completed' && a.date.startsWith('2026-08')
            );
            const totalRev = staffAppts.reduce((sum, a) => sum + a.price + (a.retail || 0), 0);
            const commissionPayout = st.commission ? (totalRev * st.commission) / 100 : st.salary || 0;

            return (
              <div
                key={st.id}
                className="card-box p-5 flex flex-col justify-between space-y-4 hover:border-[#2E8A81] transition-all"
              >
                <div>
                  {/* Header with Avatar Color */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-display font-bold text-lg shadow-sm"
                        style={{ backgroundColor: st.color }}
                      >
                        {st.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-xl text-[#173E39]">
                          {st.name}
                        </h3>
                        <div className="text-xs font-bold text-[#2E8A81]">
                          {st.role}
                        </div>
                      </div>
                    </div>

                    {st.commission > 0 && (
                      <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#E1ECF0] text-[#3A6B7C]">
                        {st.commission}% Commission
                      </span>
                    )}
                  </div>

                  {/* Monthly Stats Summary */}
                  {showPerformanceMetrics && (
                    <div className="grid grid-cols-2 gap-3 mt-4 bg-[#F1EEE6] p-3 rounded-xl text-xs">
                      <div>
                        <div className="text-[#5C716C] font-semibold">August Grooms Done</div>
                        <div className="font-display font-bold text-base text-[#173E39]">
                          {staffAppts.length} sessions
                        </div>
                      </div>
                      <div>
                        <div className="text-[#5C716C] font-semibold">Est. Payout</div>
                        <div className="font-display font-bold text-base text-[#3E9B6E]">
                          ${Number(commissionPayout || 0).toFixed(0)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Weekly Availability Schedule */}
                  {showScheduleEditor && (
                    <div className="mt-4 space-y-1.5">
                      <div className="text-xs font-bold text-[#173E39] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#2E8A81]" /> Weekly Hours:
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                        {[1, 2, 3, 4, 5, 6, 0].map((dIdx) => {
                          const hours = st.avail ? st.avail[dIdx] : null;
                          return (
                            <div
                              key={dIdx}
                              className={`p-1.5 rounded-lg font-bold border ${
                                hours
                                  ? 'bg-white border-[#D8D3C4] text-[#173E39]'
                                  : 'bg-[#EAE7DC]/40 border-transparent text-[#5C716C] line-through'
                              }`}
                            >
                              <div>{daysMap[dIdx]}</div>
                              <div className="text-[9px] mt-0.5">
                                {hours ? `${hours[0]}-${hours[1]}` : 'Off'}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-[#D8D3C4] flex items-center justify-between">
                  <span className="text-xs text-[#5C716C]">
                    Qualified for <strong className="text-[#173E39]">{st.services.length}</strong> services
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal('staffForm', { staff: st })}
                      className="p-1.5 text-[#5C716C] hover:text-[#2E8A81] rounded-lg"
                      title="Edit Staff"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        confirmDelete({
                          title: 'Remove Staff Member',
                          message: `Are you sure you want to remove ${st.name} from the active staff list?`,
                          confirmLabel: 'Remove Staff',
                          onConfirm: () => deleteStaff(st.id),
                        });
                      }}
                      className="p-1.5 text-[#5C716C] hover:text-[#C9503A] rounded-lg"
                      title="Delete Staff"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
