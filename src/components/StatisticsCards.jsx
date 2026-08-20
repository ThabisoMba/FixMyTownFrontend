import { useEffect, useState } from "react";
import {
  FileText,
  CheckCircle,
  Clock3,
  TrendingUp
} from "lucide-react";
import api from "../api/api";

export default function StatisticsCards() {
  const [stats, setStats] = useState({
    TotalReports: 0,
    Reported: 0,
    Assigned: 0,
    InProgress: 0,
    Resolved: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();

    const interval = setInterval(loadStatistics, 30000);

    return () => clearInterval(interval);
  }, []);

  async function loadStatistics() {
    try {
      const { data } = await api.get("/issues/public-stats");

      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const completionRate =
    stats.TotalReports > 0
      ? ((stats.Resolved / stats.TotalReports) * 100).toFixed(1)
      : 0;

  const openIssues =
    stats.TotalReports - stats.Resolved;

  if (loading) {
    return (
      <section className="statistics-section">
        <div className="section-container">
          <h2>Loading municipal statistics...</h2>
        </div>
      </section>
    );
  }

  return (
    <section id="statistics" className="statistics-section">

      <div className="section-container">

        <div className="section-title">
          <h2>Municipal Performance</h2>

          <p>
            Live statistics showing community engagement and municipal
            service delivery.
          </p>
        </div>

        <div className="statistics-grid">

          <div className="stat-card">
            <FileText size={34} />
            <h3>{stats.TotalReports.toLocaleString()}</h3>
            <p>Reports Submitted</p>
          </div>

          <div className="stat-card">
            <CheckCircle size={34} />
            <h3>{stats.Resolved.toLocaleString()}</h3>
            <p>Resolved Issues</p>
          </div>

          <div className="stat-card">
            <TrendingUp size={34} />
            <h3>{completionRate}%</h3>
            <p>Completion Rate</p>
          </div>

          <div className="stat-card">
            <Clock3 size={34} />
            <h3>{openIssues.toLocaleString()}</h3>
            <p>Open Issues</p>
          </div>

        </div>

      </div>

    </section>
  );
}