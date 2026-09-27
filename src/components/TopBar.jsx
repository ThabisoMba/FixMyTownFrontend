import {
  RefreshCw
} from 'lucide-react';

import {
  useEffect,
  useState
} from 'react';

export default function TopBar({
  section,
  page,
  onRefresh,
  refreshing: refreshingProp
}) {
  const [time, setTime] = useState(
    new Date()
  );

  const [
    internalRefreshing,
    setInternalRefreshing
  ] = useState(false);

  const refreshing =
    typeof refreshingProp === 'boolean'
      ? refreshingProp
      : internalRefreshing;


  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);


  async function handleRefresh() {
    if (!onRefresh || refreshing) {
      return;
    }

    if (
      typeof refreshingProp !==
      'boolean'
    ) {
      setInternalRefreshing(true);
    }

    try {
      await onRefresh();
    } finally {
      if (
        typeof refreshingProp !==
        'boolean'
      ) {
        setTimeout(() => {
          setInternalRefreshing(false);
        }, 500);
      }
    }
  }


  return (
    <div
      className="portal-topbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,

        padding: '16px 28px',

        background: 'white',

        borderBottom:
          '1px solid var(--border)',

        position: 'sticky',
        top: 0,

        zIndex: 1000,

        width: '100%'
      }}
    >
      {/* ========================================================
          BREADCRUMB
      ======================================================== */}

      <div
        className="portal-topbar-breadcrumb"
        style={{
          minWidth: 0,

          fontSize: 14,

          color:
            'var(--text-secondary)',

          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        <span>
          {section}
        </span>

        <span
          style={{
            margin: '0 6px',
            color:
              'var(--text-muted)'
          }}
        >
          /
        </span>

        <span
          style={{
            color:
              'var(--text-primary)',

            fontWeight: 700
          }}
        >
          {page}
        </span>
      </div>


      {/* ========================================================
          ACTIONS
      ======================================================== */}

      <div
        className="portal-topbar-actions"
        style={{
          marginLeft: 'auto',

          display: 'flex',
          alignItems: 'center',
          gap: 12,

          flexShrink: 0
        }}
      >
        {/* CLOCK */}

        <div
          className="portal-topbar-clock"
          style={{
            fontSize: 13,

            color:
              'var(--text-secondary)',

            textAlign: 'right',

            lineHeight: 1.35
          }}
        >
          <div
            className="portal-topbar-date"
          >
            {time.toLocaleDateString(
              'en-ZA',
              {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }
            )}
          </div>

          <div
            style={{
              fontWeight: 700
            }}
          >
            {time.toLocaleTimeString(
              'en-ZA',
              {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              }
            )}
          </div>
        </div>


        {/* REFRESH */}

        {onRefresh && (
          <button
            type="button"
            className="btn btn-primary portal-topbar-refresh"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label={
              refreshing
                ? 'Refreshing'
                : 'Refresh'
            }
            style={{
              padding: '8px 14px',

              display: 'flex',
              alignItems: 'center',
              gap: 7
            }}
          >
            <RefreshCw
              size={14}
              style={{
                animation:
                  refreshing
                    ? 'portalSpin 1s linear infinite'
                    : 'none',

                flexShrink: 0
              }}
            />

            <span
              className="portal-topbar-refresh-label"
            >
              {refreshing
                ? 'Refreshing...'
                : 'Refresh'}
            </span>
          </button>
        )}
      </div>


      <style>
        {`
          @keyframes portalSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          /*
           * Mobile Admin / Worker layout has
           * a 58px portal navigation header.
           */
          @media (max-width: 900px) {
            .portal-topbar {
              top: 58px !important;

              padding:
                12px 16px !important;
            }
          }

          @media (max-width: 620px) {
            .portal-topbar {
              gap: 8px !important;
            }

            .portal-topbar-breadcrumb {
              font-size:
                12.5px !important;
            }

            .portal-topbar-date {
              display: none;
            }

            .portal-topbar-clock {
              font-size:
                12px !important;
            }

            .portal-topbar-refresh {
              width:
                36px !important;

              height:
                36px !important;

              padding:
                0 !important;

              border-radius:
                9px !important;
            }

            .portal-topbar-refresh-label {
              display: none;
            }
          }

          @media (max-width: 390px) {
            .portal-topbar {
              padding-left:
                12px !important;

              padding-right:
                12px !important;
            }

            .portal-topbar-clock {
              display: none;
            }
          }
        `}
      </style>
    </div>
  );
}