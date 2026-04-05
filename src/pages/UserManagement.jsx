import { useState, useEffect } from 'react';
import { Plus, Edit2, UserX, UserCheck, X } from 'lucide-react';
import api from '../api/apiClient';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'VIEWER', status: 'ACTIVE' });
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const result = await api.get('/users?page=0&size=50&sortBy=createdAt&sortDir=desc');
      setUsers(result.content);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', form);
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'VIEWER', status: 'ACTIVE' });
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await api.patch(`/users/${id}/status`);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="flex items-center justify-between">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>User Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> Add User</button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</td></tr>
              ) : users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{u.name}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{u.email}</td>
                  <td><span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span></td>
                  <td><span className={`badge ${u.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>{u.status}</span></td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => toggleStatus(u.id)} title="Toggle Status" style={{ color: u.status === 'ACTIVE' ? 'var(--color-danger)' : 'var(--color-success)' }}>
                        {u.status === 'ACTIVE' ? <UserX size={16} /> : <UserCheck size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Add New User</h3>
              <button onClick={() => setShowModal(false)}><X size={20} color="var(--color-text-muted)" /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Full Name</label>
                  <input type="text" className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Email</label>
                  <input type="email" className="input-field" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Password</label>
                  <input type="password" className="input-field" placeholder="Min 8 chars" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Role</label>
                  <select className="input-field" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                    <option value="VIEWER">Viewer</option>
                    <option value="ANALYST">Analyst</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
