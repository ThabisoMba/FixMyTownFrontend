import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  ZoomControl,
  useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../api/api";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function FitBounds({ issues }) {
  const map = useMap();

  useEffect(() => {
    if (!issues.length) return;

    const bounds = L.latLngBounds(
      issues.map((issue) => [issue.latitude, issue.longitude])
    );

    map.fitBounds(bounds, {
      padding: [80, 80],
      maxZoom: 15,
    });
  }, [issues, map]);

  return null;
}

export default function PublicMap() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadIssues() {
    try {
      const { data } = await api.get("/issues/map");
      setIssues(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load public map", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIssues();

    const timer = setInterval(loadIssues, 30000);

    return () => clearInterval(timer);
  }, []);

  const markers = useMemo(() => {
    return issues.filter(
      (issue) =>
        issue.latitude != null &&
        issue.longitude != null &&
        !isNaN(issue.latitude) &&
        !isNaN(issue.longitude)
    );
  }, [issues]);

  function getMarkerColor(status) {
    switch (status) {
      case "Assigned":
        return "#f59e0b";

      case "In Progress":
      case "InProgress":
        return "#2563eb";

      case "Resolved":
        return "#16a34a";

      default:
        return "#dc2626";
    }
  }

  function getStatusClass(status) {
    switch (status) {
      case "Assigned":
        return "assigned";

      case "In Progress":
      case "InProgress":
        return "progress";

      case "Resolved":
        return "resolved";

      default:
        return "reported";
    }
  }

  if (loading) {
    return (
      <div className="map-loading">
        <div className="loading-spinner"></div>
        <h3>Loading Municipal Map...</h3>
      </div>
    );
  }

  return (
    <MapContainer
      center={[-33.96, 25.60]}
      zoom={12}
      zoomControl={false}
      scrollWheelZoom
      className="landing-map"
    >
      <ZoomControl position="bottomright" />

      <TileLayer
        attribution="&copy; OpenStreetMap Contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds issues={markers} />

      {markers.map((issue) => (
        <CircleMarker
          key={issue.reportID}
          center={[issue.latitude, issue.longitude]}
          radius={10}
          color={getMarkerColor(issue.status)}
          fillColor={getMarkerColor(issue.status)}
          fillOpacity={0.95}
          weight={3}
        >
          <Popup className="landing-popup">
            <div className="popup-card">
              <h3>{issue.title}</h3>

              <p>{issue.description}</p>

              <hr />

              <div className="popup-row">
                <span>Reference</span>
                <strong>{issue.reportCode}</strong>
              </div>

              <div className="popup-row">
                <span>Category</span>
                <strong>{issue.categoryName}</strong>
              </div>

              <div className="popup-row">
                <span>Status</span>

                <span
                  className={`status-badge ${getStatusClass(issue.status)}`}
                >
                  {issue.status}
                </span>
              </div>

              <div className="popup-row">
                <span>Priority</span>
                <strong>{issue.priority}</strong>
              </div>

              <div className="popup-row">
                <span>Location</span>
                <strong>{issue.locationName}</strong>
              </div>

              <div className="popup-row">
                <span>Reported</span>
                <strong>
                  {issue.createdAt
                    ? new Date(issue.createdAt).toLocaleDateString()
                    : "N/A"}
                </strong>
              </div>

              <button className="popup-btn">
                View Details
              </button>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}