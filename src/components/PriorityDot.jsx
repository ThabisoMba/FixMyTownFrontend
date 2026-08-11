/**
 * PriorityDot.jsx
 * ---------------
 * Small colored dot + label used for Low/Medium/High/Critical,
 * matching the priority selector in "Making a Report Step 3".
 */

const COLORS = {
  Low: 'var(--priority-low)',
  Medium: 'var(--priority-medium)',
  High: 'var(--priority-high)',
  Critical: 'var(--priority-critical)'
};

export default function PriorityDot({ priority }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: COLORS[priority] || COLORS.Medium,
          display: 'inline-block'
        }}
      />
      {priority}
    </span>
  );
}
