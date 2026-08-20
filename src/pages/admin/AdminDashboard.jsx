import { useEffect, useState } from 'react';
import {
  Eye,
  UserPlus,
  CheckCircle,
  X,
  Search
} from 'lucide-react';

import api from '../../api/api';
import TopBar from '../../components/TopBar';
import StatusBadge from '../../components/StatusBadge';
import PriorityDot from '../../components/PriorityDot';
import PageTransition from '../../components/PageTransition';

const API_ORIGIN = 'http://localhost:5000';

const WORKERS_ENDPOINT = '/admin/workers';
const ASSIGNMENT_ENDPOINT = '/admin/assignments';


export default function AdminDashboard() {
const [data, setData] = useState(null);

  const [dashboard, setDashboard] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshAnimation, setRefreshAnimation] = useState(false);

  // Report modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Assignment modal
  const [assignmentReport, setAssignmentReport] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [assigning, setAssigning] = useState(false);

  // Messages
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /*
   * ============================================================
   * LOAD DASHBOARD
   * ============================================================
   */
  async function load() {
    try {
      setError('');

      const response = await api.get('/admin/dashboard');

      setData(response.data);
    } catch (err) {
      console.error('Dashboard loading error:', err);

      setError(
        err.response?.data?.message ||
        'Could not load the admin dashboard.'
      );
    }
  }

  useEffect(() => {
    load();
  }, []);

   
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


  /*
   * ============================================================
   * VIEW REPORT
   * ============================================================
   *
   * Uses the same endpoint that worked for your All Reports
   * page:
   *
   * GET /api/issues/search?code=GRP-...
   */
  async function viewReport(report) {
    try {
      setError('');
      setLoadingReport(true);

      const response = await api.get('/issues/search', {
        params: {
          code: report.ReportCode
        }
      });

      setSelectedReport(response.data);
    } catch (err) {
      console.error('View report error:', err);

      setError(
        err.response?.data?.message ||
        'Could not load report details.'
      );
    } finally {
      setLoadingReport(false);
    }
  }


  /*
   * ============================================================
   * CLOSE REPORT MODAL
   * ============================================================
   */
  function closeReportModal() {
    setSelectedReport(null);
  }


  /*
   * ============================================================
   * LOAD WORKERS
   * ============================================================
   */
  async function loadWorkers() {
    try {
      setLoadingWorkers(true);
      setError('');

      const response = await api.get(WORKERS_ENDPOINT);

      /*
       * Supports either:
       *
       * [
       *   {...}
       * ]
       *
       * OR:
       *
       * {
       *   workers: [...]
       * }
       */
      const workerData = Array.isArray(response.data)
        ? response.data
        : response.data.workers || [];

      setWorkers(workerData);
    } catch (err) {
      console.error('Worker loading error:', err);

      setError(
        err.response?.data?.message ||
        'Could not load workers.'
      );
    } finally {
      setLoadingWorkers(false);
    }
  }


  /*
   * ============================================================
   * OPEN ASSIGNMENT MODAL
   * ============================================================
   */
  async function openAssignmentModal(report) {
    setAssignmentReport(report);
    setSelectedWorkerId('');
    setSuccess('');
    setError('');

    await loadWorkers();
  }


  /*
   * ============================================================
   * CLOSE ASSIGNMENT MODAL
   * ============================================================
   */
  function closeAssignmentModal() {
    if (assigning) {
      return;
    }

    setAssignmentReport(null);
    setSelectedWorkerId('');
  }


  /*
   * ============================================================
   * ASSIGN REPORT
   * ============================================================
   */
  async function assignReport() {
    if (!assignmentReport) {
      return;
    }

    if (!selectedWorkerId) {
      setError('Please select a worker.');
      return;
    }

    try {
      setAssigning(true);
      setError('');
      setSuccess('');

      await api.post(ASSIGNMENT_ENDPOINT, {
        reportId: assignmentReport.ReportID,
        workerId: Number(selectedWorkerId)
      });

      setSuccess(
        `Report ${assignmentReport.ReportCode} was assigned successfully.`
      );

      /*
       * Close assignment modal after successful assignment.
       */
      setTimeout(() => {
        setAssignmentReport(null);
        setSelectedWorkerId('');
        load();
      }, 800);

    } catch (err) {
      console.error('Assignment error:', err);

      setError(
        err.response?.data?.message ||
        'Could not assign this report.'
      );
    } finally {
      setAssigning(false);
    }
  }


  /*
   * ============================================================
   * EXPORT REPORTS TO CSV
   * ============================================================
   */
  function handleExport() {
    if (!data?.recentReports?.length) {
      setError('There are no reports available to export.');
      return;
    }

    const rows = data.recentReports;

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

    const csvRows = rows.map((report) => [
      report.ReportCode,
      report.Title,
      report.CategoryName,
      report.Priority,
      report.LocationName,
      report.Status,
      report.WorkerName || 'Unassigned',
      new Date(report.CreatedAt).toLocaleString()
    ]);

    const escapeCsvValue = (value) => {
      const text = String(value ?? '');

      if (
        text.includes(',') ||
        text.includes('"') ||
        text.includes('\n')
      ) {
        return `"${text.replace(/"/g, '""')}"`;
      }

      return text;
    };

    const csvContent = [
      headers.map(escapeCsvValue).join(','),
      ...csvRows.map((row) =>
        row.map(escapeCsvValue).join(',')
      )
    ].join('\n');

    const blob = new Blob(
      [csvContent],
      {
        type: 'text/csv;charset=utf-8;'
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;

    link.download =
      `FixMyTown-Admin-Reports-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }


  /*
   * ============================================================
   * REFRESH
   * ============================================================
   */
  async function handleRefresh() {
    setSuccess('');
    setError('');

    setRefreshing(true);
    setRefreshAnimation(true);

    await load();

    setTimeout(() => {
      setRefreshing(false);
      setRefreshAnimation(false);
    }, 800);
  }


  /*
   * ============================================================
   * LOADING
   * ============================================================
   */
  if (!data) {
    return (
      <PageTransition>
        <Loading />
      </PageTransition>
    );
  }


  return (
    <PageTransition>
      <div>

        {/* =====================================================
            TOP BAR
            ===================================================== */}
        <TopBar
          section="Admin"
          page="Dashboard"
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />


        {/* =====================================================
            PAGE
            ===================================================== */}
        <div
          style={{
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}
        >

          {/* ===================================================
              ERROR MESSAGE
              =================================================== */}
          {error && (
            <div
              style={{
                padding: '11px 14px',
                borderRadius: 8,
                background: '#fdecec',
                color: '#c0362c',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10
              }}
            >
              <span>{error}</span>

              <button
                onClick={() => setError('')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'inherit',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={15} />
              </button>
            </div>
          )}


          {/* ===================================================
              SUCCESS MESSAGE
              =================================================== */}
          {success && (
            <div
              style={{
                padding: '11px 14px',
                borderRadius: 8,
                background: '#eaf8ef',
                color: '#16803c',
                fontSize: 13
              }}
            >
              {success}
            </div>
          )}


          {/* ===================================================
              RECENT REPORTS
              =================================================== */}
          <div className="card">

            {/* HEADER */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom:
                  '1px solid var(--border)'
              }}
            >
              <strong>
                Recent Reports
              </strong>
            </div>


            {/* TABLE */}
            <div
              style={{
                overflowX: 'auto'
              }}
            >
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
                      color:
                        'var(--text-secondary)',
                      fontSize: 11,
                      textTransform:
                        'uppercase'
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
                      'Actions'
                    ].map((heading) => (
                      <th
                        key={heading}
                        style={{
                          padding:
                            '10px 16px',
                          fontWeight: 700,
                          whiteSpace:
                            'nowrap'
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>


                <tbody>
                  {data.recentReports.map(
                    (report) => (
                      <tr
                        key={
                          report.ReportID
                        }
                        style={{
                          borderTop:
                            '1px solid var(--border)'
                        }}
                      >

                        {/* ID */}
                        <td
                          style={{
                            padding:
                              '12px 16px',
                            fontWeight: 700,
                            whiteSpace:
                              'nowrap'
                          }}
                        >
                          #{report.ReportCode}
                        </td>


                        {/* ISSUE */}
                        <td
                          style={{
                            padding:
                              '12px 16px'
                          }}
                        >
                          {report.Title}
                        </td>


                        {/* CATEGORY */}
                        <td
                          style={{
                            padding:
                              '12px 16px'
                          }}
                        >
                          {report.CategoryName}
                        </td>


                        {/* PRIORITY */}
                        <td
                          style={{
                            padding:
                              '12px 16px'
                          }}
                        >
                          <PriorityDot
                            priority={
                              report.Priority
                            }
                          />
                        </td>


                        {/* LOCATION */}
                        <td
                          style={{
                            padding:
                              '12px 16px'
                          }}
                        >
                          {report.LocationName}
                        </td>


                        {/* STATUS */}
                        <td
                          style={{
                            padding:
                              '12px 16px'
                          }}
                        >
                          <StatusBadge
                            status={
                              report.Status
                            }
                          />
                        </td>


                        {/* WORKER */}
                        <td
                          style={{
                            padding:
                              '12px 16px'
                          }}
                        >
                          {report.WorkerName ||
                            '—'}
                        </td>


                        {/* DATE */}
                        <td
                          style={{
                            padding:
                              '12px 16px',
                            whiteSpace:
                              'nowrap'
                          }}
                        >
                          {new Date(
                            report.CreatedAt
                          ).toLocaleDateString()}
                        </td>


                        {/* ACTIONS */}
                        <td
                          style={{
                            padding:
                              '12px 16px'
                          }}
                        >
                          <div
                            style={{
                              display:
                                'flex',
                              gap: 6,
                              alignItems:
                                'center'
                            }}
                          >

                            {/* VIEW */}
                            <IconBtn
                              icon={
                                <Eye
                                  size={14}
                                />
                              }
                              title="View report"
                              onClick={() =>
                                viewReport(
                                  report
                                )
                              }
                            />


                            {/* RESOLVE */}
                            {report.Status ===
                              'In Progress' && (
                              <IconBtn
                                icon={
                                  <CheckCircle
                                    size={14}
                                  />
                                }
                                green
                                title="Mark as resolved"
                              />
                            )}

                          </div>
                        </td>

                      </tr>
                    )
                  )}


                  {/* NO REPORTS */}
                  {data.recentReports
                    .length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        style={{
                          padding: 30,
                          textAlign:
                            'center',
                          color:
                            'var(--text-secondary)'
                        }}
                      >
                        No recent reports.
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          </div>


          {/* ===================================================
              LOWER SECTION
              =================================================== */}
          <div
            style={{
              display: 'flex',
              gap: 20,
              flexWrap: 'wrap'
            }}
          >

            {/* WORKER OVERVIEW */}
            <div
              className="card"
              style={{
                flex: 1,
                minWidth: 400
              }}
            >
              <div
                style={{
                  padding:
                    '16px 20px',
                  borderBottom:
                    '1px solid var(--border)',
                  fontWeight: 700
                }}
              >
                Worker Overview
              </div>

              <div
                style={{
                  overflowX: 'auto'
                }}
              >
                <table
                  style={{
                    width: '100%',
                    borderCollapse:
                      'collapse',
                    fontSize: 13
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        textAlign:
                          'left',
                        color:
                          'var(--text-secondary)',
                        fontSize: 11,
                        textTransform:
                          'uppercase'
                      }}
                    >
                      <th
                        style={{
                          padding:
                            '10px 16px'
                        }}
                      >
                        Worker
                      </th>

                      <th
                        style={{
                          padding:
                            '10px 16px'
                        }}
                      >
                        Department
                      </th>

                      <th
                        style={{
                          padding:
                            '10px 16px'
                        }}
                      >
                        Active Issues
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.workerOverview.map(
                      (worker) => (
                        <tr
                          key={
                            worker.WorkerName
                          }
                          style={{
                            borderTop:
                              '1px solid var(--border)'
                          }}
                        >
                          <td
                            style={{
                              padding:
                                '10px 16px',
                              fontWeight: 600
                            }}
                          >
                            {
                              worker.WorkerName
                            }
                          </td>

                          <td
                            style={{
                              padding:
                                '10px 16px'
                            }}
                          >
                            {
                              worker.DepartmentName
                            }
                          </td>

                          <td
                            style={{
                              padding:
                                '10px 16px'
                            }}
                          >
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

                    {data.workerOverview
                      .length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          style={{
                            padding: 20,
                            textAlign:
                              'center',
                            color:
                              'var(--text-secondary)'
                          }}
                        >
                          No worker data.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>


            {/* RECENT ACTIVITY */}
            <div
              className="card"
              style={{
                flex: 1,
                minWidth: 350,
                padding: 20
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  marginBottom: 14
                }}
              >
                Recent Activity
              </div>

              <div
                style={{
                  display:
                    'flex',
                  flexDirection:
                    'column',
                  gap: 12
                }}
              >
                {data.recentReports
                  .slice(0, 4)
                  .map((report) => (
                    <div
                      key={
                        report.ReportID
                      }
                      style={{
                        fontSize: 13,
                        paddingBottom:
                          10,
                        borderBottom:
                          '1px solid var(--border)'
                      }}
                    >
                      <strong>
                        {report.Status}
                      </strong>

                      <div
                        style={{
                          color:
                            'var(--text-secondary)',
                          fontSize: 12,
                          marginTop: 3
                        }}
                      >
                        {new Date(
                          report.CreatedAt
                        ).toLocaleString()}{' '}
                        —{' '}
                        {report.WorkerName ||
                          'Unassigned'}
                      </div>
                    </div>
                  ))}

                {data.recentReports.length ===
                  0 && (
                  <div
                    style={{
                      color:
                        'var(--text-secondary)',
                      fontSize: 13
                    }}
                  >
                    No recent activity.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>


        {/* =====================================================
            REPORT DETAILS MODAL
            ===================================================== */}
        {selectedReport && (
          <ReportModal
            report={selectedReport}
            getPhotoUrl={getPhotoUrl}
            onClose={closeReportModal}
          />
        )}


        {/* =====================================================
            ASSIGN WORKER MODAL
            ===================================================== */}
        {assignmentReport && (
          <AssignmentModal
            report={assignmentReport}
            workers={workers}
            selectedWorkerId={
              selectedWorkerId
            }
            setSelectedWorkerId={
              setSelectedWorkerId
            }
            loadingWorkers={
              loadingWorkers
            }
            assigning={assigning}
            onAssign={assignReport}
            onClose={
              closeAssignmentModal
            }
          />
        )}

        {/* =====================================================
    SYSTEM REFRESH LOADING
    ===================================================== */}

      {refreshAnimation && (
        <div
          style={{
            position:'fixed',
            inset:0,
            zIndex:9998,
            background:'rgba(255,255,255,0.35)',
            backdropFilter:'blur(3px)',
            display:'flex',
            alignItems:'center',
            justifyContent:'center'
          }}
        >

          <div
            style={{
              width:55,
              height:55,
              borderRadius:'50%',
              border:'5px solid #dbeafe',
              borderTop:'5px solid #2563eb',
              animation:'refreshSpin 0.9s linear infinite'
            }}
          />

          <style>
            {`
              @keyframes refreshSpin {
                from {
                  transform:rotate(0deg);
                }

                to {
                  transform:rotate(360deg);
                }
              }
            `}
          </style>

        </div>
      )}


        {/* =====================================================
            REPORT LOADING
            ===================================================== */}
        {loadingReport && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              background:
                'rgba(15, 23, 42, 0.25)',
              backdropFilter:
                'blur(2px)',
              display: 'flex',
              alignItems:
                'center',
              justifyContent:
                'center'
            }}
          >
            <div
              style={{
                background:
                  'white',
                padding:
                  '20px 28px',
                borderRadius: 10,
                boxShadow:
                  '0 10px 40px rgba(0,0,0,0.2)',
                fontSize: 14,
                fontWeight: 600
              }}
            >
              Loading report...
            </div>
          </div>
        )}

      </div>
    </PageTransition>
  );
}


/* ============================================================
   REPORT DETAILS MODAL
   ============================================================ */

function ReportModal({
  report,
  getPhotoUrl,
  onClose
}) {
  /*
   * Close with Escape.
   */
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
    if (e.target === e.currentTarget) {
      onClose();
    }
  }


  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,

        background:
          'rgba(15, 23, 42, 0.35)',

        backdropFilter:
          'blur(3px)',

        WebkitBackdropFilter:
          'blur(3px)',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        padding: 20
      }}
    >
      <div
        style={{
          position: 'relative',

          width: '100%',
          maxWidth: 850,

          maxHeight: '90vh',
          overflowY: 'auto',

          background:
            'var(--bg-card, white)',

          borderRadius: 14,

          boxShadow:
            '0 20px 60px rgba(0,0,0,0.25)',

          padding: 24
        }}
      >

        {/* CLOSE */}
        <button
          onClick={onClose}
          title="Close"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,

            width: 36,
            height: 36,

            borderRadius: '50%',
            border:
              '1px solid var(--border)',

            background:
              'var(--bg-page)',

            display: 'flex',
            alignItems:
              'center',
            justifyContent:
              'center',

            cursor: 'pointer',

            zIndex: 2
          }}
        >
          <X size={18} />
        </button>


        {/* HEADER */}
        <div
          style={{
            paddingRight: 50,
            paddingBottom: 18,
            borderBottom:
              '1px solid var(--border)',
            marginBottom: 20
          }}
        >
          <div
            style={{
              fontSize: 11,
              color:
                'var(--text-secondary)',
              textTransform:
                'uppercase',
              marginBottom: 5
            }}
          >
            Report ID
          </div>

          <div
            style={{
              fontSize: 20,
              fontWeight: 800
            }}
          >
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


        {/* DETAILS */}
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
              report.CategoryName
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
            value={new Date(
              report.CreatedAt
            ).toLocaleString()}
          />
        </div>


        {/* DESCRIPTION */}
        <div
          style={{
            marginTop: 22
          }}
        >
          <SectionTitle>
            DESCRIPTION
          </SectionTitle>

          <div
            style={{
              padding: 14,
              borderRadius: 8,
              background:
                'var(--bg-page)',
              lineHeight: 1.6,
              fontSize: 13
            }}
          >
            {report.Description ||
              'No description provided.'}
          </div>
        </div>


        {/* PHOTOS */}
        <div
          style={{
            marginTop: 22
          }}
        >
          <SectionTitle>
            PHOTOS
            {report.Photos?.length
              ? ` (${report.Photos.length})`
              : ''}
          </SectionTitle>

          {report.Photos?.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(180px, 1fr))',
                gap: 12
              }}
            >
              {report.Photos.map(
                (photo, index) => {
                  const photoUrl =
                    getPhotoUrl(
                      photo
                    );

                  return (
                    <div
                      key={`${photo}-${index}`}
                      style={{
                        border:
                          '1px solid var(--border)',
                        borderRadius: 10,
                        overflow:
                          'hidden',
                        background:
                          'var(--bg-page)'
                      }}
                    >
                      <img
                        src={photoUrl}
                        alt={`Report photo ${
                          index + 1
                        }`}
                        style={{
                          width: '100%',
                          height: 180,
                          objectFit:
                            'cover',
                          display:
                            'block'
                        }}
                        onError={(e) => {
                          console.error(
                            'Photo failed:',
                            photoUrl
                          );

                          e.currentTarget.style.display =
                            'none';

                          const parent =
                            e.currentTarget
                              .parentElement;

                          if (parent) {
                            const message =
                              document.createElement(
                                'div'
                              );

                            message.style.height =
                              '180px';

                            message.style.display =
                              'flex';

                            message.style.alignItems =
                              'center';

                            message.style.justifyContent =
                              'center';

                            message.style.padding =
                              '15px';

                            message.style.textAlign =
                              'center';

                            message.style.fontSize =
                              '12px';

                            message.style.color =
                              '#777';

                            message.textContent =
                              'Photo could not be loaded';

                            parent.insertBefore(
                              message,
                              parent.firstChild
                            );
                          }
                        }}
                      />

                      <div
                        style={{
                          padding:
                            '8px 10px',
                          fontSize: 11,
                          color:
                            'var(--text-secondary)',
                          borderTop:
                            '1px solid var(--border)'
                        }}
                      >
                        Report photo{' '}
                        {index + 1}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div
              style={{
                padding: 20,
                textAlign:
                  'center',
                border:
                  '1px dashed var(--border)',
                borderRadius: 10,
                color:
                  'var(--text-secondary)',
                fontSize: 13
              }}
            >
              No photos attached to
              this report.
            </div>
          )}
        </div>


        {/* PROGRESS UPDATES */}
        {report.Updates?.length >
          0 && (
          <div
            style={{
              marginTop: 22
            }}
          >
            <SectionTitle>
              PROGRESS UPDATES
            </SectionTitle>

            <div
              style={{
                display: 'flex',
                flexDirection:
                  'column',
                gap: 10
              }}
            >
              {report.Updates.map(
                (update, index) => (
                  <div
                    key={index}
                    style={{
                      padding: 14,
                      border:
                        '1px solid var(--border)',
                      borderRadius: 8
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        gap: 15,
                        marginBottom: 6
                      }}
                    >
                      <strong
                        style={{
                          fontSize: 13
                        }}
                      >
                        {update.WorkerName ||
                          'Unknown Worker'}
                      </strong>

                      <span
                        style={{
                          fontSize: 11,
                          color:
                            'var(--text-secondary)'
                        }}
                      >
                        {new Date(
                          update.CreatedAt
                        ).toLocaleString()}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: 13
                      }}
                    >
                      {update.Note ||
                        'No progress note provided.'}
                    </div>

                    <div
                      style={{
                        marginTop: 8
                      }}
                    >
                      <StatusBadge
                        status={
                          update.StatusAtUpdate
                        }
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


/* ============================================================
   ASSIGNMENT MODAL
   ============================================================ */

function AssignmentModal({
  report,
  workers,
  selectedWorkerId,
  setSelectedWorkerId,
  loadingWorkers,
  assigning,
  onAssign,
  onClose
}) {
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape' && !assigning) {
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
  }, [onClose, assigning]);


  function handleBackdropClick(e) {
    if (
      e.target === e.currentTarget &&
      !assigning
    ) {
      onClose();
    }
  }


  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10001,

        background:
          'rgba(15, 23, 42, 0.35)',

        backdropFilter:
          'blur(3px)',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        padding: 20
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 500,

          background:
            'var(--bg-card, white)',

          borderRadius: 14,

          padding: 24,

          boxShadow:
            '0 20px 60px rgba(0,0,0,0.25)',

          position: 'relative'
        }}
      >

        {/* CLOSE */}
        <button
          onClick={onClose}
          disabled={assigning}
          title="Close"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,

            width: 34,
            height: 34,

            borderRadius: '50%',
            border:
              '1px solid var(--border)',

            background:
              'var(--bg-page)',

            cursor: assigning
              ? 'not-allowed'
              : 'pointer',

            display: 'flex',
            alignItems:
              'center',
            justifyContent:
              'center'
          }}
        >
          <X size={17} />
        </button>


        {/* HEADER */}
        <div
          style={{
            paddingRight: 45,
            marginBottom: 22
          }}
        >
          <div
            style={{
              fontSize: 12,
              color:
                'var(--text-secondary)',
              textTransform:
                'uppercase',
              marginBottom: 5
            }}
          >
            Assign Report
          </div>

          <div
            style={{
              fontSize: 18,
              fontWeight: 800
            }}
          >
            #{report.ReportCode}
          </div>

          <div
            style={{
              marginTop: 5,
              fontSize: 14,
              color:
                'var(--text-secondary)'
            }}
          >
            {report.Title}
          </div>
        </div>


        {/* WORKER SELECT */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 7
            }}
          >
            SELECT WORKER
          </label>

          {loadingWorkers ? (
            <div
              style={{
                padding: 12,
                border:
                  '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 13,
                color:
                  'var(--text-secondary)'
              }}
            >
              Loading workers...
            </div>
          ) : (
            <select
              value={selectedWorkerId}
              onChange={(e) =>
                setSelectedWorkerId(
                  e.target.value
                )
              }
              disabled={assigning}
              style={{
                width: '100%',
                padding:
                  '10px 12px',
                borderRadius: 8,
                border:
                  '1px solid var(--border)',
                background:
                  'var(--bg-page)',
                fontSize: 13,
                outline: 'none'
              }}
            >
              <option value="">
                Select a worker
              </option>

              {workers.map(
                (worker) => {
                  const id =
                    worker.UserId ??
                    worker.WorkerId ??
                    worker.Id;

                  const firstName =
                    worker.FirstName ||
                    '';

                  const lastName =
                    worker.LastName ||
                    '';

                  const fullName =
                    worker.WorkerName ||
                    worker.Name ||
                    `${firstName} ${lastName}`.trim();

                  return (
                    <option
                      key={id}
                      value={id}
                    >
                      {fullName ||
                        `Worker ${id}`}
                    </option>
                  );
                }
              )}
            </select>
          )}
        </div>


        {/* NO WORKERS */}
        {!loadingWorkers &&
          workers.length === 0 && (
            <div
              style={{
                marginTop: 10,
                fontSize: 12,
                color:
                  'var(--text-secondary)'
              }}
            >
              No workers are available.
            </div>
          )}


        {/* BUTTONS */}
        <div
          style={{
            display: 'flex',
            justifyContent:
              'flex-end',
            gap: 10,
            marginTop: 24
          }}
        >
          <button
            onClick={onClose}
            disabled={assigning}
            style={{
              padding:
                '9px 16px',
              borderRadius: 8,
              border:
                '1px solid var(--border)',
              background:
                'var(--bg-page)',
              cursor:
                assigning
                  ? 'not-allowed'
                  : 'pointer',
              fontSize: 13
            }}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary"
            onClick={onAssign}
            disabled={
              assigning ||
              loadingWorkers ||
              !selectedWorkerId
            }
            style={{
              padding:
                '9px 16px',
              fontSize: 13,
              display: 'flex',
              alignItems:
                'center',
              gap: 7
            }}
          >
            <UserPlus size={14} />

            {assigning
              ? 'Assigning...'
              : 'Assign Report'}
          </button>
        </div>

      </div>
    </div>
  );
}


/* ============================================================
   DETAIL ITEM
   ============================================================ */

function DetailItem({
  label,
  value
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          textTransform:
            'uppercase',
          color:
            'var(--text-secondary)',
          marginBottom: 5
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


/* ============================================================
   SECTION TITLE
   ============================================================ */

function SectionTitle({
  children
}) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        color:
          'var(--text-secondary)',
        marginBottom: 10
      }}
    >
      {children}
    </div>
  );
}


/* ============================================================
   ACTION BUTTON
   ============================================================ */

function IconBtn({
  icon,
  dark,
  green,
  onClick,
  title
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 30,
        height: 30,
        borderRadius: '50%',
        border: 'none',

        background: green
          ? '#22c55e'
          : dark
            ? 'var(--navy-800)'
            : 'var(--bg-page)',

        color:
          green || dark
            ? 'white'
            : 'var(--text-secondary)',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        cursor: 'pointer'
      }}
    >
      {icon}
    </button>
  );
}


/* ============================================================
   LOADING
   ============================================================ */

function Loading() {
  return (
    <div
      style={{
        padding: 40,
        color:
          'var(--text-secondary)'
      }}
    >
      Loading dashboard...
    </div>
  );
}