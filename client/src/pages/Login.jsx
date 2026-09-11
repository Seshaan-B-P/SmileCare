import React, { useState } from 'react';
import { Logo } from '../components/common/Logo';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Zap,
  Activity,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { login } = useAuth();

  // Sign In states (Starts empty for user input)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = login(email, password);
    if (!res.success) {
      setError(res.error);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/80 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans text-slate-800 selection:bg-brand-500 selection:text-white">
      {/* Radiant Light Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-brand-200/50 via-tealbrand-200/40 to-transparent rounded-full blur-[130px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-tealbrand-200/50 via-cyan-200/40 to-transparent rounded-full blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }}></div>

      {/* Main Split Glassmorphic Card Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-300/40 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">

        {/* Left Panel: High-End Hero Showcase (Medical Rich Navy & Teal) */}
        <div className="lg:col-span-6 p-8 lg:p-12 bg-gradient-to-br from-slate-900 via-brand-950 to-tealbrand-900 text-white flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 relative overflow-hidden">
          <div className="absolute -right-16 -bottom-16 w-72 h-72 bg-tealbrand-400/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-8 relative z-10">
            {/* Logo */}
            <div>
              <Logo size="xl" variant="light" />
            </div>

            {/* Main Headline & Value Proposition */}
            <div className="space-y-3.5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-tealbrand-200 text-xs font-bold shadow-sm backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '5s' }} /> Next-Gen Dental Practice SaaS
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white">
                Precision Healthcare & <span className="bg-gradient-to-r from-tealbrand-300 via-cyan-200 to-amber-200 bg-clip-text text-transparent">Odontogram Platform</span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                Complete dental practice management with interactive 32-tooth odontogram charting, Tamil WhatsApp patient recall, and real-time clinical workflows.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-amber-300 shrink-0">
                  <Zap className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">32-Tooth Odontogram</h4>
                  <p className="text-[10px] text-slate-300 font-medium">Interactive live charting</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-tealbrand-300 shrink-0">
                  <Activity className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Tamil WhatsApp Bot</h4>
                  <p className="text-[10px] text-slate-300 font-medium">Automated Patient Recall</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Security Badges */}
          <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-300 relative z-10">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> ISO 27001 Certified
            </div>
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <Shield className="w-4 h-4 text-cyan-300" /> HIPAA Compliant Data
            </div>
          </div>
        </div>

        {/* Right Panel: Light Theme Authentication Form */}
        <div className="lg:col-span-6 p-6 sm:p-10 bg-white flex flex-col justify-center relative">
          <div className="max-w-md mx-auto w-full space-y-6">

            {/* Header Title */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-[11px] font-bold mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-tealbrand-600" /> Secure Clinic Gateway
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Enter your authorized credentials to access Doctor or Staff workspace
              </p>
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="p-3.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-2xl border border-rose-200 text-center animate-fade-in shadow-sm">
                {error}
              </div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                  Clinic Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="Enter Your Login ID"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-2xl border border-slate-200 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs text-brand-600 font-bold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 hover:bg-slate-100/80 focus:bg-white rounded-2xl border border-slate-200 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-brand-600 via-tealbrand-600 to-brand-700 hover:opacity-95 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 group mt-3 active:scale-[0.99]"
              >
                <span>Sign In to Clinic Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="pt-4 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  🔒 <strong className="text-slate-700">Notice:</strong> Staff accounts are managed & generated directly by the Medical Director from the Staff Roster portal.
                </p>
              </div>
            </form>

          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-slate-200 shadow-2xl animate-fade-in text-slate-800">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-brand-50 border border-brand-200 rounded-2xl flex items-center justify-center mx-auto text-brand-600 mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Reset Password</h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">Enter your clinic email to receive password reset instructions</p>
            </div>

            {forgotSent ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-2xl border border-emerald-200 text-center space-y-3">
                <p>Reset instructions sent to <strong className="text-slate-900">{forgotEmail}</strong>! Check your inbox.</p>
                <button
                  onClick={() => { setShowForgot(false); setForgotSent(false); }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold shadow-md transition-all text-xs"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-700 mb-1">Clinic Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgot(false)}
                    className="flex-1 py-2.5 text-xs font-extrabold text-slate-600 hover:bg-slate-100 rounded-xl transition-all border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-brand-600 to-tealbrand-600 rounded-xl shadow-md transition-all hover:opacity-95"
                  >
                    Send Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
