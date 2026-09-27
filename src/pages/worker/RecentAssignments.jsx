import { useEffect, useState } from 'react';
import {
  ClipboardList,
  MapPin,
  Clock3,
  AlertTriangle,
  X,
  ArrowRight,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';

import {
  MapContainer,
  TileLayer,
  Marker
} from 'react-leaflet';

import api from '../../api/api';
import TopBar from '../../components/TopBar';
import StatusBadge from '../../components/StatusBadge';
import PageTransition from '../../components/PageTransition';

import '../../components/leafletIcons';

import { formatSADateTime } from '../../utils/dateUtils';


const APP_BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

const API_ORIGIN = import.meta.env.DEV
  ? 'http://localhost:5000'
  : `${window.location.origin}${APP_BASE}`;


/* =============================================================
   MAIN COMPONENT
============================================================= */

export default function RecentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [mapReport, setMapReport] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);


  async function load() {
    try {
      setLoading(true);
      setError('');

      const response = await api.get(
        '/worker/assignments',
        {
          params: {
            status: 'Assigned'
          }
        }
      );

      setAssignments(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        'Failed to load recently assigned issues:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Could not load recently assigned issues.'
      );
    } finally {
      setLoading(false);
    }
  }


  async function openReportMap(report) {
    try {
      setError('');

      const reportId =
        report.ReportID ??
        report.ReportId;

      if (!reportId) {
        setError(
          'Could not determine the report ID.'
        );
        return;
      }

      const response = await api.get(
        `/worker/reports/${reportId}`
      );

      const fullReport = response.data;

      const latitude = Number(
        fullReport.Latitude
      );

      const longitude = Number(
        fullReport.Longitude
      );

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        setError(
          'Location coordinates are not available for this issue.'
        );
        return;
      }

      setMapReport(fullReport);
    } catch (err) {
      console.error(
        'Could not load issue location:',
        err
      );

      setError(
        err.response?.data?.message ||
          'Could not load the issue location.'
      );
    }
  }


  useEffect(() => {
    load();
  }, []);


  if (loading) {
    return (
      <PageTransition>
        <div>
          <TopBar
            section="Worker"
            page="Recently Assigned"
          />

          <div
            style={{
              padding: 40,
              color: 'var(--text-secondary)'
            }}
          >
            Loading recently assigned issues...
          </div>
        </div>
      </PageTransition>
    );
  }


  return (
    <PageTransition>
      <div>

        <TopBar
          section="Worker"
          page="Recently Assigned"
          onRefresh={load}
        />


        <div
          style={{
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 20
          }}
        >

          <div
            className="card"
            style={{
              padding: 20
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: '#e8f0fe',
                  color: '#2f6fed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <ClipboardList size={21} />
              </div>

              <div>
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 700
                  }}
                >
                  Recently Assigned
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    marginTop: 3
                  }}
                >
                  Issues recently assigned to you
                </div>
              </div>

              <div
                style={{
                  marginLeft: 'auto',
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  fontWeight: 600
                }}
              >
                {assignments.length}{' '}
                {assignments.length === 1
                  ? 'Assignment'
                  : 'Assignments'}
              </div>
            </div>
          </div>


          {error && (
            <div
              style={{
                background: '#fdecec',
                color: '#c0362c',
                fontSize: 13,
                padding: '12px 14px',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <AlertTriangle size={16} />
              {error}
            </div>
          )}


          <div
            className="card"
            style={{
              padding: 20
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 700,
                marginBottom: 16
              }}
            >
              <Clock3
                size={17}
                color="#2f6fed"
              />

              Recently Assigned Issues

              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  fontWeight: 500
                }}
              >
                Assigned
              </span>
            </div>


            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 14
              }}
            >
              {assignments.map((report) => (
                <AssignmentCard
                  key={
                    report.ReportID ??
                    report.ReportId ??
                    report.ReportCode
                  }
                  report={report}
                  onView={() =>
                    setSelectedIssue(report)
                  }
                  onViewMap={() =>
                    openReportMap(report)
                  }
                />
              ))}


              {assignments.length === 0 && (
                <div
                  style={{
                    padding: 30,
                    textAlign: 'center',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <ClipboardList
                    size={34}
                    style={{
                      marginBottom: 10,
                      opacity: 0.5
                    }}
                  />

                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: 'var(--text-primary)',
                      marginBottom: 5
                    }}
                  >
                    No recently assigned issues
                  </div>

                  <div
                    style={{
                      fontSize: 12
                    }}
                  >
                    New assignments will appear here
                    when they are assigned to you.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>


        {mapReport && (
          <LocationMapModal
            report={mapReport}
            onClose={() =>
              setMapReport(null)
            }
          />
        )}


        {selectedIssue && (
          <IssueDetailModal
            issue={selectedIssue}
            onClose={() =>
              setSelectedIssue(null)
            }
          />
        )}

      </div>
    </PageTransition>
  );
}


/* =============================================================
   ASSIGNMENT CARD
============================================================= */

function AssignmentCard({
  report,
  onView,
  onViewMap
}) {
  const createdDate = report.CreatedAt
    ? formatSADateTime(report.CreatedAt)
    : 'Unknown date';

  const category =
    report.CategoryName ||
    report.Category ||
    'Uncategorized';


  return (
    <div
      className="card"
      style={{
        padding: 16
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 6,
          gap: 10
        }}
      >
        <strong
          style={{
            fontSize: 14
          }}
        >
          {report.Title || 'Untitled issue'}
        </strong>

        <span
          style={{
            marginLeft: 'auto'
          }}
        >
          <StatusBadge
            status={report.Status}
          />
        </span>
      </div>


      <div
        style={{
          fontSize: 12,
          color: 'var(--text-secondary)',
          marginBottom: 8,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4
        }}
      >
        <span>
          {report.Location ||
            report.LocationName ||
            'Location unavailable'}
        </span>

        <span>&bull;</span>

        <span>
          Assigned: {createdDate}
        </span>

        <span>&bull;</span>

        <span>
          {report.Priority || 'Unknown'} Priority
        </span>
      </div>


      <p
        style={{
          fontSize: 13,
          margin: '0 0 12px',
          color: 'var(--text-secondary)',
          lineHeight: 1.5
        }}
      >
        {report.Description ||
          'No description provided.'}
      </p>


      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12,
          fontSize: 11,
          color: 'var(--text-secondary)',
          flexWrap: 'wrap'
        }}
      >
        {report.ReportCode && (
          <span>
            <strong>
              {report.ReportCode}
            </strong>
          </span>
        )}

        {report.ReportCode && category && (
          <span>&bull;</span>
        )}

        <span>
          {category}
        </span>
      </div>


      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap'
        }}
      >
        <button
          type="button"
          className="btn btn-primary"
          style={{
            padding: '8px 14px',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
          onClick={onView}
        >
          <Eye size={14} />
          View
          <ArrowRight size={14} />
        </button>


        <button
          type="button"
          className="btn"
          style={{
            padding: '8px 14px',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
          onClick={onViewMap}
        >
          <MapPin size={14} />
          View on Map
        </button>
      </div>
    </div>
  );
}


/* =============================================================
   PHOTO URL
============================================================= */

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


/* =============================================================
   ISSUE DETAIL MODAL
============================================================= */

function IssueDetailModal({
  issue,
  onClose
}) {
  const [photoIndex, setPhotoIndex] = useState(0);

  const photos = Array.isArray(issue.Photos)
    ? issue.Photos
    : [];

  const category =
    issue.CategoryName ||
    issue.Category ||
    'Uncategorized';


  useEffect(() => {
    function handleKeyboard(e) {
      if (e.key === 'Escape') {
        onClose();
      }

      if (
        e.key === 'ArrowLeft' &&
        photos.length > 1
      ) {
        setPhotoIndex(
          (index) =>
            index === 0
              ? photos.length - 1
              : index - 1
        );
      }

      if (
        e.key === 'ArrowRight' &&
        photos.length > 1
      ) {
        setPhotoIndex(
          (index) =>
            index === photos.length - 1
              ? 0
              : index + 1
        );
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
  }, [onClose, photos.length]);


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
        zIndex: 10000,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(10px, 4vw, 20px)'
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Issue details"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 620,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'white',
          borderRadius: 14,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          padding: 'clamp(16px, 5vw, 24px)'
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          title="Close"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 34,
            height: 34,
            borderRadius: '50%',
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 2
          }}
        >
          <X size={17} />
        </button>


        <div
          style={{
            paddingRight: 46,
            marginBottom: 20
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: 0.5,
              marginBottom: 5
            }}
          >
            {issue.ReportCode || 'Assigned report'}
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: 20,
              lineHeight: 1.3
            }}
          >
            {issue.Title || 'Untitled issue'}
          </h2>
        </div>


        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 18
          }}
        >
          <StatusBadge
            status={issue.Status}
          />

          <span
            style={priorityBadgeStyle(
              issue.Priority
            )}
          >
            {issue.Priority || 'Unknown'} Priority
          </span>

          <span
            style={categoryBadgeStyle}
          >
            {category}
          </span>
        </div>


        <DetailRow
          label="Location"
          value={
            issue.Location ||
            issue.LocationName ||
            'Location unavailable'
          }
        />

        <DetailRow
          label="Assigned / reported"
          value={
            issue.CreatedAt
              ? formatSADateTime(issue.CreatedAt)
              : 'Unknown'
          }
        />

        <DetailRow
          label="Worker"
          value={
            issue.WorkerName ||
            'Assigned to your account'
          }
        />


        <div
          style={{
            marginTop: 20
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 8,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase'
            }}
          >
            Description
          </div>

          <p
            style={{
              fontSize: 13,
              lineHeight: 1.6,
              margin: 0,
              color: 'var(--text-secondary)'
            }}
          >
            {issue.Description ||
              'No description provided.'}
          </p>
        </div>


        <div
          style={{
            marginTop: 22
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 10,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase'
            }}
          >
            <ImageIcon size={14} />
            Report Photos
            {photos.length > 0 && (
              <span>({photos.length})</span>
            )}
          </div>


          {photos.length === 0 ? (
            <div
              style={{
                padding: 14,
                border: '1px dashed var(--border)',
                borderRadius: 8,
                color: '#94a3b8',
                fontSize: 13,
                textAlign: 'center'
              }}
            >
              No photos attached to this report.
            </div>
          ) : (
            <div>
              <div
                style={{
                  position: 'relative',
                  borderRadius: 10,
                  overflow: 'hidden',
                  background: '#f1f5f9',
                  marginBottom:
                    photos.length > 1
                      ? 10
                      : 0
                }}
              >
                <img
                  src={getPhotoUrl(
                    photos[photoIndex]
                  )}
                  alt={`Report photo ${
                    photoIndex + 1
                  }`}
                  style={{
                    width: '100%',
                    height: 'clamp(180px, 45vw, 300px)',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />

                {photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous photo"
                      onClick={() =>
                        setPhotoIndex(
                          (index) =>
                            index === 0
                              ? photos.length - 1
                              : index - 1
                        )
                      }
                      style={photoNavButtonStyle('left')}
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <button
                      type="button"
                      aria-label="Next photo"
                      onClick={() =>
                        setPhotoIndex(
                          (index) =>
                            index === photos.length - 1
                              ? 0
                              : index + 1
                        )
                      }
                      style={photoNavButtonStyle('right')}
                    >
                      <ChevronRight size={18} />
                    </button>

                    <span
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        background: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        fontSize: 11,
                        padding: '3px 8px',
                        borderRadius: 6
                      }}
                    >
                      {photoIndex + 1} / {photos.length}
                    </span>
                  </>
                )}
              </div>


              {photos.length > 1 && (
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    overflowX: 'auto',
                    padding: '2px 0'
                  }}
                >
                  {photos.map((photo, index) => (
                    <button
                      type="button"
                      key={`${photo}-${index}`}
                      aria-label={`View photo ${index + 1}`}
                      onClick={() =>
                        setPhotoIndex(index)
                      }
                      style={{
                        width: 56,
                        height: 44,
                        flexShrink: 0,
                        padding: 0,
                        borderRadius: 6,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border:
                          index === photoIndex
                            ? '2px solid var(--navy-800)'
                            : '2px solid transparent'
                      }}
                    >
                      <img
                        src={getPhotoUrl(photo)}
                        alt={`Thumbnail ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


/* =============================================================
   LOCATION MAP MODAL
============================================================= */

function LocationMapModal({
  report,
  onClose
}) {
  const latitude = Number(
    report.Latitude
  );

  const longitude = Number(
    report.Longitude
  );


  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return (
      <ModalBackdrop onClose={onClose}>
        <div
          className="card"
          style={{
            width: 420,
            maxWidth: '100%',
            padding: 22
          }}
          onClick={(e) =>
            e.stopPropagation()
          }
        >
          <ModalHeader
            title="Issue Location"
            onClose={onClose}
          />

          <p
            style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              marginTop: 16
            }}
          >
            Location coordinates are not available for this issue.
          </p>
        </div>
      </ModalBackdrop>
    );
  }


  return (
    <ModalBackdrop onClose={onClose}>
      <div
        className="card"
        style={{
          width: 560,
          maxWidth: '100%',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-modal)'
        }}
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)'
          }}
        >
          <ModalHeader
            title="Issue Location"
            onClose={onClose}
          />
        </div>


        <div
          style={{
            padding: '14px 20px 10px'
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              marginBottom: 4
            }}
          >
            {report.Title || 'Untitled issue'}
          </div>

          <div
            style={{
              fontSize: 12,
              color: 'var(--text-secondary)'
            }}
          >
            {report.Location ||
              report.LocationName ||
              'Location unavailable'}
          </div>
        </div>


        <div
          style={{
            height: 320,
            width: '100%'
          }}
        >
          <MapContainer
            center={[
              latitude,
              longitude
            ]}
            zoom={16}
            style={{
              height: '100%',
              width: '100%'
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker
              position={[
                latitude,
                longitude
              ]}
            />
          </MapContainer>
        </div>


        <div
          style={{
            padding: '12px 20px',
            fontSize: 11,
            color: 'var(--text-secondary)',
            borderTop: '1px solid var(--border)'
          }}
        >
          Coordinates:{' '}
          {latitude.toFixed(6)},{' '}
          {longitude.toFixed(6)}
        </div>
      </div>
    </ModalBackdrop>
  );
}


/* =============================================================
   SMALL UI HELPERS
============================================================= */

function DetailRow({
  label,
  value
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '140px 1fr',
        gap: 12,
        padding: '9px 0',
        borderBottom: '1px solid var(--border)',
        fontSize: 13
      }}
    >
      <span
        style={{
          color: 'var(--text-secondary)',
          fontWeight: 600
        }}
      >
        {label}
      </span>

      <span>
        {value}
      </span>
    </div>
  );
}


function ModalBackdrop({
  children,
  onClose
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(15, 33, 54, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
      onClick={onClose}
    >
      {children}
    </div>
  );
}


function ModalHeader({
  title,
  onClose
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontWeight: 700,
          fontSize: 15
        }}
      >
        <MapPin
          size={18}
          color="#ef4444"
        />
        {title}
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        style={{
          marginLeft: 'auto',
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <X size={20} />
      </button>
    </div>
  );
}


function photoNavButtonStyle(side) {
  return {
    position: 'absolute',
    [side]: 8,
    top: '50%',
    transform: 'translateY(-50%)',
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(255,255,255,0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  };
}


function priorityBadgeStyle(priority) {
  const map = {
    Low: {
      bg: '#f1f5f9',
      color: '#475569'
    },
    Medium: {
      bg: '#fef3c7',
      color: '#92400e'
    },
    High: {
      bg: '#ffedd5',
      color: '#9a3412'
    },
    Critical: {
      bg: '#fee2e2',
      color: '#991b1b'
    }
  };

  const selected =
    map[priority] || {
      bg: '#f1f5f9',
      color: '#475569'
    };

  return {
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: 11.5,
    fontWeight: 700,
    background: selected.bg,
    color: selected.color,
    textTransform: 'capitalize'
  };
}


const categoryBadgeStyle = {
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 11.5,
  fontWeight: 700,
  background: '#ede9fe',
  color: '#5b21b6'
};
