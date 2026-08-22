import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { isSectionAllowed } from '../../data/permissionPresets';
import { 
  Dog, 
  Phone, 
  Mail, 
  MapPin, 
  Award, 
  AlertTriangle, 
  Plus, 
  Calendar, 
  Edit, 
  Trash2, 
  Send,
  History
} from 'lucide-react';

export const ClientsView: React.FC = () => {
  const { 
    clients, 
    appointments, 
    services, 
    openModal, 
    deleteClient, 
    confirmDelete,
    searchQuery, 
    setSearchQuery 
  } = useApp();
  const { currentProfile } = useAuth();

  const showSearchAndFilters = isSectionAllowed(currentProfile?.permissions, 'clients', 'searchAndFilters');
  const showClientsList = isSectionAllowed(currentProfile?.permissions, 'clients', 'clientsList');
  const showAddClientButton = isSectionAllowed(currentProfile?.permissions, 'clients', 'addClientButton');

  const [filterType, setFilterType] = useState<string>('all');

  // Today reference
  const today = new Date(2026, 7, 12);

  // Filter & Search Logic
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      // Search matches pet name, owner, phone, email, breed
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !q || 
        c.name.toLowerCase().includes(q) ||
        c.owner.toLowerCase().includes(q) ||
        c.breed.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // Filter options
      if (filterType === 'matting') {
        return c.coat.toLowerCase().includes('matting') || c.coat.toLowerCase().includes('tangles');
      }
      if (filterType === 'behavior') {
        return c.behaviorNotes && c.behaviorNotes.length > 0;
      }
      if (filterType === 'rabies') {
        if (!c.rabiesExpiry) return false;
        const exp = new Date(c.rabiesExpiry);
        const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return diffDays <= 30; // Expired or expiring within 30 days
      }

      return true;
    });
  }, [clients, searchQuery, filterType]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Filter Bar */}
      {(showSearchAndFilters || showAddClientButton) && (
        <div className="card-box p-3.5 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          {/* Filter Pills */}
          {showSearchAndFilters && (
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-nowrap sm:flex-wrap">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterType === 'all'
                    ? 'bg-theme-primary text-white shadow-xs'
                    : 'bg-[#EAE7DC] text-[#5C716C] hover:text-[#173E39]'
                }`}
              >
                All Pets ({clients.length})
              </button>
              <button
                onClick={() => setFilterType('rabies')}
                className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterType === 'rabies'
                    ? 'bg-[#C9503A] text-white shadow-xs'
                    : 'bg-[#FEF2F2] text-[#C9503A] hover:bg-[#FCE7F3]'
                }`}
              >
                ⚠️ Vaccines
              </button>
              <button
                onClick={() => setFilterType('behavior')}
                className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterType === 'behavior'
                    ? 'bg-[#E7A93C] text-white shadow-xs'
                    : 'bg-[#FFFBEB] text-[#9A6E1B]'
                }`}
              >
                🐾 Care Notes
              </button>
              <button
                onClick={() => setFilterType('matting')}
                className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  filterType === 'matting'
                    ? 'bg-[#2E8A81] text-white shadow-xs'
                    : 'bg-[#EAE7DC] text-[#5C716C]'
                }`}
              >
                ✂️ Coat Matting
              </button>
            </div>
          )}

          {/* Add Client Button */}
          {showAddClientButton && (
            <button
              onClick={() => openModal('clientForm')}
              className="btn-primary text-xs px-4 py-2 rounded-full flex items-center justify-center gap-1.5 font-bold shadow-md cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" /> Add Pet & Client
            </button>
          )}
        </div>
      )}

      {/* Clients Cards Grid */}
      {showClientsList && (
        filteredClients.length === 0 ? (
          <div className="card-box p-8 sm:p-12 text-center text-[#5C716C]">
            No client or pet records found matching search or filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredClients.map((client) => {
            // Check Rabies expiry
            const rabiesDate = client.rabiesExpiry ? new Date(client.rabiesExpiry) : null;
            const daysToRabies = rabiesDate
              ? Math.ceil((rabiesDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
              : 999;
            const isRabiesExpired = daysToRabies < 0;
            const isRabiesWarning = daysToRabies >= 0 && daysToRabies <= 30;

            // Client grooming history count
            const historyList = appointments.filter(
              (a) => a.clientId === client.id && a.status === 'completed'
            );

            return (
              <div
                key={client.id}
                className="card-box flex flex-col justify-between space-y-4 hover:border-[#2E8A81] transition-all"
              >
                {/* Header: Pet Name, Breed, Points */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Dog className="w-5 h-5 text-[#2E8A81]" />
                        <h3 className="font-display font-bold text-xl text-[#173E39]">
                          {client.name}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAE7DC] text-[#5C716C] uppercase">
                          {client.size}
                        </span>
                      </div>
                      <div className="text-xs text-[#2E8A81] font-bold mt-0.5">
                        {client.breed}
                      </div>
                    </div>

                    {/* Loyalty Points Badge */}
                    <div className="bg-[#E7A93C]/10 text-[#C98A22] border border-[#E7A93C]/30 px-2.5 py-1 rounded-xl text-center">
                      <div className="text-[10px] uppercase font-extrabold flex items-center gap-1">
                        <Award className="w-3 h-3" /> {client.points || 0} pts
                      </div>
                    </div>
                  </div>

                  {/* Owner & Contact */}
                  <div className="mt-3 pt-3 border-t border-[#D8D3C4] space-y-1 text-xs text-[#5C716C]">
                    <div className="font-bold text-[#173E39] text-sm">Owner: {client.owner}</div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#2E8A81]" />
                      <a href={`tel:${client.phone}`} className="hover:underline text-[#173E39]">
                        {client.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#2E8A81]" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  </div>

                  {/* Coat & Style Notes */}
                  <div className="mt-3 bg-[#F1EEE6] p-2.5 rounded-xl space-y-1 text-xs">
                    <div>
                      <span className="font-bold text-[#173E39]">Coat: </span>
                      <span className="text-[#5C716C]">{client.coat}</span>
                    </div>
                    {client.lastCut && (
                      <div>
                        <span className="font-bold text-[#173E39]">Last Cut Style: </span>
                        <span className="text-[#5C716C] italic">{client.lastCut}</span>
                      </div>
                    )}
                  </div>

                  {/* Care Notes & Sensitivities */}
                  {(() => {
                    const sensitivitiesList: string[] = Array.isArray(client.sensitivities)
                      ? (client.sensitivities as string[])
                      : typeof client.sensitivities === 'string' && client.sensitivities.trim()
                      ? client.sensitivities.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)
                      : [];

                    const hasCareInfo = sensitivitiesList.length > 0 || client.allergies || client.careNotes || client.medicalNotes;
                    if (!hasCareInfo) return null;

                    return (
                      <div className="mt-2 bg-[#FFF3EB] border border-[#FFD0B3] p-2.5 rounded-xl space-y-1.5 text-xs text-[#541900]">
                        <div className="font-extrabold text-[11px] flex items-center gap-1 text-[#FF6B00]">
                          <span>🛡️ Pet Care Notes & Sensitivities</span>
                        </div>
                        {sensitivitiesList.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {sensitivitiesList.map((s, sIdx) => (
                              <span key={sIdx} className="bg-[#FFE4D3] text-[#541900] px-2 py-0.5 rounded-md font-bold text-[10px]">
                                ⚠️ {s}
                              </span>
                            ))}
                          </div>
                        )}
                        {client.allergies && (
                          <div>
                            <span className="font-bold text-[#541900]">Allergies: </span>
                            <span className="text-[#7A2E00]">{client.allergies}</span>
                          </div>
                        )}
                        {client.careNotes && (
                          <div>
                            <span className="font-bold text-[#541900]">Care Instructions: </span>
                            <span className="text-[#7A2E00]">{client.careNotes}</span>
                          </div>
                        )}
                        {client.medicalNotes && (
                          <div>
                            <span className="font-bold text-[#541900]">Medical: </span>
                            <span className="text-[#7A2E00]">{client.medicalNotes}</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Behavioral Warnings */}
                  {(() => {
                    const behaviorList: string[] = Array.isArray(client.behaviorNotes)
                      ? client.behaviorNotes
                      : typeof client.behaviorNotes === 'string' && (client.behaviorNotes as string).trim()
                      ? [(client.behaviorNotes as string).trim()]
                      : [];

                    if (behaviorList.length === 0) return null;

                    return (
                      <div className="mt-2 text-xs bg-[#FEF2F2] border border-[#E7C0B5] text-[#991B1B] p-2 rounded-xl font-semibold flex items-start gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-[#C9503A] flex-none mt-0.5" />
                        <div>{behaviorList.join(', ')}</div>
                      </div>
                    );
                  })()}

                  {/* Vaccine Status & Schedule Tag */}
                  <div className="mt-3 bg-[#FFF8E7] border border-[#FFE7B3] p-2.5 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#240C0B] font-bold flex items-center gap-1">
                        <span>Rabies / Vaccine:</span>
                      </span>
                      {isRabiesExpired ? (
                        <span className="bg-[#FEF2F2] text-[#C9503A] font-extrabold px-2.5 py-0.5 rounded-full text-[10px]">
                          EXPIRED ({client.rabiesExpiry})
                        </span>
                      ) : isRabiesWarning ? (
                        <span className="bg-[#FFFBEB] text-[#9A6E1B] font-extrabold px-2.5 py-0.5 rounded-full text-[10px]">
                          EXPIRING SOON ({client.rabiesExpiry})
                        </span>
                      ) : (
                        <span className="bg-[#E1F0E7] text-[#357A54] font-extrabold px-2.5 py-0.5 rounded-full text-[10px]">
                          ACTIVE ({client.rabiesExpiry})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#FFE7B3]/60 text-[11px]">
                      <span className="text-[#A08E8B]">
                        {client.vaccinationSchedule?.length
                          ? `${client.vaccinationSchedule.length} Vaccine Schedules Recorded`
                          : 'No custom schedule'}
                      </span>
                      <button
                        onClick={() => openModal('vaccineScheduleForm', { clientId: client.id })}
                        className="text-[#FF6B00] hover:text-[#E55C00] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add Vaccine
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-3 border-t border-[#D8D3C4] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal('appointmentForm', { clientId: client.id })}
                      className="btn-teal text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 font-bold"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Book
                    </button>
                    <button
                      onClick={() => openModal('clientHistory', { client })}
                      className="btn-ghost text-xs px-2.5 py-1.5 rounded-xl"
                      title="View Grooming History"
                    >
                      <History className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal('clientForm', { client })}
                      className="p-1.5 text-[#5C716C] hover:text-[#2E8A81] rounded-lg"
                      title="Edit Client"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        confirmDelete({
                          title: 'Delete Pet & Client Record',
                          message: `Are you sure you want to delete ${client.name} (${client.breed}) and all associated records?`,
                          confirmLabel: 'Delete Record',
                          onConfirm: () => deleteClient(client.id),
                        });
                      }}
                      className="p-1.5 text-[#5C716C] hover:text-[#C9503A] rounded-lg"
                      title="Delete Client"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};
