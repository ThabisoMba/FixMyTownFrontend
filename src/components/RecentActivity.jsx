import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock3,
  MapPin,
  ArrowRight,
  LocateFixed,
  AlertTriangle,
  X,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import api from "../api/api";
import { distanceKm, getUserLocation } from "../utils/geo";
import { formatSADateTime } from "../utils/dateUtils";

const RADIUS_KM = 10;
const PREVIEW_COUNT = 6;

const API_ORIGIN = `${window.location.origin}${(
  import.meta.env.BASE_URL || "/"
).replace(/\/$/, "")}`;

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.$values)) return value.$values;
  if (Array.isArray(value?.items)) return value.items;
  return [];
}

export default function RecentActivity({
  showAll = false,
  authenticated = false,
  title = "Recent Community Activity",
  promptLocation = false,
}) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState(
    promptLocation ? "idle" : "checking"
  );
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (promptLocation) return;
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptLocation]);

  useEffect(() => {
    loadRecentActivity();

    const interval = setInterval(loadRecentActivity, 30000);
    return () => clearInterval(interval);
  }, []);

  async function requestLocation() {
    setLocationStatus("checking");

    try {
      const loc = await getUserLocation();
      setUserLocation(loc);
      setLocationStatus(loc ? "found" : "denied");
    } catch {
      setUserLocation(null);
      setLocationStatus("denied");
    }
  }

  async function loadRecentActivity() {
    try {
      const { data } = await api.get("/issues/recent");
      setActivities(asArray(data));
    } catch (err) {
      console.error("Failed to load recent activity:", err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }

  function timeAgo(dateString) {
    if (!dateString) return "Just now";

    const created = new Date(dateString);

    if (Number.isNaN(created.getTime())) {
      return "Just now";
    }

    const seconds = Math.floor((Date.now() - created.getTime()) / 1000);

    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    }

    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? "s" : ""} ago`;
  }

  function statusClass(status) {
    switch (status) {
      case "Reported":
        return "reported";
      case "Assigned":
      case "InProgress":
      case "In Progress":
        return "assigned";
      case "Resolved":
        return "resolved";
      default:
        return "reported";
    }
  }

  function handleViewClick(item) {
    if (authenticated) {
      setSelectedIssue(item);
      return;
    }

    setShowLoginModal(true);
  }

  function goToLogin() {
    navigate("/login");
  }

  let visibleActivities = asArray(activities);

  if (userLocation) {
    visibleActivities = visibleActivities
      .map((item) => ({
        ...item,
        _distance: distanceKm(
          userLocation.lat,
          userLocation.lng,
          item.Latitude,
          item.Longitude
        ),
      }))
      .filter(
        (item) =>
          item._distance == null || item._distance <= RADIUS_KM
      )
      .sort(
        (a, b) =>
          (a._distance ?? Infinity) - (b._distance ?? Infinity)
      );
  }

  if (!showAll) {
    visibleActivities = visibleActivities.slice(0, PREVIEW_COUNT);
  }

  if (loading) {
    return (
      <section className="recent-section">
        <div className="section-container">
          <h2>{title}</h2>
          <p>Loading latest municipal reports...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="recent-section">
      <div
        className="section-container"
        style={{ borderRadius: "5px" }}
      >
        <h2>{title}</h2>

        <p>
          {locationStatus === "found"
            ? `Reports within ${RADIUS_KM}km of your location.`
            : "Latest publicly visible service requests across the municipality."}
        </p>

        {locationStatus === "denied" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: "clamp(12px, 3vw, 13px)",
              color: "#8a5a12",
              background: "#fdf3dd",
              border: "1px solid #f3d9a8",
              borderRadius: 8,
              padding: "10px clamp(10px, 3vw, 14px)",
              margin: "12px 0",
              flexWrap: "wrap",
            }}
          >
            <LocateFixed size={15} style={{ flexShrink: 0 }} />
            Enable location access in your browser to see reports near you.
          </div>
        )}

        <div className="activity-grid">
          {visibleActivities.length === 0 ? (
            <div className="activity-card">
              <h3>
                {locationStatus === "found"
                  ? `No recent reports within ${RADIUS_KM}km of you.`
                  : "No recent reports available."}
              </h3>
            </div>
          ) : (
            visibleActivities.map((item, index) => (
              <div
                className="activity-card"
                key={
                  item.ReportId ??
                  item.ReportID ??
                  item.ReferenceNumber ??
                  index
                }
              >
                <div
                  className="activity-top"
                  style={{ flexWrap: "wrap", gap: 8 }}
                >
                  <span
                    className={`status ${statusClass(item.Status)}`}
                  >
                    {item.Status}
                  </span>

                  <span className="activity-id">
                    {item.ReferenceNumber}
                  </span>
                </div>

                <h3 style={{ wordBreak: "break-word" }}>
                  {item.Title}
                </h3>

                <div
                  className="activity-location"
                  style={{ flexWrap: "wrap" }}
                >
                  <MapPin size={15} style={{ flexShrink: 0 }} />

                  <span style={{ wordBreak: "break-word" }}>
                    {item.Location}
                  </span>

                  {item._distance != null && (
                    <span
                      style={{
                        marginLeft: 6,
                        color: "#94a3b8",
                      }}
                    >
                      •{" "}
                      {item._distance < 1
                        ? "<1km"
                        : `${Math.round(item._distance)}km away`}
                    </span>
                  )}
                </div>

                <div
                  style={{
                    marginTop: 10,
                    color: "#64748b",
                    fontSize: 13,
                    wordBreak: "break-word",
                  }}
                >
                  {item.Category} • {item.Priority}
                </div>

                <div
                  className="activity-footer"
                  style={{ flexWrap: "wrap", gap: 10 }}
                >
                  <div className="activity-time">
                    <Clock3 size={15} style={{ flexShrink: 0 }} />
                    {timeAgo(item.CreatedAt)}
                  </div>

                  <button
                    className="view-btn"
                    onClick={() => handleViewClick(item)}
                  >
                    View
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showLoginModal && (
        <LoginPromptModal
          onClose={() => setShowLoginModal(false)}
          onContinue={goToLogin}
        />
      )}

      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </section>
  );
}

function statusBadgeStyle(status) {
  const map = {
    Reported: { bg: "#fef3c7", color: "#92400e" },
    Assigned: { bg: "#dbeafe", color: "#1e40af" },
    InProgress: { bg: "#dbeafe", color: "#1e40af" },
    "In Progress": { bg: "#dbeafe", color: "#1e40af" },
    Resolved: { bg: "#dcfce7", color: "#166534" },
  };

  const c = map[status] || {
    bg: "#f1f5f9",
    color: "#475569",
  };

  return {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 11.5,
    fontWeight: 700,
    background: c.bg,
    color: c.color,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  };
}

function priorityBadgeStyle(priority) {
  const map = {
    Low: { bg: "#f1f5f9", color: "#475569" },
    Medium: { bg: "#fef3c7", color: "#92400e" },
    High: { bg: "#ffedd5", color: "#9a3412" },
    Critical: { bg: "#fee2e2", color: "#991b1b" },
  };

  const c = map[priority] || {
    bg: "#f1f5f9",
    color: "#475569",
  };

  return {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 11.5,
    fontWeight: 700,
    background: c.bg,
    color: c.color,
    textTransform: "capitalize",
  };
}

const categoryBadgeStyle = {
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 11.5,
  fontWeight: 700,
  background: "#ede9fe",
  color: "#5b21b6",
};

function getPhotoUrl(photo) {
  if (!photo) return "";

  if (photo.startsWith("http://") || photo.startsWith("https://")) {
    return photo;
  }

  return `${API_ORIGIN}${photo.startsWith("/") ? "" : "/"}${photo}`;
}

function IssueDetailModal({ issue, onClose }) {
  const [photoIndex, setPhotoIndex] = useState(0);

  const photos = asArray(issue?.Photos);

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape") onClose();

      if (e.key === "ArrowLeft" && photos.length > 1) {
        setPhotoIndex((i) =>
          i === 0 ? photos.length - 1 : i - 1
        );
      }

      if (e.key === "ArrowRight" && photos.length > 1) {
        setPhotoIndex((i) =>
          i === photos.length - 1 ? 0 : i + 1
        );
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () =>
      document.removeEventListener("keydown", handleEscape);
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
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(10px, 4vw, 20px)",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Issue details"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "white",
          borderRadius: 14,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          padding: "clamp(16px, 5vw, 24px)",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          title="Close"
          style={{
            position: "absolute",
            top: "clamp(10px, 3vw, 16px)",
            right: "clamp(10px, 3vw, 16px)",
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            color: "#475569",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 2,
          }}
        >
          <X size={17} />
        </button>

        <div
          style={{
            paddingRight: "clamp(30px, 10vw, 40px)",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#94a3b8",
              textTransform: "uppercase",
              marginBottom: 5,
            }}
          >
            #{issue.ReferenceNumber}
          </div>

          <h3
            style={{
              margin: 0,
              fontSize: "clamp(16px, 4.5vw, 19px)",
              fontWeight: 700,
              color: "#1e293b",
              wordBreak: "break-word",
            }}
          >
            {issue.Title}
          </h3>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              fontSize: 13.5,
              color: "#475569",
            }}
          >
            <MapPin
              size={16}
              color="#94a3b8"
              style={{ flexShrink: 0, marginTop: 1 }}
            />

            <span style={{ wordBreak: "break-word" }}>
              {issue.Location || "Location not specified"}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13.5,
              color: "#475569",
            }}
          >
            <Clock3
              size={16}
              color="#94a3b8"
              style={{ flexShrink: 0 }}
            />
            {formatSADateTime(issue.CreatedAt)}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 18,
          }}
        >
          {issue.Status && (
            <span style={statusBadgeStyle(issue.Status)}>
              {issue.Status}
            </span>
          )}

          {issue.Priority && (
            <span style={priorityBadgeStyle(issue.Priority)}>
              {issue.Priority} priority
            </span>
          )}

          {issue.Category && (
            <span style={categoryBadgeStyle}>{issue.Category}</span>
          )}
        </div>

        {issue.Description && (
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#64748b",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Description
            </div>

            <p
              style={{
                margin: 0,
                fontSize: 13.5,
                color: "#475569",
                lineHeight: 1.5,
                wordBreak: "break-word",
              }}
            >
              {issue.Description}
            </p>
          </div>
        )}

        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 10,
              color: "#64748b",
              textTransform: "uppercase",
            }}
          >
            <ImageIcon size={14} />
            <span>Photos</span>
            {photos.length > 0 && <span>({photos.length})</span>}
          </div>

          {photos.length === 0 ? (
            <div
              style={{
                padding: 20,
                textAlign: "center",
                border: "1px dashed #e2e8f0",
                borderRadius: 10,
                color: "#94a3b8",
                fontSize: 13,
              }}
            >
              No photos attached to this report.
            </div>
          ) : (
            <div>
              <div
                style={{
                  position: "relative",
                  borderRadius: 10,
                  overflow: "hidden",
                  background: "#f1f5f9",
                  marginBottom: photos.length > 1 ? 10 : 0,
                }}
              >
                <img
                  src={getPhotoUrl(photos[photoIndex])}
                  alt={`Report photo ${photoIndex + 1}`}
                  style={{
                    width: "100%",
                    height: "clamp(160px, 45vw, 260px)",
                    objectFit: "cover",
                    display: "block",
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />

                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setPhotoIndex((i) =>
                          i === 0 ? photos.length - 1 : i - 1
                        )
                      }
                      style={{
                        position: "absolute",
                        left: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        border: "none",
                        background: "rgba(255,255,255,0.9)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <button
                      onClick={() =>
                        setPhotoIndex((i) =>
                          i === photos.length - 1 ? 0 : i + 1
                        )
                      }
                      style={{
                        position: "absolute",
                        right: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        border: "none",
                        background: "rgba(255,255,255,0.9)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <ChevronRight size={18} />
                    </button>

                    <span
                      style={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        background: "rgba(0,0,0,0.6)",
                        color: "white",
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 6,
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
                    display: "flex",
                    gap: 8,
                    overflowX: "auto",
                    padding: "2px 0",
                  }}
                >
                  {photos.map((photo, i) => (
                    <button
                      key={`${photo}-${i}`}
                      onClick={() => setPhotoIndex(i)}
                      style={{
                        width: "clamp(46px, 14vw, 56px)",
                        height: "clamp(36px, 11vw, 44px)",
                        flexShrink: 0,
                        padding: 0,
                        borderRadius: 6,
                        overflow: "hidden",
                        cursor: "pointer",
                        border:
                          i === photoIndex
                            ? "2px solid var(--navy-800, #1e293b)"
                            : "2px solid transparent",
                      }}
                    >
                      <img
                        src={getPhotoUrl(photo)}
                        alt={`Thumbnail ${i + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
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

function LoginPromptModal({ onClose, onContinue }) {
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);

    return () =>
      document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(10px, 4vw, 20px)",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Login required"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 360,
          background: "white",
          borderRadius: 14,
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          padding:
            "clamp(20px, 6vw, 28px) clamp(16px, 5vw, 24px) clamp(16px, 5vw, 22px)",
          textAlign: "center",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          title="Close"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 30,
            height: 30,
            borderRadius: "50%",
            border: "none",
            background: "#fdecec",
            color: "#c0362c",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <X size={16} />
        </button>

        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "#fdecec",
            border: "1px solid #f8c9c4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <AlertTriangle size={24} color="#c0362c" />
        </div>

        <h3
          style={{
            margin: "0 0 8px",
            fontSize: 16,
            fontWeight: 700,
            color: "#1e293b",
          }}
        >
          Login Required
        </h3>

        <p
          style={{
            margin: "0 0 22px",
            fontSize: 13.5,
            color: "#64748b",
            lineHeight: 1.5,
          }}
        >
          Login to view issue.
        </p>

        <button
          onClick={onContinue}
          style={{
            width: "100%",
            padding: "11px 0",
            borderRadius: 8,
            border: "none",
            background: "#c0362c",
            color: "white",
            fontWeight: 700,
            fontSize: 13.5,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          Continue to Login
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
