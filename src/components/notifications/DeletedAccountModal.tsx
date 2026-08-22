import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserX, ShieldAlert, LogOut } from 'lucide-react';

export const DeletedAccountModal: React.FC = () => {
  const { deletedAccountNotice, setDeletedAccountNotice, setAuthView } = useAuth();

  if (!deletedAccountNotice) return null;

  const handleClose = () => {
    setDeletedAccountNotice(false);
    setAuthView('client_login');
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#FAF8F5] text-[#240C0B] rounded-3xl border border-red-200 shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-5 animate-scaleUp text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-red-500/20">
          <UserX className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 bg-red-100 text-red-700 border border-red-200 rounded-full text-[10px] font-black uppercase tracking-wider">
            Simultaneous Session Invalidation
          </span>
          <h3 className="font-display font-black text-xl text-[#240C0B]">
            Account Deleted from Database
          </h3>
          <p className="text-xs text-[#5C4A47] leading-relaxed">
            Your client profile has been permanently removed from the Firebase Firestore database by an administrator.
          </p>
          <p className="text-xs text-[#7A6865] bg-white p-3 rounded-xl border border-[#E6DFD5]">
            For security, your active session on this device and all other tabs has been simultaneously terminated.
          </p>
        </div>

        <button
          onClick={handleClose}
          className="w-full py-3 px-5 bg-[#240C0B] hover:bg-black text-white font-bold text-xs rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Return to Client Login</span>
        </button>
      </div>
    </div>
  );
};
