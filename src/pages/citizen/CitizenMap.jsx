/**
 * CitizenMap.jsx
 * --------------
 * Recreates the "Citizen Landing Page" slide with a REAL map this
 * time: react-leaflet + OpenStreetMap tiles (free, no API key
 * needed - same attribution the prototype slides show in the
 * bottom-right corner: "Leaflet | © OpenStreetMap").
 *
 * - Every open issue is shown as a colored dot (color = status).
 * - Clicking anywhere on the map opens the Report Wizard with that
 *   exact lat/lng already pinned on Step 1.
 */

import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { MapPinned, Hand } from 'lucide-react';
import api from '../../api/api';
import '../../components/leafletIcons'; // fixes Leaflet's default marker icon under Vite
import { coloredDotIcon } from '../../components/leafletIcons';

const STATUS_COLOR = {
  Reported: '#e70707',     // red
  Assigned: '#87724e',     // amber
  'In Progress': '#ea9707',
  Resolved: '#00a33c'      // green
};

// South Africa's rough geographic center - a sensible default view
// before we know the citizen's actual location.
const DEFAULT_CENTER = [-28.4793, 24.6727];
const DEFAULT_ZOOM = 5;

/** Small internal component: react-leaflet requires map click handlers
 *  to live INSIDE the <MapContainer>, wired up via this hook. */
function ClickToReport({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    }
  });
  return null;
}

export default function CitizenMap() {
  const { openWizard } = useOutletContext();
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    api.get('/issues/map').then((res) => setIssues(res.data)).catch(() => {});
  }, []);

  function handleMapClick(latlng) {
    openWizard({
      lat: latlng.lat.toFixed(6),
      lng: latlng.lng.toFixed(6),
      name: 'Locating...'
    });
  }

  return (
    <div className="card" style={{ maxWidth: 1100, margin: '0 auto', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
          <MapPinned size={18} /> Municipal Issue Map
        </div>
      </div>

      <div style={{ height: 480, position: 'relative' }}>
        <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ClickToReport onPick={handleMapClick} />

          {issues.map((issue) => (
            <Marker
              key={issue.ReportID}
              position={[Number(issue.Latitude), Number(issue.Longitude)]}
              icon={coloredDotIcon(STATUS_COLOR[issue.Status] || '#2f6fed')}
            >
              <Popup>
                <strong>{issue.Title}</strong>
                <br />
                {issue.CategoryName} &bull; {issue.Status}
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--navy-900)',
            color: 'white',
            padding: '10px 18px',
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            whiteSpace: 'nowrap',
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          <Hand size={15} /> Click anywhere on the map to report an issue
        </div>
      </div>
    </div>
  );
}
