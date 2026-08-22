import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';
          const isError = toast.type === 'error';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`pointer-events-auto flex items-center gap-3 p-3.5 rounded-2xl shadow-xl border text-sm font-semibold text-[#173E39] ${
                isSuccess
                  ? 'bg-[#FFFFFF] border-[#3E9B6E] text-[#173E39]'
                  : isWarning
                  ? 'bg-[#FFFBEB] border-[#E7A93C] text-[#9A6E1B]'
                  : isError
                  ? 'bg-[#FEF2F2] border-[#C9503A] text-[#991B1B]'
                  : 'bg-[#FFFFFF] border-[#86B7C2] text-[#173E39]'
              }`}
            >
              <div className="flex-none">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#3E9B6E]" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-[#E7A93C]" />}
                {isError && <AlertCircle className="w-5 h-5 text-[#C9503A]" />}
                {!isSuccess && !isWarning && !isError && <Info className="w-5 h-5 text-[#2E8A81]" />}
              </div>

              <div className="flex-1 text-xs leading-snug">{toast.text}</div>

              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 text-[#5C716C] hover:text-[#173E39] rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
