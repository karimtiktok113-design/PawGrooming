import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { isSectionAllowed } from '../../data/permissionPresets';
import { AlertTriangle, Send, Phone, ShieldAlert, Plus, Trash2, Calendar, CheckCircle2 } from 'lucide-react';

export const AlertsView: React.FC = () => {
  const { clients, settings, openModal, deleteVaccineRecord } = useApp();
  const { currentProfile } = useAuth();

  const showVaccineAlerts = isSectionAllowed(currentProfile?.permissions, 'alerts', 'vaccineAlerts');
  const showAutomatedTriggers = isSectionAllowed(currentProfile?.permissions, 'alerts', 'automatedTriggers');
  const showNotificationComposer = isSectionAllowed(currentProfile?.permissions, 'alerts', 'notificationComposer');

  const today = new Date();

  // Categorize Vaccine Expiry
  const alertsList = React.useMemo(() => {
    return clients
      .map((c) => {
        if (!c.rabiesExpiry) return null;
        const exp = new Date(c.rabiesExpiry);
        const daysTo = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));
        if (daysTo <= 30) {
          return {
            client: c,
            daysTo,
            isExpired: daysTo < 0,
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => (a?.daysTo || 0) - (b?.daysTo || 0));
  }, [clients]);

  // Aggregate all pet vaccination schedule records across all clients
  const allVaccines = React.useMemo(() => {
    const records: Array<{ client: typeof clients[0]; vax: NonNullable<typeof clients[0]['vaccinationSchedule']>[0] }> = [];
    clients.forEach((c) => {
      if (c.vaccinationSchedule && c.vaccinationSchedule.length > 0) {
        c.vaccinationSchedule.forEach((v) => {
          records.push({ client: c, vax: v });
        });
      }
    });
    return records;
  }, [clients]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Banner with Shop & Owner Display + Add Vaccination Schedule Button */}
      <div className="card-box bg-gradient-to-r from-[#FEF2F2] via-[#FFFBEB] to-[#FFF8E7] border border-[#E7C0B5] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-theme-primary/10 text-theme-primary flex items-center justify-center font-bold shrink-0 border border-theme-primary/20">
            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="font-display font-bold text-base sm:text-lg text-[#240C0B]">
                Vaccination & Health Alert Radar
              </h2>
              <span className="text-[10px] bg-theme-primary/10 text-theme-primary font-extrabold px-2 py-0.5 rounded-full border border-theme-primary/20">
                {settings.salonName || 'PawBook Studio'}
              </span>
            </div>
            <p className="text-xs text-[#5C716C]">
              Managed by Owner: <strong className="text-[#240C0B]">{settings.name || 'FAHD ABRAR'}</strong> • Ensure pet vaccination schedules are up to date prior to grooming appointments.
            </p>
          </div>
        </div>

        <button
          onClick={() => openModal('vaccineScheduleForm')}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-theme-primary hover:opacity-90 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer whitespace-nowrap self-stretch sm:self-start md:self-center shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vaccination Schedule</span>
        </button>
      </div>

      {/* Upcoming & Expired Vaccine Warnings */}
      {showVaccineAlerts && (
        <div className="card-box space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-[#240C0B] flex items-center gap-2">
              <span>Critical Vaccine Warnings</span>
              <span className="text-xs bg-[#FEF2F2] text-[#C9503A] font-extrabold px-2.5 py-0.5 rounded-full border border-[#C9503A]/20">
                {alertsList.length} Action Needed
              </span>
            </h3>
            <span className="text-xs text-[#A08E8B]">Shop: {settings.salonName}</span>
          </div>

          {alertsList.length === 0 ? (
            <div className="p-8 text-center text-[#5C716C] text-xs bg-[#F1EEE6]/50 rounded-2xl border border-dashed border-[#D8D3C4]">
              🎉 All registered pets have up-to-date rabies vaccinations!
            </div>
          ) : (
            <div className="divide-y divide-[#E8E1D1]">
              {alertsList.map((item) => {
                if (!item) return null;
                const { client, daysTo, isExpired } = item;

                return (
                  <div key={client.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl flex items-center justify-center font-bold ${
                        isExpired ? 'bg-[#FEF2F2] text-[#C9503A]' : 'bg-[#FFFBEB] text-[#9A6E1B]'
                      }`}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-base text-[#240C0B]">
                            {client.name}
                          </span>
                          <span className="text-[10px] bg-[#EAE7DC] text-[#5C716C] px-2 py-0.5 rounded-full">
                            {client.breed}
                          </span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isExpired ? 'bg-[#FEF2F2] text-[#C9503A]' : 'bg-[#FFFBEB] text-[#9A6E1B]'
                          }`}>
                            {isExpired ? `EXPIRED (${Math.abs(daysTo)} days ago)` : `Expires in ${daysTo} days`}
                          </span>
                        </div>

                        <div className="text-[#5C716C] mt-1">
                          Owner: <strong className="text-[#240C0B]">{client.owner}</strong> • Phone: {client.phone} • Email: {client.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <a
                        href={`tel:${client.phone}`}
                        className="px-3 py-1.5 bg-[#F1EEE6] hover:bg-[#E8E1D1] text-[#240C0B] rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#FF6B00]" /> Call
                      </a>
                      {showNotificationComposer && (
                        <button
                          onClick={() => openModal('reminderModal', { client, alertType: 'vaccine' })}
                          className="px-3.5 py-1.5 bg-[#FF6B00] hover:bg-[#E55C00] text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" /> Send Reminder
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Full Pet Vaccination Schedule Overview */}
      {showAutomatedTriggers && (
        <div className="card-box space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E8E1D1]">
            <div>
              <h3 className="font-display font-bold text-lg text-[#240C0B]">
                Active Pet Vaccination Schedules
              </h3>
              <p className="text-xs text-[#A08E8B]">
                Comprehensive medical immunization schedule maintained by {settings.salonName || 'PawBook Pro'} ({settings.name || 'Owner'})
              </p>
            </div>
            <button
              onClick={() => openModal('vaccineScheduleForm')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF8E7] hover:bg-[#FFE7B3] text-[#FF6B00] border border-[#FFE7B3] rounded-xl text-xs font-bold transition-all cursor-pointer self-start sm:self-center"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule New Vaccine</span>
            </button>
          </div>

          {allVaccines.length === 0 ? (
            <div className="p-8 text-center space-y-2 bg-[#FFFDF9] rounded-2xl border border-dashed border-[#D8D3C4]">
              <p className="text-xs text-[#5C716C]">No specific custom vaccine schedule records added yet.</p>
              <button
                onClick={() => openModal('vaccineScheduleForm')}
                className="px-4 py-2 bg-[#FF6B00] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-[#E55C00] transition-colors inline-flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add First Vaccination Schedule
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allVaccines.map(({ client, vax }) => {
                const expDate = new Date(vax.nextDueDate);
                const daysLeft = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
                const isPast = daysLeft < 0;
                const isDueSoon = daysLeft >= 0 && daysLeft <= 30;

                return (
                  <div
                    key={vax.id}
                    className="bg-[#FFFDF9] border border-[#E8E1D1] rounded-2xl p-4 space-y-2 hover:border-[#FF6B00] transition-colors relative group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-sm text-[#240C0B]">
                            {client.name}
                          </span>
                          <span className="text-[10px] bg-[#F1EEE6] text-[#5C716C] px-2 py-0.5 rounded-md font-medium">
                            {client.breed}
                          </span>
                        </div>
                        <div className="text-xs text-[#A08E8B] mt-0.5">
                          Owner: <strong className="text-[#240C0B]">{client.owner}</strong>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                          isPast
                            ? 'bg-[#FEF2F2] text-[#C9503A] border border-[#C9503A]/20'
                            : isDueSoon
                            ? 'bg-[#FFFBEB] text-[#9A6E1B] border border-[#9A6E1B]/20'
                            : 'bg-[#F0FDF4] text-[#166534] border border-[#166534]/20'
                        }`}
                      >
                        {isPast ? 'EXPIRED' : isDueSoon ? 'DUE SOON' : 'UP TO DATE'}
                      </span>
                    </div>

                    <div className="bg-[#F1EEE6]/60 p-2.5 rounded-xl space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#240C0B]">{vax.vaccineName}</span>
                        {vax.batchNo && (
                          <span className="text-[10px] font-mono text-[#A08E8B]">Lot: {vax.batchNo}</span>
                        )}
                      </div>
                      <div className="flex justify-between text-[11px] text-[#5C716C]">
                        <span>Administered: {vax.dateAdministered || 'N/A'}</span>
                        <span className="font-semibold text-[#240C0B]">
                          Next Due: {vax.nextDueDate}
                        </span>
                      </div>
                      {vax.veterinarian && (
                        <div className="text-[11px] text-[#A08E8B] pt-0.5 border-t border-[#D8D3C4]/50">
                          Clinic: {vax.veterinarian}
                        </div>
                      )}
                      {vax.notes && (
                        <div className="text-[11px] text-[#5C716C] italic pt-0.5">
                          "{vax.notes}"
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-[#A08E8B]">
                        Verified by {settings.salonName || 'Shop'}
                      </span>
                      <button
                        onClick={() => deleteVaccineRecord(client.id, vax.id)}
                        className="text-xs text-[#C9503A] hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer opacity-80 hover:opacity-100"
                        title="Delete Vaccine Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
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
