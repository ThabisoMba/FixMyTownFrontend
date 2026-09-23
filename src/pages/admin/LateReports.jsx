/**
 * LateReports.jsx
 * ----------------
 * A dedicated "Late Reports" page for the admin sidebar. Reuses the
 * existing, already-tested AllReports table (search, view modal,
 * assign button, export) rather than duplicating it - it's the same
 * component, just always filtered to reports flagged IsLate by the
 * database trigger / sweep (see database/late-reports-migration.sql).
 */

import AllReports from './AllReports';

export default function LateReports() {
  return <AllReports lateOnly />;
}
