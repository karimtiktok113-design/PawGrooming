import React from 'react';
import { PanelLeftOpen, PanelLeftClose, ChevronRight, Menu } from 'lucide-react';
import { SidebarMode } from '../Sidebar';
import { motion, AnimatePresence } from 'motion/react';

interface FloatingSidebarTriggerProps {
  sidebarMode: SidebarMode;
  setSidebarMode: (mode: SidebarMode) => void;
}

export const FloatingSidebarTrigger: React.FC<FloatingSidebarTriggerProps> = ({
  sidebarMode,
  setSidebarMode
}) => {
  if (sidebarMode !== 'hidden') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="fixed top-4 left-4 z-40 hidden lg:flex items-center"
      >
        <button
          onClick={() => setSidebarMode('expanded')}
          className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#1C0908]/90 hover:bg-[#1C0908] text-white border border-white/20 shadow-2xl backdrop-blur-xl transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          title="Open Studio Navigation (⌘B or [ )"
          aria-label="Open sidebar navigation"
        >
          <div className="w-6 h-6 rounded-xl bg-theme-primary flex items-center justify-center shadow-xs group-hover:rotate-12 transition-transform">
            <PanelLeftOpen className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-bold font-display pr-1">Menu</span>
          <span className="text-[9px] font-mono bg-white/10 px-1.5 py-0.5 rounded text-[#A08E8B]">
            ⌘B
          </span>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
