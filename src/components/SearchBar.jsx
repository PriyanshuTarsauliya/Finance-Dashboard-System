import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, FileText, Users, LayoutDashboard, PieChart, DollarSign, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/apiClient';

const PAGES = [
  { type: 'page', name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, description: 'Overview & summary' },
  { type: 'page', name: 'Transactions', path: '/transactions', icon: FileText, description: 'View all transactions' },
  { type: 'page', name: 'Analytics', path: '/analytics', icon: PieChart, description: 'Charts & reports' },
  { type: 'page', name: 'User Management', path: '/users', icon: Users, description: 'Manage users' },
];

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const overlayRef = useRef(null);
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  // Keyboard shortcut: Ctrl+K / ⌘+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  // Debounced search
  const search = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const lower = q.toLowerCase();

    try {
      // 1. Search pages (instant, local)
      const pageResults = PAGES.filter(p =>
        p.name.toLowerCase().includes(lower) || p.description.toLowerCase().includes(lower)
      ).map(p => ({ ...p, id: p.path }));

      // 2. Search transactions (API)
      let transactionResults = [];
      try {
        const txData = await api.get(`/records?page=0&size=50&sortBy=date&sortDir=desc`);
        transactionResults = (txData.content || [])
          .filter(tx =>
            tx.category?.toLowerCase().includes(lower) ||
            tx.notes?.toLowerCase().includes(lower) ||
            tx.type?.toLowerCase().includes(lower) ||
            String(tx.amount).includes(q)
          )
          .slice(0, 5)
          .map(tx => ({
            type: 'transaction',
            id: tx.id,
            name: `${tx.category} — ₹${Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            description: `${tx.type} • ${tx.date}${tx.notes ? ' • ' + tx.notes : ''}`,
            icon: DollarSign,
            path: '/transactions',
            badge: tx.type,
          }));
      } catch { /* ignore if unauthorized */ }

      // 3. Search users (API, admin only)
      let userResults = [];
      try {
        const userData = await api.get(`/users?page=0&size=50&sortBy=name&sortDir=asc`);
        userResults = (userData.content || [])
          .filter(u =>
            u.name?.toLowerCase().includes(lower) ||
            u.email?.toLowerCase().includes(lower) ||
            u.role?.toLowerCase().includes(lower)
          )
          .slice(0, 4)
          .map(u => ({
            type: 'user',
            id: u.id,
            name: u.name,
            description: `${u.email} • ${u.role}`,
            icon: Users,
            path: '/users',
            badge: u.role,
          }));
      } catch { /* ignore if not admin */ }

      setResults([...pageResults, ...transactionResults, ...userResults]);
      setSelectedIndex(0);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 250);
  };

  const handleSelect = (item) => {
    setOpen(false);
    navigate(item.path);
  };

  const handleKeyNav = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  // Group results by type
  const grouped = results.reduce((acc, item) => {
    const label = item.type === 'page' ? 'Pages' : item.type === 'transaction' ? 'Transactions' : 'Users';
    if (!acc[label]) acc[label] = [];
    acc[label].push(item);
    return acc;
  }, {});

  let flatIndex = -1;

  return (
    <>
      {/* Trigger Button (inline in navbar) */}
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', background: 'var(--color-bg-input)',
          padding: '0.5rem 1rem', borderRadius: '8px', width: '350px', gap: '0.5rem',
          border: '1px solid var(--color-border)', cursor: 'pointer', transition: 'border-color 0.2s'
        }}
      >
        <Search size={16} color="var(--color-text-muted)" />
        <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--color-text-muted)', textAlign: 'left' }}>Search anything...</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <kbd style={{ background: 'var(--color-border)', color: 'var(--color-text-muted)', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontFamily: 'inherit' }}>⌘</kbd>
          <kbd style={{ background: 'var(--color-border)', color: 'var(--color-text-muted)', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', fontFamily: 'inherit' }}>K</kbd>
        </div>
      </button>

      {/* Command Palette Overlay */}
      {open && (
        <div
          ref={overlayRef}
          onClick={(e) => { if (e.target === overlayRef.current) setOpen(false); }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            paddingTop: '15vh', zIndex: 9999, animation: 'modalIn 0.15s ease'
          }}
        >
          <div style={{
            width: '100%', maxWidth: '560px',
            background: 'var(--color-bg-white)', border: '1px solid var(--color-border)',
            borderRadius: '16px', boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
            overflow: 'hidden'
          }}>
            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)', gap: '0.75rem' }}>
              <Search size={20} color="var(--color-text-muted)" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search pages, transactions, users..."
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyNav}
                style={{
                  flex: 1, border: 'none', background: 'transparent', fontSize: '1rem',
                  color: 'var(--color-text-main)', outline: 'none'
                }}
              />
              {query && (
                <button onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}>
                  <X size={16} color="var(--color-text-muted)" />
                </button>
              )}
              <kbd style={{ background: 'var(--color-bg-input)', color: 'var(--color-text-muted)', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>ESC</kbd>
            </div>

            {/* Results */}
            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '0.5rem' }}>
              {!query && (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <Search size={32} color="var(--color-border)" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Start typing to search across pages, transactions, and users</p>
                </div>
              )}

              {query && loading && (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                  Searching...
                </div>
              )}

              {query && !loading && results.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No results found for "<strong>{query}</strong>"</p>
                </div>
              )}

              {Object.entries(grouped).map(([groupLabel, items]) => (
                <div key={groupLabel}>
                  <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {groupLabel}
                  </div>
                  {items.map((item) => {
                    flatIndex++;
                    const idx = flatIndex;
                    const Icon = item.icon;
                    const isActive = idx === selectedIndex;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
                          padding: '0.65rem 0.75rem', borderRadius: '10px', textAlign: 'left',
                          color: 'var(--color-text-main)',
                          background: isActive ? 'var(--color-bg-input)' : 'transparent',
                          transition: 'background 0.1s'
                        }}
                      >
                        <div style={{
                          width: 36, height: 36, borderRadius: '8px',
                          background: isActive ? 'var(--color-primary)' : 'var(--color-bg-neutral)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'background 0.15s', flexShrink: 0
                        }}>
                          <Icon size={18} color={isActive ? '#fff' : 'var(--color-text-muted)'} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</div>
                        </div>
                        {item.badge && (
                          <span className={`badge badge-${item.badge.toLowerCase()}`} style={{ fontSize: '0.6rem', flexShrink: 0 }}>{item.badge}</span>
                        )}
                        {isActive && <ArrowRight size={14} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Footer */}
            {query && results.length > 0 && (
              <div style={{ padding: '0.6rem 1rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <kbd style={{ background: 'var(--color-bg-input)', padding: '1px 5px', borderRadius: '3px', border: '1px solid var(--color-border)', fontSize: '10px' }}>↑↓</kbd> Navigate
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <kbd style={{ background: 'var(--color-bg-input)', padding: '1px 5px', borderRadius: '3px', border: '1px solid var(--color-border)', fontSize: '10px' }}>↵</kbd> Open
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <kbd style={{ background: 'var(--color-bg-input)', padding: '1px 5px', borderRadius: '3px', border: '1px solid var(--color-border)', fontSize: '10px' }}>Esc</kbd> Close
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
