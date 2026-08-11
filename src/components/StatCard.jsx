/**
 * StatCard.jsx
 * ------------
 * The little "icon + big number + label" card used across every
 * dashboard (Total Reports, In Progress, Resolved, New Today, etc.)
 */

export default function StatCard({ icon, value, label, iconBg = 'var(--gold-100)', iconColor = 'var(--gold-600)' }) {
  return (
    <div className="card" style={{ padding: '20px', textAlign: 'center', flex: 1, minWidth: 140 }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: iconBg,
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px'
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
        {label}
      </div>
    </div>
  );
}
