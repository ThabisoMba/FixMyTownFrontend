import { useEffect, useState } from 'react';
import { ClipboardList, Loader, CheckCircle2, AlertTriangle } from 'lucide-react';
import api from '../../api/api';
import TopBar from '../../components/TopBar';
import StatusBadge from '../../components/StatusBadge';
import ProgressModal from './ProgressModal';
import PageTransition from '../../components/PageTransition';


export default function WorkerDashboard() {
  const [data, setData] = useState(null);
  const [activeReport, setActiveReport] = useState(null);

  function load() {
    api.get('/worker/dashboard').then((res) => setData(res.data)).catch(() => {});
  }

  useEffect(load, []);

  if (!data) return <div style={{ padding: 40, color: 'var(--text-secondary)' }}>Loading dashboard...</div>;

  return (
    <>
    <PageTransition>
    <div>
      <TopBar section="Worker" page="Dashboard" onRefresh={load} />
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <Stat icon={<ClipboardList size={20} />} value={data.counts.TotalAssigned} label="Total Assigned" bg="#e8f0fe" color="#2f6fed" />
          <Stat icon={<Loader size={20} />} value={data.counts.InProgress} label="In Progress" bg="#fef3e2" color="#d97706" />
          <Stat icon={<CheckCircle2 size={20} />} value={data.counts.Completed} label="Completed" bg="#e6f4ea" color="#1e8e3e" />
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 16 }}>
            <AlertTriangle size={17} color="#f97316" /> Priority Issues
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>High &amp; Critical</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {data.priorityIssues.map((r) => (
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
            {data.priorityIssues.length === 0 && (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>No high-priority issues right now.</p>
            )}
          </div>
        </div>
      </div>

      {activeReport && (
        <ProgressModal
          report={activeReport}
          onClose={() => setActiveReport(null)}
          onUpdated={() => { setActiveReport(null); load(); }}
        />
      )}
    </div>
    </PageTransition>
    </>
  );
}

function Stat({ icon, value, label, bg, color }) {
  return (
    <div className="card" style={{ flex: 1, padding: 20, textAlign: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
        {icon}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}
