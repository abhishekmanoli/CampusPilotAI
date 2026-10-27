import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { CuteGhostWithPumpkin, CutePumpkinIcon, CuteBatIcon } from './CuteHalloweenIllustrations';
import { api } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const DEMO_EMAIL = 'student@campuspilot.demo';
  const DEMO_PASS = 'CampusDemo2026!';

  const handleSignIn = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    const targetEmail = (customEmail ?? email).trim();
    const targetPass = customPass ?? password;

    if (!targetEmail) {
      setError('Please enter your student email address.');
      return;
    }
    if (!targetPass) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.login(targetEmail, targetPass, rememberMe);
      if (res.token && res.user) {
        localStorage.setItem('campuspilot_token', res.token);
        localStorage.setItem('campuspilot_user', JSON.stringify(res.user));
        onLoginSuccess(res.user, res.token);
      }
    } catch (err: any) {
      setError(
        err.message ||
          'Could not sign in. Please verify your credentials or click "Try demo account".'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTryDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASS);
    setError(null);
    handleSignIn(undefined, DEMO_EMAIL, DEMO_PASS);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FFF9F2] p-4 sm:p-6 lg:p-10 select-none">
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-[#F0EAF3] shadow-xl overflow-hidden grid lg:grid-cols-2">
        {/* Left Side: Friendly Cute Ghost & Welcome */}
        <div className="bg-[#FFF9F2] p-8 sm:p-10 flex flex-col justify-between items-center text-center border-b lg:border-b-0 lg:border-r border-[#F0EAF3] relative overflow-hidden">
          {/* Subtle decorative icons in background */}
          <CuteBatIcon className="absolute top-6 left-8 opacity-40" size={26} />
          <CutePumpkinIcon className="absolute top-8 right-8 opacity-40" size={24} />
          <div className="absolute bottom-6 left-10 text-[#FFB347] text-lg opacity-50">✦</div>
          <div className="absolute bottom-10 right-10 text-[#7C5CE7] text-sm opacity-50">★</div>

          {/* Brand header */}
          <div className="flex items-center space-x-2.5 z-10">
            <div className="h-9 w-9 rounded-2xl bg-[#FFF0E5] flex items-center justify-center border border-[#FFE2CD]">
              <CutePumpkinIcon size={20} />
            </div>
            <span className="font-heading font-bold text-xl text-[#282433] tracking-tight">
              Campus<span className="text-[#FF8A3D]">Pilot</span>
            </span>
          </div>

          {/* Central friendly mascot illustration */}
          <div className="my-6 z-10 flex flex-col items-center">
            <CuteGhostWithPumpkin size={150} />

            <h2 className="mt-4 font-heading font-bold text-2xl text-[#282433]">
              Your campus, made simple.
            </h2>
            <p className="mt-2 text-sm font-sans text-[#777382] max-w-xs leading-relaxed">
              Keep track of classes, events, and important dates—all in one happy place.
            </p>
          </div>

          {/* Demo account helper card */}
          <div className="w-full rounded-2xl bg-white border border-[#F0EAF3] p-3.5 z-10 text-left shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-heading font-semibold uppercase tracking-wider text-[#FF8A3D] flex items-center space-x-1">
                <span>🎃 Hackathon Demo Access</span>
              </span>
              <span className="text-[10px] font-mono bg-[#DDF7E8] text-[#227B49] px-2 py-0.5 rounded-full font-bold">
                Ready to Use
              </span>
            </div>
            <div className="text-xs font-sans text-[#777382] space-y-0.5">
              <div className="flex justify-between">
                <span>Email:</span>
                <code className="font-mono text-[#282433] font-semibold">{DEMO_EMAIL}</code>
              </div>
              <div className="flex justify-between">
                <span>Password:</span>
                <code className="font-mono text-[#282433] font-semibold">{DEMO_PASS}</code>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-center bg-white">
          <div>
            <div className="inline-flex items-center space-x-1.5 rounded-full bg-[#FFF0E5] px-3 py-1 text-xs font-heading font-semibold text-[#FF8A3D] mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Friendly Student Companion</span>
            </div>

            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#282433]">
              Welcome back! 👋
            </h1>
            <p className="text-sm font-sans text-[#777382] mt-1">
              Let's get your campus day organized.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="mt-6 space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-heading font-semibold text-[#282433] mb-1.5">
                Student Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#777382]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@campuspilot.demo"
                  className="w-full rounded-xl border border-[#F0EAF3] bg-white py-2.5 pl-10 pr-4 text-sm font-sans text-[#282433] placeholder-[#777382]/50 focus:border-[#FF8A3D] focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/20 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-heading font-semibold text-[#282433] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#777382]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-[#F0EAF3] bg-white py-2.5 pl-10 pr-10 text-sm font-sans text-[#282433] placeholder-[#777382]/50 focus:border-[#FF8A3D] focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#777382] hover:text-[#282433] p-0.5"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 text-[#777382] cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#F0EAF3] text-[#FF8A3D] focus:ring-[#FF8A3D]"
                />
                <span className="font-sans">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setEmail(DEMO_EMAIL);
                  setPassword(DEMO_PASS);
                }}
                className="font-heading text-[#7C5CE7] hover:underline"
              >
                Fill demo credentials
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div className="rounded-xl bg-[#FFF0E5] border border-[#FFE2CD] p-3 text-xs text-[#D94C4C] font-sans">
                {error}
              </div>
            )}

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-friendly-pumpkin flex items-center justify-center space-x-2 disabled:opacity-50 text-sm py-3"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            {/* Try demo account button */}
            <button
              type="button"
              onClick={handleTryDemo}
              disabled={loading}
              className="w-full btn-friendly-soft flex items-center justify-center space-x-2 text-xs py-2.5 mt-2"
            >
              <CutePumpkinIcon size={16} />
              <span>1-Click Try Demo Account (Alex Morgan)</span>
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-8 pt-4 border-t border-[#F0EAF3] text-center text-xs font-sans text-[#777382]">
            <span>Powered by on-device Google Gemma 4 on local Ollama</span>
          </div>
        </div>
      </div>
    </div>
  );
};
