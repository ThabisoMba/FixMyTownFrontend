import {
  useEffect,
  useState
} from 'react';

import {
  useOutletContext
} from 'react-router-dom';

import {
  Flag,
  Loader,
  CheckCircle2,
  Clock,
  HelpCircle,
  Lightbulb,
  CheckCircle,
  Plus,
  AlertTriangle
} from 'lucide-react';

import api from '../../api/api';

import PageTransition from '../../components/PageTransition';

import RecentActivity from '../../components/RecentActivity';

export default function CitizenDashboard() {
  const {
    openWizard
  } = useOutletContext();

  const [stats, setStats] =
    useState(null);

  const [
    statsError,
    setStatsError
  ] = useState('');


  /* ============================================================
     LOAD PUBLIC STATS
  ============================================================ */

  useEffect(() => {
    let active = true;

    api
      .get('/issues/public-stats')
      .then((res) => {
        if (!active) {
          return;
        }

        setStats({
          totalReports:
            res.data.TotalReports,

          inProgress:
            res.data.InProgress,

          resolved:
            res.data.Resolved,

          newToday:
            res.data.NewToday
        });
      })
      .catch((err) => {
        console.error(
          'Error fetching stats:',
          err
        );

        if (active) {
          setStatsError(
            'Community statistics are temporarily unavailable.'
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);


  const steps = [
    {
      num: 1,

      title: 'Report',

      text:
        'Choose the issue location, describe the problem and add supporting photos.'
    },

    {
      num: 2,

      title: 'Track',

      text:
        "Follow your report's progress and see when it is assigned or being worked on."
    },

    {
      num: 3,

      title: 'Get Notified',

      text:
        'Receive updates when the status changes without needing to call the municipality.'
    },

    {
      num: 4,

      title: 'See Results',

      text:
        'Resolved reports help show where community service delivery has improved.'
    }
  ];


  const tips = [
    {
      title: 'Be specific',

      text:
        'Describe exactly where the issue is, including a nearby landmark when possible.'
    },

    {
      title: 'Add photos',

      text:
        'Clear photos help municipal workers understand the problem before arriving.'
    },

    {
      title:
        'Choose the right category',

      text:
        'The correct category helps route your report to the appropriate department.'
    },

    {
      title:
        'Set the priority carefully',

      text:
        'Use critical priority for urgent safety hazards rather than ordinary service requests.'
    }
  ];


  return (
    <PageTransition>
      <div
        className="citizen-dashboard"
      >
        {/* =====================================================
            WELCOME
        ===================================================== */}

        <section
          className="citizen-dashboard-welcome card"
        >
          <div>
            <div
              className="citizen-dashboard-eyebrow"
            >
              Citizen Dashboard
            </div>

            <h1>
              Your community at a glance
            </h1>

            <p>
              Browse nearby reports,
              understand the reporting
              process and submit a new
              municipal issue when needed.
            </p>
          </div>


          <button
            type="button"
            className="btn btn-gold citizen-dashboard-report-button"
            onClick={() =>
              openWizard()
            }
          >
            <Plus size={16} />

            Report an Issue
          </button>
        </section>


        {/* =====================================================
            COMMUNITY ACTIVITY
        ===================================================== */}

        <div
          className="citizen-dashboard-activity"
        >
          <RecentActivity
            showAll={true}
            authenticated={true}
            title="Issues reported near you"
            promptLocation={false}
          />
        </div>


        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}

        <section
          className="card citizen-dashboard-section"
        >
          <div
            className="citizen-dashboard-section-title"
          >
            <HelpCircle
              size={18}
              color="var(--navy-800)"
            />

            How It Works
          </div>


          <div
            className="citizen-dashboard-steps"
          >
            {steps.map((step) => (
              <article
                key={step.num}
                className="citizen-step-card"
              >
                <div
                  className="citizen-step-number"
                >
                  {step.num}
                </div>

                <div
                  className="citizen-step-copy"
                >
                  <strong>
                    {step.title}
                  </strong>

                  <p>
                    {step.text}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>


        {/* =====================================================
            STATS ERROR
        ===================================================== */}

        {statsError && (
          <div
            className="citizen-dashboard-alert"
          >
            <AlertTriangle
              size={16}
            />

            {statsError}
          </div>
        )}


        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <section
          className="citizen-dashboard-stats"
          aria-label="Community report statistics"
        >
          <StatCard
            icon={
              <Flag size={20} />
            }
            value={
              stats?.totalReports ??
              '—'
            }
            label="Total Reports"
            color="#2f6fed"
          />

          <StatCard
            icon={
              <Loader size={20} />
            }
            value={
              stats?.inProgress ??
              '—'
            }
            label="In Progress"
            color="#f2a93d"
          />

          <StatCard
            icon={
              <CheckCircle2
                size={20}
              />
            }
            value={
              stats?.resolved ??
              '—'
            }
            label="Resolved"
            color="#22c55e"
          />

          <StatCard
            icon={
              <Clock size={20} />
            }
            value={
              stats?.newToday ??
              '—'
            }
            label="New Today"
            color="#9333ea"
          />
        </section>


        {/* =====================================================
            TIPS
        ===================================================== */}

        <section
          className="card citizen-dashboard-section"
        >
          <div
            className="citizen-dashboard-section-title"
          >
            <Lightbulb
              size={18}
              color="var(--gold-500)"
            />

            Tips for a Great Report
          </div>


          <div
            className="citizen-dashboard-tips"
          >
            {tips.map((tip) => (
              <article
                key={tip.title}
                className="citizen-tip"
              >
                <CheckCircle
                  size={16}
                  color="var(--gold-500)"
                />

                <div>
                  <strong>
                    {tip.title}
                  </strong>

                  <p>
                    {tip.text}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>


        {/* =====================================================
            RESPONSIVE STYLES
        ===================================================== */}

        <style>
          {`
            .citizen-dashboard {
              width: 100%;

              max-width: 1180px;

              margin: 0 auto;

              display: flex;

              flex-direction: column;

              gap: 20px;
            }


            .citizen-dashboard-welcome {
              display: flex;

              align-items: center;

              justify-content:
                space-between;

              gap: 24px;

              padding: 24px;

              background:
                linear-gradient(
                  135deg,
                  var(--navy-800),
                  var(--navy-700)
                );

              color: white;

              overflow: hidden;
            }


            .citizen-dashboard-eyebrow {
              color:
                var(--gold-500);

              font-size: 11px;

              font-weight: 800;

              letter-spacing: 0.8px;

              text-transform:
                uppercase;

              margin-bottom: 6px;
            }


            .citizen-dashboard-welcome h1 {
              margin: 0;

              font-size:
                clamp(
                  21px,
                  3vw,
                  30px
                );

              line-height: 1.2;
            }


            .citizen-dashboard-welcome p {
              margin:
                8px 0 0;

              max-width: 700px;

              color: #c7d3e3;

              line-height: 1.55;

              font-size: 13.5px;
            }


            .citizen-dashboard-report-button {
              flex-shrink: 0;
            }


            /*
             * RecentActivity is also used by the landing page.
             * The landing page gives it very large section padding.
             * Inside the citizen dashboard we override that spacing.
             */

            .citizen-dashboard-activity
            .recent-section {
              padding:
                0 !important;

              background:
                transparent !important;
            }


            .citizen-dashboard-activity
            .section-container {
              max-width:
                none !important;

              width: 100%;

              margin:
                0 !important;
            }


            .citizen-dashboard-activity
            .activity-grid {
              margin-top:
                22px !important;

              gap:
                16px !important;

              grid-template-columns:
                repeat(
                  3,
                  minmax(0, 1fr)
                ) !important;
            }


            .citizen-dashboard-activity
            .activity-card {
              padding:
                18px !important;

              border-radius:
                12px !important;

              box-shadow:
                var(--shadow-card)
                !important;
            }


            .citizen-dashboard-activity
            .activity-card:hover {
              transform:
                none !important;
            }


            .citizen-dashboard-section {
              padding: 20px;
            }


            .citizen-dashboard-section-title {
              display: flex;

              align-items: center;

              gap: 8px;

              font-weight: 800;

              margin-bottom: 16px;
            }


            .citizen-dashboard-steps {
              display: grid;

              grid-template-columns:
                repeat(
                  4,
                  minmax(0, 1fr)
                );

              gap: 14px;
            }


            .citizen-step-card {
              min-width: 0;

              border:
                1px solid var(--border);

              border-radius: 10px;

              padding:
                16px 14px;

              background: #fff;

              text-align: center;
            }


            .citizen-step-number {
              width: 34px;

              height: 34px;

              border-radius: 50%;

              background:
                var(--navy-800);

              color: white;

              display: flex;

              align-items: center;

              justify-content:
                center;

              margin:
                0 auto 10px;

              font-weight: 800;

              flex-shrink: 0;
            }


            .citizen-step-copy strong {
              font-size: 14px;
            }


            .citizen-step-copy p {
              margin:
                6px 0 0;

              font-size: 12.5px;

              color:
                var(--text-secondary);

              line-height: 1.5;
            }


            .citizen-dashboard-stats {
              display: grid;

              grid-template-columns:
                repeat(
                  4,
                  minmax(0, 1fr)
                );

              gap: 14px;
            }


            .citizen-dashboard-stat {
              min-width: 0;

              padding:
                20px 14px;

              text-align: center;
            }


            .citizen-dashboard-stat-icon {
              display: flex;

              justify-content:
                center;

              margin-bottom: 8px;
            }


            .citizen-dashboard-stat-value {
              font-size: 26px;

              line-height: 1.2;

              font-weight: 800;
            }


            .citizen-dashboard-stat-label {
              margin-top: 4px;

              font-size: 11px;

              color:
                var(--text-secondary);

              font-weight: 700;

              text-transform:
                uppercase;

              letter-spacing:
                0.35px;
            }


            .citizen-dashboard-tips {
              display: grid;

              grid-template-columns:
                repeat(
                  2,
                  minmax(0, 1fr)
                );

              gap:
                12px 24px;
            }


            .citizen-tip {
              min-width: 0;

              display: flex;

              gap: 9px;

              align-items:
                flex-start;
            }


            .citizen-tip > svg {
              flex-shrink: 0;

              margin-top: 2px;
            }


            .citizen-tip strong {
              display: block;

              color:
                var(--text-primary);

              font-size: 13px;

              margin-bottom: 3px;
            }


            .citizen-tip p {
              margin: 0;

              color:
                var(--text-secondary);

              font-size: 12.5px;

              line-height: 1.5;
            }


            .citizen-dashboard-alert {
              display: flex;

              gap: 8px;

              align-items: center;

              padding:
                11px 14px;

              border-radius: 9px;

              background:
                #fff7ed;

              color:
                #9a3412;

              font-size: 13px;
            }


            @media (max-width: 900px) {
              .citizen-dashboard-activity
              .activity-grid {
                grid-template-columns:
                  repeat(
                    2,
                    minmax(0, 1fr)
                  ) !important;
              }


              .citizen-dashboard-steps {
                grid-template-columns:
                  repeat(
                    2,
                    minmax(0, 1fr)
                  );
              }


              .citizen-dashboard-stats {
                grid-template-columns:
                  repeat(
                    2,
                    minmax(0, 1fr)
                  );
              }
            }


            @media (max-width: 620px) {
              .citizen-dashboard {
                gap: 16px;
              }


              .citizen-dashboard-welcome {
                align-items:
                  stretch;

                flex-direction:
                  column;

                padding: 18px;

                gap: 16px;
              }


              .citizen-dashboard-report-button {
                width: 100%;
              }


              .citizen-dashboard-section {
                padding: 16px;
              }


              .citizen-dashboard-activity
              .activity-grid {
                grid-template-columns:
                  1fr !important;

                margin-top:
                  16px !important;
              }


              .citizen-dashboard-activity
              .activity-card {
                padding:
                  16px !important;
              }


              .citizen-dashboard-activity
              .activity-footer {
                align-items:
                  stretch !important;
              }


              .citizen-dashboard-activity
              .view-btn {
                margin-left: auto;
              }


              .citizen-dashboard-tips {
                grid-template-columns:
                  1fr;
              }
            }


            @media (max-width: 430px) {
              .citizen-dashboard-steps {
                grid-template-columns:
                  1fr;
              }


              .citizen-step-card {
                display: flex;

                align-items:
                  flex-start;

                gap: 12px;

                text-align: left;
              }


              .citizen-step-number {
                margin: 0;
              }


              .citizen-dashboard-stat {
                padding:
                  16px 10px;
              }


              .citizen-dashboard-stat-value {
                font-size: 22px;
              }
            }
          `}
        </style>
      </div>
    </PageTransition>
  );
}


/* =============================================================
   STAT CARD
============================================================= */

function StatCard({
  icon,
  value,
  label,
  color
}) {
  return (
    <div
      className="card citizen-dashboard-stat"
    >
      <div
        className="citizen-dashboard-stat-icon"
        style={{
          color
        }}
      >
        {icon}
      </div>

      <div
        className="citizen-dashboard-stat-value"
      >
        {typeof value === 'number'
          ? value.toLocaleString()
          : value}
      </div>

      <div
        className="citizen-dashboard-stat-label"
      >
        {label}
      </div>
    </div>
  );
}