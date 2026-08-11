/**
 * InProgress.jsx
 * --------------
 * Recreates the "Worker Work Progress Update" list slide: reports
 * this worker has already started, filtered to Status = In Progress.
 */

import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import api from '../../api/api';
import TopBar from '../../components/TopBar';
import StatusBadge from '../../components/StatusBadge';
import ProgressModal from './ProgressModal';

export default function InProgress() {
  const [reports, setReports] = useState([]);
  const [activeReport, setActiveReport] = useState(null);

  function load() {
    api.get('/worker/assignments', { params: { status: 'In Progress' } }).then((res) => setReports(res.data)).catch(() => {});
  }

  useEffect(load, []);

  return (
    <div>
      <TopBar section="Worker" page="In Progress" onRefresh={load} />
      <div style={{ padding: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 16 }}>
            <Loader size={17} /> In Progress ({reports.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {reports.map((r) => (
              <div key={r.ReportID} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                  <strong>{r.Title}</strong>
                  <span style={{ marginLeft: 'auto' }}><StatusBadge status={r.Status} /></span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  {r.LocationName} &bull; Reported: {new Date(r.CreatedAt).toLocaleDateString()} &bull; {r.Priority} Priority
                </div>
                <p style={{ fontSize: 13, margin: '0 0 12px', color: 'var(--text-secondary)' }}>{r.Description}</p>
                <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 12 }} onClick={() => setActiveReport(r)}>
                  Update Progress
                </button>
              </div>
            ))}
            {reports.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Nothing in progress right now.</p>}
          </div>
        </div>
      </div>

      {activeReport && (
        <ProgressModal report={activeReport} onClose={() => setActiveReport(null)} onUpdated={() => { setActiveReport(null); load(); }} />
      )}
    </div>
  );
}
