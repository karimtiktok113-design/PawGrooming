import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  KeyRound, 
  Server, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { loginAdmin, setAuthView } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!email.trim()) {
      setErrorMessage('Please enter the administrator email.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter the admin security password.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await loginAdmin(email, password, rememberMe);
      if (!res.success) {
        setErrorMessage(res.error || 'Invalid admin credentials.');
      }
    } catch (err) {
      setErrorMessage('Authentication service error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#E5F0FD] selection:bg-[#138AEE] selection:text-white">
      {/* Background Soft 4-Color Lighting */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#138AEE]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-[#82B8F6]/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#0C4EA4]/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Admin Card */}
      <div className="relative z-10 w-full max-w-md bg-[#082854] border border-[#82B8F6]/35 rounded-[32px] p-8 sm:p-10 shadow-[0_24px_70px_rgba(12,78,164,0.3)] text-[#E5F0FD] space-y-6">
        
        {/* Back to Client Login Button */}
        <button
          type="button"
          onClick={() => setAuthView('client_login')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#82B8F6] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Client Login</span>
        </button>

        {/* Header Title with Official Park Grooming Paw Logo */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#138AEE] border border-[#82B8F6]/40 flex items-center justify-center mx-auto shadow-lg shadow-[#138AEE]/35 shrink-0">
            <svg className="w-8 h-8 fill-white" viewBox="0 0 32 32">
              <ellipse cx="16" cy="20" rx="6" ry="5" />
              <circle cx="9.5" cy="13" r="2.6" />
              <circle cx="16" cy="10.5" r="2.8" />
              <circle cx="22.5" cy="13" r="2.6" />
            </svg>
          </div>
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#138AEE]/20 text-[#82B8F6] border border-[#82B8F6]/40 text-[10px] font-black uppercase tracking-widest mb-1.5">
              SuperAdmin Console
            </span>
            <h2 className="font-display font-black text-2xl tracking-tight text-white uppercase">
              PAW GROOMING
            </h2>
            <p className="text-xs text-[#82B8F6] mt-1">
              Multi-Client Profile & Database Management
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#E5F0FD]">
              Master Admin Email
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
                placeholder="Enter master admin email"
                required
                className="w-full bg-[#061F42]/80 border border-[#82B8F6]/30 focus:border-[#138AEE] focus:ring-2 focus:ring-[#138AEE]/40 rounded-2xl pl-11 pr-4 py-3 text-sm text-[#E5F0FD] placeholder-[#82B8F6]/50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#E5F0FD]">
              Admin Security Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#82B8F6] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter security password"
                required
                className="w-full bg-[#061F42]/80 border border-[#82B8F6]/30 focus:border-[#138AEE] focus:ring-2 focus:ring-[#138AEE]/40 rounded-2xl pl-11 pr-11 py-3 text-sm text-[#E5F0FD] placeholder-[#82B8F6]/50 outline-none transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#82B8F6] hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-md accent-[#138AEE] cursor-pointer"
              />
              <span className="text-xs text-[#82B8F6]">Keep admin session</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#138AEE] hover:bg-[#0C75D0] text-white font-display font-bold text-sm tracking-wide shadow-lg shadow-[#138AEE]/30 border border-[#82B8F6]/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-70"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying Admin Access...</span>
              </div>
            ) : (
              <span>Unlock Admin Console</span>
            )}
          </button>
        </form>

        {/* Security Info Box */}
        <div className="p-3.5 rounded-2xl bg-[#061F42]/80 border border-[#82B8F6]/25 text-[11px] text-[#82B8F6] space-y-1">
          <p className="flex items-center gap-1.5 font-bold text-[#E5F0FD]">
            <Server className="w-3.5 h-3.5 text-[#138AEE]" />
            <span>Universal Cloud Synchronizer</span>
          </p>
          <p>
            Client profiles created here are stored securely and synchronized across any mobile, tablet, or browser worldwide.
          </p>
        </div>

      </div>
    </div>
  );
};
