/**
 * Completed.jsx
 * -------------
 * Recreates "Completed Tasks View": resolved reports archived with
 * a trophy empty-state matching the prototype exactly when there's
 * nothing resolved yet.
 */

import { useEffect, useState } from 'react';
import { CheckCircle2, Trophy } from 'lucide-react';
import api from '../../api/api';
import TopBar from '../../components/TopBar';

export default function Completed() {
  const [reports, setReports] = useState([]);

  function load() {
    api.get('/worker/assignments', { params: { status: 'Resolved' } }).then((res) => setReports(res.data)).catch(() => {});
  }

  useEffect(load, []);

  return (
    <div>
      <TopBar section="Worker" page="Completed" onRefresh={load} />
      <div style={{ padding: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 16 }}>
            <CheckCircle2 size={17} /> Completed ({reports.length})
          </div>

          {reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-secondary)' }}>
              <Trophy size={40} color="var(--gold-500)" style={{ marginBottom: 12 }} />
              <div style={{ fontWeight: 600 }}>No completed issues yet.</div>
              <div style={{ fontSize: 13 }}>Resolved issues will appear here.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {reports.map((r) => (
                <div key={r.ReportID} className="card" style={{ padding: 16 }}>
                  <strong>{r.Title}</strong>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    {r.LocationName} &bull; Resolved &bull; {r.CategoryName}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
