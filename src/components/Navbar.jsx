import { Bell, Sun, Moon, Settings, User, LogOut, X, Camera, Check, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import api from '../api/apiClient';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'dark');
  
  // Profile state
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef(null);

  // Notification state
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  useEffect(() => {
    if (user) {
      api.get('/notifications/unread-count').then((data) => setUnreadCount(data.count)).catch(() => {});
    }
  }, [user]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    setTheme(nextTheme);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleNotifications = async () => {
    if (!showNotifications) {
      setShowDropdown(false);
      try {
        const notifs = await api.get('/notifications');
        setNotifications(notifs);
      } catch (err) {
        console.error('Failed to get notifications', err);
      }
    }
    setShowNotifications(!showNotifications);
  };

  const toggleProfileDropdown = () => {
    if (!showDropdown) setShowNotifications(false);
    setShowDropdown(!showDropdown);
  };

  const markAsRead = async (id, e) => {
     e.stopPropagation();
     try {
       await api.patch(`/notifications/${id}/read`);
       setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
       setUnreadCount(prev => Math.max(0, prev - 1));
     } catch(err) {}
  };

  const markAllAsRead = async () => {
     try {
       await api.patch('/notifications/read-all');
       setNotifications(notifications.map(n => ({ ...n, isRead: true })));
       setUnreadCount(0);
     } catch(err) {}
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('') || 'U';

  return (
    <>
      <header style={{ 
        height: 'var(--navbar-height)', 
        background: 'var(--color-bg-neutral)', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'relative',
        zIndex: 100
      }}>
        <div style={{ flex: 1 }}></div>

        <SearchBar />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, justifyContent: 'flex-end' }}>
          <button onClick={() => navigate('/settings')} style={{ color: 'var(--color-text-muted)' }}><Settings size={18} /></button>
          
          {/* Notification Menu */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button 
              onClick={toggleNotifications}
              style={{ position: 'relative', color: showNotifications ? 'var(--color-primary)' : 'var(--color-text-muted)', transition: 'color 0.2s', background: showNotifications ? 'var(--color-bg-input)' : 'transparent', padding: '6px', borderRadius: '8px' }}
            >
              <Bell size={18} />
              {unreadCount > 0 && <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, background: 'var(--color-danger)', borderRadius: '50%', border: '2px solid var(--color-bg-neutral)' }}></span>}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '320px',
                background: 'var(--color-bg-white)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
                animation: 'modalIn 0.2s ease',
                zIndex: 999
              }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-main)' }}>Notifications
                    {unreadCount > 0 && <span className="badge badge-danger" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>{unreadCount} new</span>}
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} style={{ fontSize: '0.75rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                       <Check size={14}/> Mark all read
                    </button>
                  )}
                </div>
                
                <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                     <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No notifications yet.</div>
                  ) : notifications.map(n => (
                     <div key={n.id} style={{ 
                       padding: '1rem', 
                       borderBottom: '1px solid var(--color-border)', 
                       background: n.isRead ? 'transparent' : 'var(--color-bg-input)',
                       display: 'flex',
                       gap: '0.75rem',
                       transition: 'background 0.2s'
                     }}>
                       <div style={{ width: 8, height: 8, borderRadius: '50%', background: n.isRead ? 'transparent' : 'var(--color-primary)', marginTop: '0.4rem', flexShrink: 0 }}></div>
                       <div style={{ flex: 1 }}>
                         <div style={{ fontSize: '0.875rem', color: 'var(--color-text-main)', marginBottom: '0.25rem', lineHeight: 1.4 }}>{n.message}</div>
                         <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{new Date(n.createdAt).toLocaleString()}</div>
                       </div>
                       {!n.isRead && (
                         <button onClick={(e) => markAsRead(n.id, e)} title="Mark as read" style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}>
                           <CheckCircle2 size={16} />
                         </button>
                       )}
                     </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button style={{ color: 'var(--color-text-muted)' }} onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          {/* Profile Avatar — Clickable */}
          <div ref={dropdownRef} style={{ position: 'relative', marginLeft: '0.5rem' }}>
            <button 
              onClick={toggleProfileDropdown}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '4px 8px', borderRadius: '10px', transition: 'background 0.2s', background: showDropdown ? 'var(--color-bg-input)' : 'transparent' }}
            >
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-main)' }}>{user?.name || 'User'}</div>
                <span className={`badge badge-${(user?.role || 'viewer').toLowerCase()}`} style={{ fontSize: '0.6rem' }}>{user?.role}</span>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-neon-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: 700, border: '2px solid var(--color-border)' }}>
                {initials}
              </div>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '200px',
                background: 'var(--color-bg-white)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
                animation: 'modalIn 0.2s ease',
                zIndex: 999
              }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-main)' }}>{user?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{user?.email}</div>
                </div>
                <div style={{ padding: '0.5rem' }}>
                  <button 
                    onClick={() => { setShowDropdown(false); setShowProfile(true); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', width: '100%', borderRadius: '8px', color: 'var(--color-text-main)', fontSize: '0.875rem', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-input)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <User size={16} /> My Profile
                  </button>
                  <button 
                    onClick={() => { setShowDropdown(false); logout(); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', width: '100%', borderRadius: '8px', color: 'var(--color-danger)', fontSize: '0.875rem', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-input)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      {showProfile && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)} style={{ zIndex: 1000 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', borderRadius: '16px' }}>
            {/* Header */}
            <div style={{ position: 'relative', background: 'linear-gradient(135deg, var(--color-primary), var(--color-neon-cyan))', height: '100px', borderRadius: '16px 16px 0 0' }}>
              <button onClick={() => setShowProfile(false)} style={{ position: 'absolute', top: 12, right: 12, color: '#fff', opacity: 0.8 }}>
                <X size={20} />
              </button>
            </div>

            {/* Avatar overlapping header */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-48px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  width: 96, height: 96, borderRadius: '50%', 
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-neon-cyan))', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  color: '#fff', fontSize: '2rem', fontWeight: 700,
                  border: '4px solid var(--color-bg-white)',
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  {initials}
                </div>
                <div style={{ 
                  position: 'absolute', bottom: 0, right: 0, 
                  width: 28, height: 28, borderRadius: '50%', 
                  background: 'var(--color-primary)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--color-bg-white)', cursor: 'pointer'
                }}>
                  <Camera size={14} color="#fff" />
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div style={{ padding: '1.5rem 2rem 2rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{user?.name || 'User'}</h2>
                <span className={`badge badge-${(user?.role || 'viewer').toLowerCase()}`} style={{ marginTop: '0.5rem', display: 'inline-block' }}>{user?.role}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', background: 'var(--color-bg-input)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--color-primary-light, var(--color-bg-neutral))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={18} color="var(--color-primary)" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Full Name</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-main)' }}>{user?.name || '—'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', background: 'var(--color-bg-input)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--color-primary-light, var(--color-bg-neutral))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Email</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-main)' }}>{user?.email || '—'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', background: 'var(--color-bg-input)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--color-primary-light, var(--color-bg-neutral))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Mobile</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-main)' }}>+91 6387831138</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', background: 'var(--color-bg-input)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'var(--color-primary-light, var(--color-bg-neutral))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Status</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: user?.status === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-danger)', display: 'inline-block' }}></span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-main)' }}>{user?.status || 'ACTIVE'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowProfile(false)} 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem', borderRadius: '10px' }}
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
