import { useEffect, useState } from 'react';
import { UserCog, UserPlus2 } from 'lucide-react';
import api from '../../api/api';
import TopBar from '../../components/TopBar';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';

export default function AssignIssues() {
  const [reports, setReports] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [active, setActive] = useState(null); // report being assigned
  const [departmentId, setDepartmentId] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  function load() {
    api.get('/admin/reports/unassigned').then((res) => setReports(res.data));
    api.get('/lookups/departments').then((res) => setDepartments(res.data));
    api.get('/admin/workers').then((res) => setWorkers(res.data));
  }

  useEffect(load, []);

  function openAssign(report) {
    setActive(report);
    setDepartmentId('');
    setWorkerId('');
    setNote('');
  }

  async function handleAssign() {
    setSaving(true);
    try {
      await api.post(`/admin/reports/${active.ReportID}/assign`, { departmentId, workerId, note });
      setActive(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not assign this issue.');
    } finally {
      setSaving(false);
    }
  }

  const workersInDept = workers.filter((w) => String(w.DepartmentID) === String(departmentId) || !departmentId);

  return (
    <div>
      <TopBar section="Admin" page="Assign Issues" onRefresh={load} showExport />
      <div style={{ padding: 24 }}>
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserCog size={17} /> Unassigned Issues
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase' }}>
                {['ID', 'Issue', 'Category', 'Status', 'Reported', 'Actions'].map((h) => <th key={h} style={{ padding: '10px 16px' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.ReportID} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>#{r.ReportCode}</td>
                  <td style={{ padding: '12px 16px' }}>{r.Title}</td>
                  <td style={{ padding: '12px 16px' }}>{r.CategoryName}</td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={r.Status} /></td>
                  <td style={{ padding: '12px 16px' }}>{new Date(r.CreatedAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => openAssign(r)}>
                      <UserPlus2 size={13} /> Assign
                    </button>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>Nothing to assign right now — nice and clear!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {active && (
        <Modal title="Assign Issue" icon={<UserPlus2 size={18} />} onClose={() => setActive(null)} width={460}>
          <div className="field">
            <label>Issue</label>
            <div style={{ fontWeight: 600 }}>{active.Title}</div>
          </div>
          <div className="field">
            <label>Department *</label>
            <select value={departmentId} onChange={(e) => { setDepartmentId(e.target.value); setWorkerId(''); }}>
              <option value="">Select</option>
              {departments.map((d) => <option key={d.DepartmentID} value={d.DepartmentID}>{d.Name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Worker *</label>
            <select value={workerId} onChange={(e) => setWorkerId(e.target.value)}>
              <option value="">Select</option>
              {workersInDept.map((w) => <option key={w.WorkerID} value={w.WorkerID}>{w.FullName}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Note</label>
            <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note for the worker" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button className="btn btn-outline" onClick={() => setActive(null)}>Cancel</button>
            <button className="btn btn-primary" disabled={!departmentId || !workerId || saving} onClick={handleAssign}>
              {saving ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
