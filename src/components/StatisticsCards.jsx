import {
  useEffect,
  useState
} from "react";

import {
  FileText,
  CheckCircle,
  Clock3,
  TrendingUp
} from "lucide-react";

import api from "../api/api";

const EMPTY_STATS = {
  totalReports: 0,
  reported: 0,
  assigned: 0,
  inProgress: 0,
  resolved: 0
};

function safeNumber(value) {
  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : 0;
}

function normalizeStatistics(
  data
) {
  const source =
    data?.stats ??
    data?.data ??
    data ??
    {};

  return {
    totalReports:
      safeNumber(
        source.totalReports ??
          source.TotalReports
      ),

    reported:
      safeNumber(
        source.reported ??
          source.Reported
      ),

    assigned:
      safeNumber(
        source.assigned ??
          source.Assigned
      ),

    inProgress:
      safeNumber(
        source.inProgress ??
          source.InProgress ??
          source.inprogress
      ),

    resolved:
      safeNumber(
        source.resolved ??
          source.Resolved
      )
  };
}

export default function StatisticsCards() {
  const [
    stats,
    setStats
  ] = useState(
    EMPTY_STATS
  );

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");

  useEffect(() => {
    let active = true;

    async function loadStatistics() {
      try {
        setError("");

        const {
          data
        } =
          await api.get(
            "/issues/public-stats"
          );

        if (!active) {
          return;
        }

        setStats(
          normalizeStatistics(
            data
          )
        );
      } catch (err) {
        console.error(
          "Failed to load public statistics:",
          err
        );

        if (!active) {
          return;
        }

        /*
         * Keep safe zero values rather than
         * allowing a failed/malformed API
         * response to crash the landing page.
         */
        setStats(
          EMPTY_STATS
        );

        setError(
          "Live statistics are temporarily unavailable."
        );
      } finally {
        if (active) {
          setLoading(
            false
          );
        }
      }
    }

    loadStatistics();

    const interval =
      window.setInterval(
        loadStatistics,
        30000
      );

    return () => {
      active = false;

      window.clearInterval(
        interval
      );
    };
  }, []);

  const totalReports =
    safeNumber(
      stats.totalReports
    );

  const resolved =
    safeNumber(
      stats.resolved
    );

  const completionRate =
    totalReports > 0
      ? (
          (resolved /
            totalReports) *
          100
        ).toFixed(1)
      : "0.0";

  const openIssues =
    Math.max(
      0,
      totalReports -
        resolved
    );

  if (loading) {
    return (
      <section className="statistics-section">
        <div className="section-container">
          <div className="section-title">
            <h2>
              Municipal
              Performance
            </h2>

            <p>
              Loading live
              municipal
              statistics...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="statistics"
      className="statistics-section"
    >
      <div className="section-container">
        <div className="section-title">
          <h2>
            Municipal Performance
          </h2>

          <p>
            Live statistics
            showing community
            engagement and
            municipal service
            delivery.
          </p>
        </div>

        {error && (
          <div
            style={{
              margin:
                "0 auto 18px",
              maxWidth: 620,
              padding:
                "10px 14px",
              borderRadius: 8,
              background:
                "#fff7ed",
              border:
                "1px solid #fed7aa",
              color:
                "#9a3412",
              fontSize: 12,
              textAlign:
                "center"
            }}
          >
            {error}
          </div>
        )}

        <div className="statistics-grid">
          <div className="stat-card">
            <FileText
              size={34}
            />

            <h3>
              {totalReports.toLocaleString()}
            </h3>

            <p>
              Reports Submitted
            </p>
          </div>

          <div className="stat-card">
            <CheckCircle
              size={34}
            />

            <h3>
              {resolved.toLocaleString()}
            </h3>

            <p>
              Resolved Issues
            </p>
          </div>

          <div className="stat-card">
            <TrendingUp
              size={34}
            />

            <h3>
              {completionRate}%
            </h3>

            <p>
              Completion Rate
            </p>
          </div>

          <div className="stat-card">
            <Clock3
              size={34}
            />

            <h3>
              {openIssues.toLocaleString()}
            </h3>

            <p>
              Open Issues
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}