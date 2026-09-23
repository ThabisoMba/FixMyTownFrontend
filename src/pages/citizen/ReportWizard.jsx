import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents
} from 'react-leaflet';

import {
  MapPin,
  Construction,
  Droplet,
  Zap,
  Trash2,
  Lightbulb,
  SprayCan,
  Trees,
  MoreHorizontal,
  UploadCloud,
  ArrowLeft,
  ArrowRight,
  Send,
  Check,
  LocateFixed,
  AlertTriangle,
  ThumbsUp,
  Loader2
} from 'lucide-react';

import api from '../../api/api';
import { reverseGeocode } from '../../utils/geocode';
import Modal from '../../components/Modal';
import '../../components/leafletIcons';
import '../../pages/public/LandingPage.css';

const DEFAULT_CENTER = [-28.4793, 24.6727];
const DEFAULT_ZOOM = 5;
const MOBILE_BREAKPOINT = 640;

/**
 * Lives inside <MapContainer>.
 * Reports every manual map click back to the wizard.
 */
function ClickToPin({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    }
  });

  return null;
}

/**
 * Moves the Leaflet map whenever the selected location changes.
 *
 * This is important because MapContainer's `center` prop
 * does not automatically recenter an already-mounted map.
 */
function RecenterMap({ location }) {
  const map = useMapEvents({});

  useEffect(() => {
    if (!location) return;

    const lat = Number(location.lat);
    const lng = Number(location.lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return;
    }

    map.setView([lat, lng], 17, {
      animate: true
    });
  }, [location, map]);

  return null;
}

const STEP_LABELS = [
  'Location',
  'Category',
  'Details',
  'Photos'
];

const CATEGORY_ICONS = {
  Pothole: Construction,
  'Water Supply': Droplet,
  Electricity: Zap,
  Sanitation: Trash2,
  'Street Light': Lightbulb,
  Graffiti: SprayCan,
  Parks: Trees,
  Other: MoreHorizontal
};

export default function ReportWizard({
  onClose,
  onSubmitted,
  initialLocation = null
}) {
  const [step, setStep] = useState(1);

  const [categories, setCategories] = useState([]);

  const [submitting, setSubmitting] = useState(false);

  const [gettingLocation, setGettingLocation] = useState(false);

  const [error, setError] = useState('');

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined'
      ? window.innerWidth <= MOBILE_BREAKPOINT
      : false
  );

  const [location, setLocation] = useState(initialLocation);

  const [categoryId, setCategoryId] = useState(null);

  const [title, setTitle] = useState('');

  const [description, setDescription] = useState('');

  const [priority, setPriority] = useState('Medium');

  const [photos, setPhotos] = useState([]);

  // Duplicate detection - checked when leaving the Category step.
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [duplicates, setDuplicates] = useState([]);
  const [showDuplicatePanel, setShowDuplicatePanel] = useState(false);
  const [votedIds, setVotedIds] = useState(new Set());

  /*
   * Load issue categories.
   */
  useEffect(() => {
    api
      .get('/lookups/categories')
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  /*
   * Keep the wizard responsive.
   */
  useEffect(() => {
    function handleResize() {
      setIsMobile(
        window.innerWidth <= MOBILE_BREAKPOINT
      );
    }

    window.addEventListener(
      'resize',
      handleResize
    );

    return () =>
      window.removeEventListener(
        'resize',
        handleResize
      );
  }, []);

  /*
   * If the wizard was opened from another map view
   * with an existing location, reverse-geocode it.
   */
  useEffect(() => {
    if (initialLocation) {
      lookUpPlaceName(
        initialLocation.lat,
        initialLocation.lng
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * Reverse-geocode coordinates into a readable
   * location name.
   */
  async function lookUpPlaceName(lat, lng) {
    try {
      const placeName = await reverseGeocode(
        lat,
        lng
      );

      setLocation((prev) =>
        prev &&
        Number(prev.lat) === Number(lat) &&
        Number(prev.lng) === Number(lng)
          ? {
              ...prev,
              name:
                placeName ||
                'Unknown area'
            }
          : prev
      );
    } catch (err) {
      console.error(
        'Reverse geocoding failed:',
        err
      );

      setLocation((prev) =>
        prev &&
        Number(prev.lat) === Number(lat) &&
        Number(prev.lng) === Number(lng)
          ? {
              ...prev,
              name: 'Unknown area'
            }
          : prev
      );
    }
  }

  /*
   * Handles manually clicking somewhere on
   * the Leaflet map.
   */
  function handleMapClick(latlng) {
    const lat = latlng.lat.toFixed(6);
    const lng = latlng.lng.toFixed(6);

    setError('');

    setLocation({
      lat,
      lng,
      name: 'Locating...'
    });

    lookUpPlaceName(lat, lng);
  }

  /*
   * Called when the citizen moves on from the Category step. Checks
   * for existing open reports of the same category nearby - if any
   * are found, shows the duplicate-warning panel instead of advancing
   * straight to the description step, so they get a chance to upvote
   * an existing report rather than filing an accidental duplicate.
   */
  async function goNext() {
    if (step === 2 && categoryId && location) {
      setCheckingDuplicates(true);
      try {
        const res = await api.get('/issues/nearby-duplicates', {
          params: {
            lat: location.lat,
            lng: location.lng,
            categoryId
          }
        });

        if (res.data && res.data.length > 0) {
          setDuplicates(res.data);
          setShowDuplicatePanel(true);
          setCheckingDuplicates(false);
          return;
        }
      } catch {
        // If the check itself fails, don't block the citizen from
        // reporting - just proceed as normal.
      }
      setCheckingDuplicates(false);
    }

    setStep(step + 1);
  }

  async function handleUpvote(reportId) {
    try {
      await api.post(`/issues/${reportId}/vote`);
      setVotedIds((prev) => new Set(prev).add(reportId));
    } catch {
      // Non-critical - if it fails, the button just stays clickable.
    }
  }

  function formatDistance(meters) {
    if (meters < 1000) return `${Math.round(meters)}m away`;
    return `${(meters / 1000).toFixed(1)}km away`;
  }

  function getDuplicatePhotoUrl(photo) {
    if (!photo) return '';
    if (photo.startsWith('http://') || photo.startsWith('https://')) return photo;
    return `http://localhost:5000${photo.startsWith('/') ? '' : '/'}${photo}`;
  }

  /*
   * Gets the user's current GPS location using
   * the browser Geolocation API.
   *
   * Leaflet then displays that location on the map.
   */
  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setError(
        'Your browser does not support location services.'
      );

      return;
    }

    setGettingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat =
          position.coords.latitude.toFixed(6);

        const lng =
          position.coords.longitude.toFixed(6);

        /*
         * Immediately place the marker while
         * reverse geocoding happens.
         */
        setLocation({
          lat,
          lng,
          name: 'Locating...'
        });

        try {
          const placeName =
            await reverseGeocode(
              lat,
              lng
            );

          setLocation({
            lat,
            lng,
            name:
              placeName ||
              'Current location'
          });
        } catch (err) {
          console.error(
            'Reverse geocoding failed:',
            err
          );

          setLocation({
            lat,
            lng,
            name: 'Current location'
          });
        } finally {
          setGettingLocation(false);
        }
      },

      (geoError) => {
        setGettingLocation(false);

        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            setError(
              'Location permission was denied. Please allow location access in your browser settings.'
            );
            break;

          case geoError.POSITION_UNAVAILABLE:
            setError(
              'Your current location could not be determined. Please try again or pin the location manually.'
            );
            break;

          case geoError.TIMEOUT:
            setError(
              'Getting your location took too long. Please try again.'
            );
            break;

          default:
            setError(
              'Could not get your current location. Please try again.'
            );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }

  /*
   * Handles photo selection.
   */
  function handlePhotoChange(e) {
    setPhotos(
      Array.from(e.target.files).slice(0, 5)
    );
  }

  /*
   * Submit the report.
   */
  async function handleSubmit() {
    if (!location) {
      setError(
        'Please select a location before submitting your report.'
      );

      setStep(1);

      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();

      formData.append(
        'categoryId',
        categoryId
      );

      formData.append(
        'title',
        title
      );

      formData.append(
        'description',
        description
      );

      formData.append(
        'priority',
        priority
      );

      formData.append(
        'latitude',
        location.lat
      );

      formData.append(
        'longitude',
        location.lng
      );

      formData.append(
        'locationName',
        location.name
      );

      photos.forEach((file) =>
        formData.append(
          'photos',
          file
        )
      );

      await api.post(
        '/issues',
        formData,
        {
          headers: {
            'Content-Type':
              'multipart/form-data'
          }
        }
      );

      onSubmitted?.();

      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not submit your report. Please try again.'
      );

      console.log(
        'Server response:',
        err.response?.data
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * Determines whether the user can continue
   * to the next step.
   */
  const canGoNext =
    (step === 1 && !!location) ||
    (step === 2 && !!categoryId) ||
    (step === 3 &&
      title.trim() &&
      description.trim());

  return (
      <Modal
        title="Report New Issue"
        icon={<Plus22 />}
        onClose={onClose}
        width={
          isMobile
            ? '100%'
            : 620
        }
        style={{
          marginTop: isMobile ? '70px' : '80px'
        }}
      >
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      {showDuplicatePanel && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'white',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            padding: 22,
            overflowY: 'auto'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
            <div
              style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <AlertTriangle size={19} color="#92400e" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15.5 }}>
                {duplicates.length === 1
                  ? 'A similar report already exists nearby'
                  : `${duplicates.length} similar reports already exist nearby`}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 3 }}>
                Support an existing report instead of filing a duplicate, or continue if yours is a separate issue.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {duplicates.map((dup) => {
              const voted = dup.AlreadyVotedByMe || votedIds.has(dup.ReportID);
              return (
                <div
                  key={dup.ReportID}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: 12, border: '1px solid var(--border)', borderRadius: 10
                  }}
                >
                  {dup.PhotoUrl ? (
                    <img
                      src={getDuplicatePhotoUrl(dup.PhotoUrl)}
                      alt=""
                      style={{ width: 54, height: 54, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 54, height: 54, borderRadius: 8, flexShrink: 0,
                        background: 'var(--bg-page)', border: '1px dashed var(--border)'
                      }}
                    />
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {dup.Title}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {formatDistance(dup.DistanceMeters)} &bull; {dup.Status} &bull; #{dup.ReportCode}
                    </div>
                  </div>

                  <button
                    type="button"
                    className={voted ? 'btn' : 'btn btn-outline'}
                    disabled={voted}
                    onClick={() => handleUpvote(dup.ReportID)}
                    style={{
                      flexShrink: 0,
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 12, padding: '7px 12px',
                      ...(voted ? { background: 'var(--gold-100)', color: 'var(--gold-600)' } : {})
                    }}
                  >
                    {voted ? <Check size={13} /> : <ThumbsUp size={13} />}
                    {voted ? `Upvoted (${dup.VoteCount + (dup.AlreadyVotedByMe ? 0 : 1)})` : `Upvote (${dup.VoteCount})`}
                  </button>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setShowDuplicatePanel(false);
                setStep(3);
              }}
            >
              Continue With My Report
            </button>
            {votedIds.size > 0 && (
              <button type="button" className="btn btn-primary" onClick={onClose}>
                Done - Close
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: isMobile
            ? 18
            : 26
        }}
      >
        {STEP_LABELS.map(
          (label, i) => {
            const num = i + 1;

            const done =
              num < step;

            const current =
              num === step;

            return (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flex:
                    num < 4
                      ? 1
                      : 'none'
                }}
              >
                <div
                  style={{
                    textAlign: 'center'
                  }}
                >
                  <div
                    style={{
                      width: isMobile
                        ? 26
                        : 32,
                      height: isMobile
                        ? 26
                        : 32,
                      borderRadius:
                        '50%',
                      display: 'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                      margin:
                        '0 auto 6px',
                      fontWeight: 700,
                      fontSize:
                        isMobile
                          ? 11
                          : 13,
                      background:
                        done
                          ? '#22c55e'
                          : current
                            ? 'var(--navy-800)'
                            : 'white',
                      color:
                        done || current
                          ? 'white'
                          : 'var(--text-muted)',
                      border:
                        done || current
                          ? 'none'
                          : '2px solid var(--border)',
                      flexShrink: 0
                    }}
                  >
                    {done ? (
                      <Check
                        size={
                          isMobile
                            ? 12
                            : 15
                        }
                      />
                    ) : (
                      num
                    )}
                  </div>

                  <div
                    style={{
                      fontSize:
                        isMobile
                          ? 9
                          : 11,
                      fontWeight: 700,
                      letterSpacing:
                        isMobile
                          ? 0.2
                          : 0.5,
                      textTransform:
                        'uppercase',
                      color:
                        done
                          ? '#22c55e'
                          : current
                            ? 'var(--navy-800)'
                            : 'var(--text-muted)',
                      whiteSpace:
                        'nowrap'
                    }}
                  >
                    {label}
                  </div>
                </div>

                {num < 4 && (
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      background:
                        done
                          ? '#22c55e'
                          : 'var(--border)',
                      margin:
                        isMobile
                          ? '0 4px 16px'
                          : '0 8px 20px'
                    }}
                  />
                )}
              </div>
            );
          }
        )}
      </div>

      {/* Error message */}
      {error && (
        <div
          style={{
            background:
              '#fdecec',
            color: '#c0362c',
            fontSize: 13,
            padding:
              '10px 14px',
            borderRadius: 8,
            marginBottom: 16,
            wordBreak:
              'break-word'
          }}
        >
          {error}
        </div>
      )}

      {/* =====================================================
          STEP 1: LOCATION
          ===================================================== */}
      {step === 1 && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 700,
              marginBottom: 4,
              flexWrap: 'wrap'
            }}
          >
            <MapPin
              size={16}
              color="#ef4444"
            />

            Pinpoint Location on Map
          </div>

          <p
            style={{
              fontSize: 13,
              color:
                'var(--text-secondary)',
              marginBottom: 12
            }}
          >
            Click on the map below to
            mark the exact issue
            location, or use your
            current location.
          </p>

          {/* Leaflet map */}
          <div
            style={{
              height: isMobile
                ? 180
                : 220,
              borderRadius: 10,
              border:
                '1px solid var(--border)',
              overflow: 'hidden'
            }}
          >
            <MapContainer
              center={
                location
                  ? [
                      Number(
                        location.lat
                      ),
                      Number(
                        location.lng
                      )
                    ]
                  : DEFAULT_CENTER
              }
              zoom={
                location
                  ? 15
                  : DEFAULT_ZOOM
              }
              style={{
                height: '100%',
                width: '100%',
                cursor:
                  'crosshair'
              }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Manual map pinning */}
              <ClickToPin
                onPick={
                  handleMapClick
                }
              />

              {/* Recenter map after GPS/manual selection */}
              <RecenterMap
                location={location}
              />

              {/* Selected location marker */}
              {location && (
                <Marker
                  position={[
                    Number(
                      location.lat
                    ),
                    Number(
                      location.lng
                    )
                  ]}
                />
              )}
            </MapContainer>
          </div>

          {/* Selected location information */}
          {location && (
            <p
              style={{
                fontSize: 12,
                color:
                  'var(--text-secondary)',
                marginTop: 8,
                wordBreak:
                  'break-word'
              }}
            >
              Pinned at{' '}
              {location.lat},{' '}
              {location.lng}{' '}
              (
              {location.name}
              )
            </p>
          )}

          {/* Current location button */}
          <button
            type="button"
            onClick={
              handleUseCurrentLocation
            }
            disabled={
              gettingLocation
            }
            style={{
              width: '100%',
              marginTop: 12,
              padding:
                '10px 14px',
              border:
                '1px solid var(--border)',
              borderRadius: 8,
              background:
                gettingLocation
                  ? '#f3f4f6'
                  : 'white',
              color:
                'var(--navy-800)',
              display: 'flex',
              alignItems:
                'center',
              justifyContent:
                'center',
              gap: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor:
                gettingLocation
                  ? 'not-allowed'
                  : 'pointer',
              opacity:
                gettingLocation
                  ? 0.7
                  : 1
            }}
          >
            <LocateFixed
              size={16}
            />

            {gettingLocation
              ? 'Getting Current Location...'
              : 'Use Current Location'}
          </button>
        </div>
      )}

      {/* =====================================================
          STEP 2: CATEGORY
          ===================================================== */}
      {step === 2 && (
        <div>
          <label
            style={{
              fontWeight: 700,
              fontSize: 14,
              display: 'block',
              marginBottom: 12
            }}
          >
            Select Issue Category *
          </label>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                isMobile
                  ? 'repeat(2, 1fr)'
                  : 'repeat(4, 1fr)',
              gap: isMobile
                ? 8
                : 10
            }}
          >
            {categories.map(
              (cat) => {
                const Icon =
                  CATEGORY_ICONS[
                    cat.Name
                  ] ||
                  MoreHorizontal;

                const selected =
                  categoryId ===
                  cat.CategoryID;

                return (
                  <button
                    key={
                      cat.CategoryID
                    }
                    type="button"
                    onClick={() =>
                      setCategoryId(
                        cat.CategoryID
                      )
                    }
                    style={{
                      border:
                        selected
                          ? '2px solid var(--gold-500)'
                          : '1px solid var(--border)',
                      background:
                        selected
                          ? 'var(--gold-100)'
                          : 'white',
                      borderRadius: 10,
                      padding:
                        isMobile
                          ? '14px 8px'
                          : '16px 8px',
                      display: 'flex',
                      flexDirection:
                        'column',
                      alignItems:
                        'center',
                      gap: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      textAlign:
                        'center',
                      wordBreak:
                        'break-word',
                      cursor:
                        'pointer'
                    }}
                  >
                    <Icon
                      size={22}
                      color={
                        selected
                          ? 'var(--gold-600)'
                          : 'var(--navy-800)'
                      }
                    />

                    {cat.Name}
                  </button>
                );
              }
            )}
          </div>
        </div>
      )}

      {/* =====================================================
          STEP 3: DETAILS
          ===================================================== */}
      {step === 3 && (
        <div>
          <div className="field">
            <label>
              Issue Title *
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              placeholder="Brief title summarizing the issue"
            />
          </div>

          <div className="field">
            <label>
              Description *
            </label>

            <textarea
              rows={4}
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Describe the issue in detail (what, where, how long, impact)..."
            />
          </div>

          <label
            style={{
              fontWeight: 700,
              fontSize: 13,
              display: 'block',
              marginBottom: 8
            }}
          >
            Priority Level
          </label>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                isMobile
                  ? 'repeat(2, 1fr)'
                  : 'repeat(4, 1fr)',
              gap: 8
            }}
          >
            {[
              {
                key: 'Low',
                note: 'Minor',
                color: '#22c55e'
              },
              {
                key: 'Medium',
                note: 'Moderate',
                color: '#f2a93d'
              },
              {
                key: 'High',
                note: 'Serious',
                color: '#f97316'
              },
              {
                key: 'Critical',
                note: 'Emergency',
                color: '#ef4444'
              }
            ].map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() =>
                  setPriority(
                    p.key
                  )
                }
                style={{
                  border:
                    priority ===
                    p.key
                      ? `2px solid ${p.color}`
                      : '1px solid var(--border)',
                  background:
                    priority ===
                    p.key
                      ? `${p.color}18`
                      : 'white',
                  borderRadius: 10,
                  padding:
                    '10px 4px',
                  textAlign:
                    'center',
                  cursor:
                    'pointer'
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: p.color
                  }}
                >
                  {p.key}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    color:
                      'var(--text-secondary)'
                  }}
                >
                  {p.note}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================
          STEP 4: PHOTOS
          ===================================================== */}
      {step === 4 && (
        <div>
          <label
            style={{
              fontWeight: 700,
              fontSize: 14,
              display: 'block',
              marginBottom: 4
            }}
          >
            Upload Photos
          </label>

          <p
            style={{
              fontSize: 13,
              color:
                'var(--text-secondary)',
              marginBottom: 12
            }}
          >
            Help us identify the
            issue with clear photos
          </p>

          <label
            style={{
              display: 'flex',
              flexDirection:
                'column',
              alignItems:
                'center',
              gap: 10,
              padding: isMobile
                ? '28px 12px'
                : '40px 0',
              border:
                '2px dashed var(--border)',
              borderRadius: 10,
              cursor: 'pointer',
              color:
                'var(--text-secondary)',
              background:
                '#fafbfc',
              textAlign: 'center'
            }}
          >
            <UploadCloud
              size={
                isMobile
                  ? 26
                  : 30
              }
            />

            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                color:
                  'var(--text-primary)'
              }}
            >
              Click or Drag Images
              Here
            </div>

            <div
              style={{
                fontSize: 12
              }}
            >
              JPG, PNG up to
              10MB each
            </div>

            <input
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={
                handlePhotoChange
              }
            />
          </label>

          {photos.length >
            0 && (
            <p
              style={{
                fontSize: 12,
                color:
                  'var(--text-secondary)',
                marginTop: 8
              }}
            >
              {photos.length}{' '}
              photo(s) selected
            </p>
          )}
        </div>
      )}

      {/* =====================================================
          FOOTER NAVIGATION
          ===================================================== */}
      <div
        style={{
          display: 'flex',
          flexDirection:
            isMobile
              ? 'column-reverse'
              : 'row',
          justifyContent:
            'flex-end',
          gap: 10,
          marginTop: 24,
          paddingTop: 18,
          borderTop:
            '1px solid var(--border)'
        }}
      >
        {/* Back button */}
        {step > 1 && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={() =>
              setStep(step - 1)
            }
            style={
              isMobile
                ? {
                    width: '100%',
                    justifyContent:
                      'center'
                  }
                : undefined
            }
          >
            <ArrowLeft
              size={15}
            />

            Back
          </button>
        )}

        {/* Next button */}
        {step < 4 && (
          <button
            type="button"
            className="btn btn-primary"
            disabled={
              !canGoNext || checkingDuplicates
            }
            onClick={goNext}
            style={
              isMobile
                ? {
                    width:
                      '100%',
                    justifyContent:
                      'center'
                  }
                : undefined
            }
          >
            {checkingDuplicates ? (
              <>
                <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                Checking nearby reports...
              </>
            ) : (
              <>
                Next
                <ArrowRight size={15} />
              </>
            )}
          </button>
        )}

        {/* Submit button */}
        {step === 4 && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={
              handleSubmit
            }
            disabled={
              submitting
            }
            style={
              isMobile
                ? {
                    width: '100%',
                    justifyContent:
                      'center'
                  }
                : undefined
            }
          >
            <Send
              size={15}
            />

            {submitting
              ? 'Submitting...'
              : 'Submit Report'}
          </button>
        )}
      </div>
    </Modal>
  );
}

/*
 * Small inline icon so Modal's header matches
 * the "+ Report New Issue" style.
 */
function Plus22() {
  return (
    <span
      style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        background:
          'var(--navy-800)',
        color: 'white',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        fontWeight: 700
      }}
    >
      +
    </span>
  );
}