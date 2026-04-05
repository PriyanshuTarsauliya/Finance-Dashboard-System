import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, PieChart, Users, Menu, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const role = user?.role || 'VIEWER';

  const navItems = [
    { name: 'Insights', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'ANALYST', 'VIEWER'] },
    { name: 'Transactions', path: '/transactions', icon: ReceiptText, roles: ['ADMIN', 'ANALYST', 'VIEWER'] },
    { name: 'Analytics', path: '/analytics', icon: PieChart, roles: ['ADMIN', 'ANALYST'] },
    { name: 'Users', path: '/users', icon: Users, roles: ['ADMIN'] },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside style={{ 
      width: collapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)', 
      background: 'var(--color-bg-neutral)',
      transition: 'width 0.3s',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', height: 'var(--navbar-height)' }}>
        {!collapsed && <h2 style={{ fontSize: '1.25rem', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 24, height: 24, background: 'var(--color-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 8, height: 8, background: '#fff', borderRadius: '50%' }}></div>
          </div>
          FinanceBoard
        </h2>}
        <button onClick={() => setCollapsed(!collapsed)} style={{ color: 'var(--color-text-muted)' }}>
          <Menu size={20} />
        </button>
      </div>
      
      <nav style={{ flex: 1, padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {visibleItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink 
              key={item.path} 
              to={item.path}
              style={({isActive}) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '0.75rem' : '0.6rem 1.5rem',
                margin: collapsed ? '0 0.5rem' : '0 1rem',
                borderRadius: '8px',
                color: isActive ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                backgroundColor: isActive ? 'var(--color-bg-white)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                transition: 'all 0.2s',
                gap: '0.75rem'
              })}
            >
              <Icon size={18} />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>
      
      <div style={{ padding: '1.5rem' }}>
        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', justifyContent: collapsed ? 'center' : 'flex-start', width: '100%' }}>
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
