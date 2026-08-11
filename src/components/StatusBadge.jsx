/**
 * StatusBadge.jsx
 * ---------------
 * Renders the small colored pill used everywhere a report's status
 * is shown (tables, cards, timelines). Colors come straight from
 * theme.css so they always match the rest of the app.
 */

const STYLES = {
  Reported: { bg: 'var(--status-reported-bg)', text: 'var(--status-reported-text)' },
  Assigned: { bg: 'var(--status-assigned-bg)', text: 'var(--status-assigned-text)' },
  'In Progress': { bg: 'var(--status-progress-bg)', text: 'var(--status-progress-text)' },
  Resolved: { bg: 'var(--status-resolved-bg)', text: 'var(--status-resolved-text)' }
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || STYLES.Reported;
  return (
    <span
      className="badge"
      style={{ background: style.bg, color: style.text, textTransform: 'uppercase' }}
    >
      {status}
    </span>
  );
}
