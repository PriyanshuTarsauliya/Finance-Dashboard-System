import { useState, useEffect } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, Activity, ChevronDown, Filter, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/apiClient';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendPeriod, setTrendPeriod] = useState('Monthly');
  
  // E.g., '2026-04'
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const fetchTrends = async (period = trendPeriod, fallbackMonth = selectedMonth) => {
    try {
      const [year, month] = fallbackMonth.split('-');
      const queryParams = `?year=${year}&month=${parseInt(month, 10)}`;

      const endpoint = period === 'Daily' ? `/dashboard/daily-trends${queryParams}` 
                     : period === 'Weekly' ? `/dashboard/weekly-trends${queryParams}` 
                     : `/dashboard/monthly-trends?year=${year}`;
      
      const trendsData = await api.get(endpoint).catch(() => []);
      
      const prefix = period === 'Daily' ? 'Day' 
                   : period === 'Weekly' ? 'Week' 
                   : 'Month';
                   
      setTrends(trendsData.map(t => ({ name: `${prefix} ${t.period}`, income: t.income, expense: t.expense })));
    } catch (err) {
      console.error('Error fetching trends:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, recentData] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/recent'),
        ]);
        setSummary(summaryData);
        setRecent(recentData);
        await fetchTrends(trendPeriod, selectedMonth);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedMonth]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--color-text-muted)' }}>Loading dashboard...</div>;

  const fmt = (val) => `₹${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Dashboard Overview</h1>
        
        {/* Month/Year Selection Badge */}
        <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-main)', background: 'var(--color-bg-input)', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.875rem', border: '1px solid var(--color-border)', fontWeight: 500 }}>
          <Calendar size={16} color="var(--color-primary)" /> 
          <input 
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'inherit', 
              outline: 'none',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              fontWeight: 'inherit',
              cursor: 'pointer'
            }}
          />
        </label>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <SummaryCard title="Total Income" amount={fmt(summary?.totalIncome)} trend="+14.5%" positive icon={<ArrowUpRight size={24} color="var(--color-success)" />} />
        <SummaryCard title="Total Expenses" amount={fmt(summary?.totalExpenses)} trend="-2.4%" positive={false} icon={<ArrowDownRight size={24} color="var(--color-danger)" />} />
        <SummaryCard title="Net Balance" amount={fmt(summary?.netBalance)} trend="+8.2%" positive icon={<DollarSign size={24} color="var(--color-primary)" />} />
        <SummaryCard title="Total Records" amount={String(summary?.totalRecords || 0)} trend="+12" positive icon={<Activity size={24} color="var(--color-warning)" />} />
      </div>

      {/* Chart */}
      <div className="card" style={{ height: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Income vs Expenses</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {['Daily', 'Weekly', 'Monthly'].map(period => (
               <button 
                 key={period}
                 onClick={() => {
                   setTrendPeriod(period);
                   fetchTrends(period);
                 }}
                 style={{ 
                   fontSize: '0.875rem', 
                   fontWeight: trendPeriod === period ? 600 : 500, 
                   color: trendPeriod === period ? 'var(--color-primary)' : 'var(--color-text-muted)',
                   background: 'none', border: 'none', cursor: 'pointer' 
                 }}
               >
                 {period}
               </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Income</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-neon-cyan)' }}>{fmt(summary?.totalIncome)}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Expenses</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{fmt(summary?.totalExpenses)}</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height="65%">
          <AreaChart data={trends} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-neon-cyan)" stopOpacity={0.4}/>
                <stop offset="90%" stopColor="var(--color-neon-cyan)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
            <Tooltip contentStyle={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-main)' }} />
            <Area type="monotone" dataKey="expense" stroke="#3F3F46" fillOpacity={0} strokeWidth={2} />
            <Area type="monotone" dataKey="income" stroke="var(--color-neon-cyan)" fillOpacity={1} fill="url(#neonGradient)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Transactions (from API) */}
      <div className="card">
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Recent Transactions</h2>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Date</th><th>Category</th><th>Type</th><th>Amount</th><th>Notes</th></tr></thead>
            <tbody>
              {recent.map(tx => (
                <tr key={tx.id}>
                  <td>{tx.date}</td>
                  <td>{tx.category}</td>
                  <td><span className={`badge badge-${tx.type.toLowerCase()}`}>{tx.type}</span></td>
                  <td style={{ fontWeight: 500 }}>{fmt(tx.amount)}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{tx.notes}</td>
                </tr>
              ))}
              {recent.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No records found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, amount, trend, positive, icon }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div className="flex items-center justify-between">
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>{title}</span>
        <div style={{ padding: '0.5rem', background: 'var(--color-bg-input)', borderRadius: '8px' }}>{icon}</div>
      </div>
      <div className="flex items-center justify-between" style={{ marginTop: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{amount}</span>
        <span className={`badge ${positive ? 'badge-success' : 'badge-danger'}`}>{trend}</span>
      </div>
    </div>
  );
}
