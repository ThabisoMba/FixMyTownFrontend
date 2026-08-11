import { useEffect, useState } from 'react';
import {
  ClipboardList,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon
} from 'lucide-react';

import api from '../../api/api';
import TopBar from '../../components/TopBar';
import StatusBadge from '../../components/StatusBadge';
import ProgressModal from './ProgressModal';

const API_ORIGIN = 'http://localhost:5000';

export default function MyAssignments() {
  const [reports, setReports] = useState([]);
  const [activeReport, setActiveReport] = useState(null);

  // Photo modal
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  /*
   * ============================================================
   * LOAD ASSIGNMENTS
   * ============================================================
   */
  function load() {
    api
      .get('/worker/assignments')
      .then((res) => {
        console.log('Worker assignments:', res.data);
        setReports(res.data);
      })
      .catch((err) => {
        console.error('Could not load assignments:', err);
      });
  }

  useEffect(() => {
    load();
  }, []);

  /*
   * ============================================================
   * PHOTO URL
   * ============================================================
   *
   * Handles:
   *
   * /uploads/example.jpg
   *
   * and:
   *
   * http://localhost:5000/uploads/example.jpg
   */
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
   * OPEN PHOTO MODAL
   * ============================================================
   */
  function openPhotoModal(photos, index = 0) {
    if (!photos || photos.length === 0) {
      return;
    }

    setSelectedPhotos(photos);
    setSelectedPhotoIndex(index);
  }

  /*
   * ============================================================
   * CLOSE PHOTO MODAL
   * ============================================================
   */
  function closePhotoModal() {
    setSelectedPhotos([]);
    setSelectedPhotoIndex(0);
  }

  /*
   * ============================================================
   * PREVIOUS PHOTO
   * ============================================================
   */
  function showPreviousPhoto() {
    setSelectedPhotoIndex((currentIndex) => {
      if (currentIndex === 0) {
        return selectedPhotos.length - 1;
      }

      return currentIndex - 1;
    });
  }

  /*
   * ============================================================
   * NEXT PHOTO
   * ============================================================
   */
  function showNextPhoto() {
    setSelectedPhotoIndex((currentIndex) => {
      if (currentIndex === selectedPhotos.length - 1) {
        return 0;
      }

      return currentIndex + 1;
    });
  }

  /*
   * ============================================================
   * KEYBOARD CONTROLS
   * ============================================================
   */
  useEffect(() => {
    function handleKeyboard(e) {
      if (selectedPhotos.length === 0) {
        return;
      }

      if (e.key === 'Escape') {
        closePhotoModal();
      }

      if (e.key === 'ArrowLeft') {
        showPreviousPhoto();
      }

      if (e.key === 'ArrowRight') {
        showNextPhoto();
      }
    }

    document.addEventListener('keydown', handleKeyboard);

    return () => {
      document.removeEventListener('keydown', handleKeyboard);
    };
  }, [selectedPhotos.length]);

  /*
   * ============================================================
   * PHOTO MODAL BACKDROP
   * ============================================================
   */
  function handlePhotoBackdropClick(e) {
    if (e.target === e.currentTarget) {
      closePhotoModal();
    }
  }

  return (
    <>
      <TopBar
        section="Worker"
        page="My Assignments"
      />

      <div
        style={{
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 20
        }}
      >
        {/* =====================================================
            MAIN ASSIGNMENTS CARD
            ===================================================== */}
        <div
          className="card"
          style={{
            padding: 20
          }}
        >
          {/* ===================================================
              HEADER
              =================================================== */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 700,
              marginBottom: 20
            }}
          >
            <ClipboardList size={18} />

            <span>
              All My Assignments ({reports.length})
            </span>
          </div>

          {/* ===================================================
              ASSIGNMENTS
              =================================================== */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            {reports.map((report) => (
              <div
                key={report.ReportID}
                className="card"
                style={{
                  padding: 18,
                  border: '1px solid var(--border)'
                }}
              >
                {/* =================================================
                    REPORT HEADER
                    ================================================= */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 8
                  }}
                >
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700
                    }}
                  >
                    {report.Title}
                  </div>

                  <div
                    style={{
                      marginLeft: 'auto'
                    }}
                  >
                    <StatusBadge
                      status={report.Status}
                    />
                  </div>
                </div>

                {/* =================================================
                    REPORT INFORMATION
                    ================================================= */}
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    marginBottom: 10,
                    lineHeight: 1.6
                  }}
                >
                  {report.LocationName || 'Location unavailable'}

                  {' • '}

                  Reported:{' '}
                  {report.CreatedAt
                    ? new Date(
                        report.CreatedAt
                      ).toLocaleDateString()
                    : 'Unknown'}

                  {' • '}

                  {report.Priority} Priority

                  {' • '}

                  {report.CategoryName || 'Uncategorized'}
                </div>

                {/* =================================================
                    DESCRIPTION
                    ================================================= */}
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    margin: '0 0 16px',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {report.Description ||
                    'No description provided.'}
                </p>

                {/* =================================================
                    REPORT PHOTOS
                    ================================================= */}
                <div
                  style={{
                    marginBottom: 16
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

                    <span>
                      Report Photos
                    </span>

                    {report.Photos?.length > 0 && (
                      <span>
                        ({report.Photos.length})
                      </span>
                    )}
                  </div>

                  {report.Photos?.length > 0 ? (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 10
                      }}
                    >
                      {report.Photos.map(
                        (photo, index) => {
                          const photoUrl =
                            getPhotoUrl(photo);

                          return (
                            <button
                              key={`${photo}-${index}`}
                              type="button"
                              onClick={() =>
                                openPhotoModal(
                                  report.Photos,
                                  index
                                )
                              }
                              title={`View photo ${
                                index + 1
                              }`}
                              style={{
                                width: 110,
                                height: 85,
                                padding: 0,
                                border: '1px solid var(--border)',
                                borderRadius: 8,
                                overflow: 'hidden',
                                background:
                                  'var(--bg-page)',
                                cursor: 'pointer',
                                position: 'relative'
                              }}
                            >
                              <img
                                src={photoUrl}
                                alt={`Report photo ${
                                  index + 1
                                }`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  display: 'block'
                                }}
                                onError={(e) => {
                                  e.currentTarget.style.display =
                                    'none';
                                }}
                              />

                              {/* PHOTO NUMBER */}
                              <span
                                style={{
                                  position: 'absolute',
                                  bottom: 5,
                                  right: 5,
                                  background:
                                    'rgba(0, 0, 0, 0.65)',
                                  color: 'white',
                                  fontSize: 10,
                                  padding:
                                    '3px 6px',
                                  borderRadius: 5
                                }}
                              >
                                {index + 1}
                              </span>
                            </button>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: 14,
                        border: '1px dashed var(--border)',
                        borderRadius: 8,
                        color:
                          'var(--text-secondary)',
                        fontSize: 12,
                        textAlign: 'center'
                      }}
                    >
                      No photos attached to this report.
                    </div>
                  )}
                </div>

                {/* =================================================
                    ACTIONS
                    ================================================= */}
                {report.Status !== 'Resolved' && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      paddingTop: 4
                    }}
                  >
                    <button
                      className="btn btn-primary"
                      type="button"
                      style={{
                        padding: '8px 14px',
                        fontSize: 12
                      }}
                      onClick={() =>
                        setActiveReport(report)
                      }
                    >
                      Update Progress
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* =====================================================
                NO ASSIGNMENTS
                ===================================================== */}
            {reports.length === 0 && (
              <div
                style={{
                  padding: 30,
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                  border: '1px dashed var(--border)',
                  borderRadius: 8
                }}
              >
                No assignments yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =======================================================
          PROGRESS MODAL
          ======================================================= */}
      {activeReport && (
        <ProgressModal
          report={activeReport}
          onClose={() => setActiveReport(null)}
          onUpdated={() => {
            setActiveReport(null);
            load();
          }}
        />
      )}

      {/* =======================================================
          PHOTO VIEWER MODAL
          ======================================================= */}
      {selectedPhotos.length > 0 && (
        <div
          onClick={handlePhotoBackdropClick}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background:
              'rgba(15, 23, 42, 0.82)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          {/* ===================================================
              PHOTO VIEWER
              =================================================== */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 1100,
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14
            }}
          >
            {/* =================================================
                CLOSE BUTTON
                ================================================= */}
            <button
              type="button"
              onClick={closePhotoModal}
              title="Close photo viewer"
              style={{
                position: 'absolute',
                top: -5,
                right: 0,
                width: 38,
                height: 38,
                borderRadius: '50%',
                border: 'none',
                background:
                  'rgba(255, 255, 255, 0.95)',
                color: '#111827',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 3
              }}
            >
              <X size={20} />
            </button>

            {/* =================================================
                PHOTO COUNTER
                ================================================= */}
            <div
              style={{
                color: 'white',
                fontSize: 13,
                fontWeight: 600,
                marginTop: 5
              }}
            >
              Photo {selectedPhotoIndex + 1} of{' '}
              {selectedPhotos.length}
            </div>

            {/* =================================================
                IMAGE CONTAINER
                ================================================= */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* PREVIOUS */}
              {selectedPhotos.length > 1 && (
                <button
                  type="button"
                  onClick={showPreviousPhoto}
                  title="Previous photo"
                  style={{
                    position: 'absolute',
                    left: 10,
                    zIndex: 2,
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    border: 'none',
                    background:
                      'rgba(255, 255, 255, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronLeft size={22} />
                </button>
              )}

              {/* IMAGE */}
              <img
                src={getPhotoUrl(
                  selectedPhotos[
                    selectedPhotoIndex
                  ]
                )}
                alt={`Report photo ${
                  selectedPhotoIndex + 1
                }`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '78vh',
                  objectFit: 'contain',
                  borderRadius: 10,
                  boxShadow:
                    '0 20px 60px rgba(0, 0, 0, 0.4)',
                  background: '#111827'
                }}
              />

              {/* NEXT */}
              {selectedPhotos.length > 1 && (
                <button
                  type="button"
                  onClick={showNextPhoto}
                  title="Next photo"
                  style={{
                    position: 'absolute',
                    right: 10,
                    zIndex: 2,
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    border: 'none',
                    background:
                      'rgba(255, 255, 255, 0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronRight size={22} />
                </button>
              )}
            </div>

            {/* =================================================
                THUMBNAILS
                ================================================= */}
            {selectedPhotos.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  maxWidth: '100%',
                  overflowX: 'auto',
                  padding: '4px 0'
                }}
              >
                {selectedPhotos.map(
                  (photo, index) => (
                    <button
                      key={`${photo}-${index}`}
                      type="button"
                      onClick={() =>
                        setSelectedPhotoIndex(
                          index
                        )
                      }
                      style={{
                        width: 65,
                        height: 50,
                        flexShrink: 0,
                        padding: 0,
                        borderRadius: 6,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border:
                          index ===
                          selectedPhotoIndex
                            ? '2px solid white'
                            : '2px solid transparent',
                        background:
                          'rgba(255,255,255,0.1)'
                      }}
                    >
                      <img
                        src={getPhotoUrl(photo)}
                        alt={`Thumbnail ${
                          index + 1
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
        </div>
      )}
    </>
  );
}
