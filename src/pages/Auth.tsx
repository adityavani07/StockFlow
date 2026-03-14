import React, { useState } from 'react';
import { LogIn, UserPlus, KeyRound, ArrowLeft, Mail, Lock, User, Shield } from 'lucide-react';
import { useInventoryStore } from '../store/inventoryStore';

type AuthMode = 'login' | 'signup' | 'reset';

const Auth: React.FC = () => {
  const { login, signup } = useInventoryStore();
  const [mode, setMode] = useState<AuthMode>('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [loginEmail, setLoginEmail] = useState('adiva@stockflow.com');
  const [loginPassword, setLoginPassword] = useState('admin123');

  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'inventory_manager' | 'warehouse_staff'>('inventory_manager');

  const [resetEmail, setResetEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginEmail || !loginPassword) { setError('All fields are required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) { setError('Invalid email format'); return; }
    const ok = login(loginEmail, loginPassword);
    if (!ok) setError('Invalid email or password');
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!signupName || !signupEmail || !signupPassword) { setError('All fields are required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) { setError('Invalid email format'); return; }
    if (signupPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    const ok = signup(signupName, signupEmail, signupPassword, signupRole);
    if (!ok) setError('Email already registered');
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otpSent) {
      if (!resetEmail) { setError('Enter your email'); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) { setError('Invalid email format'); return; }
      setOtpSent(true);
      setSuccess('OTP sent to your email (use code: 123456 for demo)');
    } else {
      if (otp === '123456') {
        setSuccess('Password has been reset to "newpass123". Please login.');
        setTimeout(() => { setMode('login'); setOtpSent(false); setSuccess(''); }, 2000);
      } else {
        setError('Invalid OTP');
      }
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm glass-input";
  const inputErrorClass = "w-full px-4 py-3 rounded-xl text-sm glass-input border-red-400/50";

  return (
    <div className="min-h-screen auth-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md relative z-10 animate-scaleIn">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
            }}>
            <span className="text-2xl font-bold text-white">SF</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">StockFlow</h1>
          <p className="text-white/40 mt-1 text-sm">Inventory Management System</p>
        </div>

        <div className="glass-modal rounded-2xl overflow-hidden">
          {/* Tabs */}
          {mode !== 'reset' && (
            <div className="flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-3.5 text-sm font-semibold transition-all duration-200 ${
                  mode === 'login'
                    ? 'text-indigo-400 border-b-2 border-indigo-400'
                    : 'text-white/30 hover:text-white/50'
                }`}
              >
                <span className="inline-flex items-center gap-1.5"><LogIn size={15} /> Login</span>
              </button>
              <button
                onClick={() => { setMode('signup'); setError(''); }}
                className={`flex-1 py-3.5 text-sm font-semibold transition-all duration-200 ${
                  mode === 'signup'
                    ? 'text-indigo-400 border-b-2 border-indigo-400'
                    : 'text-white/30 hover:text-white/50'
                }`}
              >
                <span className="inline-flex items-center gap-1.5"><UserPlus size={15} /> Sign Up</span>
              </button>
            </div>
          )}

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 rounded-xl text-sm" style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#f87171',
              }}>{error}</div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-xl text-sm" style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: '#34d399',
              }}>{success}</div>
            )}

            {/* LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5 flex items-center gap-1"><Mail size={12} /> Email</label>
                  <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                    className={inputClass} placeholder="your@email.com"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5 flex items-center gap-1"><Lock size={12} /> Password</label>
                  <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                    className={inputClass} placeholder="••••••••"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                </div>
                <button type="submit" className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}>
                  Sign In
                </button>
                <button type="button" onClick={() => { setMode('reset'); setError(''); setSuccess(''); setOtpSent(false); }}
                  className="w-full text-sm text-white/30 hover:text-indigo-400 transition-colors">
                  Forgot password?
                </button>
                <div className="text-[11px] text-white/20 text-center p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  Demo: adiva@stockflow.com / admin123
                </div>
              </form>
            )}

            {/* SIGNUP FORM */}
            {mode === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5 flex items-center gap-1"><User size={12} /> Full Name</label>
                  <input type="text" value={signupName} onChange={e => setSignupName(e.target.value)}
                    className={inputClass} placeholder="John Doe"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5 flex items-center gap-1"><Mail size={12} /> Email</label>
                  <input type="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
                    className={inputErrorClass} placeholder="your@email.com"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5 flex items-center gap-1"><Lock size={12} /> Password</label>
                  <input type="password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)}
                    className={inputClass} placeholder="Min 6 characters"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-1.5 flex items-center gap-1"><Shield size={12} /> Role</label>
                  <select value={signupRole} onChange={e => setSignupRole(e.target.value as typeof signupRole)}
                    className={inputClass}
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                    <option value="inventory_manager">Inventory Manager</option>
                    <option value="warehouse_staff">Warehouse Staff</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}>
                  Create Account
                </button>
              </form>
            )}

            {/* PASSWORD RESET */}
            {mode === 'reset' && (
              <div>
                <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                  className="inline-flex items-center gap-1 text-sm text-white/30 hover:text-indigo-400 mb-4 transition-colors">
                  <ArrowLeft size={16} /> Back to login
                </button>
                <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <KeyRound size={18} className="text-indigo-400" /> Reset Password
                </h2>
                <p className="text-sm text-white/30 mb-4">
                  {otpSent ? 'Enter the OTP sent to your email' : 'Enter your email to receive an OTP'}
                </p>
                <form onSubmit={handleReset} className="space-y-4">
                  {!otpSent ? (
                    <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)}
                      className={inputClass} placeholder="your@email.com"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                  ) : (
                    <input type="text" value={otp} onChange={e => setOtp(e.target.value)}
                      className={`${inputClass} text-center tracking-[0.3em] text-lg font-mono`}
                      placeholder="000000" maxLength={6}
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                  )}
                  <button type="submit" className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}>
                    {otpSent ? 'Verify OTP' : 'Send OTP'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-white/15 text-[11px] mt-6">
          © 2025 StockFlow IMS · Built for hackathon
        </p>
      </div>
    </div>
  );
};

export default Auth;
