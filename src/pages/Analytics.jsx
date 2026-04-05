import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/apiClient';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#06b6d4', '#EF4444', '#8B5CF6'];

export default function Analytics() {
  const [categories, setCategories] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catData, weeklyData] = await Promise.all([
          api.get('/dashboard/category-totals'),
          api.get('/dashboard/weekly-trends'),
        ]);
        setCategories(catData);
        setWeekly(weeklyData.map(w => ({ name: `Week ${w.period}`, income: Number(w.income), expense: Number(w.expense) })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--color-text-muted)' }}>Loading analytics...</div>;

  const pieData = categories.filter(c => c.type === 'EXPENSE').map(c => ({ name: c.category, value: Number(c.total) }));
  const topCategories = categories.sort((a, b) => Number(b.total) - Number(a.total)).slice(0, 5);

  const fmt = (val) => `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Analytics & Reports</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Expenses by Category</h2>
          <div style={{ height: 300 }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-main)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>No data</div>}
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Weekly Trends</h2>
          <div style={{ height: 300 }}>
            {weekly.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: 'var(--color-bg-white)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text-main)' }} />
                  <Bar dataKey="income" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="var(--color-danger)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>No data</div>}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Top Categories by Spending</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {topCategories.map((cat, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--color-bg-input)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length] }}></div>
                <span style={{ fontWeight: 500 }}>{cat.category}</span>
                <span className={`badge badge-${cat.type.toLowerCase()}`}>{cat.type}</span>
              </div>
              <span style={{ fontWeight: 600 }}>{fmt(cat.total)}</span>
            </div>
          ))}
          {topCategories.length === 0 && <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No data</div>}
        </div>
      </div>
    </div>
  );
}
