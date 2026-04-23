'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Wallet, Eye, EyeOff, ArrowLeft, Mail } from 'lucide-react';

type Screen = 'login' | 'twofa' | 'forgot' | 'forgot_sent';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuthStore();
  const [screen, setScreen] = useState<Screen>('login');
  const [email, setEmail] = useState('demo@demo.com');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [forgotEmail, setForgotEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    if (email && password) setScreen('twofa');
    else setError('Please enter your email and password.');
  };

  const handleOtp = () => {
    const code = otp.join('');
    if (code.length < 6) { setError('Enter all 6 digits'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); login(email); router.replace('/dashboard'); }, 800);
  };

  const handleOtpInput = (val: string, i: number) => {
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) { setError('Enter your email address'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setScreen('forgot_sent'); }, 1000);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />
      {/* Glow orbs */}
      <div style={{ position: 'absolute', width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)', top: '20%', left: '20%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', bottom: '20%', right: '20%', pointerEvents: 'none' }} />

      <div style={{ width: 400, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32, animation: 'fadeIn 0.5s ease' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={20} color="#000" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em' }}>VAULT</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Institutional Portfolio Intelligence</div>
        </div>

        <div className="vault-card" style={{ padding: 32, animation: 'fadeIn 0.5s ease 0.1s both' }}>

          {/* ── LOGIN SCREEN ── */}
          {screen === 'login' && (
            <>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Sign in</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Access your portfolio dashboard</div>
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="vault-input" placeholder="you@example.com" required />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Password</label>
                    <button type="button" onClick={() => setScreen('forgot')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                      Forgot password?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="vault-input" placeholder="••••••••" required style={{ paddingRight: 40 }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                {error && <div style={{ fontSize: 12, color: 'var(--negative)', marginBottom: 12, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }} disabled={loading}>
                  {loading ? 'Signing in...' : 'Continue →'}
                </button>
              </form>
              <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>Demo: </span>any email + any password
              </div>
            </>
          )}

          {/* ── 2FA SCREEN ── */}
          {screen === 'twofa' && (
            <>
              <button onClick={() => setScreen('login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 20, padding: 0 }}>
                <ArrowLeft size={14} /> Back
              </button>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Two-Factor Auth</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Enter the 6-digit code from your authenticator app or enter any 6 digits to continue.</div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
                {otp.map((digit, i) => (
                  <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={e => handleOtpInput(e.target.value, i)}
                    onKeyDown={e => { if (e.key === 'Backspace' && !digit && i > 0) document.getElementById(`otp-${i - 1}`)?.focus(); }}
                    style={{ width: 46, height: 54, textAlign: 'center', fontSize: 22, background: 'var(--bg-tertiary)', border: `1px solid ${digit ? 'var(--accent-cyan)' : 'var(--border)'}`, borderRadius: 8, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', outline: 'none', transition: 'border-color 150ms' }} />
                ))}
              </div>
              {error && <div style={{ fontSize: 12, color: 'var(--negative)', marginBottom: 12, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 6 }}>{error}</div>}
              <button onClick={handleOtp} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }} disabled={loading || otp.join('').length < 6}>
                {loading ? 'Verifying...' : 'Verify & Sign In →'}
              </button>
              <button onClick={() => { login(email); router.replace('/dashboard'); }} style={{ width: '100%', marginTop: 10, background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '10px 0', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                Skip for demo →
              </button>
            </>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {screen === 'forgot' && (
            <>
              <button onClick={() => setScreen('login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 20, padding: 0 }}>
                <ArrowLeft size={14} /> Back to sign in
              </button>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Reset Password</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>Enter your email and we'll send a reset link.</div>
              <form onSubmit={handleForgot}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Email Address</label>
                  <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} className="vault-input" placeholder="you@example.com" required />
                </div>
                {error && <div style={{ fontSize: 12, color: 'var(--negative)', marginBottom: 12, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: 6 }}>{error}</div>}
                <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 12 }} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link →'}
                </button>
              </form>
            </>
          )}

          {/* ── FORGOT SENT ── */}
          {screen === 'forgot_sent' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--positive-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Mail size={24} style={{ color: 'var(--positive)' }} />
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Check your email</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
                A password reset link has been sent to <strong>{forgotEmail}</strong>. Check your inbox and spam folder.
              </div>
              <button onClick={() => { setScreen('login'); setForgotEmail(''); setError(''); }} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                Back to sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}