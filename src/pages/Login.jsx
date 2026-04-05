import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CloudflareTurnstile from '../components/CloudflareTurnstile';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [authMethod, setAuthMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');

  const handleTurnstileVerify = useCallback((token) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken('');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (authMethod === 'mobile' && !showOtp) {
      setShowOtp(true);
      return;
    }

    try {
      await login(email, password, turnstileToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    }
  };

  // Demo: quick-login buttons
  const quickLogin = async (demoEmail, demoPass) => {
    setError('');
    try {
      await login(demoEmail, demoPass, turnstileToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-bg-neutral)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '2rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, background: 'var(--color-primary)', borderRadius: '50%', marginBottom: '1rem' }}>
            <div style={{ width: 16, height: 16, background: '#fff', borderRadius: '50%' }}></div>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-main)' }}>Welcome back</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Sign in to your FinanceBoard account</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger)', borderRadius: '8px', color: 'var(--color-danger)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {!showOtp && (
          <>
            <button onClick={() => quickLogin('admin@finance.com', 'Admin@123')} className="btn" style={{ width: '100%', padding: '0.75rem', background: 'var(--color-bg-input)', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', marginBottom: '0.5rem', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.89 16.78 15.74 17.55V20.34H19.3C21.38 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/><path d="M12 23C14.97 23 17.46 22.02 19.3 20.34L15.74 17.55C14.74 18.22 13.48 18.63 12 18.63C9.14 18.63 6.71 16.71 5.84 14.13H2.16V16.98C3.97 20.58 7.7 23 12 23Z" fill="#34A853"/><path d="M5.84 14.13C5.62 13.47 5.49 12.75 5.49 12C5.49 11.25 5.62 10.53 5.84 9.87V7.02H2.16C1.41 8.52 1 10.21 1 12C1 13.79 1.41 15.48 2.16 16.98L5.84 14.13Z" fill="#FBBC05"/><path d="M12 5.38C13.62 5.38 15.07 5.94 16.22 7.03L19.38 3.87C17.45 2.07 14.96 1 12 1C7.7 1 3.97 3.42 2.16 7.02L5.84 9.87C6.71 7.29 9.14 5.38 12 5.38Z" fill="#EA4335"/></svg>
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>or sign in with</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.25rem', background: 'var(--color-bg-input)', borderRadius: '8px' }}>
              <button type="button" onClick={() => setAuthMethod('email')} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, color: authMethod === 'email' ? 'var(--color-text-main)' : 'var(--color-text-muted)', background: authMethod === 'email' ? 'var(--color-border)' : 'transparent', transition: 'all 0.2s' }}>Email</button>
              <button type="button" onClick={() => setAuthMethod('mobile')} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, color: authMethod === 'mobile' ? 'var(--color-text-main)' : 'var(--color-text-muted)', background: authMethod === 'mobile' ? 'var(--color-border)' : 'transparent', transition: 'all 0.2s' }}>Mobile</button>
            </div>
          </>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {showOtp ? (
            <div style={{ animation: 'modalIn 0.3s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Verify your number</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>We sent a 6-digit code to your phone.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                {[1,2,3,4,5,6].map(i => <input key={i} type="text" maxLength="1" style={{ width: 40, height: 48, textAlign: 'center', fontSize: '1.25rem', fontWeight: 600, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg-input)', color: 'var(--color-text-main)' }} />)}
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>Verify & Sign In</button>
              <button type="button" onClick={() => setShowOtp(false)} style={{ width: '100%', padding: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Back</button>
            </div>
          ) : (
            <>
              {authMethod === 'email' ? (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Email Address</label>
                    <input type="email" placeholder="admin@finance.com" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Password</label>
                    <input type="password" placeholder="Admin@123" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                </>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Mobile Number</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select className="input-field" style={{ width: 80, padding: '0.5rem' }}><option>+91</option><option>+1</option><option>+44</option></select>
                    <input type="tel" placeholder="(555) 000-0000" className="input-field" value={phone} onChange={e => setPhone(e.target.value)} required />
                  </div>
                </div>
              )}
              <CloudflareTurnstile
                onVerify={handleTurnstileVerify}
                onExpire={handleTurnstileExpire}
                theme="dark"
              />
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
                {loading ? 'Signing in...' : authMethod === 'email' ? 'Sign In' : 'Send OTP'}
              </button>
            </>
          )}
        </form>

        {!showOtp && (
          <>
            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Don't have an account? <Link to="/signup" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Sign up</Link>
            </p>
            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--color-bg-input)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Quick Login (Demo)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button onClick={() => quickLogin('admin@finance.com', 'Admin@123')} className="btn btn-outline" style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span>admin@finance.com</span><span className="badge badge-admin">Admin</span>
                </button>
                <button onClick={() => quickLogin('analyst@finance.com', 'Analyst@123')} className="btn btn-outline" style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span>analyst@finance.com</span><span className="badge badge-analyst">Analyst</span>
                </button>
                <button onClick={() => quickLogin('viewer@finance.com', 'Viewer@123')} className="btn btn-outline" style={{ width: '100%', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span>viewer@finance.com</span><span className="badge badge-viewer">Viewer</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
