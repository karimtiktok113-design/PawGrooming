import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { ViewMode } from '../../types';
import { 
  Lock, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight, 
  Mail, 
  ExternalLink,
  Crown,
  LayoutDashboard
} from 'lucide-react';

interface FeatureLockedScreenProps {
  screenId: ViewMode;
  screenTitle?: string;
}

export const FeatureLockedScreen: React.FC<FeatureLockedScreenProps> = ({ 
  screenId,
  screenTitle 
}) => {
  const { currentProfile } = useAuth();
  const { setView } = useApp();

  const trialMessage = currentProfile?.permissions?.trialMessage || 
    'This screen is reserved for full Studio Pro and Enterprise subscribers, or is restricted during your trial demo period.';

  return (
    <div className="w-full min-h-[500px] flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#E6DFD5] p-8 shadow-xl relative overflow-hidden space-y-5">
        {/* Glow backdrop */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#FF6B00]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#2E8A81]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-3xl bg-[#FF6B00]/15 text-[#FF6B00] flex items-center justify-center mx-auto shadow-inner ring-8 ring-[#FF6B00]/5">
          <Lock className="w-8 h-8" />
        </div>

        {/* Text */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-[#FF6B00] border border-orange-200 mb-2">
            <Crown className="w-3 h-3" />
            {currentProfile?.permissions?.isTrialMode ? 'Trial / Demo Restriction' : 'Feature Locked'}
          </span>

          <h3 className="font-display font-black text-2xl text-[#240C0B] mt-1">
            {screenTitle ? `${screenTitle} is Locked` : 'Access Restricted'}
          </h3>

          <p className="text-xs text-[#5C4A47] leading-relaxed mt-2.5 px-2">
            {trialMessage}
          </p>
        </div>

        {/* Plan Upgrade Box */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E6DFD5] text-left text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#7A6865]">Current Account:</span>
            <span className="font-black text-[#240C0B]">{currentProfile?.businessName || 'Demo Studio'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#7A6865]">License Mode:</span>
            <span className="font-bold text-[#FF6B00]">
              {currentProfile?.permissions?.trialTierName || (currentProfile?.permissions?.isTrialMode ? '14-Day Web Trial' : `${currentProfile?.plan || 'Starter'} Tier`)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={() => setView('dashboard')}
            className="w-full py-3 px-4 rounded-2xl bg-[#240C0B] hover:bg-[#3D1412] text-white text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Return to Available Dashboard</span>
          </button>

          <a
            href="mailto:admin@parkgrooming.com?subject=Unlock%20PawBook%20Features%20Request"
            className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-[#FAF8F5] border border-[#E6DFD5] text-[#240C0B] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-[#FF6B00]" />
            <span>Contact Administrator to Upgrade</span>
          </a>
        </div>
      </div>
    </div>
  );
};
