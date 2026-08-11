import { useEffect, useState } from "react";
import { Clock3, MapPin, ArrowRight } from "lucide-react";
import api from "../api/api";

export default function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentActivity();

    const interval = setInterval(loadRecentActivity, 30000);

    return () => clearInterval(interval);
  }, []);

  async function loadRecentActivity() {
    try {
      const { data } = await api.get("/issues/recent");
      setActivities(data);
    } catch (err) {
      console.error("Failed to load recent activity:", err);
    } finally {
      setLoading(false);
    }
  }

  function timeAgo(dateString) {
    if (!dateString) return "Just now";

    const created = new Date(dateString);

    if (isNaN(created.getTime())) {
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
        return "assigned";

      case "InProgress":
        return "assigned";

      case "Resolved":
        return "resolved";

      default:
        return "reported";
    }
  }

  if (loading) {
    return (
      <section className="recent-section">
        <div className="section-container">
          <h2>Recent Community Activity</h2>
          <p>Loading latest municipal reports...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="recent-section">
      <div className="section-container">

        <h2>Recent Community Activity</h2>

        <p>
          Latest publicly visible service requests across the municipality.
        </p>

        <div className="activity-grid">
          {activities.length === 0 ? (
            <div className="activity-card">
              <h3>No recent reports available.</h3>
            </div>
          ) : (
            activities.map((item) => (
              <div
                className="activity-card"
                key={item.ReportId}
              >
                <div className="activity-top">

                  <span
                    className={`status ${statusClass(item.Status)}`}
                  >
                    {item.Status}
                  </span>

                  <span className="activity-id">
                    {item.ReferenceNumber}
                  </span>

                </div>

                <h3>{item.Title}</h3>

                <div className="activity-location">
                  <MapPin size={15} />
                  {item.Location}
                </div>

                <div
                  style={{
                    marginTop: 10,
                    color: "#64748b",
                    fontSize: 13,
                  }}
                >
                  {item.Category} • {item.Priority}
                </div>

                <div className="activity-footer">

                  <div className="activity-time">
                    <Clock3 size={15} />
                    {timeAgo(item.CreatedAt)}
                  </div>

                  <button className="view-btn">
                    View
                    <ArrowRight size={15} />
                  </button>

                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </section>
  );
}