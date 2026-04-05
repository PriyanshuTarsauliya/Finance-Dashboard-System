import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Bell, Database, Settings as SettingsIcon, Download, Upload, Trash2 } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  
  // Profile State
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  // Preferences State
  const [preferences, setPreferences] = useState({
    currency: 'INR',
    emailNotifications: true,
    budgetAlerts: true,
    monthlyReports: true,
    autoSave: true,
    animations: true,
    dateFormat: 'DD/MM/YYYY',
    theme: 'SYSTEM'
  });

  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [prefSaving, setPrefSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/preferences', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPreferences(data);
      }
    } catch (err) {
      console.error('Error fetching preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/preferences/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });
      if (res.ok) {
        alert('Profile saved successfully! You may need to log in again to see changes everywhere.');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePreferencesSave = async (e) => {
    e?.preventDefault();
    setPrefSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(preferences)
      });
      if (res.ok) {
        const data = await res.json();
        setPreferences(data);
        alert('Preferences saved successfully!');
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
    } finally {
      setPrefSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/records/export', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transactions.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error exporting data:', err);
    }
  };

  const handleClearData = async () => {
    if (window.confirm("Are you absolutely sure you want to delete all financial records? This action cannot be undone.")) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/records/clear-all', {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          alert('All financial data has been cleared.');
        }
      } catch (err) {
        console.error('Error clearing data:', err);
      }
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading settings...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '2rem' }}>Settings</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        
        {/* Profile Settings & System Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Profile Card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="var(--color-primary)" /> Profile Settings
            </h2>
            <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ marginBottom: '0.5rem', display: 'block', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Administrator Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={profileForm.name}
                  onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label style={{ marginBottom: '0.5rem', display: 'block', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Email</label>
                <input 
                  type="email" 
                  className="input-field" 
                  value={profileForm.email}
                  onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                  required 
                />
              </div>
              <div>
                <label style={{ marginBottom: '0.5rem', display: 'block', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Currency</label>
                <select 
                  className="input-field" 
                  value={preferences.currency}
                  onChange={e => setPreferences({...preferences, currency: e.target.value})}
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }} disabled={profileSaving}>
                {profileSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* System Card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <SettingsIcon size={18} color="var(--color-primary)" /> System
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={preferences.autoSave}
                  onChange={e => setPreferences({...preferences, autoSave: e.target.checked})}
                  style={{ marginTop: '0.25rem', accentColor: 'var(--color-primary)' }}
                />
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>Auto-save</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Automatically save changes to localStorage</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={preferences.animations}
                  onChange={e => setPreferences({...preferences, animations: e.target.checked})}
                  style={{ marginTop: '0.25rem', accentColor: 'var(--color-primary)' }}
                />
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>Animations</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Enable UI animations and transitions</div>
                </div>
              </label>

              <div style={{ marginTop: '0.5rem' }}>
                <label style={{ marginBottom: '0.5rem', display: 'block', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Date Format</label>
                <select 
                  className="input-field" 
                  value={preferences.dateFormat}
                  onChange={e => setPreferences({...preferences, dateFormat: e.target.value})}
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

            </div>
          </div>

        </div>

        {/* Notifications Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', height: '100%' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} color="var(--color-primary)" /> Notifications
            </h2>
            <form onSubmit={handlePreferencesSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'calc(100% - 2.6rem)' }}>
              
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={preferences.emailNotifications}
                  onChange={e => setPreferences({...preferences, emailNotifications: e.target.checked})}
                  style={{ marginTop: '0.25rem', accentColor: 'var(--color-primary)' }}
                />
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>Email Notifications</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>Receive email updates about your financial activities</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={preferences.budgetAlerts}
                  onChange={e => setPreferences({...preferences, budgetAlerts: e.target.checked})}
                  style={{ marginTop: '0.25rem', accentColor: 'var(--color-primary)' }}
                />
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>Budget Alerts</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>Get notified when you approach budget limits</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={preferences.monthlyReports}
                  onChange={e => setPreferences({...preferences, monthlyReports: e.target.checked})}
                  style={{ marginTop: '0.25rem', accentColor: 'var(--color-primary)' }}
                />
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>Monthly Reports</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>Automatic monthly financial reports</div>
                </div>
              </label>

              <div style={{ flex: 1 }}></div>
              
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={prefSaving}>
                {prefSaving ? 'Saving...' : 'Save Preferences'}
              </button>
            </form>
          </div>
        </div>

        {/* Data Management Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={18} color="var(--color-primary)" /> Data Management
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div>
                <button 
                  onClick={handleExport}
                  className="btn btn-outline" 
                  style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Download size={16} /> Export All Data
                </button>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>Download all your financial data as CSV</div>
              </div>

              <div>
                <button 
                  onClick={() => alert("Import Data functionality coming soon!")}
                  className="btn btn-outline" 
                  style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Upload size={16} /> Import Data
                </button>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>Import transactions from CSV file</div>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <button 
                  onClick={handleClearData}
                  className="btn btn-danger" 
                  style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--color-danger-bg)' }}
                >
                  <Trash2 size={16} /> Clear All Data
                </button>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>Permanently delete all transaction data</div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
