import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { isSectionAllowed } from '../../data/permissionPresets';
import { Service, Package } from '../../types';
import { 
  Scissors, 
  Clock, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Package as PackageIcon, 
  Sparkles 
} from 'lucide-react';

export const ServicesView: React.FC = () => {
  const { 
    services, 
    packages, 
    staff, 
    openModal, 
    deleteService, 
    deletePackage, 
    confirmDelete,
    searchQuery,
    formatPrice 
  } = useApp();
  const { currentProfile } = useAuth();

  const showServicesGrid = isSectionAllowed(currentProfile?.permissions, 'services', 'servicesGrid');
  const showAddServiceButton = isSectionAllowed(currentProfile?.permissions, 'services', 'addServiceButton');
  const showPackagesSection = isSectionAllowed(currentProfile?.permissions, 'services', 'packagesSection');

  // Category label map
  const catLabels: Record<string, string> = {
    fullgroom: 'Full Grooming Packages',
    bath: 'Bath & Brush Services',
    tidy: 'Tidy & Face Trim',
    deshed: 'De-shedding Treatments',
    nails: 'Nail Trimming & Grinding',
    puppy: 'Puppy First Grooming',
    addon: 'Add-on Spa Treatments',
  };

  // Group services by category
  const groupedServices = React.useMemo(() => {
    const q = searchQuery.toLowerCase();
    const map: Record<string, Service[]> = {};

    services.forEach((s) => {
      if (q && !s.name.toLowerCase().includes(q) && !s.category.toLowerCase().includes(q)) {
        return;
      }
      if (!map[s.category]) map[s.category] = [];
      map[s.category].push(s);
    });

    return map;
  }, [services, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Top Action Header */}
      <div className="card-box p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-lg text-[#173E39]">
            Grooming Service Menu & Pricing
          </h2>
          <p className="text-xs text-[#5C716C]">
            Configure standard service durations, prices, and qualified stylists.
          </p>
        </div>

        {showAddServiceButton && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openModal('packageForm')}
              className="btn-ghost text-xs px-3.5 py-2 rounded-full flex items-center gap-1.5 font-bold"
            >
              <PackageIcon className="w-4 h-4 text-[#8B6D9C]" /> + Add Spa Package
            </button>
            <button
              onClick={() => openModal('serviceForm')}
              className="btn-primary text-xs px-4 py-2 rounded-full flex items-center gap-1.5 font-bold shadow-md"
            >
              <Plus className="w-4 h-4" /> + Add Service
            </button>
          </div>
        )}
      </div>

      {/* Spa Package Bundles */}
      {showPackagesSection && packages.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display font-bold text-lg text-[#173E39] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#E7A93C]" />
            Featured Spa Package Bundles
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="card-box bg-gradient-to-br from-[#FFFBEB] to-[#F1EEE6] border border-[#E7A93C]/40 p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-lg text-[#173E39]">
                      {pkg.name}
                    </span>
                    <span className="text-lg font-display font-bold text-[#E8734A]">
                      {formatPrice(pkg.price)}
                    </span>
                  </div>

                  <div className="text-xs text-[#5C716C] mt-2 space-y-1">
                    <div className="flex items-center gap-1 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-[#2E8A81]" /> Duration: {pkg.duration} mins
                    </div>
                    <div>
                      Includes: {' '}
                      <span className="font-semibold text-[#173E39]">
                        {pkg.serviceIds
                          .map((sid) => services.find((s) => s.id === sid)?.name)
                          .filter(Boolean)
                          .join(' + ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#D8D3C4] flex items-center justify-between">
                  <button
                    onClick={() => openModal('appointmentForm', { packageId: pkg.id, notes: `Booked Spa Package: ${pkg.name}` })}
                    className="btn-primary text-xs px-3.5 py-1.5 rounded-full font-bold shadow-xs cursor-pointer"
                  >
                    Book This Package
                  </button>
                  <button
                    onClick={() => {
                      confirmDelete({
                        title: 'Delete Spa Package',
                        message: `Are you sure you want to delete package "${pkg.name}"?`,
                        confirmLabel: 'Delete Package',
                        onConfirm: () => deletePackage(pkg.id),
                      });
                    }}
                    className="p-1.5 text-[#5C716C] hover:text-[#C9503A] rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categorized Services List */}
      {showServicesGrid && (
        <div className="space-y-6">
        {Object.keys(catLabels).map((catKey) => {
          const list = groupedServices[catKey];
          if (!list || list.length === 0) return null;

          return (
            <div key={catKey} className="space-y-3">
              <h3 className="font-display font-bold text-base text-[#173E39] border-b border-[#D8D3C4] pb-1 flex items-center gap-2">
                <Scissors className="w-4 h-4 text-[#2E8A81]" />
                {catLabels[catKey] || catKey}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map((s) => {
                  const qualifiedGroomers = staff.filter((st) => s.staffIds.includes(st.id));

                  return (
                    <div
                      key={s.id}
                      className="card-box p-4 flex flex-col justify-between hover:border-[#2E8A81] transition-all"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-display font-bold text-base text-[#173E39]">
                            {s.name}
                          </h4>
                          <span className="text-lg font-display font-bold text-[#2E8A81]">
                            ${s.price}
                          </span>
                        </div>

                        <div className="mt-3 text-xs text-[#5C716C] space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-[#2E8A81]" />
                            <span>
                              {s.duration} mins {s.buffer > 0 ? `(+${s.buffer}m buffer)` : ''}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <span className="text-[11px] font-semibold">Qualified:</span>
                            {qualifiedGroomers.map((st) => (
                              <span
                                key={st.id}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                                style={{ backgroundColor: st.color }}
                              >
                                {st.name.split(' ')[0]}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="mt-4 pt-3 border-t border-[#D8D3C4] flex items-center justify-between">
                        <button
                          onClick={() => openModal('appointmentForm', { serviceId: s.id })}
                          className="btn-teal text-xs px-3 py-1 rounded-lg font-bold"
                        >
                          Book Service
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openModal('serviceForm', { service: s })}
                            className="p-1.5 text-[#5C716C] hover:text-[#2E8A81] rounded-lg"
                            title="Edit Service"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              confirmDelete({
                                title: 'Delete Grooming Service',
                                message: `Are you sure you want to delete service "${s.name}"?`,
                                confirmLabel: 'Delete Service',
                                onConfirm: () => deleteService(s.id),
                              });
                            }}
                            className="p-1.5 text-[#5C716C] hover:text-[#C9503A] rounded-lg"
                            title="Delete Service"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
