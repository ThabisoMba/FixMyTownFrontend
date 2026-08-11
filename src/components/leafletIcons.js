/**
 * leafletIcons.js
 * ---------------
 * Leaflet's default marker icon relies on relative image paths that
 * don't survive being bundled by Vite (or webpack) - the icon just
 * silently fails to show up. The standard fix is to override the
 * default icon URLs to point at the CDN copies instead.
 *
 * Import this ONCE, anywhere before you render a Leaflet map
 * (CitizenMap.jsx and ReportWizard.jsx both import it).
 */

import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

/** A small colored dot icon, used for status-coded pins on the issue map (see CitizenMap.jsx) */
export function coloredDotIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 16px; height: 16px; border-radius: 50%;
      background: ${color}; border: 2px solid white;
      box-shadow: 0 1px 4px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
}
