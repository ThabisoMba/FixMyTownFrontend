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


<<<<<<< HEAD
const API_ORIGIN = import.meta.env.DEV
  ? 'http://localhost:5000'
  : '/grp-03-39';
=======
const API_ORIGIN = '/grp-03-39/api';
>>>>>>> 6b652f25a7802399c32d38acf1863ecc4d9ac6c6


/* =============================================================
   MAIN COMPONENT
============================================================= */

export default function RecentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [mapReport, setMapReport] = useState(null);

  const [selectedIssue, setSelectedIssue] = useState(null);


  /*
   * Load recently assigned reports.
   *
   * The backend already restricts this request to the
   * currently authenticated worker:
   *
   * GET /api/worker/assignments?status=Assigned
   */
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

      /*
       * Do not manually log the user out here.
       *
       * The api interceptor remains responsible for
       * handling authentication errors.
       */
      setError(
        err.response?.data?.message ||
          'Could not load recently assigned issues.'
      );

    } finally {
      setLoading(false);
    }
  }


  /*
   * Load assignments when page opens.
   */
  useEffect(() => {
    load();
  }, []);


  /*
   * Loading state.
   */
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

        {/* =====================================================
            TOP BAR
        ===================================================== */}

        <TopBar
          section="Worker"
          page="Recently Assigned"
          onRefresh={load}
        />


        {/* =====================================================
            PAGE CONTENT
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
              PAGE HEADER
          =================================================== */}

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


          {/* ===================================================
              ERROR
          =================================================== */}

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


          {/* ===================================================
              ASSIGNMENTS CARD
          =================================================== */}

          <div
            className="card"
            style={{
              padding: 20
            }}
          >

            {/* Section heading */}

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


            {/* =================================================
                ASSIGNMENT LIST
            ================================================= */}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 14
              }}
            >

              {assignments.map((r) => (
                <AssignmentCard
                  key={
                    r.ReportID ??
                    r.ReportId ??
                    r.ReferenceNumber
                  }
                  report={r}
                  onView={() =>
                    setSelectedIssue(r)
                  }
                  onViewMap={() =>
                    setMapReport(r)
                  }
                />
              ))}


              {/* =================================================
                  EMPTY STATE
              ================================================= */}

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


        {/* =====================================================
            MAP MODAL
        ===================================================== */}

        {mapReport && (
          <LocationMapModal
            report={mapReport}
            onClose={() =>
              setMapReport(null)
            }
          />
        )}


        {/* =====================================================
            ISSUE DETAILS MODAL
        ===================================================== */}

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
    ? new Date(
        report.CreatedAt
      ).toLocaleDateString()
    : 'Unknown date';


  const latitude = Number(
    report.Latitude
  );

  const longitude = Number(
    report.Longitude
  );


  const hasCoordinates =
    Number.isFinite(latitude) &&
    Number.isFinite(longitude);


  return (
    <div
      className="card"
      style={{
        padding: 16
      }}
    >

      {/* ===================================================
          TITLE + STATUS
      =================================================== */}

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
          {report.Title}
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


      {/* ===================================================
          META INFORMATION
      =================================================== */}

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
          {report.Priority} Priority
        </span>

      </div>


      {/* ===================================================
          DESCRIPTION
      =================================================== */}

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


      {/* ===================================================
          REFERENCE / CATEGORY
      =================================================== */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12,
          fontSize: 11,
          color: 'var(--text-secondary)'
        }}
      >

        {report.ReportCode && (
          <span>
            <strong>
              {report.ReportCode}
            </strong>
          </span>
        )}

        {report.ReportCode &&
          report.Category && (
            <span>&bull;</span>
          )}

        {report.Category && (
          <span>
            {report.Category}
          </span>
        )}

      </div>


      {/* ===================================================
          ACTIONS
      =================================================== */}

      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap'
        }}
      >

        {/* VIEW BUTTON */}

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


        {/* VIEW ON MAP */}

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
          disabled={!hasCoordinates}
          title={
            hasCoordinates
              ? 'View issue location on map'
              : 'Location coordinates are unavailable'
          }
        >

          <MapPin size={14} />

          View on Map

        </button>

      </div>

    </div>
  );
}


/* =============================================================
   STATUS BADGE
============================================================= */

function statusBadgeStyle(status) {

  const map = {
    Reported: {
      bg: '#fef3c7',
      color: '#92400e'
    },

    Assigned: {
      bg: '#dbeafe',
      color: '#1e40af'
    },

    InProgress: {
      bg: '#dbeafe',
      color: '#1e40af'
    },

    'In Progress': {
      bg: '#dbeafe',
      color: '#1e40af'
    },

    Resolved: {
      bg: '#dcfce7',
      color: '#166534'
    }
  };


  const c =
    map[status] || {
      bg: '#f1f5f9',
      color: '#475569'
    };


  return {
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: 11.5,
    fontWeight: 700,
    background: c.bg,
    color: c.color,
    textTransform: 'uppercase',
    letterSpacing: 0.3
  };
}


/* =============================================================
   PRIORITY BADGE
============================================================= */

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


  const c =
    map[priority] || {
      bg: '#f1f5f9',
      color: '#475569'
    };


  return {
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: 11.5,
    fontWeight: 700,
    background: c.bg,
    color: c.color,
    textTransform: 'capitalize'
  };
}


/* =============================================================
   CATEGORY BADGE
============================================================= */

const categoryBadgeStyle = {
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 11.5,
  fontWeight: 700,
  background: '#ede9fe',
  color: '#5b21b6'
};


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


  /*
   * Keyboard controls.
   */
  useEffect(() => {

    function handleEscape(e) {

      if (e.key === 'Escape') {
        onClose();
      }


      if (
        e.key === 'ArrowLeft' &&
        photos.length > 1
      ) {
        setPhotoIndex(
          (i) =>
            i === 0
              ? photos.length - 1
              : i - 1
        );
      }


      if (
        e.key === 'ArrowRight' &&
        photos.length > 1
      ) {
        setPhotoIndex(
          (i) =>
            i === photos.length - 1
              ? 0
              : i + 1
        );
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

  }, [onClose, photos.length]);


  /*
   * Prevent background click from closing
   * when clicking inside the modal.
   */
  function handleBackdropClick(e) {

    if (
      e.target === e.currentTarget
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
        zIndex: 10000,
        background:
          'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding:
          'clamp(10px, 4vw, 20px)'
      }}
    >

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Issue details"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 560,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'white',
          borderRadius: 14,
          boxShadow:
            '0 20px 60px rgba(0, 0, 0, 0.3)',
          padding:
            'clamp(16px, 5vw, 24px)'
        }}
      >

        {/* =================================================
            CLOSE BUTTON
        ================================================= */}

        <button
          onClick={onClose}
          aria-label="Close"
          title="Close"
          style={{
            position: 'absolute',
            top:
              'clamp(10px, 3vw, 16px)',
            right:
              'clamp(10px, 3vw, 16px)',
            width: 34,
            height: 34,
            borderRadius: '50%',
            border:
              '1px solid #e2e8f0',
            background: '#f8fafc',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 2,
            flexShrink: 0
          }}
        >
          <X size={17} />
        </button>


        {/* =================================================
            TITLE
        ================================================= */}

        <div
          style={{
            paddingRight:
              'clamp(30px, 10vw, 40px)',
            marginBottom: 18
          }}
        >

          <div
            style={{
              fontSize: 11,
              color: '#94a3b8',
              textTransform: 'uppercase',
              marginBottom: 5
            }}
          >
            #
            {issue.ReferenceNumber ||
              issue.ReportCode ||
              issue.ReportID ||
              issue.ReportId ||
              'Issue'}
          </div>


          <h3
            style={{
              margin: 0,
              fontSize:
                'clamp(16px, 4.5vw, 19px)',
              fontWeight: 700,
              color: '#1e293b',
              wordBreak: 'break-word'
            }}
          >
            {issue.Title ||
              'Untitled Issue'}
          </h3>

        </div>


        {/* =================================================
            ISSUE INFORMATION
        ================================================= */}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginBottom: 16
          }}
        >

          {/* LOCATION */}

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              fontSize: 13.5,
              color: '#475569'
            }}
          >

            <MapPin
              size={16}
              color="#94a3b8"
              style={{
                flexShrink: 0,
                marginTop: 1
              }}
            />

            <span
              style={{
                wordBreak: 'break-word'
              }}
            >
              {issue.Location ||
                issue.LocationName ||
                'Location not specified'}
            </span>

          </div>


          {/* DATE */}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13.5,
              color: '#475569'
            }}
          >

            <Clock3
              size={16}
              color="#94a3b8"
              style={{
                flexShrink: 0
              }}
            />

            {issue.CreatedAt
              ? formatSADateTime(
                  issue.CreatedAt
                )
              : 'Date not available'}

          </div>

        </div>


        {/* =================================================
            BADGES
        ================================================= */}

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 18
          }}
        >

          {issue.Status && (
            <span
              style={statusBadgeStyle(
                issue.Status
              )}
            >
              {issue.Status}
            </span>
          )}


          {issue.Priority && (
            <span
              style={priorityBadgeStyle(
                issue.Priority
              )}
            >
              {issue.Priority} priority
            </span>
          )}


          {issue.Category && (
            <span
              style={categoryBadgeStyle}
            >
              {issue.Category}
            </span>
          )}

        </div>


        {/* =================================================
            DESCRIPTION
        ================================================= */}

        {issue.Description && (
          <div
            style={{
              marginBottom: 20
            }}
          >

            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                marginBottom: 6
              }}
            >
              Description
            </div>


            <p
              style={{
                margin: 0,
                fontSize: 13.5,
                color: '#475569',
                lineHeight: 1.5,
                wordBreak: 'break-word'
              }}
            >
              {issue.Description}
            </p>

          </div>
        )}


        {/* =================================================
            PHOTOS
        ================================================= */}

        <div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 10,
              color: '#64748b',
              textTransform: 'uppercase'
            }}
          >

            <ImageIcon size={14} />

            <span>
              Photos
            </span>

            {photos.length > 0 && (
              <span>
                ({photos.length})
              </span>
            )}

          </div>


          {/* NO PHOTOS */}

          {photos.length === 0 ? (

            <div
              style={{
                padding: 20,
                textAlign: 'center',
                border:
                  '1px dashed #e2e8f0',
                borderRadius: 10,
                color: '#94a3b8',
                fontSize: 13
              }}
            >
              No photos attached to this report.
            </div>

          ) : (

            <div>

              {/* =================================================
                  MAIN PHOTO
              ================================================= */}

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
                    height:
                      'clamp(160px, 45vw, 260px)',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display =
                      'none';
                  }}
                />


                {/* =================================================
                    PREVIOUS / NEXT
                ================================================= */}

                {photos.length > 1 && (
                  <>

                    <button
                      type="button"
                      aria-label="Previous photo"
                      onClick={() =>
                        setPhotoIndex(
                          (i) =>
                            i === 0
                              ? photos.length - 1
                              : i - 1
                        )
                      }
                      style={{
                        position: 'absolute',
                        left: 8,
                        top: '50%',
                        transform:
                          'translateY(-50%)',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        border: 'none',
                        background:
                          'rgba(255,255,255,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      <ChevronLeft size={18} />
                    </button>


                    <button
                      type="button"
                      aria-label="Next photo"
                      onClick={() =>
                        setPhotoIndex(
                          (i) =>
                            i === photos.length - 1
                              ? 0
                              : i + 1
                        )
                      }
                      style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform:
                          'translateY(-50%)',
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        border: 'none',
                        background:
                          'rgba(255,255,255,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      <ChevronRight size={18} />
                    </button>


                    {/* PHOTO COUNTER */}

                    <span
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        background:
                          'rgba(0,0,0,0.6)',
                        color: 'white',
                        fontSize: 11,
                        padding: '3px 8px',
                        borderRadius: 6
                      }}
                    >
                      {photoIndex + 1} /{' '}
                      {photos.length}
                    </span>

                  </>
                )}

              </div>


              {/* =================================================
                  PHOTO THUMBNAILS
              ================================================= */}

              {photos.length > 1 && (
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    overflowX: 'auto',
                    padding: '2px 0'
                  }}
                >

                  {photos.map(
                    (photo, i) => (
                      <button
                        type="button"
                        key={`${photo}-${i}`}
                        aria-label={`View photo ${
                          i + 1
                        }`}
                        onClick={() =>
                          setPhotoIndex(i)
                        }
                        style={{
                          width:
                            'clamp(46px, 14vw, 56px)',
                          height:
                            'clamp(36px, 11vw, 44px)',
                          flexShrink: 0,
                          padding: 0,
                          borderRadius: 6,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border:
                            i === photoIndex
                              ? '2px solid var(--navy-800)'
                              : '2px solid transparent'
                        }}
                      >

                        <img
                          src={getPhotoUrl(
                            photo
                          )}
                          alt={`Thumbnail ${
                            i + 1
                          }`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />

                      </button>
                    )
                  )}

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


  /*
   * No coordinates.
   */
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          background:
            'rgba(15, 33, 54, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}
        onClick={onClose}
      >

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

          <div
            style={{
              display: 'flex',
              alignItems: 'center'
            }}
          >

            <strong>
              Issue Location
            </strong>


            <button
              type="button"
              onClick={onClose}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color:
                  'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

          </div>


          <p
            style={{
              fontSize: 13,
              color:
                'var(--text-secondary)',
              marginTop: 16
            }}
          >
            Location coordinates are not
            available for this issue.
          </p>

        </div>

      </div>
    );
  }


  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background:
          'rgba(15, 33, 54, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
      onClick={onClose}
    >

      <div
        className="card"
        style={{
          width: 560,
          maxWidth: '100%',
          overflow: 'hidden',
          boxShadow:
            'var(--shadow-modal)'
        }}
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        {/* =================================================
            MAP MODAL HEADER
        ================================================= */}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom:
              '1px solid var(--border)'
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

            Issue Location

          </div>


          <button
            type="button"
            onClick={onClose}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color:
                'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>

        </div>


        {/* =================================================
            REPORT INFORMATION
        ================================================= */}

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
            {report.Title}
          </div>


          <div
            style={{
              fontSize: 12,
              color:
                'var(--text-secondary)'
            }}
          >
            {report.Location ||
              report.LocationName ||
              'Location unavailable'}
          </div>

        </div>


        {/* =================================================
            MAP
        ================================================= */}

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


        {/* =================================================
            COORDINATES
        ================================================= */}

        <div
          style={{
            padding: '12px 20px',
            fontSize: 11,
            color:
              'var(--text-secondary)',
            borderTop:
              '1px solid var(--border)'
          }}
        >

          Coordinates:{' '}

          {latitude.toFixed(6)},{' '}

          {longitude.toFixed(6)}

        </div>

      </div>

    </div>
  );
}