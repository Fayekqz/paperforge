'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, signUp, getCurrentUser, User } from '@/lib/auth';
import {
  GraduationCap,
  Lock,
  Mail,
  User as UserIcon,
  Building2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (tab === 'signin') {
        const res = signIn(email, password);
        if (!res.success) {
          setError(res.error || 'Failed to sign in.');
          setIsLoading(false);
          return;
        }
        router.push('/');
      } else {
        const res = signUp(name, email, password, institution);
        if (!res.success) {
          setError(res.error || 'Failed to create account.');
          setIsLoading(false);
          return;
        }
        router.push('/');
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setError(null);
    setIsLoading(true);
    const res = signIn('teacher@evalvia.edu', 'password123');
    if (res.success) {
      router.push('/');
    } else {
      // Create it if not exists then login
      signUp('Dr. Sarah Jenkins', 'teacher@evalvia.edu', 'password123', 'St. Jude Collegiate Academy');
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F0E9] text-[#181716] font-chrome flex flex-col justify-between">
      {/* Top Header */}
      <header className="p-4 sm:p-6 flex items-center justify-between border-b border-[#DDD8CD] bg-white">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded bg-[#80182A] text-white flex items-center justify-center font-serif font-bold text-base shadow-xs">
            PF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[#181716] tracking-tight">PaperForge</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#FAF6EE] text-[#555048] border border-[#DDD6C8] uppercase tracking-wider font-mono">
                Academic Instrument
              </span>
            </div>
            <p className="text-xs text-[#6B655D]">Smart Examination Generator & Constraint Solver</p>
          </div>
        </Link>

        <Link
          href="/"
          className="flex items-center gap-1 text-xs font-semibold text-[#555048] hover:text-[#80182A] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Workspace</span>
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-md bg-[#FAF8F5] border border-[#DDD6C8] rounded-xl shadow-xs overflow-hidden">
          {/* Masthead Banner */}
          <div className="bg-[#80182A] text-white p-6 text-center space-y-1">
            <GraduationCap className="w-8 h-8 mx-auto text-[#F3E5AB] mb-1" />
            <h2 className="text-lg font-serif font-bold tracking-tight">Educator Access Portal</h2>
            <p className="text-xs text-white/80">
              Sign in to manage custom examination papers, question banks, and assessments.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-[#DDD6C8] bg-[#EDE8DE]">
            <button
              type="button"
              onClick={() => {
                setTab('signin');
                setError(null);
              }}
              className={`flex-1 py-3 text-xs font-bold transition-all cursor-pointer ${
                tab === 'signin'
                  ? 'bg-[#FAF8F5] text-[#80182A] border-b-2 border-[#80182A]'
                  : 'text-[#6B655D] hover:text-[#181716]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('signup');
                setError(null);
              }}
              className={`flex-1 py-3 text-xs font-bold transition-all cursor-pointer ${
                tab === 'signup'
                  ? 'bg-[#FAF8F5] text-[#80182A] border-b-2 border-[#80182A]'
                  : 'text-[#6B655D] hover:text-[#181716]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-[#FBE2E6] border border-[#F2CCD3] text-[#80182A] flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'signup' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#332F2A] flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-[#80182A]" />
                      <span>Full Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Prof. Alan Turing"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded border border-[#DDD6C8] bg-white text-[#181716] focus:outline-none focus:border-[#80182A]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#332F2A] flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#80182A]" />
                      <span>Institution / Department</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. St. Jude Collegiate Academy"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded border border-[#DDD6C8] bg-white text-[#181716] focus:outline-none focus:border-[#80182A]"
                    />
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#332F2A] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#80182A]" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="teacher@institution.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-[#DDD6C8] bg-white text-[#181716] focus:outline-none focus:border-[#80182A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#332F2A] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#80182A]" />
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder={tab === 'signup' ? 'At least 6 characters' : '••••••••'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded border border-[#DDD6C8] bg-white text-[#181716] focus:outline-none focus:border-[#80182A]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded bg-[#80182A] hover:bg-[#63111E] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>{tab === 'signin' ? 'Sign In to Workspace' : 'Create Account'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Login Option */}
            <div className="pt-3 border-t border-[#E8E2D6] text-center space-y-2">
              <p className="text-[11px] text-[#6B655D]">Evaluating or reviewing this software?</p>
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full py-2 px-3 rounded border border-[#DDD6C8] bg-white hover:bg-[#F2EFE8] text-[#332F2A] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#80182A]" />
                <span>1-Click Demo Login (Dr. Sarah Jenkins)</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-[#7A7368] border-t border-[#DDD8CD] bg-white">
        PaperForge Academic Assessment Instrument • Secure Educator Session
      </footer>
    </div>
  );
}
