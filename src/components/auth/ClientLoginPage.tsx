import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Store,
  Calendar,
  Receipt,
  Heart
} from 'lucide-react';
import { InactiveAccountModal } from './InactiveAccountModal';

export const ClientLoginPage: React.FC = () => {
  const { loginClient, setAuthView } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShake, setIsShake] = useState(false);

  // Email format validator
  const isValidEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!email.trim()) {
      triggerError('Please enter your registered business email address.');
      return;
    }
    if (!isValidEmail(email)) {
      triggerError('Please enter a valid email format (e.g., studio@domain.com).');
      return;
    }
    if (!password) {
      triggerError('Please enter your account password.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await loginClient(email, password, rememberMe);
      if (!res.success) {
        triggerError(res.error || 'Invalid email or password. Please verify your credentials.');
      }
    } catch (err) {
      triggerError('Authentication connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setIsShake(true);
    setTimeout(() => setIsShake(false), 600);
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#E5F0FD] overflow-hidden selection:bg-[#138AEE] selection:text-white">
      {/* Background 4-Color Ambient Lighting & Blobs */}
      <div className="absolute top-[-15%] left-[-10%] w-[550px] h-[550px] rounded-full bg-[#138AEE]/15 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[550px] h-[550px] rounded-full bg-[#82B8F6]/25 blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#0C4EA4]/10 blur-[160px] pointer-events-none" />

      {/* Decorative Dot Matrix Grid */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 1px 1px, #0C4EA4 1.2px, transparent 0)`,
          backgroundSize: '28px 28px' 
        }} 
      />

      {/* Main SaaS Auth Frame (Split Layout styled with 4-Color Palette) */}
      <div className="relative z-10 w-full max-w-5xl rounded-[32px] sm:rounded-[36px] border border-[#82B8F6]/40 bg-[#082854] text-[#E5F0FD] shadow-[0_24px_70px_rgba(12,78,164,0.28)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* Left Col: Brand Identity, Official Paw Logo & Studio Features (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#0C4EA4] via-[#082D62] to-[#061F42] p-8 sm:p-10 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-[#82B8F6]/20 overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -left-12 w-44 h-44 bg-[#138AEE]/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-36 h-36 bg-[#82B8F6]/20 rounded-full blur-2xl pointer-events-none" />

          {/* Synchronized Brand Header */}
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-3">
              {/* Official Park Grooming Paw Logo with Vibrant Cerulean Background */}
              <div className="w-11 h-11 rounded-2xl bg-[#138AEE] border border-[#82B8F6]/40 flex items-center justify-center shadow-lg shadow-[#138AEE]/40 transform hover:scale-105 transition-transform shrink-0">
                <svg className="w-6 h-6 fill-white" viewBox="0 0 32 32">
                  <ellipse cx="16" cy="20" rx="6" ry="5" />
                  <circle cx="9.5" cy="13" r="2.6" />
                  <circle cx="16" cy="10.5" r="2.8" />
                  <circle cx="22.5" cy="13" r="2.6" />
                </svg>
              </div>
              <div>
                <h1 className="font-display font-black text-xl text-white tracking-wide uppercase leading-tight">
                  PAW GROOMING
                </h1>
                <span className="text-[10px] font-bold text-[#82B8F6] tracking-widest uppercase block mt-0.5">
                  Dog Grooming Studio
                </span>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="space-y-3 pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#138AEE]/20 border border-[#82B8F6]/40 text-xs text-[#E5F0FD] font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#82B8F6]" />
                <span>Client & Studio Portal</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white leading-snug">
                Manage your grooming salon anywhere in the world.
              </h2>
              <p className="text-xs text-[#E5F0FD]/80 leading-relaxed">
                Real-time appointment calendar, digital A4 & QR invoices, pet health records, groomer schedules, and automated customer loyalty rewards.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-[#E5F0FD]/95">
                <div className="w-5 h-5 rounded-full bg-[#138AEE]/30 border border-[#82B8F6] flex items-center justify-center text-[#82B8F6] shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Worldwide Cross-Device Cloud Sync</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#E5F0FD]/95">
                <div className="w-5 h-5 rounded-full bg-[#138AEE]/30 border border-[#138AEE] flex items-center justify-center text-[#138AEE] shrink-0">
                  <Receipt className="w-3.5 h-3.5 text-[#E5F0FD]" />
                </div>
                <span>Instant Invoices with WhatsApp & QR Sharing</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#E5F0FD]/95">
                <div className="w-5 h-5 rounded-full bg-[#0C4EA4]/60 border border-[#82B8F6] flex items-center justify-center text-[#82B8F6] shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <span>Smart Multi-Groomer Appointments</span>
              </div>
            </div>
          </div>

          {/* Bottom Security Badge */}
          <div className="pt-8 relative z-10">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#061F42]/80 border border-[#82B8F6]/30 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#82B8F6]" />
                <div className="text-left">
                  <p className="text-[11px] font-bold text-white leading-tight">Universal Cloud Database</p>
                  <p className="text-[10px] text-[#82B8F6]">Access from any mobile, tablet, or browser</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#E5F0FD] bg-[#138AEE]/30 border border-[#82B8F6]/40 px-2 py-1 rounded-md font-bold">Online</span>
            </div>
          </div>
        </div>

        {/* Right Col: Interactive SaaS Login Form (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between bg-[#082854]/90 backdrop-blur-sm">
          <div className="max-w-md w-full mx-auto space-y-7">
            
            {/* Header Form Title */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#138AEE] bg-[#138AEE]/15 px-2.5 py-0.5 rounded-full border border-[#82B8F6]/30">
                  Client Login
                </span>
                <span className="text-xs text-[#82B8F6] flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-[#138AEE]" /> Studio Dashboard
                </span>
              </div>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                Sign In to Paw Grooming
              </h3>
              <p className="text-xs text-[#82B8F6] mt-1">
                Enter your registered business email and password to access your dashboard.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className={`p-3.5 rounded-2xl bg-[#FEF2F2]/10 border border-red-400/40 text-red-200 text-xs flex items-start gap-2.5 ${isShake ? 'animate-shake' : ''}`}>
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#E5F0FD]">
                  Business Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#82B8F6] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="name@groomingstudio.com"
                    required
                    className="w-full bg-[#061F42]/80 border border-[#82B8F6]/30 focus:border-[#138AEE] focus:ring-2 focus:ring-[#138AEE]/40 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-[#E5F0FD] placeholder-[#82B8F6]/50 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#E5F0FD]">
                    Account Password
                  </label>
                  <span className="text-[11px] text-[#82B8F6] cursor-default">
                    Case-sensitive
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#82B8F6] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-[#061F42]/80 border border-[#82B8F6]/30 focus:border-[#138AEE] focus:ring-2 focus:ring-[#138AEE]/40 rounded-2xl pl-11 pr-11 py-3.5 text-sm text-[#E5F0FD] placeholder-[#82B8F6]/50 outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#82B8F6] hover:text-white transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md accent-[#138AEE] cursor-pointer"
                  />
                  <span className="text-xs text-[#82B8F6] group-hover:text-white transition-colors">
                    Keep me signed in on this device
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-2xl bg-[#138AEE] hover:bg-[#0C75D0] text-white font-display font-bold text-sm tracking-wide shadow-lg shadow-[#138AEE]/30 hover:shadow-xl hover:shadow-[#138AEE]/40 border border-[#82B8F6]/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed group mt-4"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in to Studio...</span>
                  </div>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Admin Switcher Gateway */}
          <div className="pt-6 mt-6 border-t border-[#82B8F6]/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#82B8F6]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#138AEE] animate-pulse" />
              <span>Paw Grooming Multi-Tenant Cloud</span>
            </div>

            <button
              type="button"
              onClick={() => setAuthView('admin_login')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0C4EA4]/50 hover:bg-[#0C4EA4] border border-[#82B8F6]/30 text-white font-bold text-xs transition-all cursor-pointer shadow-sm"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#82B8F6]" />
              <span>Admin Management Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Inactive Profile Alert Modal Popup */}
      <InactiveAccountModal />
    </div>
  );
};
