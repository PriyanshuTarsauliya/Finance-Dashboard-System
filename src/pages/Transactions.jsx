import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/apiClient';

export default function Transactions() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [data, setData] = useState({ content: [], totalElements: 0, totalPages: 0 });
  const [page, setPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ type: '', category: '' });
  const [form, setForm] = useState({ amount: '', type: 'EXPENSE', category: '', date: '', notes: '' });
  const [loading, setLoading] = useState(true);
  const size = 10;

  const fetchRecords = async () => {
    setLoading(true);
    try {
      let query = `/records?page=${page}&size=${size}&sortBy=date&sortDir=desc`;
      if (filters.type) query += `&type=${filters.type}`;
      if (filters.category) query += `&category=${filters.category}`;
      const result = await api.get(query);
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, [page, filters]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/records', { ...form, amount: parseFloat(form.amount) });
      setShowModal(false);
      setForm({ amount: '', type: 'EXPENSE', category: '', date: '', notes: '' });
      fetchRecords();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Soft-delete this record?')) return;
    try {
      await api.delete(`/records/${id}`);
      fetchRecords();
    } catch (err) {
      alert(err.message);
    }
  };

  const fmt = (val) => `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="flex items-center justify-between">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Transactions</h1>
        {isAdmin && <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> Add Transaction</button>}
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <select className="input-field" style={{ width: 'auto' }} value={filters.type} onChange={e => { setFilters({ ...filters, type: e.target.value }); setPage(0); }}>
            <option value="">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
          <select className="input-field" style={{ width: 'auto' }} value={filters.category} onChange={e => { setFilters({ ...filters, category: e.target.value }); setPage(0); }}>
            <option value="">All Categories</option>
            {['Software','Hardware','Marketing','Consulting','Payroll','Office','Cloud Infrastructure','Sales'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="table-container">
          <table className="table">
            <thead><tr><th>Date</th><th>Category</th><th>Type</th><th>Amount</th><th>Notes</th>{isAdmin && <th>Actions</th>}</tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={isAdmin ? 6 : 5} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</td></tr>
              ) : data.content.length === 0 ? (
                <tr><td colSpan={isAdmin ? 6 : 5} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No records found</td></tr>
              ) : data.content.map(tx => (
                <tr key={tx.id}>
                  <td>{tx.date}</td>
                  <td>{tx.category}</td>
                  <td><span className={`badge badge-${tx.type.toLowerCase()}`}>{tx.type}</span></td>
                  <td style={{ fontWeight: 500 }}>{fmt(tx.amount)}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{tx.notes}</td>
                  {isAdmin && (
                    <td>
                      <div className="flex gap-2">
                        <button className="btn-danger" onClick={() => handleDelete(tx.id)}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Showing {data.content.length} of {data.totalElements} entries
          </span>
          <div className="flex gap-2">
            <button className="btn btn-outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
            <button className="btn btn-outline" disabled={page >= data.totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Add Transaction</h3>
              <button onClick={() => setShowModal(false)}><X size={20} color="var(--color-text-muted)" /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Amount</label>
                  <input type="number" step="0.01" className="input-field" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Type</label>
                  <select className="input-field" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Category</label>
                  <select className="input-field" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
                    <option value="">Select...</option>
                    {['Software','Hardware','Marketing','Consulting','Payroll','Office','Cloud Infrastructure','Sales'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Date</label>
                  <input type="date" className="input-field" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Notes</label>
                  <textarea className="input-field" rows="2" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}></textarea>
                </div>
              </div>
              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
