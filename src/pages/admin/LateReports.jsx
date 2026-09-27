import {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  AlertTriangle,
  Eye,
  RefreshCw,
  Search,
  X
} from 'lucide-react';

import api from '../../api/api';

import TopBar
  from '../../components/TopBar';

import StatusBadge
  from '../../components/StatusBadge';

import PriorityDot
  from '../../components/PriorityDot';


/* ============================================================
   LATE REPORT CONFIGURATION
============================================================ */

/*
 * Temporary frontend fallback.
 *
 * A report becomes late once it has remained unresolved
 * for at least 2 full days / 48 hours.
 *
 * If the backend later returns IsLate as a boolean,
 * that backend value will be used instead.
 */
const LATE_AFTER_DAYS = 2;

const MILLISECONDS_PER_DAY =
  24 * 60 * 60 * 1000;


/*
 * Only unresolved workflow states belong on the
 * Late Reports page.
 */
const ACTIVE_STATUSES = new Set([
  'Reported',
  'Assigned',
  'In Progress'
]);


/*
 * Resolved-type states must never appear as late.
 */
const CLOSED_STATUSES = new Set([
  'Resolved',
  'Closed',
  'Rejected'
]);


const STATUS_OPTIONS = [
  'All Status',
  'Reported',
  'Assigned',
  'In Progress'
];


/* ============================================================
   PHOTO BASE
============================================================ */

const appBase =
  (
    import.meta.env.BASE_URL ||
    '/'
  ).replace(
    /\/$/,
    ''
  );


const developmentApi =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api';


const apiBase =
  import.meta.env.DEV
    ? developmentApi
    : `${window.location.origin}${appBase}/api`;


const API_ORIGIN =
  apiBase.replace(
    /\/api\/?$/,
    ''
  );


/* ============================================================
   PAGE
============================================================ */

export default function LateReports() {
  const [
    allReports,
    setAllReports
  ] = useState([]);

  const [
    status,
    setStatus
  ] = useState(
    'All Status'
  );

  const [
    search,
    setSearch
  ] = useState('');

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState('');

  const [
    selectedReport,
    setSelectedReport
  ] = useState(null);

  const [
    loadingDetails,
    setLoadingDetails
  ] = useState(false);


  /* ==========================================================
     LOAD ALL REPORTS

     IMPORTANT:
     We deliberately DO NOT send late=true.

     The restored backend does not reliably support that
     parameter, so lateness is calculated in this component.
  ========================================================== */

  async function loadReports() {
    setLoading(true);
    setError('');

    try {
      const response =
        await api.get(
          '/admin/reports'
        );

      const rows =
        Array.isArray(
          response.data
        )
          ? response.data
          : [];

      setAllReports(
        rows
      );
    } catch (
      err
    ) {
      console.error(
        'Late reports loading error:',
        err
      );

      setAllReports([]);

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


  /* ==========================================================
     CALCULATE LATE REPORTS
  ========================================================== */

  const lateReports =
    useMemo(
      () =>
        allReports
          .filter(
            (report) =>
              isLateReport(
                report
              )
          )
          .sort(
            (
              first,
              second
            ) =>
              new Date(
                second.CreatedAt
              ).getTime() -
              new Date(
                first.CreatedAt
              ).getTime()
          ),
      [
        allReports
      ]
    );


  /* ==========================================================
     STATUS + SEARCH FILTERING
  ========================================================== */

  const visibleReports =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        return lateReports.filter(
          (report) => {
            const reportStatus =
              normaliseStatus(
                report.Status
              );

            const matchesStatus =
              status ===
                'All Status' ||
              reportStatus ===
                status;

            if (
              !matchesStatus
            ) {
              return false;
            }


            if (!query) {
              return true;
            }


            const searchable =
              [
                report.ReportCode,
                report.Title,
                report.CategoryName,
                report.LocationName,
                report.WorkerName,
                report.Priority,
                reportStatus
              ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();


            return searchable.includes(
              query
            );
          }
        );
      },
      [
        lateReports,
        status,
        search
      ]
    );


  /* ==========================================================
     VIEW REPORT
  ========================================================== */

  async function viewReport(
    report
  ) {
    setLoadingDetails(true);
    setError('');

    try {
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

      /*
       * The old report-details endpoint may not return
       * IsLate, so preserve the frontend calculation.
       */
      setSelectedReport({
        ...response.data,

        IsLate:
          true
      });
    } catch (
      err
    ) {
      console.error(
        'Late report details error:',
        err
      );

      /*
       * We can still show the row information even
       * if the details request fails.
       */
      setSelectedReport({
        ...report,

        IsLate:
          true
      });

      setError(
        err.response?.data?.message ||
        'Full report details could not be loaded.'
      );
    } finally {
      setLoadingDetails(false);
    }
  }


  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <div>
      <TopBar
        section="Admin"
        page="Late Reports"
        onRefresh={
          loadReports
        }
        showExport
      />


      <div
        style={{
          padding: 24
        }}
      >
        <div className="card">

          {/* =================================================
              HEADER
          ================================================= */}

          <div
            style={{
              display: 'flex',

              alignItems:
                'center',

              gap: 12,

              flexWrap:
                'wrap',

              padding:
                '16px 20px',

              borderBottom:
                '1px solid var(--border)'
            }}
          >
            <strong
              style={{
                display:
                  'flex',

                alignItems:
                  'center',

                gap:
                  8,

                color:
                  '#991b1b'
              }}
            >
              <AlertTriangle
                size={17}
              />

              Late Reports
              {' '}
              (
              {visibleReports.length}
              )
            </strong>


            <div
              style={{
                marginLeft:
                  'auto',

                display:
                  'flex',

                alignItems:
                  'center',

                gap:
                  10,

                flexWrap:
                  'wrap'
              }}
            >

              {/* STATUS FILTER */}

              <select
                value={
                  status
                }
                onChange={(
                  event
                ) =>
                  setStatus(
                    event.target.value
                  )
                }
                style={{
                  padding:
                    '8px 12px',

                  borderRadius:
                    8,

                  border:
                    '1px solid var(--border)',

                  background:
                    'white',

                  fontSize:
                    13
                }}
              >
                {STATUS_OPTIONS.map(
                  (item) => (
                    <option
                      key={
                        item
                      }
                      value={
                        item
                      }
                    >
                      {item}
                    </option>
                  )
                )}
              </select>


              {/* SEARCH */}

              <div
                style={{
                  position:
                    'relative',

                  display:
                    'flex',

                  alignItems:
                    'center'
                }}
              >
                <Search
                  size={14}
                  style={{
                    position:
                      'absolute',

                    left:
                      10,

                    color:
                      'var(--text-muted)',

                    pointerEvents:
                      'none'
                  }}
                />

                <input
                  value={
                    search
                  }
                  placeholder="Search reports..."
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  style={{
                    width:
                      220,

                    padding:
                      '8px 34px 8px 30px',

                    borderRadius:
                      8,

                    border:
                      '1px solid var(--border)',

                    fontSize:
                      13
                  }}
                />


                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch('')
                    }
                    title="Clear search"
                    style={{
                      position:
                        'absolute',

                      right:
                        5,

                      width:
                        25,

                      height:
                        25,

                      border:
                        'none',

                      borderRadius:
                        6,

                      background:
                        'transparent',

                      color:
                        'var(--text-muted)',

                      display:
                        'flex',

                      alignItems:
                        'center',

                      justifyContent:
                        'center',

                      cursor:
                        'pointer'
                    }}
                  >
                    <X
                      size={14}
                    />
                  </button>
                )}
              </div>


              {/* REFRESH */}

              <button
                type="button"
                className="btn btn-outline"
                onClick={
                  loadReports
                }
                disabled={
                  loading
                }
                style={{
                  display:
                    'flex',

                  alignItems:
                    'center',

                  gap:
                    6,

                  padding:
                    '8px 12px'
                }}
              >
                <RefreshCw
                  size={14}
                />

                Refresh
              </button>
            </div>
          </div>


          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <div
            style={{
              padding:
                '10px 20px',

              borderBottom:
                '1px solid var(--border)',

              background:
                '#fff7f7',

              color:
                '#7f1d1d',

              fontSize:
                12
            }}
          >
            Shows unresolved reports
            that have remained open
            for at least{' '}
            <strong>
              {LATE_AFTER_DAYS}
              {' '}
              days
            </strong>.
            Resolved reports are
            excluded automatically.
          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              style={{
                margin:
                  '14px 20px 0',

                padding:
                  '10px 12px',

                border:
                  '1px solid #fecaca',

                borderRadius:
                  8,

                background:
                  '#fef2f2',

                color:
                  '#991b1b',

                fontSize:
                  12
              }}
            >
              {error}
            </div>
          )}


          {/* =================================================
              TABLE
          ================================================= */}

          <div
            style={{
              overflowX:
                'auto'
            }}
          >
            <table
              style={{
                width:
                  '100%',

                borderCollapse:
                  'collapse',

                fontSize:
                  13
              }}
            >
              <thead>
                <tr
                  style={{
                    textAlign:
                      'left',

                    color:
                      'var(--text-secondary)',

                    fontSize:
                      11,

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
                    'View'
                  ].map(
                    (
                      heading
                    ) => (
                      <th
                        key={
                          heading
                        }
                        style={{
                          padding:
                            '10px 16px',

                          fontWeight:
                            700,

                          whiteSpace:
                            'nowrap'
                        }}
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>


              <tbody>

                {/* LOADING */}

                {loading && (
                  <tr>
                    <td
                      colSpan={
                        9
                      }
                      style={{
                        padding:
                          30,

                        textAlign:
                          'center',

                        color:
                          'var(--text-secondary)'
                      }}
                    >
                      Loading late
                      reports...
                    </td>
                  </tr>
                )}


                {/* REPORTS */}

                {!loading &&
                  visibleReports.map(
                    (
                      report
                    ) => (
                      <tr
                        key={
                          report.ReportID ??
                          report.ReportId ??
                          report.ReportCode
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

                            fontWeight:
                              700,

                            whiteSpace:
                              'nowrap'
                          }}
                        >
                          #
                          {
                            report.ReportCode
                          }
                        </td>


                        {/* ISSUE */}

                        <td
                          style={{
                            padding:
                              '12px 16px',

                            minWidth:
                              180
                          }}
                        >
                          {
                            report.Title
                          }
                        </td>


                        {/* CATEGORY */}

                        <td
                          style={{
                            padding:
                              '12px 16px'
                          }}
                        >
                          {
                            report.CategoryName ||
                            '—'
                          }
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
                              '12px 16px',

                            minWidth:
                              180
                          }}
                        >
                          {
                            report.LocationName ||
                            '—'
                          }
                        </td>


                        {/* STATUS */}

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

                              alignItems:
                                'center',

                              gap:
                                6,

                              flexWrap:
                                'wrap'
                            }}
                          >
                            <StatusBadge
                              status={
                                normaliseStatus(
                                  report.Status
                                )
                              }
                            />


                            <LateBadge />
                          </div>
                        </td>


                        {/* WORKER */}

                        <td
                          style={{
                            padding:
                              '12px 16px'
                          }}
                        >
                          {
                            report.WorkerName ||
                            '—'
                          }
                        </td>


                        {/* REPORTED */}

                        <td
                          style={{
                            padding:
                              '12px 16px',

                            whiteSpace:
                              'nowrap'
                          }}
                        >
                          {
                            formatDate(
                              report.CreatedAt
                            )
                          }
                        </td>


                        {/* VIEW */}

                        <td
                          style={{
                            padding:
                              '12px 16px'
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              viewReport(
                                report
                              )
                            }
                            disabled={
                              loadingDetails
                            }
                            title="View report"
                            style={{
                              width:
                                32,

                              height:
                                32,

                              borderRadius:
                                '50%',

                              border:
                                'none',

                              background:
                                'var(--bg-page)',

                              color:
                                'var(--text-secondary)',

                              display:
                                'flex',

                              alignItems:
                                'center',

                              justifyContent:
                                'center',

                              cursor:
                                'pointer'
                            }}
                          >
                            <Eye
                              size={15}
                            />
                          </button>
                        </td>
                      </tr>
                    )
                  )}


                {/* EMPTY */}

                {!loading &&
                  visibleReports.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={
                          9
                        }
                        style={{
                          padding:
                            32,

                          textAlign:
                            'center',

                          color:
                            'var(--text-secondary)'
                        }}
                      >
                        No late unresolved
                        reports match the
                        current filter.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>


      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedReport && (
        <ReportModal
          report={
            selectedReport
          }
          onClose={() =>
            setSelectedReport(
              null
            )
          }
        />
      )}
    </div>
  );
}


/* ============================================================
   LATE CALCULATION
============================================================ */

function isLateReport(
  report
) {
  if (!report) {
    return false;
  }


  const status =
    normaliseStatus(
      report.Status
    );


  /*
   * Resolved / completed reports can never
   * appear in Late Reports.
   */
  if (
    CLOSED_STATUSES.has(
      status
    )
  ) {
    return false;
  }


  /*
   * Ignore unknown workflow states.
   */
  if (
    !ACTIVE_STATUSES.has(
      status
    )
  ) {
    return false;
  }


  /*
   * If the currently deployed backend eventually
   * returns IsLate=true, respect it.
   *
   * We deliberately do not trust IsLate=false here
   * because an older deployment may return false or
   * fail to run the scheduled late-report sweep.
   */
  if (
    report.IsLate === true
  ) {
    return true;
  }


  /*
   * Frontend fallback:
   *
   * unresolved + at least 48 hours old = late.
   */
  const createdAt =
    new Date(
      report.CreatedAt
    );


  if (
    Number.isNaN(
      createdAt.getTime()
    )
  ) {
    return false;
  }


  const age =
    Date.now() -
    createdAt.getTime();


  return (
    age >=
    LATE_AFTER_DAYS *
      MILLISECONDS_PER_DAY
  );
}


/* ============================================================
   NORMALISE STATUS
============================================================ */

function normaliseStatus(
  value
) {
  const status =
    String(
      value ||
      ''
    ).trim();


  if (
    status ===
    'InProgress'
  ) {
    return 'In Progress';
  }


  return status;
}


/* ============================================================
   LATE BADGE
============================================================ */

function LateBadge() {
  return (
    <span
      className="badge"
      title="This unresolved report has been open for at least 2 days."
      style={{
        background:
          '#fee2e2',

        color:
          '#991b1b',

        fontWeight:
          800,

        border:
          '1px solid #fecaca',

        letterSpacing:
          0.3
      }}
    >
      LATE
    </span>
  );
}


/* ============================================================
   REPORT MODAL
============================================================ */

function ReportModal({
  report,
  onClose
}) {
  const photos =
    Array.isArray(
      report.Photos
    )
      ? report.Photos
      : [];


  useEffect(() => {
    function handleKeyDown(
      event
    ) {
      if (
        event.key ===
        'Escape'
      ) {
        onClose();
      }
    }


    document.addEventListener(
      'keydown',
      handleKeyDown
    );


    return () =>
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
  }, [
    onClose
  ]);


  return (
    <div
      role="presentation"
      onClick={(
        event
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
      style={{
        position:
          'fixed',

        inset:
          0,

        zIndex:
          10000,

        padding:
          20,

        background:
          'rgba(15, 23, 42, 0.55)',

        backdropFilter:
          'blur(3px)',

        display:
          'flex',

        alignItems:
          'center',

        justifyContent:
          'center'
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Late report details"
        style={{
          position:
            'relative',

          width:
            '100%',

          maxWidth:
            720,

          maxHeight:
            '90vh',

          overflowY:
            'auto',

          padding:
            24,

          borderRadius:
            12,

          background:
            'white',

          boxShadow:
            '0 20px 60px rgba(15, 23, 42, 0.25)'
        }}
      >

        {/* CLOSE */}

        <button
          type="button"
          onClick={
            onClose
          }
          aria-label="Close"
          style={{
            position:
              'absolute',

            top:
              16,

            right:
              16,

            width:
              34,

            height:
              34,

            border:
              '1px solid var(--border)',

            borderRadius:
              '50%',

            background:
              'var(--bg-page)',

            color:
              'var(--text-primary)',

            display:
              'flex',

            alignItems:
              'center',

            justifyContent:
              'center',

            cursor:
              'pointer'
          }}
        >
          <X
            size={17}
          />
        </button>


        {/* HEADER */}

        <div
          style={{
            paddingRight:
              48,

            paddingBottom:
              18,

            marginBottom:
              20,

            borderBottom:
              '1px solid var(--border)'
          }}
        >
          <div
            style={{
              marginBottom:
                5,

              color:
                'var(--text-secondary)',

              fontSize:
                11,

              textTransform:
                'uppercase'
            }}
          >
            Late Report
          </div>


          <div
            style={{
              fontSize:
                20,

              fontWeight:
                800
            }}
          >
            #
            {
              report.ReportCode
            }
          </div>


          <div
            style={{
              marginTop:
                6,

              fontSize:
                17,

              fontWeight:
                700
            }}
          >
            {
              report.Title
            }
          </div>
        </div>


        {/* DETAILS */}

        <div
          style={{
            display:
              'grid',

            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',

            gap:
              18
          }}
        >
          <DetailItem
            label="Status"
            value={
              <div
                style={{
                  display:
                    'flex',

                  alignItems:
                    'center',

                  gap:
                    6,

                  flexWrap:
                    'wrap'
                }}
              >
                <StatusBadge
                  status={
                    normaliseStatus(
                      report.Status
                    )
                  }
                />

                <LateBadge />
              </div>
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
            label="Worker"
            value={
              report.WorkerName ||
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
              formatDateTime(
                report.CreatedAt
              )
            }
          />


          <DetailItem
            label="Time Open"
            value={
              formatAge(
                report.CreatedAt
              )
            }
          />
        </div>


        {/* DESCRIPTION */}

        <div
          style={{
            marginTop:
              24
          }}
        >
          <SectionTitle>
            DESCRIPTION
          </SectionTitle>


          <div
            style={{
              padding:
                14,

              borderRadius:
                8,

              background:
                'var(--bg-page)',

              fontSize:
                13,

              lineHeight:
                1.6
            }}
          >
            {
              report.Description ||
              'No description provided.'
            }
          </div>
        </div>


        {/* PHOTOS */}

        {photos.length >
          0 && (
          <div
            style={{
              marginTop:
                24
            }}
          >
            <SectionTitle>
              PHOTOS
              {' '}
              (
              {photos.length}
              )
            </SectionTitle>


            <div
              style={{
                display:
                  'grid',

                gridTemplateColumns:
                  'repeat(auto-fill, minmax(180px, 1fr))',

                gap:
                  12
              }}
            >
              {photos.map(
                (
                  photo,
                  index
                ) => {
                  const url =
                    getPhotoUrl(
                      photo
                    );


                  return (
                    <div
                      key={
                        `${photo}-${index}`
                      }
                      style={{
                        overflow:
                          'hidden',

                        border:
                          '1px solid var(--border)',

                        borderRadius:
                          9,

                        background:
                          'var(--bg-page)'
                      }}
                    >
                      <img
                        src={
                          url
                        }
                        alt={
                          `Report ${report.ReportCode} photo ${index + 1}`
                        }
                        style={{
                          width:
                            '100%',

                          height:
                            170,

                          display:
                            'block',

                          objectFit:
                            'cover'
                        }}
                      />
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}
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
          marginBottom:
            5,

          color:
            'var(--text-secondary)',

          fontSize:
            11,

          textTransform:
            'uppercase'
        }}
      >
        {label}
      </div>


      <div
        style={{
          fontSize:
            13,

          fontWeight:
            600
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
        marginBottom:
          10,

        color:
          'var(--text-secondary)',

        fontSize:
          12,

        fontWeight:
          700
      }}
    >
      {children}
    </div>
  );
}


/* ============================================================
   PHOTO URL
============================================================ */

function getPhotoUrl(
  photo
) {
  if (!photo) {
    return '';
  }


  if (
    photo.startsWith(
      'http://'
    ) ||
    photo.startsWith(
      'https://'
    )
  ) {
    return photo;
  }


  if (
    photo.startsWith(
      '/'
    )
  ) {
    return `${API_ORIGIN}${photo}`;
  }


  return `${API_ORIGIN}/${photo}`;
}


/* ============================================================
   DATE HELPERS
============================================================ */

function formatDate(
  value
) {
  if (!value) {
    return '—';
  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '—';
  }


  return date
    .toLocaleDateString(
      'en-ZA'
    );
}


function formatDateTime(
  value
) {
  if (!value) {
    return '—';
  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '—';
  }


  return date
    .toLocaleString(
      'en-ZA'
    );
}


/* ============================================================
   AGE
============================================================ */

function formatAge(
  value
) {
  const created =
    new Date(
      value
    );


  if (
    Number.isNaN(
      created.getTime()
    )
  ) {
    return '—';
  }


  const milliseconds =
    Math.max(
      0,
      Date.now() -
      created.getTime()
    );


  const totalHours =
    Math.floor(
      milliseconds /
      (
        60 *
        60 *
        1000
      )
    );


  const days =
    Math.floor(
      totalHours /
      24
    );


  const hours =
    totalHours %
    24;


  if (
    days === 0
  ) {
    return `${hours}h`;
  }


  if (
    hours === 0
  ) {
    return `${days}d`;
  }


  return `${days}d ${hours}h`;
}