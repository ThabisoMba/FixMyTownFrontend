import {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  Eye,
  X,
  AlertTriangle,
  Download,
  Users,
  Activity
} from 'lucide-react';

import api from '../../api/api';

import TopBar from '../../components/TopBar';

import StatusBadge from '../../components/StatusBadge';

import PriorityDot from '../../components/PriorityDot';

import PageTransition from '../../components/PageTransition';

import {
  formatSADateTime
} from '../../utils/dateUtils';


const APP_BASE =
  (import.meta.env.BASE_URL || '/')
    .replace(/\/$/, '');


const API_ORIGIN =
  import.meta.env.DEV
    ? 'http://localhost:5000'
    : `${window.location.origin}${APP_BASE}`;


export default function AdminDashboard() {
  const [data, setData] =
    useState(null);

  const [error, setError] =
    useState('');

  const [
    refreshing,
    setRefreshing
  ] = useState(false);

  const [
    selectedReport,
    setSelectedReport
  ] = useState(null);

  const [
    loadingReport,
    setLoadingReport
  ] = useState(false);


  /* ============================================================
     LOAD DASHBOARD
  ============================================================ */

  async function load() {
    try {
      setError('');

      const response =
        await api.get(
          '/admin/dashboard'
        );

      setData(response.data);
    } catch (err) {
      console.error(
        'Dashboard loading error:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Could not load the admin dashboard.'
      );
    }
  }


  useEffect(() => {
    load();
  }, []);


  const recentReports =
    useMemo(
      () =>
        Array.isArray(
          data?.recentReports
        )
          ? data.recentReports
          : [],
      [data]
    );


  const workerOverview =
    useMemo(
      () =>
        Array.isArray(
          data?.workerOverview
        )
          ? data.workerOverview
          : [],
      [data]
    );


  /* ============================================================
     PHOTO URL
  ============================================================ */

  function getPhotoUrl(photo) {
    if (!photo) {
      return '';
    }

    if (
      photo.startsWith('http://') ||
      photo.startsWith('https://')
    ) {
      return photo;
    }

    if (photo.startsWith('/')) {
      return `${API_ORIGIN}${photo}`;
    }

    return `${API_ORIGIN}/${photo}`;
  }


  /* ============================================================
     VIEW REPORT
  ============================================================ */

  async function viewReport(report) {
    try {
      setError('');
      setLoadingReport(true);

      const response =
        await api.get(
          '/issues/search',
          {
            params: {
              code:
                report.ReportCode
            }
          }
        );

      setSelectedReport(
        response.data
      );
    } catch (err) {
      console.error(
        'View report error:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Could not load report details.'
      );
    } finally {
      setLoadingReport(false);
    }
  }


  /* ============================================================
     REFRESH
  ============================================================ */

  async function handleRefresh() {
    setRefreshing(true);

    try {
      await load();
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 450);
    }
  }


  /* ============================================================
     EXPORT CSV
  ============================================================ */

  function handleExport() {
    if (
      recentReports.length === 0
    ) {
      setError(
        'There are no reports available to export.'
      );

      return;
    }

    const headers = [
      'Report Code',
      'Title',
      'Category',
      'Priority',
      'Location',
      'Status',
      'Worker',
      'Reported'
    ];


    const rows =
      recentReports.map(
        (report) => [
          report.ReportCode,
          report.Title,
          report.CategoryName,
          report.Priority,
          report.LocationName,
          report.Status,
          report.WorkerName ||
            'Unassigned',

          report.CreatedAt
            ? formatSADateTime(
                report.CreatedAt
              )
            : ''
        ]
      );


    function escapeCsvValue(
      value
    ) {
      const text =
        String(value ?? '');

      if (
        text.includes(',') ||
        text.includes('"') ||
        text.includes('\n')
      ) {
        return `"${text.replace(
          /"/g,
          '""'
        )}"`;
      }

      return text;
    }


    const csvContent = [
      headers
        .map(escapeCsvValue)
        .join(','),

      ...rows.map((row) =>
        row
          .map(escapeCsvValue)
          .join(',')
      )
    ].join('\n');


    const blob =
      new Blob(
        [csvContent],
        {
          type:
            'text/csv;charset=utf-8;'
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        'a'
      );

    link.href = url;

    link.download =
      `FixMyTown-Admin-Reports-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;


    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
      url
    );
  }


  /* ============================================================
     LOADING
  ============================================================ */

  if (!data) {
    return (
      <PageTransition>
        <div>
          <TopBar
            section="Admin"
            page="Dashboard"
            onRefresh={
              handleRefresh
            }
            refreshing={
              refreshing
            }
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

                  color:
                    '#b42318',

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


  return (
    <PageTransition>
      <div
        className="admin-dashboard"
      >
        <TopBar
          section="Admin"
          page="Dashboard"
          onRefresh={
            handleRefresh
          }
          refreshing={
            refreshing
          }
        />


        <main
          className="admin-dashboard-content"
        >
          {/* ===================================================
              ERROR
          =================================================== */}

          {error && (
            <div
              className="admin-dashboard-alert"
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

              <button
                type="button"
                onClick={() =>
                  setError('')
                }
                aria-label="Dismiss error"
              >
                <X size={15} />
              </button>
            </div>
          )}


          {/* ===================================================
              RECENT REPORTS
          =================================================== */}

          <section
            className="card admin-dashboard-panel"
          >
            <div
              className="admin-dashboard-panel-header"
            >
              <div>
                <strong>
                  Recent Reports
                </strong>

                <div
                  className="admin-dashboard-panel-subtitle"
                >
                  Latest municipal
                  reports requiring
                  oversight.
                </div>
              </div>


              <button
                type="button"
                className="btn btn-outline admin-export-button"
                onClick={
                  handleExport
                }
              >
                <Download
                  size={15}
                />

                <span>
                  Export CSV
                </span>
              </button>
            </div>


            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <div
              className="admin-desktop-table"
            >
              <table>
                <thead>
                  <tr>
                    {[
                      'ID',
                      'Issue',
                      'Category',
                      'Priority',
                      'Location',
                      'Status',
                      'Worker',
                      'Reported',
                      'Actions'
                    ].map(
                      (heading) => (
                        <th
                          key={
                            heading
                          }
                        >
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>


                <tbody>
                  {recentReports.map(
                    (report) => (
                      <tr
                        key={
                          report.ReportID
                        }
                      >
                        <td
                          className="admin-report-code"
                        >
                          #
                          {
                            report.ReportCode
                          }
                        </td>

                        <td>
                          {report.Title}
                        </td>

                        <td>
                          {report.CategoryName ||
                            '—'}
                        </td>

                        <td>
                          <PriorityDot
                            priority={
                              report.Priority
                            }
                          />
                        </td>

                        <td>
                          {report.LocationName ||
                            '—'}
                        </td>

                        <td>
                          <div
                            className="admin-status-group"
                          >
                            <StatusBadge
                              status={
                                report.Status
                              }
                            />

                            {report.IsLate && (
                              <LateBadge />
                            )}
                          </div>
                        </td>

                        <td>
                          {report.WorkerName ||
                            'Unassigned'}
                        </td>

                        <td
                          style={{
                            whiteSpace:
                              'nowrap'
                          }}
                        >
                          {report.CreatedAt
                            ? formatSADateTime(
                                report.CreatedAt
                              )
                            : '—'}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="admin-icon-button"
                            title="View report"
                            aria-label={`View ${report.ReportCode}`}
                            onClick={() =>
                              viewReport(
                                report
                              )
                            }
                          >
                            <Eye
                              size={15}
                            />
                          </button>
                        </td>
                      </tr>
                    )
                  )}


                  {recentReports.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="admin-empty-cell"
                      >
                        No recent reports.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>


            {/* =================================================
                MOBILE REPORT CARDS
            ================================================= */}

            <div
              className="admin-mobile-reports"
            >
              {recentReports.map(
                (report) => (
                  <article
                    key={
                      report.ReportID
                    }
                    className="admin-mobile-report-card"
                  >
                    <div
                      className="admin-mobile-report-top"
                    >
                      <div
                        style={{
                          minWidth: 0
                        }}
                      >
                        <div
                          className="admin-mobile-report-code"
                        >
                          #
                          {
                            report.ReportCode
                          }
                        </div>

                        <h3>
                          {report.Title ||
                            'Untitled report'}
                        </h3>
                      </div>


                      <div
                        className="admin-status-group"
                      >
                        <StatusBadge
                          status={
                            report.Status
                          }
                        />

                        {report.IsLate && (
                          <LateBadge />
                        )}
                      </div>
                    </div>


                    <div
                      className="admin-mobile-report-grid"
                    >
                      <MobileField
                        label="Category"
                        value={
                          report.CategoryName ||
                          '—'
                        }
                      />

                      <MobileField
                        label="Priority"
                        value={
                          <PriorityDot
                            priority={
                              report.Priority
                            }
                          />
                        }
                      />

                      <MobileField
                        label="Location"
                        value={
                          report.LocationName ||
                          '—'
                        }
                      />

                      <MobileField
                        label="Worker"
                        value={
                          report.WorkerName ||
                          'Unassigned'
                        }
                      />
                    </div>


                    <div
                      className="admin-mobile-report-date"
                    >
                      Reported{' '}

                      {report.CreatedAt
                        ? formatSADateTime(
                            report.CreatedAt
                          )
                        : '—'}
                    </div>


                    <button
                      type="button"
                      className="btn btn-primary admin-mobile-view-button"
                      onClick={() =>
                        viewReport(
                          report
                        )
                      }
                    >
                      <Eye
                        size={15}
                      />

                      View Report
                    </button>
                  </article>
                )
              )}


              {recentReports.length ===
                0 && (
                <div
                  className="admin-mobile-empty"
                >
                  No recent reports.
                </div>
              )}
            </div>
          </section>


          {/* ===================================================
              LOWER SECTION
          =================================================== */}

          <div
            className="admin-dashboard-lower-grid"
          >
            {/* =================================================
                WORKER OVERVIEW
            ================================================= */}

            <section
              className="card admin-dashboard-panel"
            >
              <div
                className="admin-dashboard-panel-header"
              >
                <div
                  className="admin-panel-title-icon"
                >
                  <Users
                    size={17}
                  />

                  <strong>
                    Worker Overview
                  </strong>
                </div>
              </div>


              {/* DESKTOP */}

              <div
                className="admin-desktop-table admin-worker-table"
              >
                <table>
                  <thead>
                    <tr>
                      <th>
                        Worker
                      </th>

                      <th>
                        Department
                      </th>

                      <th>
                        Active Issues
                      </th>
                    </tr>
                  </thead>


                  <tbody>
                    {workerOverview.map(
                      (
                        worker,
                        index
                      ) => (
                        <tr
                          key={
                            `${worker.WorkerName}-${index}`
                          }
                        >
                          <td
                            style={{
                              fontWeight:
                                700
                            }}
                          >
                            {
                              worker.WorkerName
                            }
                          </td>

                          <td>
                            {
                              worker.DepartmentName
                            }
                          </td>

                          <td>
                            <span
                              className="badge"
                              style={{
                                background:
                                  'var(--gold-100)',

                                color:
                                  'var(--gold-600)'
                              }}
                            >
                              {
                                worker.ActiveIssues
                              }
                            </span>
                          </td>
                        </tr>
                      )
                    )}


                    {workerOverview.length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="admin-empty-cell"
                        >
                          No worker data.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>


              {/* MOBILE */}

              <div
                className="admin-mobile-workers"
              >
                {workerOverview.map(
                  (
                    worker,
                    index
                  ) => (
                    <article
                      key={
                        `${worker.WorkerName}-${index}`
                      }
                      className="admin-mobile-worker-card"
                    >
                      <div
                        className="admin-worker-avatar"
                      >
                        {getInitials(
                          worker.WorkerName
                        )}
                      </div>


                      <div
                        style={{
                          minWidth: 0,
                          flex: 1
                        }}
                      >
                        <strong>
                          {
                            worker.WorkerName
                          }
                        </strong>

                        <div>
                          {
                            worker.DepartmentName ||
                            'No department'
                          }
                        </div>
                      </div>


                      <span
                        className="badge"
                        style={{
                          background:
                            'var(--gold-100)',

                          color:
                            'var(--gold-600)'
                        }}
                      >
                        {
                          worker.ActiveIssues
                        }{' '}
                        active
                      </span>
                    </article>
                  )
                )}


                {workerOverview.length ===
                  0 && (
                  <div
                    className="admin-mobile-empty"
                  >
                    No worker data.
                  </div>
                )}
              </div>
            </section>


            {/* =================================================
                RECENT ACTIVITY
            ================================================= */}

            <section
              className="card admin-dashboard-panel"
            >
              <div
                className="admin-dashboard-panel-header"
              >
                <div
                  className="admin-panel-title-icon"
                >
                  <Activity
                    size={17}
                  />

                  <strong>
                    Recent Activity
                  </strong>
                </div>
              </div>


              <div
                className="admin-activity-list"
              >
                {recentReports
                  .slice(0, 4)
                  .map(
                    (report) => (
                      <article
                        key={
                          report.ReportID
                        }
                        className="admin-activity-item"
                      >
                        <div
                          className="admin-activity-marker"
                        />

                        <div
                          style={{
                            minWidth: 0
                          }}
                        >
                          <strong>
                            {report.Status}
                          </strong>

                          <p>
                            {report.Title}
                          </p>

                          <span>
                            {report.CreatedAt
                              ? formatSADateTime(
                                  report.CreatedAt
                                )
                              : 'Unknown time'}

                            {' · '}

                            {report.WorkerName ||
                              'Unassigned'}
                          </span>
                        </div>
                      </article>
                    )
                  )}


                {recentReports.length ===
                  0 && (
                  <div
                    className="admin-mobile-empty"
                  >
                    No recent activity.
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>


        {/* =====================================================
            REPORT MODAL
        ===================================================== */}

        {selectedReport && (
          <ReportModal
            report={selectedReport}
            getPhotoUrl={getPhotoUrl}
            onClose={() =>
              setSelectedReport(
                null
              )
            }
          />
        )}


        {/* =====================================================
            LOADING REPORT
        ===================================================== */}

        {loadingReport && (
          <div
            className="admin-loading-overlay"
          >
            <div
              className="card admin-loading-box"
            >
              Loading report...
            </div>
          </div>
        )}


        {/* =====================================================
            DASHBOARD RESPONSIVE CSS
        ===================================================== */}

        <style>
          {`
            .admin-dashboard-content {
              width: 100%;

              padding: 24px;

              display: flex;

              flex-direction: column;

              gap: 20px;
            }


            .admin-dashboard-alert {
              padding:
                11px 14px;

              border-radius: 9px;

              background:
                #fdecec;

              color:
                #c0362c;

              font-size: 13px;

              display: flex;

              align-items:
                flex-start;

              gap: 9px;
            }


            .admin-dashboard-alert span {
              flex: 1;
            }


            .admin-dashboard-alert button {
              border: none;

              background:
                transparent;

              color: inherit;

              padding: 0;

              display: flex;

              align-items: center;
            }


            .admin-dashboard-panel {
              min-width: 0;

              overflow: hidden;
            }


            .admin-dashboard-panel-header {
              min-height: 58px;

              display: flex;

              align-items: center;

              justify-content:
                space-between;

              gap: 14px;

              padding:
                14px 20px;

              border-bottom:
                1px solid var(--border);
            }


            .admin-dashboard-panel-subtitle {
              margin-top: 3px;

              color:
                var(--text-secondary);

              font-size: 11.5px;
            }


            .admin-panel-title-icon {
              display: flex;

              align-items: center;

              gap: 8px;
            }


            .admin-desktop-table {
              width: 100%;

              overflow-x: auto;
            }


            .admin-desktop-table table {
              width: 100%;

              border-collapse:
                collapse;

              font-size: 13px;
            }


            .admin-desktop-table th {
              padding:
                10px 16px;

              text-align: left;

              color:
                var(--text-secondary);

              font-size: 10.5px;

              text-transform:
                uppercase;

              font-weight: 800;

              white-space:
                nowrap;
            }


            .admin-desktop-table td {
              padding:
                12px 16px;

              border-top:
                1px solid var(--border);

              vertical-align:
                middle;
            }


            .admin-report-code {
              font-weight: 800;

              white-space: nowrap;
            }


            .admin-status-group {
              display: flex;

              align-items: center;

              flex-wrap: wrap;

              gap: 6px;
            }


            .admin-icon-button {
              width: 32px;

              height: 32px;

              border-radius: 50%;

              border:
                1px solid var(--border);

              background:
                var(--bg-page);

              color:
                var(--text-secondary);

              display:
                inline-flex;

              align-items: center;

              justify-content:
                center;
            }


            .admin-empty-cell {
              padding:
                28px !important;

              text-align: center;

              color:
                var(--text-secondary);
            }


            .admin-mobile-reports,
            .admin-mobile-workers {
              display: none;
            }


            .admin-dashboard-lower-grid {
              display: grid;

              grid-template-columns:
                minmax(0, 1.25fr)
                minmax(300px, 0.75fr);

              gap: 20px;
            }


            .admin-activity-list {
              padding:
                6px 20px 14px;
            }


            .admin-activity-item {
              display: flex;

              gap: 11px;

              padding:
                12px 0;

              border-bottom:
                1px solid var(--border);
            }


            .admin-activity-item:last-child {
              border-bottom: none;
            }


            .admin-activity-marker {
              width: 9px;

              height: 9px;

              border-radius: 50%;

              margin-top: 5px;

              background:
                var(--gold-500);

              flex-shrink: 0;
            }


            .admin-activity-item strong {
              font-size: 12.5px;
            }


            .admin-activity-item p {
              margin:
                3px 0;

              font-size: 12px;

              color:
                var(--text-primary);

              overflow-wrap:
                anywhere;
            }


            .admin-activity-item span {
              color:
                var(--text-secondary);

              font-size: 11px;
            }


            .admin-loading-overlay {
              position: fixed;

              inset: 0;

              z-index: 10000;

              background:
                rgba(
                  15,
                  23,
                  42,
                  0.25
                );

              backdrop-filter:
                blur(2px);

              display: flex;

              align-items: center;

              justify-content:
                center;

              padding: 16px;
            }


            .admin-loading-box {
              padding:
                18px 24px;

              font-size: 14px;

              font-weight: 700;
            }


            @media (max-width: 1100px) {
              .admin-dashboard-lower-grid {
                grid-template-columns:
                  1fr;
              }
            }


            @media (max-width: 760px) {
              .admin-dashboard-content {
                padding: 16px;

                gap: 16px;
              }


              .admin-dashboard-panel-header {
                padding:
                  14px 16px;
              }


              .admin-desktop-table {
                display: none;
              }


              .admin-mobile-reports,
              .admin-mobile-workers {
                display: flex;

                flex-direction:
                  column;
              }


              .admin-mobile-report-card {
                padding: 16px;

                border-bottom:
                  1px solid var(--border);
              }


              .admin-mobile-report-card:last-child {
                border-bottom:
                  none;
              }


              .admin-mobile-report-top {
                display: flex;

                align-items:
                  flex-start;

                justify-content:
                  space-between;

                gap: 12px;
              }


              .admin-mobile-report-code {
                color:
                  var(--text-secondary);

                font-size: 10.5px;

                font-weight: 800;

                margin-bottom: 4px;
              }


              .admin-mobile-report-card h3 {
                margin: 0;

                font-size: 14.5px;

                line-height: 1.4;

                overflow-wrap:
                  anywhere;
              }


              .admin-mobile-report-grid {
                display: grid;

                grid-template-columns:
                  repeat(
                    2,
                    minmax(0, 1fr)
                  );

                gap:
                  12px 14px;

                margin-top: 16px;
              }


              .admin-mobile-field {
                min-width: 0;
              }


              .admin-mobile-field-label {
                display: block;

                color:
                  var(--text-secondary);

                font-size: 10px;

                text-transform:
                  uppercase;

                font-weight: 800;

                margin-bottom: 4px;
              }


              .admin-mobile-field-value {
                font-size: 12.5px;

                overflow-wrap:
                  anywhere;
              }


              .admin-mobile-report-date {
                margin-top: 14px;

                padding-top: 12px;

                border-top:
                  1px solid var(--border);

                color:
                  var(--text-secondary);

                font-size: 11px;
              }


              .admin-mobile-view-button {
                width: 100%;

                margin-top: 12px;
              }


              .admin-mobile-worker-card {
                display: flex;

                align-items: center;

                gap: 11px;

                padding:
                  14px 16px;

                border-bottom:
                  1px solid var(--border);
              }


              .admin-mobile-worker-card:last-child {
                border-bottom:
                  none;
              }


              .admin-mobile-worker-card strong {
                display: block;

                font-size: 13px;

                overflow-wrap:
                  anywhere;
              }


              .admin-mobile-worker-card
              div div {
                margin-top: 3px;

                color:
                  var(--text-secondary);

                font-size: 11.5px;

                overflow-wrap:
                  anywhere;
              }


              .admin-worker-avatar {
                width: 36px;

                height: 36px;

                border-radius: 50%;

                display: flex;

                align-items: center;

                justify-content:
                  center;

                background:
                  var(--navy-800);

                color: white;

                font-size: 11px;

                font-weight: 800;

                flex-shrink: 0;
              }


              .admin-mobile-empty {
                padding:
                  24px 16px;

                text-align:
                  center;

                color:
                  var(--text-secondary);

                font-size: 12.5px;
              }
            }


            @media (max-width: 430px) {
              .admin-dashboard-panel-header {
                align-items:
                  flex-start;
              }


              .admin-export-button {
                width:
                  38px !important;

                height:
                  38px !important;

                padding:
                  0 !important;

                flex-shrink: 0;
              }


              .admin-export-button span {
                display: none;
              }


              .admin-mobile-report-top {
                flex-direction:
                  column;
              }


              .admin-mobile-report-grid {
                grid-template-columns:
                  1fr;

                gap: 9px;
              }


              .admin-mobile-worker-card {
                align-items:
                  flex-start;

                flex-wrap: wrap;
              }
            }
          `}
        </style>
      </div>
    </PageTransition>
  );
}


/* =============================================================
   MOBILE FIELD
============================================================= */

function MobileField({
  label,
  value
}) {
  return (
    <div
      className="admin-mobile-field"
    >
      <span
        className="admin-mobile-field-label"
      >
        {label}
      </span>

      <div
        className="admin-mobile-field-value"
      >
        {value}
      </div>
    </div>
  );
}


/* =============================================================
   LATE BADGE
============================================================= */

function LateBadge() {
  return (
    <span
      className="badge"
      title="This report has been open longer than its SLA allows for its priority"
      style={{
        background: '#fee2e2',
        color: '#991b1b',
        fontWeight: 800
      }}
    >
      LATE
    </span>
  );
}


/* =============================================================
   REPORT MODAL
============================================================= */

function ReportModal({
  report,
  getPhotoUrl,
  onClose
}) {
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener(
      'keydown',
      handleEscape
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape
      );
    };
  }, [onClose]);


  function handleBackdropClick(e) {
    if (
      e.target ===
      e.currentTarget
    ) {
      onClose();
    }
  }


  const photos =
    Array.isArray(
      report.Photos
    )
      ? report.Photos
      : [];


  const updates =
    Array.isArray(
      report.Updates
    )
      ? report.Updates
      : [];


  return (
    <div
      className="admin-report-modal-backdrop"
      onClick={
        handleBackdropClick
      }
    >
      <div
        className="admin-report-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Report details"
      >
        <button
          type="button"
          className="admin-report-modal-close"
          onClick={onClose}
          aria-label="Close report"
        >
          <X size={18} />
        </button>


        {/* HEADER */}

        <header
          className="admin-report-modal-header"
        >
          <div>
            <div
              className="admin-report-modal-eyebrow"
            >
              Report ID
            </div>

            <div
              className="admin-report-modal-code"
            >
              #{report.ReportCode}
            </div>

            <h2>
              {report.Title}
            </h2>
          </div>
        </header>


        {/* DETAILS */}

        <div
          className="admin-report-detail-grid"
        >
          <DetailItem
            label="Status"
            value={
              <StatusBadge
                status={
                  report.Status
                }
              />
            }
          />

          <DetailItem
            label="Priority"
            value={
              <PriorityDot
                priority={
                  report.Priority
                }
              />
            }
          />

          <DetailItem
            label="Category"
            value={
              report.CategoryName ||
              '—'
            }
          />

          <DetailItem
            label="Department"
            value={
              report.DepartmentName ||
              '—'
            }
          />

          <DetailItem
            label="Location"
            value={
              report.LocationName ||
              '—'
            }
          />

          <DetailItem
            label="Reported"
            value={
              report.CreatedAt
                ? formatSADateTime(
                    report.CreatedAt
                  )
                : '—'
            }
          />
        </div>


        {/* DESCRIPTION */}

        <section
          className="admin-report-modal-section"
        >
          <SectionTitle>
            Description
          </SectionTitle>

          <div
            className="admin-report-description"
          >
            {report.Description ||
              'No description provided.'}
          </div>
        </section>


        {/* PHOTOS */}

        <section
          className="admin-report-modal-section"
        >
          <SectionTitle>
            Photos

            {photos.length > 0
              ? ` (${photos.length})`
              : ''}
          </SectionTitle>


          {photos.length > 0 ? (
            <div
              className="admin-report-photo-grid"
            >
              {photos.map(
                (
                  photo,
                  index
                ) => (
                  <div
                    key={`${photo}-${index}`}
                    className="admin-report-photo"
                  >
                    <img
                      src={
                        getPhotoUrl(
                          photo
                        )
                      }
                      alt={`Report photo ${index + 1}`}
                    />

                    <div>
                      Report photo{' '}
                      {index + 1}
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div
              className="admin-report-empty-box"
            >
              No photos attached to
              this report.
            </div>
          )}
        </section>


        {/* UPDATES */}

        {updates.length > 0 && (
          <section
            className="admin-report-modal-section"
          >
            <SectionTitle>
              Progress Updates
            </SectionTitle>


            <div
              className="admin-report-updates"
            >
              {updates.map(
                (
                  update,
                  index
                ) => (
                  <article
                    key={index}
                    className="admin-report-update"
                  >
                    <div
                      className="admin-report-update-heading"
                    >
                      <strong>
                        {update.WorkerName ||
                          'Unknown Worker'}
                      </strong>

                      <span>
                        {update.CreatedAt
                          ? formatSADateTime(
                              update.CreatedAt
                            )
                          : 'Unknown time'}
                      </span>
                    </div>

                    <p>
                      {update.Note ||
                        'No progress note provided.'}
                    </p>

                    <StatusBadge
                      status={
                        update.StatusAtUpdate
                      }
                    />
                  </article>
                )
              )}
            </div>
          </section>
        )}
      </div>


      <style>
        {`
          .admin-report-modal-backdrop {
            position: fixed;

            inset: 0;

            z-index: 10001;

            background:
              rgba(
                15,
                23,
                42,
                0.45
              );

            backdrop-filter:
              blur(3px);

            display: flex;

            align-items: center;

            justify-content:
              center;

            padding: 20px;
          }


          .admin-report-modal {
            position: relative;

            width:
              min(
                850px,
                100%
              );

            max-height: 90vh;

            overflow-y: auto;

            background: white;

            border-radius: 14px;

            box-shadow:
              var(--shadow-modal);

            padding: 24px;
          }


          .admin-report-modal-close {
            position: absolute;

            top: 16px;

            right: 16px;

            width: 36px;

            height: 36px;

            border-radius: 50%;

            border:
              1px solid var(--border);

            background:
              var(--bg-page);

            display: flex;

            align-items: center;

            justify-content:
              center;
          }


          .admin-report-modal-header {
            padding-right: 52px;

            padding-bottom: 18px;

            border-bottom:
              1px solid var(--border);

            margin-bottom: 20px;
          }


          .admin-report-modal-eyebrow {
            font-size: 10.5px;

            color:
              var(--text-secondary);

            text-transform:
              uppercase;

            font-weight: 800;

            margin-bottom: 4px;
          }


          .admin-report-modal-code {
            font-size: 19px;

            font-weight: 800;
          }


          .admin-report-modal h2 {
            margin:
              6px 0 0;

            font-size: 17px;

            line-height: 1.4;

            overflow-wrap:
              anywhere;
          }


          .admin-report-detail-grid {
            display: grid;

            grid-template-columns:
              repeat(
                3,
                minmax(0, 1fr)
              );

            gap: 18px;
          }


          .admin-report-modal-section {
            margin-top: 22px;
          }


          .admin-report-description {
            padding: 14px;

            border-radius: 8px;

            background:
              var(--bg-page);

            line-height: 1.6;

            font-size: 13px;

            overflow-wrap:
              anywhere;
          }


          .admin-report-photo-grid {
            display: grid;

            grid-template-columns:
              repeat(
                auto-fill,
                minmax(180px, 1fr)
              );

            gap: 12px;
          }


          .admin-report-photo {
            border:
              1px solid var(--border);

            border-radius: 10px;

            overflow: hidden;

            background:
              var(--bg-page);
          }


          .admin-report-photo img {
            width: 100%;

            height: 180px;

            object-fit: cover;

            display: block;
          }


          .admin-report-photo > div {
            padding:
              8px 10px;

            font-size: 11px;

            color:
              var(--text-secondary);

            border-top:
              1px solid var(--border);
          }


          .admin-report-empty-box {
            padding: 20px;

            text-align: center;

            border:
              1px dashed var(--border);

            border-radius: 10px;

            color:
              var(--text-secondary);

            font-size: 13px;
          }


          .admin-report-updates {
            display: flex;

            flex-direction:
              column;

            gap: 10px;
          }


          .admin-report-update {
            padding: 14px;

            border:
              1px solid var(--border);

            border-radius: 8px;
          }


          .admin-report-update-heading {
            display: flex;

            justify-content:
              space-between;

            gap: 12px;

            margin-bottom: 6px;
          }


          .admin-report-update-heading strong {
            font-size: 13px;
          }


          .admin-report-update-heading span {
            font-size: 11px;

            color:
              var(--text-secondary);

            text-align: right;
          }


          .admin-report-update p {
            margin:
              0 0 8px;

            font-size: 13px;

            line-height: 1.5;
          }


          @media (max-width: 620px) {
            .admin-report-modal-backdrop {
              padding: 8px;

              align-items:
                flex-end;
            }


            .admin-report-modal {
              width: 100%;

              max-height: 92vh;

              border-radius:
                16px
                16px
                0
                0;

              padding:
                18px 16px 22px;
            }


            .admin-report-modal-close {
              top: 12px;

              right: 12px;
            }


            .admin-report-detail-grid {
              grid-template-columns:
                repeat(
                  2,
                  minmax(0, 1fr)
                );

              gap: 14px;
            }


            .admin-report-photo-grid {
              grid-template-columns:
                1fr;
            }


            .admin-report-photo img {
              height:
                min(
                  55vw,
                  240px
                );
            }


            .admin-report-update-heading {
              flex-direction:
                column;

              gap: 3px;
            }


            .admin-report-update-heading span {
              text-align: left;
            }
          }


          @media (max-width: 390px) {
            .admin-report-detail-grid {
              grid-template-columns:
                1fr;

              gap: 12px;
            }
          }
        `}
      </style>
    </div>
  );
}


/* =============================================================
   DETAIL ITEM
============================================================= */

function DetailItem({
  label,
  value
}) {
  return (
    <div
      style={{
        minWidth: 0
      }}
    >
      <div
        style={{
          fontSize: 10.5,

          textTransform:
            'uppercase',

          color:
            'var(--text-secondary)',

          fontWeight: 800,

          marginBottom: 5
        }}
      >
        {label}
      </div>


      <div
        style={{
          fontSize: 13,

          fontWeight: 600,

          overflowWrap:
            'anywhere'
        }}
      >
        {value}
      </div>
    </div>
  );
}


/* =============================================================
   SECTION TITLE
============================================================= */

function SectionTitle({
  children
}) {
  return (
    <div
      style={{
        fontSize: 11,

        fontWeight: 800,

        color:
          'var(--text-secondary)',

        textTransform:
          'uppercase',

        letterSpacing: 0.35,

        marginBottom: 10
      }}
    >
      {children}
    </div>
  );
}


/* =============================================================
   INITIALS
============================================================= */

function getInitials(name) {
  if (!name) {
    return 'W';
  }

  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'W'
  );
}