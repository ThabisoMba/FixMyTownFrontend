import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Eye, RefreshCw, Search, X } from 'lucide-react';

import api from '../../api/api';
import TopBar from '../../components/TopBar';
import StatusBadge from '../../components/StatusBadge';
import PriorityDot from '../../components/PriorityDot';

const LATE_AFTER_DAYS = 2;
const DAY_MS = 24 * 60 * 60 * 1000;

const ACTIVE_STATUSES = new Set([
  'Reported',
  'Assigned',
  'In Progress'
]);

const STATUS_OPTIONS = [
  'All Status',
  'Reported',
  'Assigned',
  'In Progress'
];

export default function LateReports() {
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState('All Status');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  async function loadReports() {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/admin/reports');
      setReports(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Late reports loading error:', err);
      setReports([]);
      setError(
        err.response?.data?.message ||
        'Could not load late reports.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  const lateReports = useMemo(() => {
    return reports
      .filter(isLateReport)
      .sort(
        (a, b) =>
          new Date(b.CreatedAt).getTime() -
          new Date(a.CreatedAt).getTime()
      );
  }, [reports]);

  const visibleReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return lateReports.filter((report) => {
      const reportStatus = normaliseStatus(report.Status);

      if (
        status !== 'All Status' &&
        reportStatus !== status
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        report.ReportCode,
        report.Title,
        report.CategoryName,
        report.Priority,
        report.LocationName,
        report.WorkerName,
        reportStatus
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [lateReports, search, status]);

  async function viewReport(report) {
    setLoadingDetails(true);
    setError('');

    try {
      const response = await api.get('/issues/search', {
        params: {
          code: report.ReportCode
        }
      });

      setSelectedReport({
        ...report,
        ...response.data,
        IsLate: true
      });
    } catch (err) {
      console.error('Late report details error:', err);

      setSelectedReport({
        ...report,
        IsLate: true
      });

      setError(
        err.response?.data?.message ||
        'Full report details could not be loaded.'
      );
    } finally {
      setLoadingDetails(false);
    }
  }

  return (
    <div>
      <TopBar
        section="Admin"
        page="Late Reports"
        onRefresh={loadReports}
        showExport
      />

      <div style={{ padding: 24 }}>
        <div className="card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)'
            }}
          >
            <strong
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#991b1b'
              }}
            >
              <AlertTriangle size={17} />
              Late Reports ({visibleReports.length})
            </strong>

            <div
              style={{
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap'
              }}
            >
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'white',
                  fontSize: 13
                }}
              >
                {STATUS_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Search
                  size={14}
                  style={{
                    position: 'absolute',
                    left: 10,
                    color: 'var(--text-muted)',
                    pointerEvents: 'none'
                  }}
                />

                <input
                  value={search}
                  placeholder="Search reports..."
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: 220,
                    padding: '8px 34px 8px 30px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    fontSize: 13
                  }}
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    title="Clear search"
                    style={{
                      position: 'absolute',
                      right: 5,
                      width: 25,
                      height: 25,
                      border: 'none',
                      borderRadius: 6,
                      background: 'transparent',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <button
                type="button"
                className="btn btn-outline"
                onClick={loadReports}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 12px'
                }}
              >
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>
          </div>

          <div
            style={{
              padding: '10px 20px',
              borderBottom: '1px solid var(--border)',
              background: '#fff7f7',
              color: '#7f1d1d',
              fontSize: 12
            }}
          >
            Shows unresolved reports that have remained open for at least{' '}
            <strong>{LATE_AFTER_DAYS} days</strong>. Resolved reports are excluded.
          </div>

          {error && (
            <div
              style={{
                margin: '14px 20px 0',
                padding: '10px 12px',
                border: '1px solid #fecaca',
                borderRadius: 8,
                background: '#fef2f2',
                color: '#991b1b',
                fontSize: 12
              }}
            >
              {error}
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 13
              }}
            >
              <thead>
                <tr
                  style={{
                    textAlign: 'left',
                    color: 'var(--text-secondary)',
                    fontSize: 11,
                    textTransform: 'uppercase'
                  }}
                >
                  {[
                    'ID',
                    'Issue',
                    'Category',
                    'Priority',
                    'Location',
                    'Status',
                    'Worker',
                    'Reported',
                    'View'
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: '10px 16px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        padding: 30,
                        textAlign: 'center',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      Loading late reports...
                    </td>
                  </tr>
                )}

                {!loading &&
                  visibleReports.map((report) => (
                    <tr
                      key={
                        report.ReportID ??
                        report.ReportId ??
                        report.ReportCode
                      }
                      style={{
                        borderTop: '1px solid var(--border)'
                      }}
                    >
                      <td
                        style={{
                          padding: '12px 16px',
                          fontWeight: 700,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        #{report.ReportCode}
                      </td>

                      <td
                        style={{
                          padding: '12px 16px',
                          minWidth: 180
                        }}
                      >
                        {report.Title}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        {report.CategoryName || '—'}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <PriorityDot priority={report.Priority} />
                      </td>

                      <td
                        style={{
                          padding: '12px 16px',
                          minWidth: 180
                        }}
                      >
                        {report.LocationName || '—'}
                      </td>

                      <td
                        style={{
                          padding: '12px 16px',
                          whiteSpace: 'nowrap',
                          minWidth: 190
                        }}
                      >
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            flexWrap: 'nowrap',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <StatusBadge
                            status={normaliseStatus(report.Status)}
                          />
                          <LateBadge />
                        </div>
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        {report.WorkerName || '—'}
                      </td>

                      <td
                        style={{
                          padding: '12px 16px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {formatDate(report.CreatedAt)}
                      </td>

                      <td style={{ padding: '12px 16px' }}>
                        <button
                          type="button"
                          onClick={() => viewReport(report)}
                          disabled={loadingDetails}
                          title="View report"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            border: 'none',
                            background: 'var(--bg-page)',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}

                {!loading && visibleReports.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        padding: 32,
                        textAlign: 'center',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      No late unresolved reports match the current filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedReport && (
        <ReportModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}

function isLateReport(report) {
  if (!report) {
    return false;
  }

  const status = normaliseStatus(report.Status);

  if (!ACTIVE_STATUSES.has(status)) {
    return false;
  }

  if (report.IsLate === true) {
    return true;
  }

  const createdAt = new Date(report.CreatedAt);

  if (Number.isNaN(createdAt.getTime())) {
    return false;
  }

  return (
    Date.now() - createdAt.getTime() >=
    LATE_AFTER_DAYS * DAY_MS
  );
}

function normaliseStatus(value) {
  const status = String(value || '').trim();

  if (status === 'InProgress') {
    return 'In Progress';
  }

  return status;
}

function LateBadge() {
  return (
    <span
      className="badge"
      title="This unresolved report has been open for at least 2 days."
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        background: '#fee2e2',
        color: '#991b1b',
        border: '1px solid #fecaca',
        fontWeight: 800,
        letterSpacing: 0.3
      }}
    >
      LATE
    </span>
  );
}

function ReportModal({ report, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        padding: 20,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Late report details"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 720,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 24,
          borderRadius: 12,
          background: 'white',
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.25)'
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 34,
            height: 34,
            border: '1px solid var(--border)',
            borderRadius: '50%',
            background: 'var(--bg-page)',
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={17} />
        </button>

        <div
          style={{
            paddingRight: 48,
            paddingBottom: 18,
            marginBottom: 20,
            borderBottom: '1px solid var(--border)'
          }}
        >
          <div
            style={{
              marginBottom: 5,
              color: 'var(--text-secondary)',
              fontSize: 11,
              textTransform: 'uppercase'
            }}
          >
            Late Report
          </div>

          <div style={{ fontSize: 20, fontWeight: 800 }}>
            #{report.ReportCode}
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 17,
              fontWeight: 700
            }}
          >
            {report.Title}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 18
          }}
        >
          <DetailItem
            label="Status"
            value={
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  flexWrap: 'nowrap',
                  whiteSpace: 'nowrap'
                }}
              >
                <StatusBadge
                  status={normaliseStatus(report.Status)}
                />
                <LateBadge />
              </div>
            }
          />

          <DetailItem
            label="Priority"
            value={<PriorityDot priority={report.Priority} />}
          />

          <DetailItem
            label="Category"
            value={report.CategoryName || '—'}
          />

          <DetailItem
            label="Department"
            value={report.DepartmentName || '—'}
          />

          <DetailItem
            label="Worker"
            value={report.WorkerName || '—'}
          />

          <DetailItem
            label="Location"
            value={report.LocationName || '—'}
          />

          <DetailItem
            label="Reported"
            value={formatDateTime(report.CreatedAt)}
          />

          <DetailItem
            label="Time Open"
            value={formatAge(report.CreatedAt)}
          />
        </div>

        <div style={{ marginTop: 24 }}>
          <div
            style={{
              marginBottom: 10,
              color: 'var(--text-secondary)',
              fontSize: 12,
              fontWeight: 700
            }}
          >
            DESCRIPTION
          </div>

          <div
            style={{
              padding: 14,
              borderRadius: 8,
              background: 'var(--bg-page)',
              fontSize: 13,
              lineHeight: 1.6
            }}
          >
            {report.Description || 'No description provided.'}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <div
        style={{
          marginBottom: 5,
          color: 'var(--text-secondary)',
          fontSize: 11,
          textTransform: 'uppercase'
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 600
        }}
      >
        {value}
      </div>
    </div>
  );
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('en-ZA');
}

function formatDateTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleString('en-ZA');
}

function formatAge(value) {
  const created = new Date(value);

  if (Number.isNaN(created.getTime())) {
    return '—';
  }

  const totalHours = Math.floor(
    Math.max(0, Date.now() - created.getTime()) /
    (60 * 60 * 1000)
  );

  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days === 0) {
    return `${hours}h`;
  }

  if (hours === 0) {
    return `${days}d`;
  }

  return `${days}d ${hours}h`;
}
