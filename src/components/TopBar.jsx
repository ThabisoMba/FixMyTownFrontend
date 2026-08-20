import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

export default function TopBar({
  section,
  page,
  onRefresh
}) {
  const [time, setTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRefresh = async () => {
    if (!onRefresh || refreshing) {
      return;
    }

    setRefreshing(true);

    try {
      await onRefresh();
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 700);
    }
  };

  return (
    <>
      <div
        className="top-bar"
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 28px",
          background: "white",
          borderBottom: "1px solid var(--border)",

          position: "sticky",
          top: 0,
          zIndex: 1000,

          width: "100%",
          boxSizing: "border-box"
        }}
      >
        {/* Breadcrumb */}
        <div
          style={{
            fontSize: 14,
            color: "var(--text-secondary)"
          }}
        >
          {section}

          <span
            style={{
              margin: "0 6px",
              color: "var(--text-muted)"
            }}
          >
            /
          </span>

          <span
            style={{
              color: "var(--text-primary)",
              fontWeight: 600
            }}
          >
            {page}
          </span>
        </div>

        {/* Actions */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 14
          }}
        >
          {/* Current Date + Time */}
          <div
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              textAlign: "right"
            }}
          >
            <div>
              {time.toLocaleDateString("en-ZA", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric"
              })}
            </div>

            <div
              style={{
                fontWeight: 600
              }}
            >
              {time.toLocaleTimeString("en-ZA", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
              })}
            </div>
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              className="btn btn-primary"
              style={{
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: 7
              }}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                size={14}
                style={{
                  animation: refreshing
                    ? "spin 1s linear infinite"
                    : "none"
                }}
              />

              {refreshing
                ? "Refreshing System..."
                : "Refresh"}
            </button>
          )}
        </div>

        {/* =====================================================
            EXISTING REFRESH ANIMATION + MOBILE NAVIGATION
        ===================================================== */}

        <style>
          {`
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }

            /* =================================================
               MOBILE NAVIGATION LINKS
               ================================================= */

            @media (max-width: 767px) {
              .mobile-menu a,
              .mobile-nav a,
              .hamburger-menu a,
              .nav-menu a,
              .mobile-navigation a {
                color: var(--gold-500) !important;
                text-decoration: none !important;
              }

              .mobile-menu a:visited,
              .mobile-nav a:visited,
              .hamburger-menu a:visited,
              .nav-menu a:visited,
              .mobile-navigation a:visited {
                color: var(--gold-500) !important;
                text-decoration: none !important;
              }

              .mobile-menu a:hover,
              .mobile-nav a:hover,
              .hamburger-menu a:hover,
              .nav-menu a:hover,
              .mobile-navigation a:hover {
                color: var(--gold-500) !important;
                text-decoration: none !important;
              }

              .mobile-menu a:active,
              .mobile-nav a:active,
              .hamburger-menu a:active,
              .nav-menu a:active,
              .mobile-navigation a:active {
                color: var(--gold-500) !important;
                text-decoration: none !important;
              }
            }
          `}
        </style>
      </div>
    </>
  );
}