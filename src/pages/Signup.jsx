import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CloudflareTurnstile from '../components/CloudflareTurnstile';

export default function Signup() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [authMethod, setAuthMethod] = useState('email');
  const [name, setName] = useState('');
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

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (authMethod === 'mobile' && !showOtp) {
      setShowOtp(true);
      return;
    }

    try {
      await register(name, email, password, 'VIEWER', turnstileToken);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-bg-neutral)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, background: 'var(--color-primary)', borderRadius: '50%', marginBottom: '1rem' }}>
            <div style={{ width: 16, height: 16, background: '#fff', borderRadius: '50%' }}></div>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Create an account</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Set up your FinanceBoard workspace</p>
        </div>

        {error && <div style={{ padding: '0.75rem', background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger)', borderRadius: '8px', color: 'var(--color-danger)', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</div>}

        {!showOtp && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '0 0 1.5rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>sign up with</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }}></div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.25rem', background: 'var(--color-bg-input)', borderRadius: '8px' }}>
              <button type="button" onClick={() => setAuthMethod('email')} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, color: authMethod === 'email' ? 'var(--color-text-main)' : 'var(--color-text-muted)', background: authMethod === 'email' ? 'var(--color-border)' : 'transparent' }}>Email</button>
              <button type="button" onClick={() => setAuthMethod('mobile')} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, color: authMethod === 'mobile' ? 'var(--color-text-main)' : 'var(--color-text-muted)', background: authMethod === 'mobile' ? 'var(--color-border)' : 'transparent' }}>Mobile</button>
            </div>
          </>
        )}

        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {showOtp ? (
            <div style={{ animation: 'modalIn 0.3s ease' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Verify your number</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>We sent a 6-digit code to your phone.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                {[1,2,3,4,5,6].map(i => <input key={i} type="text" maxLength="1" style={{ width: 40, height: 48, textAlign: 'center', fontSize: '1.25rem', fontWeight: 600, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg-input)', color: 'var(--color-text-main)' }} />)}
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>Create Account</button>
              <button type="button" onClick={() => setShowOtp(false)} style={{ width: '100%', padding: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Cancel</button>
            </div>
          ) : (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Full Name</label>
                <input type="text" placeholder="John Doe" className="input-field" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              {authMethod === 'email' ? (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Email</label>
                    <input type="email" placeholder="name@company.com" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Password</label>
                    <input type="password" placeholder="Min 8 characters" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                </>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Mobile Number</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select className="input-field" style={{ width: 80, padding: '0.5rem' }}><option>+91</option><option>+1</option></select>
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
                {loading ? 'Creating...' : authMethod === 'email' ? 'Create Account' : 'Send OTP'}
              </button>
            </>
          )}
        </form>

        {!showOtp && <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Sign in</Link></p>}
      </div>
    </div>
  );
}
