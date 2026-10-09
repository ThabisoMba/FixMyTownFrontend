import {
  useEffect,
  useState
} from 'react';

import {
  AlertCircle,
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Construction,
  Droplet,
  Eye,
  Image as ImageIcon,
  Lightbulb,
  Loader,
  MapPin,
  MessageSquare,
  RefreshCw,
  UserRound,
  X,
  XCircle
} from 'lucide-react';

import api from '../../api/api';

const ICONS = {
  Pothole: Construction,
  'Water Supply': Droplet,
  'Street Light': Lightbulb
};

const STATUS_STEPS = [
  {
    key: 'Reported',
    label: 'Reported',
    color: '#6b7280',
    icon: Clock
  },
  {
    key: 'Under Review',
    label: 'Review',
    color: '#f59e0b',
    icon: AlertCircle
  },
  {
    key: 'In Progress',
    label: 'Progress',
    color: '#3b82f6',
    icon: Loader
  },
  {
    key: 'Resolved',
    label: 'Resolved',
    color: '#22c55e',
    icon: CheckCircle2
  }
];

const STATUS_MAP = {
  Reported: 'Reported',
  Assigned: 'Under Review',
  'Under Review': 'Under Review',
  InProgress: 'In Progress',
  'In Progress': 'In Progress',
  Resolved: 'Resolved'
};

const MOBILE_BREAKPOINT = 640;

const APP_BASE = (
  import.meta.env.BASE_URL ||
  '/'
).replace(/\/$/, '');

const API_ORIGIN =
  import.meta.env.DEV
    ? 'http://localhost:5000'
    : `${window.location.origin}${APP_BASE}`;

function asArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (
    Array.isArray(
      value?.$values
    )
  ) {
    return value.$values;
  }

  if (
    Array.isArray(
      value?.items
    )
  ) {
    return value.items;
  }

  return [];
}

function getPhotoUrl(photo) {
  if (!photo) {
    return '';
  }

  const raw =
    typeof photo ===
    'string'
      ? photo
      : photo.Url ||
        photo.PhotoUrl ||
        photo.Path ||
        photo.FilePath ||
        '';

  if (!raw) {
    return '';
  }

  if (
    raw.startsWith(
      'http://'
    ) ||
    raw.startsWith(
      'https://'
    )
  ) {
    return raw;
  }

  if (
    raw.startsWith('/')
  ) {
    return `${API_ORIGIN}${raw}`;
  }

  return `${API_ORIGIN}/${raw}`;
}

function normalizeStatus(status) {
  return (
    STATUS_MAP[status] ||
    status ||
    'Reported'
  );
}

function getStatusIndex(status) {
  const normalized =
    normalizeStatus(
      status
    );

  return STATUS_STEPS.findIndex(
    step =>
      step.key ===
      normalized
  );
}

function getStatusColor(status) {
  const normalized =
    normalizeStatus(
      status
    );

  const step =
    STATUS_STEPS.find(
      item =>
        item.key ===
        normalized
    );

  return (
    step?.color ||
    '#6b7280'
  );
}

function timeAgo(dateStr) {
  if (!dateStr) {
    return 'N/A';
  }

  const date =
    new Date(dateStr);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return 'N/A';
  }

  const diffMs =
    Date.now() -
    date.getTime();

  const hours =
    Math.floor(
      diffMs / 3600000
    );

  if (hours < 1) {
    return 'Just now';
  }

  if (hours < 24) {
    return `${hours} hour${
      hours === 1 ? '' : 's'
    } ago`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  if (days < 30) {
    return `${days} day${
      days === 1 ? '' : 's'
    } ago`;
  }

  const months =
    Math.floor(
      days / 30
    );

  return `${months} month${
    months === 1 ? '' : 's'
  } ago`;
}

function formatDateTime(
  value
) {
  if (!value) {
    return 'Date unavailable';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return 'Date unavailable';
  }

  return date.toLocaleString(
    'en-ZA',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  );
}

function mapProgressUpdate(
  update
) {
  return {
    id:
      update.ProgressID ??
      update.ProgressId ??
      update.UpdateID ??
      update.UpdateId ??
      update.Id,

    note:
      update.Note ??
      update.Description ??
      update.Message ??
      '',

    workerName:
      update.WorkerName ??
      update.WorkerFullName ??
      update.UpdatedBy ??
      '',

    status:
      update.Status ??
      update.NewStatus ??
      '',

    createdAt:
      update.CreatedAt ??
      update.UpdatedAt ??
      update.Date,

    photos:
      asArray(
        update.Photos ??
          update.ProgressPhotos ??
          update.PhotoUrls
      )
  };
}

function mapReport(
  report
) {
  const progressUpdates =
    asArray(
      report.ProgressUpdates ??
        report.Progress ??
        report.WorkerUpdates
    ).map(
      mapProgressUpdate
    );

  progressUpdates.sort(
    (a, b) =>
      new Date(
        b.createdAt || 0
      ).getTime() -
      new Date(
        a.createdAt || 0
      ).getTime()
  );

  return {
    reportID:
      report.ReportID ??
      report.ReportId,

    reportCode:
      report.ReportCode,

    title:
      report.Title,

    description:
      report.Description,

    status:
      report.Status,

    priority:
      report.Priority,

    locationName:
      report.LocationName,

    createdAt:
      report.CreatedAt,

    categoryName:
      report.CategoryName,

    workerName:
      report.WorkerName,

    photos:
      asArray(
        report.Photos ??
          report.PhotoUrls
      ),

    progressUpdates
  };
}

export default function MyReports() {
  const [
    reports,
    setReports
  ] = useState([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    refreshing,
    setRefreshing
  ] = useState(false);

  const [
    error,
    setError
  ] = useState(null);

  const [
    selectedReport,
    setSelectedReport
  ] = useState(null);

  const [
    selectedPhotos,
    setSelectedPhotos
  ] = useState([]);

  const [
    selectedPhotoIndex,
    setSelectedPhotoIndex
  ] = useState(0);

  const [
    isMobile,
    setIsMobile
  ] = useState(
    typeof window !==
      'undefined'
      ? window.innerWidth <=
          MOBILE_BREAKPOINT
      : false
  );

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    function handleResize() {
      setIsMobile(
        window.innerWidth <=
          MOBILE_BREAKPOINT
      );
    }

    window.addEventListener(
      'resize',
      handleResize
    );

    return () => {
      window.removeEventListener(
        'resize',
        handleResize
      );
    };
  }, []);

  useEffect(() => {
    function handleKeyboard(
      event
    ) {
      if (
        selectedPhotos.length ===
        0
      ) {
        return;
      }

      if (
        event.key ===
        'Escape'
      ) {
        closePhotoViewer();
      }

      if (
        event.key ===
        'ArrowLeft'
      ) {
        showPreviousPhoto();
      }

      if (
        event.key ===
        'ArrowRight'
      ) {
        showNextPhoto();
      }
    }

    document.addEventListener(
      'keydown',
      handleKeyboard
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyboard
      );
    };
  }, [
    selectedPhotos.length
  ]);

  async function fetchReports(
    background = false
  ) {
    try {
      if (background) {
        setRefreshing(
          true
        );
      } else {
        setLoading(true);
      }

      setError(null);

      const response =
        await api.get(
          '/issues/mine'
        );

      const data =
        asArray(
          response.data
        );

      setReports(
        data.map(
          mapReport
        )
      );
    } catch (err) {
      console.error(
        'Error fetching reports:',
        err
      );

      if (
        err.response
      ) {
        if (
          err.response
            .status === 401
        ) {
          setError(
            'Your session has expired. Please log in again.'
          );
        } else if (
          err.response
            .status === 500
        ) {
          setError(
            `Server error: ${
              err.response
                .data?.error ||
              err.response
                .data
                ?.message ||
              'Internal server error. Please try again later.'
            }`
          );
        } else {
          setError(
            err.response
              .data
              ?.message ||
              'Failed to load your reports.'
          );
        }
      } else if (
        err.request
      ) {
        setError(
          'Network error: Could not connect to the server.'
        );
      } else {
        setError(
          err.message ||
            'Could not load your reports.'
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(
        false
      );
    }
  }

  function openPhotoViewer(
    photos,
    index = 0
  ) {
    const validPhotos =
      asArray(photos).filter(
        photo =>
          !!getPhotoUrl(
            photo
          )
      );

    if (
      validPhotos.length ===
      0
    ) {
      return;
    }

    setSelectedPhotos(
      validPhotos
    );

    setSelectedPhotoIndex(
      Math.min(
        index,
        validPhotos.length -
          1
      )
    );
  }

  function closePhotoViewer() {
    setSelectedPhotos([]);
    setSelectedPhotoIndex(
      0
    );
  }

  function showPreviousPhoto() {
    setSelectedPhotoIndex(
      current =>
        current === 0
          ? selectedPhotos.length -
            1
          : current - 1
    );
  }

  function showNextPhoto() {
    setSelectedPhotoIndex(
      current =>
        current ===
        selectedPhotos.length -
          1
          ? 0
          : current + 1
    );
  }

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        display: 'flex',
        flexDirection:
          'column',
        gap:
          isMobile
            ? 14
            : 20
      }}
    >
      <div
        className="card"
        style={{
          padding:
            isMobile
              ? 14
              : 20
        }}
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          style={{
            display: 'flex',
            alignItems:
              'center',
            justifyContent:
              'space-between',
            marginBottom:
              16,
            flexWrap: 'wrap',
            gap: 10
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems:
                'center',
              gap: 8,
              fontWeight:
                700,
              fontSize:
                isMobile
                  ? 14
                  : 16
            }}
          >
            <ClipboardList
              size={18}
            />

            My Reports (
            {reports.length})
          </div>

          {!loading && (
            <button
              type="button"
              className="btn btn-outline"
              disabled={
                refreshing
              }
              onClick={() =>
                fetchReports(
                  true
                )
              }
              style={{
                padding:
                  '7px 13px',
                fontSize: 12
              }}
            >
              <RefreshCw
                size={13}
                style={{
                  animation:
                    refreshing
                      ? 'citizenReportSpin 1s linear infinite'
                      : 'none'
                }}
              />

              {refreshing
                ? 'Refreshing...'
                : 'Refresh'}
            </button>
          )}
        </div>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <div
            style={{
              textAlign:
                'center',
              padding: 40
            }}
          >
            <Loader
              size={24}
              style={{
                animation:
                  'citizenReportSpin 1s linear infinite',
                color:
                  'var(--navy-800)'
              }}
            />

            <p
              style={{
                color:
                  'var(--text-secondary)',
                fontSize: 14,
                marginTop:
                  10
              }}
            >
              Loading your
              reports...
            </p>
          </div>
        )}

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div
            style={{
              padding:
                '12px 16px',
              background:
                '#fef2f2',
              border:
                '1px solid #fecaca',
              borderRadius:
                8,
              display: 'flex',
              alignItems:
                'center',
              gap: 10,
              marginBottom:
                16,
              flexWrap:
                'wrap'
            }}
          >
            <XCircle
              size={18}
              color="#dc2626"
            />

            <span
              style={{
                color:
                  '#dc2626',
                fontSize:
                  13,
                flex: 1
              }}
            >
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                fetchReports()
              }
              style={{
                padding:
                  '5px 12px',
                background:
                  '#dc2626',
                color:
                  'white',
                border:
                  'none',
                borderRadius:
                  5,
                fontSize:
                  12
              }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          reports.length ===
            0 && (
            <div
              style={{
                textAlign:
                  'center',
                padding: 40
              }}
            >
              <ClipboardList
                size={48}
                color="var(--text-secondary)"
                style={{
                  marginBottom:
                    16
                }}
              />

              <h3
                style={{
                  margin:
                    '0 0 8px',
                  fontSize:
                    16
                }}
              >
                No Reports Yet
              </h3>

              <p
                style={{
                  color:
                    'var(--text-secondary)',
                  fontSize:
                    14,
                  margin: 0
                }}
              >
                You haven't
                reported any
                issues yet.
              </p>
            </div>
          )}

        {/* =====================================================
            REPORTS
        ===================================================== */}

        {!loading &&
          reports.map(
            report => (
              <CitizenReportCard
                key={
                  report.reportID
                }
                report={
                  report
                }
                isMobile={
                  isMobile
                }
                onView={() =>
                  setSelectedReport(
                    report
                  )
                }
                onOpenPhotos={
                  openPhotoViewer
                }
              />
            )
          )}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection:
            isMobile
              ? 'column'
              : 'row',
          gap:
            isMobile
              ? 12
              : 16
        }}
      >
        <InfoCard
          icon={
            <Clock
              size={18}
            />
          }
          title="Response Time"
          text="Most reports are acknowledged within 24 hours. Critical issues are prioritized."
        />

        <InfoCard
          icon={
            <Bell
              size={18}
            />
          }
          title="Notifications"
          text="You'll receive updates when your issue status changes. Check your notifications regularly."
        />

        <InfoCard
          icon={
            <MessageSquare
              size={18}
            />
          }
          title="Work Updates"
          text="Progress notes and photos supplied by municipal workers appear inside your report details."
        />
      </div>

      {selectedReport && (
        <ReportDetailModal
          report={
            selectedReport
          }
          onClose={() =>
            setSelectedReport(
              null
            )
          }
          onOpenPhotos={
            openPhotoViewer
          }
        />
      )}

      {selectedPhotos.length >
        0 && (
        <PhotoViewer
          photos={
            selectedPhotos
          }
          index={
            selectedPhotoIndex
          }
          onClose={
            closePhotoViewer
          }
          onPrevious={
            showPreviousPhoto
          }
          onNext={
            showNextPhoto
          }
        />
      )}

      <style>
        {`
          @keyframes citizenReportSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}

function CitizenReportCard({
  report,
  isMobile,
  onView,
  onOpenPhotos
}) {
  const Icon =
    ICONS[
      report.categoryName
    ] || Construction;

  const status =
    normalizeStatus(
      report.status
    );

  const statusIndex =
    getStatusIndex(
      report.status
    );

  const updateCount =
    report.progressUpdates
      .length;

  return (
    <article
      style={{
        padding:
          '18px 0',
        borderBottom:
          '1px solid var(--border)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems:
            'flex-start',
          gap:
            isMobile
              ? 10
              : 14
        }}
      >
        <div
          style={{
            width:
              isMobile
                ? 34
                : 40,
            height:
              isMobile
                ? 34
                : 40,
            borderRadius:
              '50%',
            background:
              'var(--gold-100)',
            display: 'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
            flexShrink: 0
          }}
        >
          <Icon
            size={
              isMobile
                ? 15
                : 18
            }
            color="var(--gold-600)"
          />
        </div>

        <div
          style={{
            minWidth: 0,
            flex: 1
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems:
                'center',
              gap: 9,
              flexWrap:
                'wrap'
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize:
                  isMobile
                    ? 14
                    : 15,
                fontWeight:
                  700
              }}
            >
              {report.title ||
                'Untitled Report'}
            </h3>

            <span
              style={{
                padding:
                  '3px 10px',
                borderRadius:
                  12,
                fontSize: 11,
                fontWeight:
                  700,
                background:
                  `${getStatusColor(
                    report.status
                  )}20`,
                color:
                  getStatusColor(
                    report.status
                  )
              }}
            >
              {status}
            </span>
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color:
                'var(--text-secondary)',
              display: 'flex',
              alignItems:
                'center',
              gap: 5
            }}
          >
            <MapPin
              size={12}
            />

            <span>
              {report.locationName ||
                'Location not specified'}
            </span>
          </div>

          <div
            style={{
              marginTop: 3,
              color:
                'var(--text-secondary)',
              fontSize: 11
            }}
          >
            Reported{' '}
            {timeAgo(
              report.createdAt
            )}

            {report.reportCode
              ? ` • #${report.reportCode}`
              : ''}
          </div>

          {report.workerName && (
            <div
              style={{
                marginTop: 5,
                display:
                  'flex',
                gap: 5,
                alignItems:
                  'center',
                fontSize: 11,
                color:
                  'var(--navy-800)',
                fontWeight:
                  600
              }}
            >
              <UserRound
                size={12}
              />

              Assigned to:{' '}
              {
                report.workerName
              }
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap:
            isMobile
              ? 2
              : 4,
          marginTop: 16,
          paddingLeft:
            isMobile
              ? 0
              : 54
        }}
      >
        {STATUS_STEPS.map(
          (
            step,
            index
          ) => {
            const StepIcon =
              step.icon;

            const completed =
              index <=
              statusIndex;

            const current =
              step.key ===
              status;

            return (
              <div
                key={
                  step.key
                }
                style={{
                  flex: 1,
                  minWidth: 0,
                  textAlign:
                    'center'
                }}
              >
                <div
                  style={{
                    display:
                      'flex',
                    alignItems:
                      'center',
                    marginBottom:
                      4
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      background:
                        index ===
                        0
                          ? 'transparent'
                          : completed
                            ? step.color
                            : '#e5e7eb'
                    }}
                  />

                  <div
                    style={{
                      width:
                        isMobile
                          ? 18
                          : 22,
                      height:
                        isMobile
                          ? 18
                          : 22,
                      borderRadius:
                        '50%',
                      display:
                        'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                      background:
                        completed
                          ? step.color
                          : '#e5e7eb',
                      border:
                        current
                          ? '2px solid var(--navy-800)'
                          : 'none',
                      flexShrink:
                        0
                    }}
                  >
                    <StepIcon
                      size={
                        isMobile
                          ? 9
                          : 11
                      }
                      color={
                        completed
                          ? 'white'
                          : '#9ca3af'
                      }
                    />
                  </div>

                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      background:
                        index ===
                        STATUS_STEPS.length -
                          1
                          ? 'transparent'
                          : completed
                            ? step.color
                            : '#e5e7eb'
                    }}
                  />
                </div>

                <div
                  style={{
                    fontSize:
                      isMobile
                        ? 8.5
                        : 10,
                    fontWeight:
                      current
                        ? 700
                        : 500,
                    color:
                      current
                        ? step.color
                        : 'var(--text-secondary)',
                    overflow:
                      'hidden',
                    whiteSpace:
                      'nowrap',
                    textOverflow:
                      'ellipsis'
                  }}
                >
                  {step.label}
                </div>
              </div>
            );
          }
        )}
      </div>

      <div
        style={{
          marginTop: 15,
          display: 'flex',
          gap: 8,
          flexWrap:
            'wrap',
          paddingLeft:
            isMobile
              ? 0
              : 54
        }}
      >
        <button
          type="button"
          className="btn btn-primary"
          style={{
            padding:
              '7px 12px',
            fontSize: 12
          }}
          onClick={
            onView
          }
        >
          <Eye
            size={14}
          />

          View Details
        </button>

        {report.photos.length >
          0 && (
          <button
            type="button"
            className="btn btn-outline"
            style={{
              padding:
                '7px 12px',
              fontSize: 12
            }}
            onClick={() =>
              onOpenPhotos(
                report.photos
              )
            }
          >
            <ImageIcon
              size={14}
            />

            Report Photos (
            {report.photos.length}
            )
          </button>
        )}

        {updateCount > 0 && (
          <span
            style={{
              display: 'flex',
              alignItems:
                'center',
              padding:
                '7px 11px',
              borderRadius:
                7,
              background:
                '#e8f0fe',
              color:
                '#2f6fed',
              fontSize: 11,
              fontWeight:
                700
            }}
          >
            {updateCount}{' '}
            worker update
            {updateCount === 1
              ? ''
              : 's'}
          </span>
        )}
      </div>
    </article>
  );
}

function ReportDetailModal({
  report,
  onClose,
  onOpenPhotos
}) {
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

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [
    onClose
  ]);

  return (
    <div
      onClick={event => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background:
          'rgba(15, 23, 42, 0.58)',
        backdropFilter:
          'blur(3px)',
        display: 'flex',
        alignItems:
          'center',
        justifyContent:
          'center',
        padding:
          'clamp(10px, 3vw, 22px)'
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        style={{
          width: '100%',
          maxWidth: 760,
          maxHeight:
            '92dvh',
          overflowY:
            'auto',
          background:
            '#ffffff',
          borderRadius: 14,
          boxShadow:
            '0 24px 70px rgba(15, 23, 42, 0.32)',
          position:
            'relative'
        }}
      >
        <div
          style={{
            position:
              'sticky',
            top: 0,
            zIndex: 4,
            padding:
              '18px 20px',
            background:
              '#ffffff',
            borderBottom:
              '1px solid var(--border)',
            display: 'flex',
            alignItems:
              'center',
            gap: 12
          }}
        >
          <div
            style={{
              minWidth: 0,
              flex: 1
            }}
          >
            <div
              style={{
                fontSize: 11,
                color:
                  'var(--text-secondary)',
                fontWeight:
                  700,
                textTransform:
                  'uppercase'
              }}
            >
              {report.reportCode
                ? `Report #${report.reportCode}`
                : 'Report details'}
            </div>

            <h2
              style={{
                margin:
                  '3px 0 0',
                fontSize: 18
              }}
            >
              {report.title ||
                'Municipal Issue'}
            </h2>
          </div>

          <span
            style={{
              padding:
                '5px 10px',
              borderRadius: 14,
              background:
                `${getStatusColor(
                  report.status
                )}20`,
              color:
                getStatusColor(
                  report.status
                ),
              fontSize: 11,
              fontWeight:
                700
            }}
          >
            {normalizeStatus(
              report.status
            )}
          </span>

          <button
            type="button"
            aria-label="Close"
            onClick={
              onClose
            }
            style={{
              width: 35,
              height: 35,
              borderRadius:
                '50%',
              border:
                '1px solid var(--border)',
              background:
                '#ffffff',
              display: 'flex',
              alignItems:
                'center',
              justifyContent:
                'center'
            }}
          >
            <X
              size={17}
            />
          </button>
        </div>

        <div
          style={{
            padding:
              '20px'
          }}
        >
          {/* ORIGINAL REPORT */}

          <section>
            <SectionHeading>
              Original Report
            </SectionHeading>

            <div
              style={{
                display:
                  'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 10,
                marginBottom:
                  16
              }}
            >
              <DetailBox
                label="Category"
                value={
                  report.categoryName ||
                  '—'
                }
              />

              <DetailBox
                label="Priority"
                value={
                  report.priority ||
                  '—'
                }
              />

              <DetailBox
                label="Location"
                value={
                  report.locationName ||
                  '—'
                }
              />

              <DetailBox
                label="Reported"
                value={formatDateTime(
                  report.createdAt
                )}
              />
            </div>

            <div
              style={{
                marginBottom:
                  18
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight:
                    700,
                  color:
                    'var(--text-secondary)',
                  textTransform:
                    'uppercase',
                  marginBottom:
                    6
                }}
              >
                Description
              </div>

              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color:
                    'var(--text-secondary)',
                  lineHeight:
                    1.65,
                  whiteSpace:
                    'pre-wrap'
                }}
              >
                {report.description ||
                  'No description was provided.'}
              </p>
            </div>

            <PhotoGrid
              title="Original Report Photos"
              photos={
                report.photos
              }
              onOpen={
                onOpenPhotos
              }
            />
          </section>

          {/* ASSIGNMENT */}

          {report.workerName && (
            <section
              style={{
                marginTop: 24
              }}
            >
              <SectionHeading>
                Assigned Worker
              </SectionHeading>

              <div
                style={{
                  display: 'flex',
                  alignItems:
                    'center',
                  gap: 10,
                  padding:
                    '12px 14px',
                  background:
                    '#f8fafc',
                  border:
                    '1px solid var(--border)',
                  borderRadius:
                    8
                }}
              >
                <UserRound
                  size={18}
                  color="var(--navy-800)"
                />

                <div>
                  <div
                    style={{
                      fontWeight:
                        700,
                      fontSize:
                        13
                    }}
                  >
                    {
                      report.workerName
                    }
                  </div>

                  <div
                    style={{
                      color:
                        'var(--text-secondary)',
                      fontSize:
                        11,
                      marginTop:
                        2
                    }}
                  >
                    Municipal worker
                    assigned to this
                    report
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* WORK PROGRESS */}

          <section
            style={{
              marginTop: 26
            }}
          >
            <SectionHeading>
              Work Progress
            </SectionHeading>

            {report
              .progressUpdates
              .length === 0 ? (
              <div
                style={{
                  padding:
                    '22px 16px',
                  textAlign:
                    'center',
                  border:
                    '1px dashed var(--border)',
                  borderRadius:
                    9,
                  color:
                    'var(--text-secondary)',
                  fontSize: 12
                }}
              >
                No worker progress
                updates have been
                posted yet.
              </div>
            ) : (
              <div
                style={{
                  position:
                    'relative',
                  paddingLeft:
                    22
                }}
              >
                <div
                  style={{
                    position:
                      'absolute',
                    top: 8,
                    bottom: 8,
                    left: 6,
                    width: 2,
                    background:
                      '#dbe4ee'
                  }}
                />

                {report.progressUpdates.map(
                  (
                    update,
                    index
                  ) => (
                    <ProgressUpdate
                      key={
                        update.id ??
                        `${update.createdAt}-${index}`
                      }
                      update={
                        update
                      }
                      onOpenPhotos={
                        onOpenPhotos
                      }
                      last={
                        index ===
                        report
                          .progressUpdates
                          .length -
                          1
                      }
                    />
                  )
                )}
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}

function ProgressUpdate({
  update,
  onOpenPhotos,
  last
}) {
  const resolved =
    normalizeStatus(
      update.status
    ) === 'Resolved';

  return (
    <article
      style={{
        position:
          'relative',
        padding:
          '0 0 22px 16px',
        marginBottom:
          last ? 0 : 4
      }}
    >
      <span
        style={{
          position:
            'absolute',
          left: -21,
          top: 5,
          width: 12,
          height: 12,
          borderRadius:
            '50%',
          border:
            '3px solid white',
          background:
            resolved
              ? '#22c55e'
              : '#2f6fed',
          boxShadow:
            '0 0 0 2px #dbe4ee'
        }}
      />

      <div
        style={{
          border:
            '1px solid var(--border)',
          borderRadius:
            10,
          padding:
            '14px',
          background:
            '#ffffff'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            gap: 10,
            flexWrap:
              'wrap',
            marginBottom:
              8
          }}
        >
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight:
                  700
              }}
            >
              {update.workerName ||
                'Municipal worker'}
            </div>

            <div
              style={{
                fontSize: 10.5,
                color:
                  'var(--text-secondary)',
                marginTop:
                  2
              }}
            >
              {formatDateTime(
                update.createdAt
              )}
            </div>
          </div>

          {update.status && (
            <span
              style={{
                alignSelf:
                  'flex-start',
                padding:
                  '4px 8px',
                borderRadius:
                  10,
                fontSize: 10,
                fontWeight:
                  700,
                background:
                  `${getStatusColor(
                    update.status
                  )}20`,
                color:
                  getStatusColor(
                    update.status
                  )
              }}
            >
              {normalizeStatus(
                update.status
              )}
            </span>
          )}
        </div>

        <p
          style={{
            margin:
              '0 0 12px',
            color:
              'var(--text-secondary)',
            lineHeight:
              1.6,
            fontSize: 13,
            whiteSpace:
              'pre-wrap'
          }}
        >
          {update.note ||
            'Progress updated.'}
        </p>

        {update.photos.length >
          0 && (
          <PhotoGrid
            title="Progress Photos"
            photos={
              update.photos
            }
            onOpen={
              onOpenPhotos
            }
            compact
          />
        )}
      </div>
    </article>
  );
}

function PhotoGrid({
  title,
  photos,
  onOpen,
  compact = false
}) {
  const items =
    asArray(photos).filter(
      photo =>
        !!getPhotoUrl(
          photo
        )
    );

  if (
    items.length === 0
  ) {
    return null;
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems:
            'center',
          gap: 6,
          fontSize: 11,
          fontWeight:
            700,
          color:
            'var(--text-secondary)',
          textTransform:
            'uppercase',
          marginBottom:
            9
        }}
      >
        <ImageIcon
          size={13}
        />

        {title}

        <span>
          ({items.length})
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap:
            'wrap',
          gap: 8
        }}
      >
        {items.map(
          (
            photo,
            index
          ) => (
            <button
              key={`${getPhotoUrl(
                photo
              )}-${index}`}
              type="button"
              onClick={() =>
                onOpen(
                  items,
                  index
                )
              }
              style={{
                width:
                  compact
                    ? 90
                    : 110,
                height:
                  compact
                    ? 68
                    : 82,
                padding: 0,
                border:
                  '1px solid var(--border)',
                borderRadius:
                  8,
                overflow:
                  'hidden',
                background:
                  '#f1f5f9'
              }}
            >
              <img
                src={getPhotoUrl(
                  photo
                )}
                alt={`${title} ${
                  index + 1
                }`}
                style={{
                  width:
                    '100%',
                  height:
                    '100%',
                  objectFit:
                    'cover',
                  display:
                    'block'
                }}
              />
            </button>
          )
        )}
      </div>
    </div>
  );
}

function PhotoViewer({
  photos,
  index,
  onClose,
  onPrevious,
  onNext
}) {
  return (
    <div
      onClick={event => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 12000,
        background:
          'rgba(15, 23, 42, 0.9)',
        backdropFilter:
          'blur(4px)',
        display: 'flex',
        alignItems:
          'center',
        justifyContent:
          'center',
        padding: 20
      }}
    >
      <div
        style={{
          position:
            'relative',
          width: '100%',
          maxWidth: 1100,
          display: 'flex',
          alignItems:
            'center',
          justifyContent:
            'center'
        }}
      >
        <button
          type="button"
          onClick={
            onClose
          }
          style={{
            position:
              'absolute',
            top: -42,
            right: 0,
            width: 38,
            height: 38,
            borderRadius:
              '50%',
            border:
              'none',
            background:
              '#ffffff',
            color:
              '#111827',
            display: 'flex',
            alignItems:
              'center',
            justifyContent:
              'center'
          }}
        >
          <X
            size={20}
          />
        </button>

        {photos.length >
          1 && (
          <button
            type="button"
            onClick={
              onPrevious
            }
            style={{
              position:
                'absolute',
              left: 8,
              zIndex: 2,
              width: 44,
              height: 44,
              borderRadius:
                '50%',
              border:
                'none',
              background:
                'rgba(255,255,255,0.94)',
              display:
                'flex',
              alignItems:
                'center',
              justifyContent:
                'center'
            }}
          >
            <ChevronLeft
              size={23}
            />
          </button>
        )}

        <img
          src={getPhotoUrl(
            photos[index]
          )}
          alt={`Photo ${
            index + 1
          }`}
          style={{
            maxWidth:
              '100%',
            maxHeight:
              '82dvh',
            objectFit:
              'contain',
            borderRadius:
              10,
            boxShadow:
              '0 20px 70px rgba(0,0,0,0.45)'
          }}
        />

        {photos.length >
          1 && (
          <button
            type="button"
            onClick={
              onNext
            }
            style={{
              position:
                'absolute',
              right: 8,
              zIndex: 2,
              width: 44,
              height: 44,
              borderRadius:
                '50%',
              border:
                'none',
              background:
                'rgba(255,255,255,0.94)',
              display:
                'flex',
              alignItems:
                'center',
              justifyContent:
                'center'
            }}
          >
            <ChevronRight
              size={23}
            />
          </button>
        )}

        <div
          style={{
            position:
              'absolute',
            bottom: -35,
            color:
              '#ffffff',
            fontSize: 12,
            fontWeight:
              600
          }}
        >
          Photo {index + 1}{' '}
          of {photos.length}
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  children
}) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 800,
        color:
          'var(--navy-800)',
        textTransform:
          'uppercase',
        letterSpacing:
          '0.5px',
        marginBottom:
          12
      }}
    >
      {children}
    </div>
  );
}

function DetailBox({
  label,
  value
}) {
  return (
    <div
      style={{
        padding:
          '10px 12px',
        background:
          '#f8fafc',
        border:
          '1px solid var(--border)',
        borderRadius: 8
      }}
    >
      <div
        style={{
          fontSize: 10,
          color:
            'var(--text-secondary)',
          fontWeight:
            700,
          textTransform:
            'uppercase',
          marginBottom:
            4
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 12.5,
          fontWeight:
            600,
          color:
            'var(--text-primary)'
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  text
}) {
  return (
    <div
      className="card"
      style={{
        flex: 1,
        padding: 18
      }}
    >
      <div
        style={{
          color:
            'var(--navy-800)',
          marginBottom:
            10
        }}
      >
        {icon}
      </div>

      <div
        style={{
          fontWeight: 700,
          marginBottom:
            6,
          fontSize: 14
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 12.5,
          color:
            'var(--text-secondary)',
          lineHeight:
            1.5
        }}
      >
        {text}
      </div>
    </div>
  );
}