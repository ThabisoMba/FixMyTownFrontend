/**
 * ManageWorkers.jsx
 * -----------------
 * Recreates "Admin Workers Management": a table of every worker
 * with department, contact info, active issue count and status.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Ban, CheckCircle, UserPlus } from 'lucide-react';
import api from '../../api/api';
import TopBar from '../../components/TopBar';

export default function ManageWorkers() {
  const [workers, setWorkers] = useState([]);

  function load() {
    api.get('/admin/workers').then((res) => setWorkers(res.data)).catch(() => {});
  }

  useEffect(load, []);

  function handleToggleStatus(worker) {
    const nextIsActive = !worker.IsActive;
    const action = nextIsActive ? 'reactivate' : 'deactivate';

    if (!window.confirm(`Are you sure you want to ${action} ${worker.FullName}?`)) {
      return;
    }

    api
      .put(`/admin/workers/${worker.WorkerID}/status`, { isActive: nextIsActive })
      .then(() => load())
      .catch((err) => {
        alert(err.response?.data?.message || `Failed to ${action} worker.`);
      });
  }

  return (
    <div>
      <TopBar section="Admin" page="Manage Workers" onRefresh={load} showExport />
      <div style={{ padding: 24 }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <strong style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={17} /> Workers ({workers.length})
            </strong>
            <Link to="/admin/workers/new" className="btn btn-primary" style={{ marginLeft: 'auto', padding: '8px 14px', fontSize: 13, textDecoration: 'none' }}>
              <UserPlus size={14} /> Register Worker
            </Link>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase' }}>
                {['Name', 'Department', 'Email', 'Phone', 'Issues', 'Status', 'Actions'].map((h) => <th key={h} style={{ padding: '10px 16px' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {workers.map((w) => (
                <tr key={w.WorkerID} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{w.FullName}</td>
                  <td style={{ padding: '12px 16px' }}>{w.DepartmentName}</td>
                  <td style={{ padding: '12px 16px' }}>{w.Email}</td>
                  <td style={{ padding: '12px 16px' }}>{w.Phone || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="badge" style={{ background: 'var(--gold-100)', color: 'var(--gold-600)' }}>{w.ActiveIssues}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ color: w.IsActive ? '#22c55e' : 'var(--text-muted)', fontWeight: 600, fontSize: 12 }}>
                      &bull; {w.IsActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <StatusToggleBtn worker={w} onToggle={() => handleToggleStatus(w)} />
                  </td>
                </tr>
              ))}
              {workers.length === 0 && (
                <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>No workers registered yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusToggleBtn({ worker, onToggle }) {
  const isActive = worker.IsActive;

  return (
    <button
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 6, border: 'none',
        background: isActive ? '#fdecec' : '#e9f9ef',
        color: isActive ? '#ef4444' : '#22c55e',
        fontSize: 12, fontWeight: 600, cursor: 'pointer'
      }}
    >
      {isActive ? <Ban size={14} /> : <CheckCircle size={14} />}
      {isActive ? 'Deactivate' : 'Activate'}
    </button>
  );
}