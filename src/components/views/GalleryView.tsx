import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { isSectionAllowed } from '../../data/permissionPresets';
import { Sparkles, Plus, Trash2, Camera, Scissors, Search, Share2 } from 'lucide-react';
import { motion } from 'motion/react';

export const GalleryView: React.FC = () => {
  const { transformations, openModal, deleteTransformation, confirmDelete, showToast } = useApp();
  const { currentProfile } = useAuth();

  const showTransformationsGrid = isSectionAllowed(currentProfile?.permissions, 'gallery', 'transformationsGrid');
  const showUploadPhotoBtn = isSectionAllowed(currentProfile?.permissions, 'gallery', 'uploadPhotoBtn');
  const showCategoryFilters = isSectionAllowed(currentProfile?.permissions, 'gallery', 'categoryFilters');
  const showPortfolioShare = isSectionAllowed(currentProfile?.permissions, 'gallery', 'portfolioShare');

  const [filterBreed, setFilterBreed] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const breeds = Array.from(new Set(transformations.map((t) => t.breed)));

  const filteredTransformations = React.useMemo(() => {
    return transformations.filter((t) => {
      if (filterBreed !== 'all' && t.breed !== filterBreed) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.petName.toLowerCase().includes(q) ||
          t.breed.toLowerCase().includes(q) ||
          t.ownerName.toLowerCase().includes(q) ||
          t.groomerName.toLowerCase().includes(q) ||
          t.styleNotes.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [transformations, filterBreed, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-[28px] border border-[#E6DFD5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FFF3EB] text-[#FF6B00] flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <h1 className="font-display font-black text-2xl text-[#240C0B]">
              Dog Transformation Gallery
            </h1>
          </div>
          <p className="text-xs text-[#7A6865] font-semibold mt-1">
            Real before & after grooming transformations, blade length notes, and scissored head styles.
          </p>
        </div>

        {showUploadPhotoBtn && (
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => openModal('transformationForm')}
              className="px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E55C00] text-white text-xs font-black rounded-full shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Transformation Photo
            </button>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      {showCategoryFilters && (
        <div className="bg-white p-4 rounded-2xl border border-[#E6DFD5] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A08E8B]" />
            <input
              type="text"
              placeholder="Search dog, owner, or cut style..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#E6DFD5] rounded-xl outline-none text-[#240C0B] placeholder:text-[#A08E8B] focus:bg-white focus:border-[#FF6B00]"
            />
          </div>

          {/* Breed Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-bold scrollbar-none">
            <button
              onClick={() => setFilterBreed('all')}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                filterBreed === 'all'
                  ? 'bg-[#240C0B] text-white shadow-2xs'
                  : 'bg-[#FAF8F5] text-[#7A6865] hover:bg-[#E6DFD5]'
              }`}
            >
              All Breeds ({transformations.length})
            </button>
            {breeds.map((b) => (
              <button
                key={b}
                onClick={() => setFilterBreed(b)}
                className={`px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                  filterBreed === b
                    ? 'bg-[#FF6B00] text-white shadow-2xs'
                    : 'bg-[#FAF8F5] text-[#7A6865] hover:bg-[#E6DFD5]'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Gallery Cards Grid */}
      {showTransformationsGrid && (
        filteredTransformations.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#E6DFD5] space-y-3">
            <p className="text-sm font-bold text-[#240C0B]">No dog transformations found</p>
            <p className="text-xs text-[#7A6865]">Try adjusting your search query or upload a new Before & After set.</p>
            {showUploadPhotoBtn && (
              <button
                onClick={() => openModal('transformationForm')}
                className="px-4 py-2 bg-[#FF6B00] text-white text-xs font-black rounded-full shadow-sm"
              >
                Upload Transformation
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTransformations.map((tr) => (
              <motion.div 
                key={tr.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-5 rounded-[24px] border border-[#E6DFD5] shadow-xs space-y-4 hover:border-[#FF6B00] transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Pet Header */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#E6DFD5]">
                    <div>
                      <h3 className="font-display font-black text-lg text-[#240C0B]">{tr.petName}</h3>
                      <p className="text-xs font-bold text-[#FF6B00]">
                        {tr.breed} • <span className="text-[#7A6865]">Owner: {tr.ownerName}</span>
                      </p>
                    </div>
                    <span className="text-[10px] bg-[#FAF8F5] text-[#7A6865] border border-[#E6DFD5] px-2.5 py-1 rounded-full font-bold">
                      {tr.date}
                    </span>
                  </div>

                  {/* Side-by-Side Before & After Photos */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black uppercase tracking-wider block text-center py-0.5 rounded-md bg-[#240C0B] text-white">
                        Before Groom
                      </span>
                      <div className="aspect-square rounded-2xl overflow-hidden bg-[#FAF8F5] border border-[#E6DFD5]">
                        <img
                          src={tr.beforeImg || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80'}
                          alt="Before grooming"
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-black uppercase tracking-wider block text-center py-0.5 rounded-md bg-[#059669] text-white">
                        After Groom
                      </span>
                      <div className="aspect-square rounded-2xl overflow-hidden bg-[#D1FAE5] border border-[#A7F3D0]">
                        <img
                          src={tr.afterImg || 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80'}
                          alt="After grooming"
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Treatment & Cut Notes */}
                  <div className="mt-3.5 bg-[#FAF8F5] p-3 rounded-2xl border border-[#E6DFD5] space-y-1 text-xs text-[#6E5B58]">
                    <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#240C0B]">
                      <Scissors className="w-3 h-3 text-[#FF6B00]" />
                      <span>{tr.serviceName || 'Full Spa Groom'}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      <strong className="text-[#240C0B]">Cut & Notes: </strong>
                      {tr.styleNotes}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-[#E6DFD5] flex items-center justify-between text-xs text-[#7A6865]">
                  <span>Stylist: <strong className="text-[#240C0B]">{tr.groomerName}</strong></span>

                  <div className="flex items-center gap-1.5">
                    {showPortfolioShare && (
                      <button
                        onClick={() => {
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(`Look at ${tr.petName}'s grooming transformation at Posh Paws!`);
                            showToast(`Copied transformation link for ${tr.petName}!`, 'info');
                          }
                        }}
                        className="p-1.5 text-[#7A6865] hover:text-[#FF6B00] hover:bg-[#FFF3EB] rounded-lg transition-colors cursor-pointer"
                        title="Share Transformation"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        confirmDelete({
                          title: 'Delete Transformation Entry',
                          message: `Delete before & after transformation photos for ${tr.petName}?`,
                          confirmLabel: 'Delete Entry',
                          onConfirm: () => deleteTransformation(tr.id),
                        });
                      }}
                      className="p-1.5 text-[#7A6865] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors cursor-pointer"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
