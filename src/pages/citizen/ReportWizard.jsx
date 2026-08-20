import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import {
  MapPin, Construction, Droplet, Zap, Trash2, Lightbulb, SprayCan, Trees, MoreHorizontal,
  UploadCloud, ArrowLeft, ArrowRight, Send, Check
} from 'lucide-react';
import api from '../../api/api';
import { reverseGeocode } from '../../utils/geocode';
import Modal from '../../components/Modal';
import '../../components/leafletIcons'; // fixes Leaflet's default marker icon under Vite

const DEFAULT_CENTER = [-28.4793, 24.6727]; // rough center of South Africa
const DEFAULT_ZOOM = 5;
const MOBILE_BREAKPOINT = 640;

/** Lives inside <MapContainer> - reports each click's lat/lng up to the wizard */
function ClickToPin({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    }
  });
  return null;
}

const STEP_LABELS = ['Location', 'Category', 'Details', 'Photos'];

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

export default function ReportWizard({ onClose, onSubmitted, initialLocation = null }) {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= MOBILE_BREAKPOINT : false
  );

  const [location, setLocation] = useState(initialLocation);   // { lat, lng, name }
  const [categoryId, setCategoryId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    api.get('/lookups/categories').then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // If the wizard was opened from the Map View page with a location already
  // picked, look up its real place name (it starts as a raw lat/lng only).
  useEffect(() => {
    if (initialLocation) {
      lookUpPlaceName(initialLocation.lat, initialLocation.lng);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function lookUpPlaceName(lat, lng) {
    const placeName = await reverseGeocode(lat, lng);
    setLocation((prev) =>
      prev && prev.lat === lat && prev.lng === lng ? { ...prev, name: placeName || 'Unknown area' } : prev
    );
  }

  function handleMapClick(latlng) {
    const lat = latlng.lat.toFixed(6);
    const lng = latlng.lng.toFixed(6);
    setLocation({ lat, lng, name: 'Locating...' });
    lookUpPlaceName(lat, lng);
  }

  function handlePhotoChange(e) {
    setPhotos(Array.from(e.target.files).slice(0, 5));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('categoryId', categoryId);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('priority', priority);
      formData.append('latitude', location.lat);
      formData.append('longitude', location.lng);
      formData.append('locationName', location.name);
      photos.forEach((file) => formData.append('photos', file));

      await api.post('/issues', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      onSubmitted?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit your report. Please try again.');
      console.log('Server response:', err.response?.data);
    } finally {
      setSubmitting(false);
    }
  }

  const canGoNext =
    (step === 1 && !!location) ||
    (step === 2 && !!categoryId) ||
    (step === 3 && title.trim() && description.trim());

  return (
    <Modal title="Report New Issue" icon={<Plus22 />} onClose={onClose} width={isMobile ? '100%' : 620}>
      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: isMobile ? 18 : 26 }}>
        {STEP_LABELS.map((label, i) => {
          const num = i + 1;
          const done = num < step;
          const current = num === step;
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center', flex: num < 4 ? 1 : 'none' }}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: isMobile ? 26 : 32,
                    height: isMobile ? 26 : 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 6px',
                    fontWeight: 700,
                    fontSize: isMobile ? 11 : 13,
                    background: done ? '#22c55e' : current ? 'var(--navy-800)' : 'white',
                    color: done || current ? 'white' : 'var(--text-muted)',
                    border: done || current ? 'none' : '2px solid var(--border)',
                    flexShrink: 0
                  }}
                >
                  {done ? <Check size={isMobile ? 12 : 15} /> : num}
                </div>
                <div
                  style={{
                    fontSize: isMobile ? 9 : 11,
                    fontWeight: 700,
                    letterSpacing: isMobile ? 0.2 : 0.5,
                    textTransform: 'uppercase',
                    color: done ? '#22c55e' : current ? 'var(--navy-800)' : 'var(--text-muted)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {label}
                </div>
              </div>
              {num < 4 && <div style={{ flex: 1, height: 2, background: done ? '#22c55e' : 'var(--border)', margin: isMobile ? '0 4px 16px' : '0 8px 20px' }} />}
            </div>
          );
        })}
      </div>

      {error && (
        <div style={{ background: '#fdecec', color: '#c0362c', fontSize: 13, padding: '10px 14px', borderRadius: 8, marginBottom: 16, wordBreak: 'break-word' }}>
          {error}
        </div>
      )}

      {/* Step 1: Location */}
      {step === 1 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 4, flexWrap: 'wrap' }}>
            <MapPin size={16} color="#ef4444" /> Pinpoint Location on Map
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
            Click on the map below to mark the exact issue location
          </p>
          <div style={{ height: isMobile ? 180 : 220, borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <MapContainer
              center={location ? [Number(location.lat), Number(location.lng)] : DEFAULT_CENTER}
              zoom={location ? 15 : DEFAULT_ZOOM}
              style={{ height: '100%', width: '100%', cursor: 'crosshair' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ClickToPin onPick={handleMapClick} />
              {location && <Marker position={[Number(location.lat), Number(location.lng)]} />}
            </MapContainer>
          </div>
          {location && (
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8, wordBreak: 'break-word' }}>
              Pinned at {location.lat}, {location.lng} ({location.name})
            </p>
          )}
        </div>
      )}

      {/* Step 2: Category */}
      {step === 2 && (
        <div>
          <label style={{ fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 12 }}>Select Issue Category *</label>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 8 : 10 }}>
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.Name] || MoreHorizontal;
              const selected = categoryId === cat.CategoryID;
              return (
                <button
                  key={cat.CategoryID}
                  onClick={() => setCategoryId(cat.CategoryID)}
                  style={{
                    border: selected ? '2px solid var(--gold-500)' : '1px solid var(--border)',
                    background: selected ? 'var(--gold-100)' : 'white',
                    borderRadius: 10,
                    padding: isMobile ? '14px 8px' : '16px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    textAlign: 'center',
                    wordBreak: 'break-word'
                  }}
                >
                  <Icon size={22} color={selected ? 'var(--gold-600)' : 'var(--navy-800)'} />
                  {cat.Name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: Details */}
      {step === 3 && (
        <div>
          <div className="field">
            <label>Issue Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief title summarizing the issue" />
          </div>
          <div className="field">
            <label>Description *</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail (what, where, how long, impact)..."
            />
          </div>
          <label style={{ fontWeight: 700, fontSize: 13, display: 'block', marginBottom: 8 }}>Priority Level</label>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 8 : 8 }}>
            {[
              { key: 'Low', note: 'Minor', color: '#22c55e' },
              { key: 'Medium', note: 'Moderate', color: '#f2a93d' },
              { key: 'High', note: 'Serious', color: '#f97316' },
              { key: 'Critical', note: 'Emergency', color: '#ef4444' }
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => setPriority(p.key)}
                style={{
                  border: priority === p.key ? `2px solid ${p.color}` : '1px solid var(--border)',
                  background: priority === p.key ? `${p.color}18` : 'white',
                  borderRadius: 10,
                  padding: '10px 4px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, color: p.color }}>{p.key}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{p.note}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Photos */}
      {step === 4 && (
        <div>
          <label style={{ fontWeight: 700, fontSize: 14, display: 'block', marginBottom: 4 }}>Upload Photos</label>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Help us identify the issue with clear photos</p>
          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              padding: isMobile ? '28px 12px' : '40px 0',
              border: '2px dashed var(--border)',
              borderRadius: 10,
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              background: '#fafbfc',
              textAlign: 'center'
            }}
          >
            <UploadCloud size={isMobile ? 26 : 30} />
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Click or Drag Images Here</div>
            <div style={{ fontSize: 12 }}>JPG, PNG up to 10MB each</div>
            <input type="file" accept="image/*" multiple hidden onChange={handlePhotoChange} />
          </label>
          {photos.length > 0 && (
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>{photos.length} photo(s) selected</p>
          )}
        </div>
      )}

      {/* Footer nav */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column-reverse' : 'row',
          justifyContent: 'flex-end',
          gap: 10,
          marginTop: 24,
          paddingTop: 18,
          borderTop: '1px solid var(--border)'
        }}
      >
        {step > 1 && (
          <button
            className="btn btn-outline"
            onClick={() => setStep(step - 1)}
            style={isMobile ? { width: '100%', justifyContent: 'center' } : undefined}
          >
            <ArrowLeft size={15} /> Back
          </button>
        )}
        {step < 4 && (
          <button
            className="btn btn-primary"
            disabled={!canGoNext}
            onClick={() => setStep(step + 1)}
            style={isMobile ? { width: '100%', justifyContent: 'center' } : undefined}
          >
            Next <ArrowRight size={15} />
          </button>
        )}
        {step === 4 && (
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
            style={isMobile ? { width: '100%', justifyContent: 'center' } : undefined}
          >
            <Send size={15} /> {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        )}
      </div>
    </Modal>
  );
}

// Small inline icon so Modal's header matches the "+  Report New Issue" style
function Plus22() {
  return (
    <span
      style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: 'var(--navy-800)',
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