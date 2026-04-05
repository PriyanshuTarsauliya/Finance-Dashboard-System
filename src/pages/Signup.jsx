import { useState, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CloudflareTurnstile from '../components/CloudflareTurnstile';
import { GoogleLogin } from '@react-oauth/google';

export default function Signup() {
  const navigate = useNavigate();
  const { register, loginWithGoogle, sendOtp, verifyOtp, loading } = useAuth();
  const [authMethod, setAuthMethod] = useState('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [showOtp, setShowOtp] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [otpNotice, setOtpNotice] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const otpRefs = useRef([]);

  const handleTurnstileVerify = useCallback((token) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken('');
  }, []);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newValues = [...otpValues];
    newValues[index] = value.slice(-1);
    setOtpValues(newValues);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newValues = [...otpValues];
    for (let i = 0; i < pasteData.length; i++) {
      newValues[i] = pasteData[i];
    }
    setOtpValues(newValues);
    const nextEmpty = pasteData.length < 6 ? pasteData.length : 5;
    otpRefs.current[nextEmpty]?.focus();
  };

  const handleSendOtp = async () => {
    setError('');
    setOtpNotice('');
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    if (!dateOfBirth) {
      setError('Please select your Date of Birth');
      return;
    }
    if (!gender) {
      setError('Please select your gender');
      return;
    }
    try {
      const result = await sendOtp(phone, countryCode, turnstileToken);
      setShowOtp(true);
      setOtpValues(['', '', '', '', '', '']);
      if (result.otp) {
        setOtpNotice(`Your OTP is: ${result.otp}`);
      }
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    const otp = otpValues.join('');
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }
    try {
      await verifyOtp(phone, countryCode, otp, name, dateOfBirth, gender);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (authMethod === 'mobile') {
      if (!showOtp) {
        await handleSendOtp();
      } else {
        await handleVerifyOtp();
      }
      return;
    }

    try {
      await register(name, email, password, dateOfBirth, gender, 'VIEWER', turnstileToken);
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

        {otpNotice && (
          <div style={{ padding: '0.75rem', background: 'rgba(0, 230, 118, 0.1)', border: '1px solid var(--color-primary)', borderRadius: '8px', color: 'var(--color-primary)', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center', fontWeight: 600 }}>
            📱 {otpNotice}
          </div>
        )}

        {!showOtp && (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    setError('');
                    await loginWithGoogle(credentialResponse.credential);
                    navigate('/dashboard');
                  } catch (err) {
                    setError(err.message || 'Google Login failed');
                  }
                }}
                onError={() => {
                  setError('Google Login Failed');
                }}
                theme="filled_black"
                shape="rectangular"
                width="100%"
                text="signup_with"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
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
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>We sent a 6-digit code to {countryCode}{phone}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                {otpValues.map((val, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={val}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    onPaste={i === 0 ? handleOtpPaste : undefined}
                    style={{ width: 40, height: 48, textAlign: 'center', fontSize: '1.25rem', fontWeight: 600, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-bg-input)', color: 'var(--color-text-main)' }}
                  />
                ))}
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
                {loading ? 'Creating...' : 'Create Account'}
              </button>
              <button type="button" onClick={() => handleSendOtp()} style={{ width: '100%', padding: '0.5rem', color: 'var(--color-primary)', fontSize: '0.8rem', marginTop: '0.75rem', background: 'transparent', border: 'none', cursor: 'pointer' }} disabled={loading}>
                Resend OTP
              </button>
              <button type="button" onClick={() => { setShowOtp(false); setOtpNotice(''); setError(''); }} style={{ width: '100%', padding: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Cancel</button>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="name" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Full Name</label>
                <input id="name" name="name" autoComplete="name" type="text" placeholder="John Doe" className="input-field" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="dob" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Date of Birth</label>
                  <input id="dob" type="date" className="input-field" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="gender" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Gender</label>
                  <select id="gender" className="input-field" value={gender} onChange={e => setGender(e.target.value)} required>
                    <option value="" disabled>Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
              {authMethod === 'email' ? (
                <>
                  <div>
                    <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Email</label>
                    <input id="email" name="email" autoComplete="email" type="email" placeholder="name@company.com" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div>
                    <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Password</label>
                    <input id="password" name="password" autoComplete="new-password" type="password" placeholder="Min 8 characters" className="input-field" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                </>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Mobile Number</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select className="input-field" style={{ width: 80, padding: '0.5rem' }} value={countryCode} onChange={e => setCountryCode(e.target.value)}>
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                    </select>
                    <input type="tel" placeholder="9876543210" className="input-field" value={phone} onChange={e => setPhone(e.target.value)} required />
                  </div>
                </div>
              )}
              <CloudflareTurnstile
                onVerify={handleTurnstileVerify}
                onExpire={handleTurnstileExpire}
                theme="dark"
              />
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
                {loading ? 'Processing...' : authMethod === 'email' ? 'Create Account' : 'Send OTP'}
              </button>
            </>
          )}
        </form>

        {!showOtp && <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Sign in</Link></p>}
      </div>
    </div>
  );
}
