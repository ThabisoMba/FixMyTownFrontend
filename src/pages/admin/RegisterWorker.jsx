/**
 * RegisterWorker.jsx
 * ------------------
 * Recreates "Admin Worker Registration": a form to add a new
 * worker with an auto-generated password shown to the admin so
 * they can hand it to the worker.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus2, RefreshCw } from 'lucide-react';
import api from '../../api/api';
import TopBar from '../../components/TopBar';

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let out = '';
  for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function RegisterWorker() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ fullName: '', email: '', departmentId: '', phone: '' });
  const [password, setPassword] = useState(generatePassword());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/lookups/departments').then((res) => setDepartments(res.data)).catch(() => {});
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.fullName || !form.departmentId) {
      setError('Full name and department are required.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/admin/workers', { ...form, password });
      navigate('/admin/workers');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not register this worker.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <TopBar section="Admin" page="Register Worker" />
      <div style={{ padding: 24, maxWidth: 520 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 16, marginBottom: 18 }}>
            <UserPlus2 size={19} /> Register New Worker
          </div>

          {error && (
            <div style={{ background: '#fdecec', color: '#c0362c', fontSize: 13, padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Full Name *</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Enter worker's full name" />
            </div>
            <div className="field">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Enter worker's email" />
            </div>
            <div className="field">
              <label>Department *</label>
              <select name="departmentId" value={form.departmentId} onChange={handleChange}>
                <option value="">Select</option>
                {departments.map((d) => <option key={d.DepartmentID} value={d.DepartmentID}>{d.Name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Phone Number</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Enter phone number" />
            </div>

            <div style={{ background: 'var(--gold-100)', border: '1px solid #f3d9a8', borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Auto-Generated Password</div>
              <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{password}</div>
              <button type="button" className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setPassword(generatePassword())}>
                <RefreshCw size={12} /> Generate New
              </button>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, marginBottom: 0 }}>
                Give this password to the worker. They will use it to login.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/workers')}>Cancel</button>
              <button type="submit" className="btn" style={{ background: '#22c55e', color: 'white' }} disabled={saving}>
                {saving ? 'Registering...' : 'Register Worker'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
