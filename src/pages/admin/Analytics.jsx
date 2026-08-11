/**
 * Analytics.jsx
 * -------------
 * Recreates "Admin Analytics View": the five top-line stat cards
 * plus a category/location breakdown (the prototype leaves the
 * chart itself as "Charts will render here with backend data" -
 * we go one step further and render a simple bar breakdown since
 * the data is already available from the API).
 */

import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import api from '../../api/api';
import TopBar from '../../components/TopBar';

export default function Analytics() {
  const [data, setData] = useState(null);

  function load() {
    api.get('/admin/analytics').then((res) => setData(res.data)).catch(() => {});
  }

  useEffect(load, []);

  if (!data) return <div style={{ padding: 40, color: 'var(--text-secondary)' }}>Loading analytics...</div>;

  const maxCategory = Math.max(1, ...data.byCategory.map((c) => c.IssueCount));

  return (
    <div>
      <TopBar section="Admin" page="Analytics" onRefresh={load} showExport />
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <Stat value={`${data.ResolutionRate ?? 0}%`} label="Resolution Rate" />
          <Stat value={`${data.AvgResponseHours ?? '—'}h`} label="Avg Response" />
          <Stat value={`${data.AvgResolutionDays ?? '—'}d`} label="Avg Resolution" />
          <Stat value={data.TotalWorkers} label="Workers" />
          <Stat value={data.TotalIssues} label="Total Issues" />
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 18 }}>
            <BarChart3 size={17} /> Issues by Category
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.byCategory.map((c) => (
              <div key={c.CategoryName} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 120, fontSize: 13, fontWeight: 600 }}>{c.CategoryName}</div>
                <div style={{ flex: 1, background: 'var(--bg-page)', borderRadius: 6, overflow: 'hidden', height: 18 }}>
                  <div
                    style={{
                      width: `${(c.IssueCount / maxCategory) * 100}%`,
                      background: 'var(--gold-500)',
                      height: '100%',
                      borderRadius: 6
                    }}
                  />
                </div>
                <div style={{ width: 24, fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{c.IssueCount}</div>
              </div>
            ))}
            {data.byCategory.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No data yet.</p>}
          </div>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 18 }}>Issues by Location</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {data.byLocation.map((l) => (
              <div key={l.LocationName} className="card" style={{ padding: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{l.IssueCount}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{l.LocationName}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="card" style={{ flex: 1, padding: 18, textAlign: 'center' }}>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}
