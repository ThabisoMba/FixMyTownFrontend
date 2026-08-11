import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Flag, Loader, CheckCircle2, Clock, HelpCircle, Lightbulb, CheckCircle } from 'lucide-react';
import api from '../../api/api';
import PageTransition from '../../components/PageTransition';

export default function CitizenDashboard() {
  const { openWizard } = useOutletContext();
  const [stats, setStats] = useState(null);

useEffect(() => {
  api.get('/issues/public-stats')
    .then((res) => {
      setStats({
        totalReports: res.data.TotalReports,
        inProgress: res.data.InProgress,
        resolved: res.data.Resolved,
        newToday: res.data.NewToday
      });
    })
    .catch((err) => {
      console.error('Error fetching stats:', err);
    });
}, []);

  const steps = [
    { num: 1, title: 'Report', text: 'Click on the map, describe the issue, and upload photos. It takes less than 2 minutes.' },
    { num: 2, title: 'Track', text: "Follow your report's progress in real-time. See when it's assigned and worked on." },
    { num: 3, title: 'Get Notified', text: 'Receive updates when your issue status changes — no need to call the municipality.' },
    { num: 4, title: 'See Results', text: 'Your report helps improve your community. See resolved issues on the public map.' }
  ];

  const tips = [
    'Be specific — Describe exactly where the issue is (e.g., "outside Shoprite on Main St")',
    'Add photos — Clear photos help workers understand the problem before arriving',
    'Choose the right category — This ensures your report goes to the correct department',
    'Set the priority — Critical issues like exposed wiring get faster attention'
  ];

  return (
    <>
    <PageTransition>
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 16 }}>
          <HelpCircle size={18} color="var(--navy-800)" /> How It Works
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {steps.map((s) => (
            <div key={s.num} className="card" style={{ padding: '18px 14px', textAlign: 'center' }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'var(--navy-800)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px',
                  fontWeight: 700
                }}
              >
                {s.num}
              </div>
              <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 14 }}>{s.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.text}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14 }}>
        <StatCard icon={<Flag size={20} />} value={stats?.totalReports ?? '—'} label="Total Reports" color="#2f6fed" />
        <StatCard icon={<Loader size={20} />} value={stats?.inProgress ?? '—'} label="In Progress" color="#f2a93d" />
        <StatCard icon={<CheckCircle2 size={20} />} value={stats?.resolved ?? '—'} label="Resolved" color="#22c55e" />
        <StatCard icon={<Clock size={20} />} value={stats?.newToday ?? '—'} label="New Today" color="#9333ea" />
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 14 }}>
          <Lightbulb size={18} color="var(--gold-500)" /> Tips for a Great Report
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
          {tips.map((tip) => {
            const [bold, ...rest] = tip.split('—');
            return (
              <div key={tip} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                <CheckCircle size={15} color="var(--gold-500)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>
                  <strong style={{ color: 'var(--text-primary)' }}>{bold.trim()}</strong> —{rest.join('—')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <button className="btn btn-gold" style={{ alignSelf: 'center', padding: '14px 28px' }} onClick={openWizard}>
        Report a New Issue
      </button>
    </div>
    </PageTransition>
    </>
  );
}

function StatCard({ icon, value, label, color }) {
  return (
    <div className="card" style={{ flex: 1, padding: 20, textAlign: 'center' }}>
      <div style={{ color, marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 700 }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}