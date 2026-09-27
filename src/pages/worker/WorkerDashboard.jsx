import {
  useEffect,
  useState
} from 'react';

import {
  ClipboardList,
  Loader,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock3
} from 'lucide-react';

import api from '../../api/api';

import TopBar from '../../components/TopBar';

import StatusBadge from '../../components/StatusBadge';

import ProgressModal from './ProgressModal';

import PageTransition from '../../components/PageTransition';

import {
  formatSADateTime
} from '../../utils/dateUtils';

export default function WorkerDashboard() {
  const [data, setData] =
    useState(null);

  const [
    activeReport,
    setActiveReport
  ] = useState(null);

  const [error, setError] =
    useState('');


  /* ============================================================
     LOAD DASHBOARD
  ============================================================ */

  async function load() {
    try {
      setError('');

      const response =
        await api.get(
          '/worker/dashboard'
        );

      setData(response.data);
    } catch (err) {
      console.error(
        'Worker dashboard loading error:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Could not load your worker dashboard.'
      );
    }
  }


  useEffect(() => {
    load();
  }, []);


  /* ============================================================
     LOADING
  ============================================================ */

  if (!data) {
    return (
      <PageTransition>
        <div>
          <TopBar
            section="Worker"
            page="Dashboard"
            onRefresh={load}
          />

          <div
            style={{
              padding: 24
            }}
          >
            {error ? (
              <div
                className="card"
                style={{
                  padding: 18,

                  color: '#b42318',

                  background:
                    '#fef3f2'
                }}
              >
                {error}
              </div>
            ) : (
              <div
                style={{
                  color:
                    'var(--text-secondary)'
                }}
              >
                Loading dashboard...
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    );
  }


  const counts =
    data.counts || {};

  const priorityIssues =
    Array.isArray(
      data.priorityIssues
    )
      ? data.priorityIssues
      : [];


  return (
    <PageTransition>
      <div
        className="worker-dashboard"
      >
        <TopBar
          section="Worker"
          page="Dashboard"
          onRefresh={load}
        />


        <div
          className="worker-dashboard-content"
        >
          {/* ===================================================
              ERROR
          =================================================== */}

          {error && (
            <div
              className="worker-dashboard-alert"
            >
              <AlertTriangle
                size={17}
                style={{
                  flexShrink: 0
                }}
              />

              <span>
                {error}
              </span>
            </div>
          )}


          {/* ===================================================
              STATISTICS
          =================================================== */}

          <section
            className="worker-dashboard-stats"
            aria-label="Assignment statistics"
          >
            <Stat
              icon={
                <ClipboardList
                  size={20}
                />
              }
              value={
                counts.TotalAssigned ??
                0
              }
              label="Total Assigned"
              bg="#e8f0fe"
              color="#2f6fed"
            />

            <Stat
              icon={
                <Loader
                  size={20}
                />
              }
              value={
                counts.InProgress ??
                0
              }
              label="In Progress"
              bg="#fef3e2"
              color="#d97706"
            />

            <Stat
              icon={
                <CheckCircle2
                  size={20}
                />
              }
              value={
                counts.Completed ??
                0
              }
              label="Completed"
              bg="#e6f4ea"
              color="#1e8e3e"
            />
          </section>


          {/* ===================================================
              PRIORITY ISSUES
          =================================================== */}

          <section
            className="card worker-priority-panel"
          >
            <div
              className="worker-priority-header"
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,

                  minWidth: 0
                }}
              >
                <AlertTriangle
                  size={18}
                  color="#f97316"
                  style={{
                    flexShrink: 0
                  }}
                />

                <strong>
                  Priority Issues
                </strong>
              </div>

              <span
                className="worker-priority-caption"
              >
                High &amp; Critical
              </span>
            </div>


            <div
              className="worker-priority-list"
            >
              {priorityIssues.map(
                (report) => (
                  <article
                    key={
                      report.ReportID ??
                      report.ReportCode
                    }
                    className="card worker-issue-card"
                  >
                    {/* TITLE */}

                    <div
                      className="worker-issue-heading"
                    >
                      <strong
                        className="worker-issue-title"
                      >
                        {report.Title ||
                          'Untitled issue'}
                      </strong>

                      <StatusBadge
                        status={
                          report.Status
                        }
                      />
                    </div>


                    {/* META */}

                    <div
                      className="worker-issue-meta"
                    >
                      <span>
                        <MapPin
                          size={13}
                        />

                        {report.LocationName ||
                          'Location unavailable'}
                      </span>

                      <span>
                        <Clock3
                          size={13}
                        />

                        {report.CreatedAt
                          ? formatSADateTime(
                              report.CreatedAt
                            )
                          : 'Unknown date'}
                      </span>

                      <span>
                        {report.Priority ||
                          'Unknown'}{' '}
                        Priority
                      </span>
                    </div>


                    {/* DESCRIPTION */}

                    <p
                      className="worker-issue-description"
                    >
                      {report.Description ||
                        'No description provided.'}
                    </p>


                    {/* ACTION */}

                    <button
                      type="button"
                      className="btn btn-primary worker-update-button"
                      onClick={() =>
                        setActiveReport(
                          report
                        )
                      }
                    >
                      Update Progress
                    </button>
                  </article>
                )
              )}


              {/* EMPTY */}

              {priorityIssues.length ===
                0 && (
                <div
                  className="worker-empty-state"
                >
                  <CheckCircle2
                    size={28}
                    style={{
                      opacity: 0.45,
                      flexShrink: 0
                    }}
                  />

                  <div>
                    <strong>
                      No priority issues
                    </strong>

                    <p>
                      You have no high or
                      critical assignments
                      requiring attention.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>


        {/* =====================================================
            PROGRESS MODAL
        ===================================================== */}

        {activeReport && (
          <ProgressModal
            report={activeReport}
            onClose={() =>
              setActiveReport(null)
            }
            onUpdated={() => {
              setActiveReport(null);

              load();
            }}
          />
        )}


        {/* =====================================================
            RESPONSIVE STYLES
        ===================================================== */}

        <style>
          {`
            .worker-dashboard-content {
              width: 100%;

              padding: 24px;

              display: flex;

              flex-direction: column;

              gap: 20px;
            }


            .worker-dashboard-alert {
              display: flex;

              align-items: flex-start;

              gap: 8px;

              padding:
                12px 14px;

              border-radius: 10px;

              background:
                #fef3f2;

              color:
                #b42318;

              font-size: 13px;
            }


            .worker-dashboard-stats {
              display: grid;

              grid-template-columns:
                repeat(
                  3,
                  minmax(0, 1fr)
                );

              gap: 16px;
            }


            .worker-stat-card {
              padding: 20px;

              text-align: center;

              min-width: 0;
            }


            .worker-stat-icon {
              width: 42px;

              height: 42px;

              border-radius: 50%;

              display: flex;

              align-items: center;

              justify-content: center;

              margin:
                0 auto 10px;
            }


            .worker-stat-value {
              font-size: 24px;

              line-height: 1.15;

              font-weight: 800;
            }


            .worker-stat-label {
              margin-top: 5px;

              font-size: 11px;

              color:
                var(--text-secondary);

              font-weight: 700;

              text-transform:
                uppercase;

              letter-spacing:
                0.35px;
            }


            .worker-priority-panel {
              padding: 20px;
            }


            .worker-priority-header {
              display: flex;

              align-items: center;

              gap: 12px;

              margin-bottom: 16px;
            }


            .worker-priority-caption {
              margin-left: auto;

              color:
                var(--text-secondary);

              font-size: 12px;

              font-weight: 600;

              white-space: nowrap;
            }


            .worker-priority-list {
              display: flex;

              flex-direction: column;

              gap: 14px;
            }


            .worker-issue-card {
              padding: 16px;
            }


            .worker-issue-heading {
              display: flex;

              align-items: flex-start;

              gap: 10px;

              margin-bottom: 8px;
            }


            .worker-issue-title {
              min-width: 0;

              flex: 1;

              font-size: 14px;

              line-height: 1.45;

              overflow-wrap:
                anywhere;
            }


            .worker-issue-meta {
              display: flex;

              flex-wrap: wrap;

              gap:
                8px 14px;

              color:
                var(--text-secondary);

              font-size: 12px;

              margin-bottom: 10px;
            }


            .worker-issue-meta span {
              display:
                inline-flex;

              align-items: center;

              gap: 5px;
            }


            .worker-issue-description {
              font-size: 13px;

              line-height: 1.55;

              margin:
                0 0 14px;

              color:
                var(--text-secondary);

              overflow-wrap:
                anywhere;
            }


            .worker-empty-state {
              display: flex;

              align-items: center;

              justify-content:
                center;

              gap: 12px;

              padding:
                28px 18px;

              border:
                1px dashed var(--border);

              border-radius: 10px;

              color:
                var(--text-secondary);
            }


            .worker-empty-state strong {
              display: block;

              color:
                var(--text-primary);

              margin-bottom: 3px;

              font-size: 14px;
            }


            .worker-empty-state p {
              margin: 0;

              font-size: 12px;
            }


            @media (max-width: 760px) {
              .worker-dashboard-content {
                padding: 16px;

                gap: 16px;
              }


              .worker-dashboard-stats {
                grid-template-columns:
                  repeat(
                    2,
                    minmax(0, 1fr)
                  );

                gap: 12px;
              }


              .worker-dashboard-stats
              .worker-stat-card:last-child {
                grid-column:
                  1 / -1;
              }


              .worker-stat-card {
                padding:
                  16px 12px;
              }


              .worker-priority-panel {
                padding: 16px;
              }


              .worker-priority-header {
                align-items:
                  flex-start;
              }


              .worker-priority-caption {
                font-size: 11px;
              }


              .worker-issue-card {
                padding: 14px;
              }


              .worker-issue-heading {
                flex-wrap: wrap;
              }


              .worker-update-button {
                width: 100%;
              }
            }


            @media (max-width: 430px) {
              .worker-dashboard-stats {
                grid-template-columns:
                  1fr;
              }


              .worker-dashboard-stats
              .worker-stat-card:last-child {
                grid-column:
                  auto;
              }


              .worker-priority-header {
                flex-direction:
                  column;

                gap: 5px;
              }


              .worker-priority-caption {
                margin-left: 26px;
              }


              .worker-issue-heading {
                flex-direction:
                  column;

                align-items:
                  flex-start;
              }


              .worker-issue-meta {
                flex-direction:
                  column;

                gap: 7px;
              }
            }
          `}
        </style>
      </div>
    </PageTransition>
  );
}


/* =============================================================
   STAT CARD
============================================================= */

function Stat({
  icon,
  value,
  label,
  bg,
  color
}) {
  return (
    <div
      className="card worker-stat-card"
    >
      <div
        className="worker-stat-icon"
        style={{
          background: bg,
          color
        }}
      >
        {icon}
      </div>

      <div
        className="worker-stat-value"
      >
        {value}
      </div>

      <div
        className="worker-stat-label"
      >
        {label}
      </div>
    </div>
  );
}