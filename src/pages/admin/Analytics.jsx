import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Filter,
  MapPin,
  RotateCcw,
  Users,
  X
} from 'lucide-react';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import api from '../../api/api';
import TopBar from '../../components/TopBar';
import PageTransition from '../../components/PageTransition';

import './Analytics.css';


const CHART_COLORS = [
  '#f2a93d',
  '#16283f',
  '#2d4b73',
  '#e0962b',
  '#6b7688',
  '#98a2b3',
  '#d97706',
  '#1e8e3e'
];


const DEFAULT_FILTERS = {
  dateRange: '30d',

  from: '',
  to: '',

  categoryId: '',
  categoryName: '',

  locationId: '',
  locationName: ''
};


export default function Analytics() {
  const [data, setData] =
    useState(null);

  const [initialLoading, setInitialLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState('');

  const [draftFilters, setDraftFilters] =
    useState(DEFAULT_FILTERS);

  const [appliedFilters, setAppliedFilters] =
    useState(DEFAULT_FILTERS);

  const [categories, setCategories] =
    useState([]);

  const [locations, setLocations] =
    useState([]);


  // =========================================================
  // FALLBACK FILTER OPTIONS FROM ANALYTICS RESPONSE
  // =========================================================

  const seedFilterOptions =
    useCallback((analyticsData) => {
      if (!analyticsData) {
        return;
      }

      const categoryFallback =
        normaliseCategoryData(
          analyticsData.byCategory
        ).map((item) => ({
          id: '',
          name: item.CategoryName
        }));

      const locationFallback =
        normaliseLocationData(
          analyticsData.byLocation
        ).map((item) => ({
          id: '',
          name: item.LocationName
        }));

      setCategories((current) =>
        current.length
          ? current
          : categoryFallback
      );

      setLocations((current) =>
        current.length
          ? current
          : locationFallback
      );
    }, []);


  // =========================================================
  // LOOKUPS
  // =========================================================

  const loadLookups =
    useCallback(async () => {
      await Promise.allSettled([
        api
          .get('/lookups/categories')
          .then((response) => {
            const rows =
              Array.isArray(response.data)
                ? response.data
                : [];

            setCategories(
              rows.map((row) => ({
                id:
                  row.CategoryID ??
                  row.CategoryId ??
                  '',

                name:
                  row.Name ??
                  row.DisplayName ??
                  row.CategoryName ??
                  'Unnamed category'
              }))
            );
          }),

        api
          .get('/lookups/locations')
          .then((response) => {
            const rows =
              Array.isArray(response.data)
                ? response.data
                : [];

            setLocations(
              rows.map((row) => ({
                id:
                  row.LocationID ??
                  row.LocationId ??
                  '',

                name:
                  row.Name ??
                  row.LocationName ??
                  row.AddressDescription ??
                  'Unnamed location'
              }))
            );
          })
      ]);
    }, []);


  // =========================================================
  // ANALYTICS API
  // =========================================================

  const loadAnalytics =
    useCallback(
      async (
        filters = DEFAULT_FILTERS,
        options = {}
      ) => {
        const {
          initial = false,
          preserveExisting = true
        } = options;

        if (initial) {
          setInitialLoading(true);
        } else {
          setRefreshing(true);
        }

        setError('');

        try {
          const response =
            await api.get(
              '/admin/analytics',
              {
                params:
                  buildAnalyticsParams(
                    filters
                  )
              }
            );

          const nextData =
            normaliseAnalyticsData(
              response.data
            );

          setData(nextData);

          seedFilterOptions(
            nextData
          );

          return nextData;
        } catch (err) {
          console.error(
            'Analytics loading error:',
            err
          );

          setError(
            err.response?.data?.Message ||
            err.response?.data?.message ||
            'Analytics could not be loaded.'
          );

          if (!preserveExisting) {
            setData(null);
          }

          throw err;
        } finally {
          setInitialLoading(false);
          setRefreshing(false);
        }
      },
      [seedFilterOptions]
    );


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadAnalytics(
      DEFAULT_FILTERS,
      {
        initial: true,
        preserveExisting: false
      }
    ).catch(() => {});

    loadLookups();
  }, [
    loadAnalytics,
    loadLookups
  ]);


  // =========================================================
  // FILTER HANDLERS
  // =========================================================

  function updateFilter(
    field,
    value
  ) {
    setDraftFilters(
      (current) => ({
        ...current,
        [field]: value
      })
    );
  }


  function updateCategoryFilter(
    value
  ) {
    const selected =
      categories.find(
        (item) =>
          optionValue(item) === value
      );

    setDraftFilters(
      (current) => ({
        ...current,

        categoryId:
          selected?.id || '',

        categoryName:
          selected?.name || ''
      })
    );
  }


  function updateLocationFilter(
    value
  ) {
    const selected =
      locations.find(
        (item) =>
          optionValue(item) === value
      );

    setDraftFilters(
      (current) => ({
        ...current,

        locationId:
          selected?.id || '',

        locationName:
          selected?.name || ''
      })
    );
  }


  async function applyFilters() {
    const next = {
      ...draftFilters
    };

    setAppliedFilters(next);

    try {
      await loadAnalytics(next);
    } catch {
      // Error is shown by the page.
    }
  }


  async function resetFilters() {
    const next = {
      ...DEFAULT_FILTERS
    };

    setDraftFilters(next);
    setAppliedFilters(next);

    try {
      await loadAnalytics(next);
    } catch {
      // Error is shown by the page.
    }
  }


  async function refresh() {
    try {
      await loadAnalytics(
        appliedFilters
      );
    } catch {
      // Error is shown by the page.
    }
  }


  // =========================================================
  // DATA TRANSFORMS
  // =========================================================

  const byCategory =
    useMemo(
      () =>
        normaliseCategoryData(
          data?.byCategory
        ),
      [data]
    );


  const byLocation =
    useMemo(
      () =>
        normaliseLocationData(
          data?.byLocation
        ),
      [data]
    );


  const categoryTotal =
    useMemo(
      () =>
        byCategory.reduce(
          (sum, item) =>
            sum +
            numberOrZero(
              item.IssueCount
            ),
          0
        ),
      [byCategory]
    );


  const categoryBreakdown =
    useMemo(
      () =>
        byCategory.map(
          (item, index) => ({
            ...item,

            percentage:
              categoryTotal > 0
                ? (
                    item.IssueCount /
                    categoryTotal
                  ) * 100
                : 0,

            color:
              CHART_COLORS[
                index %
                CHART_COLORS.length
              ]
          })
        ),
      [
        byCategory,
        categoryTotal
      ]
    );


  const resolvedEstimate =
    useMemo(() => {
      const total =
        numberOrZero(
          data?.TotalIssues
        );

      const rate =
        clampPercent(
          data?.ResolutionRate
        );

      const resolved =
        Math.round(
          total *
          (rate / 100)
        );

      return {
        resolved,

        open:
          Math.max(
            0,
            total - resolved
          )
      };
    }, [data]);


  const globalEmpty =
    !initialLoading &&
    !!data &&
    numberOrZero(
      data.TotalIssues
    ) === 0 &&
    byCategory.length === 0 &&
    byLocation.length === 0;


  // =========================================================
  // INITIAL LOADING
  // =========================================================

  if (
    initialLoading &&
    !data
  ) {
    return (
      <PageTransition>
        <div className="analytics-page">
          <TopBar
            section="Admin"
            page="Analytics"
          />

          <main className="analytics-content">
            <AnalyticsHeader
              draftFilters={draftFilters}
              appliedFilters={appliedFilters}
              categories={categories}
              locations={locations}
              loading
              onDateRangeChange={(value) =>
                updateFilter(
                  'dateRange',
                  value
                )
              }
              onFromChange={(value) =>
                updateFilter(
                  'from',
                  value
                )
              }
              onToChange={(value) =>
                updateFilter(
                  'to',
                  value
                )
              }
              onCategoryChange={
                updateCategoryFilter
              }
              onLocationChange={
                updateLocationFilter
              }
              onApply={() => {}}
              onReset={() => {}}
            />

            <AnalyticsSkeleton />
          </main>
        </div>
      </PageTransition>
    );
  }


  // =========================================================
  // PAGE
  // =========================================================

  return (
    <PageTransition>
      <div className="analytics-page">
        <TopBar
          section="Admin"
          page="Analytics"
          onRefresh={refresh}
          refreshing={refreshing}
        />

        <main className="analytics-content">
          {error && (
            <ErrorBanner
              message={error}
              onRetry={refresh}
              onDismiss={() =>
                setError('')
              }
            />
          )}


          <AnalyticsHeader
            draftFilters={
              draftFilters
            }
            appliedFilters={
              appliedFilters
            }
            categories={
              categories
            }
            locations={
              locations
            }
            loading={
              refreshing
            }
            onDateRangeChange={(value) =>
              updateFilter(
                'dateRange',
                value
              )
            }
            onFromChange={(value) =>
              updateFilter(
                'from',
                value
              )
            }
            onToChange={(value) =>
              updateFilter(
                'to',
                value
              )
            }
            onCategoryChange={
              updateCategoryFilter
            }
            onLocationChange={
              updateLocationFilter
            }
            onApply={
              applyFilters
            }
            onReset={
              resetFilters
            }
          />


          <div
            className={
              refreshing
                ? 'analytics-live analytics-live--refreshing'
                : 'analytics-live'
            }
            aria-busy={
              refreshing
            }
          >
            {globalEmpty ? (
              <GlobalEmptyState
                onReset={
                  resetFilters
                }
              />
            ) : (
              <>
                <KpiGrid
                  data={data}
                />


                {/* =================================================
                    MAIN CHART GRID

                    This replaces the old primary-grid + side-stack
                    structure that created the large vertical gap.
                ================================================= */}

                <section className="analytics-main-grid">
                  <ChartCard
                    className="analytics-category-card"
                    title="Issues by Category"
                    subtitle="Volume comparison across municipal service lines"
                  >
                    {categoryBreakdown.length ? (
                      <>
                        <CategoryBarChart
                          data={
                            categoryBreakdown
                          }
                        />

                        <TopCategorySummary
                          data={
                            categoryBreakdown
                          }
                        />
                      </>
                    ) : (
                      <ChartEmptyState
                        title="No category data available for the selected filters."
                        text="Adjust or clear the current filters."
                        onReset={
                          resetFilters
                        }
                      />
                    )}
                  </ChartCard>


                  <ChartCard
                    className="analytics-share-card"
                    title="Category Share"
                    subtitle="Proportional breakdown of filtered issue volume"
                    badge="Dynamic %"
                  >
                    {categoryBreakdown.length ? (
                      <CategoryDonut
                        data={
                          categoryBreakdown
                        }
                        totalIssues={
                          data?.TotalIssues ??
                          categoryTotal
                        }
                      />
                    ) : (
                      <ChartEmptyState
                        compact
                        title="No category share data available."
                        onReset={
                          resetFilters
                        }
                      />
                    )}
                  </ChartCard>


                  <ResolutionPerformance
                    rate={
                      data?.ResolutionRate
                    }
                    total={
                      data?.TotalIssues
                    }
                    resolved={
                      resolvedEstimate.resolved
                    }
                    open={
                      resolvedEstimate.open
                    }
                  />
                </section>


                <ChartCard
                  className="analytics-location-card"
                  title="Issues by Location"
                  subtitle="Geographic incident concentration across reported municipal locations"
                >
                  {byLocation.length ? (
                    <LocationBarChart
                      data={
                        byLocation
                      }
                    />
                  ) : (
                    <ChartEmptyState
                      title="No location data available for the selected filters."
                      text="Try resetting the location filter or broadening the selected date range."
                      onReset={
                        resetFilters
                      }
                    />
                  )}
                </ChartCard>


                <CategoryBreakdown
                  data={
                    categoryBreakdown
                  }
                />
              </>
            )}
          </div>


          {refreshing && (
            <div
              className="analytics-refresh-indicator"
              role="status"
              aria-live="polite"
            >
              Refreshing analytics…
            </div>
          )}
        </main>
      </div>
    </PageTransition>
  );
}


// =============================================================
// HEADER / FILTERS
// =============================================================

function AnalyticsHeader({
  draftFilters,
  appliedFilters,
  categories,
  locations,
  loading,
  onDateRangeChange,
  onFromChange,
  onToChange,
  onCategoryChange,
  onLocationChange,
  onApply,
  onReset
}) {
  return (
    <section className="analytics-header">
      <div className="analytics-title-row">
        <div>
          <h1>
            Analytics Overview
          </h1>

          <p>
            Service delivery performance,
            response velocity and municipal
            issue distribution.
          </p>
        </div>


        <div className="analytics-filter-summary">
          <span className="analytics-filter-summary-dot" />

          <span>
            {buildFilterSummary(
              appliedFilters
            )}
          </span>

          <button
            type="button"
            disabled={loading}
            onClick={onReset}
            aria-label="Reset filters"
            title="Reset filters"
          >
            <X size={14} />
          </button>
        </div>
      </div>


      <div className="analytics-filter-card">
        <div className="analytics-filter-grid">
          <label className="analytics-filter-field">
            <span>
              Date Range
            </span>

            <select
              value={
                draftFilters.dateRange
              }
              disabled={loading}
              onChange={(event) =>
                onDateRangeChange(
                  event.target.value
                )
              }
            >
              <option value="all">
                All Time
              </option>

              <option value="today">
                Today
              </option>

              <option value="7d">
                Last 7 Days
              </option>

              <option value="30d">
                Last 30 Days
              </option>

              <option value="90d">
                Last 90 Days
              </option>

              <option value="custom">
                Custom Range
              </option>
            </select>
          </label>


          <label className="analytics-filter-field">
            <span>
              Category
            </span>

            <select
              value={
                selectedOptionValue(
                  categories,
                  draftFilters.categoryId,
                  draftFilters.categoryName
                )
              }
              disabled={loading}
              onChange={(event) =>
                onCategoryChange(
                  event.target.value
                )
              }
            >
              <option value="">
                All Categories
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={
                      `${category.id}-${category.name}`
                    }
                    value={
                      optionValue(
                        category
                      )
                    }
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>
          </label>


          <label className="analytics-filter-field">
            <span>
              Location / Ward
            </span>

            <select
              value={
                selectedOptionValue(
                  locations,
                  draftFilters.locationId,
                  draftFilters.locationName
                )
              }
              disabled={loading}
              onChange={(event) =>
                onLocationChange(
                  event.target.value
                )
              }
            >
              <option value="">
                All Locations
              </option>

              {locations.map(
                (location) => (
                  <option
                    key={
                      `${location.id}-${location.name}`
                    }
                    value={
                      optionValue(
                        location
                      )
                    }
                  >
                    {location.name}
                  </option>
                )
              )}
            </select>
          </label>


          <div className="analytics-filter-actions">
            <button
              type="button"
              className="btn btn-primary"
              disabled={loading}
              onClick={onApply}
            >
              <Filter size={15} />

              Apply
            </button>


            <button
              type="button"
              className="btn btn-outline analytics-reset-button"
              disabled={loading}
              onClick={onReset}
              title="Reset filters"
              aria-label="Reset filters"
            >
              <RotateCcw
                size={15}
              />
            </button>
          </div>
        </div>


        {draftFilters.dateRange ===
          'custom' && (
          <div className="analytics-custom-range">
            <label className="analytics-filter-field">
              <span>
                From
              </span>

              <input
                type="date"
                value={
                  draftFilters.from
                }
                max={
                  draftFilters.to ||
                  undefined
                }
                disabled={loading}
                onChange={(event) =>
                  onFromChange(
                    event.target.value
                  )
                }
              />
            </label>


            <label className="analytics-filter-field">
              <span>
                To
              </span>

              <input
                type="date"
                value={
                  draftFilters.to
                }
                min={
                  draftFilters.from ||
                  undefined
                }
                disabled={loading}
                onChange={(event) =>
                  onToChange(
                    event.target.value
                  )
                }
              />
            </label>
          </div>
        )}
      </div>
    </section>
  );
}


// =============================================================
// KPI CARDS
// =============================================================

function KpiGrid({
  data
}) {
  const resolution =
    clampPercent(
      data?.ResolutionRate
    );

  return (
    <section className="analytics-kpi-grid">
      <KpiCard
        label="Resolution Rate"
        value={`${resolution}%`}
        icon={
          <CheckCircle2
            size={17}
          />
        }
        tone="success"
      >
        <div className="analytics-kpi-progress">
          <span
            style={{
              width:
                `${resolution}%`
            }}
          />
        </div>
      </KpiCard>


      <KpiCard
        label="Avg Response"
        value={
          formatMetric(
            data?.AvgResponseHours,
            'h'
          )
        }
        description="First assignment response time"
        icon={
          <Clock3 size={17} />
        }
      />


      <KpiCard
        label="Avg Resolution"
        value={
          formatMetric(
            data?.AvgResolutionDays,
            'd'
          )
        }
        description="Report creation to resolution"
        icon={
          <CalendarDays
            size={17}
          />
        }
        tone="gold"
      />


      <KpiCard
        label="Workers"
        value={
          formatCount(
            data?.TotalWorkers
          )
        }
        description="Active municipal workers"
        icon={
          <Users size={17} />
        }
      />


      <KpiCard
        label="Total Issues"
        value={
          formatCount(
            data?.TotalIssues
          )
        }
        description="Filtered report volume"
        icon={
          <ClipboardList
            size={17}
          />
        }
        tone="navy"
      />
    </section>
  );
}


function KpiCard({
  label,
  value,
  description,
  icon,
  tone = 'default',
  children
}) {
  return (
    <article
      className={
        `analytics-kpi-card analytics-kpi-card--${tone}`
      }
    >
      <div className="analytics-kpi-top">
        <span className="analytics-kpi-label">
          {label}
        </span>

        <span className="analytics-kpi-icon">
          {icon}
        </span>
      </div>


      <div className="analytics-kpi-value">
        {value}
      </div>


      {description && (
        <div className="analytics-kpi-description">
          {description}
        </div>
      )}


      {children}
    </article>
  );
}


// =============================================================
// SHARED CHART CARD
// =============================================================

function ChartCard({
  title,
  subtitle,
  badge,
  className = '',
  children
}) {
  return (
    <section
      className={
        `analytics-chart-card ${className}`
      }
    >
      <div className="analytics-chart-header">
        <div>
          <h2>
            {title}
          </h2>

          {subtitle && (
            <p>
              {subtitle}
            </p>
          )}
        </div>

        {badge && (
          <span className="analytics-chart-badge">
            {badge}
          </span>
        )}
      </div>

      {children}
    </section>
  );
}


// =============================================================
// CATEGORY BAR
// =============================================================

function CategoryBarChart({
  data
}) {
  const horizontal =
    data.length > 7;

  if (horizontal) {
    return (
      <div className="analytics-chart-body analytics-chart-body--scroll">
        <div
          style={{
            height:
              Math.max(
                260,
                data.length * 42
              )
          }}
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={data}
              layout="vertical"
              margin={{
                top: 6,
                right: 20,
                left: 12,
                bottom: 6
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#e4e8ef"
              />

              <XAxis
                type="number"
                allowDecimals={false}
                tick={{
                  fill:
                    '#6b7688',
                  fontSize: 10
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                type="category"
                dataKey="CategoryName"
                width={130}
                tick={{
                  fill:
                    '#1a2740',
                  fontSize: 10
                }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                content={
                  <AnalyticsTooltip
                    labelKey="CategoryName"
                  />
                }
              />

              <Bar
                dataKey="IssueCount"
                fill="#f2a93d"
                radius={[
                  0,
                  5,
                  5,
                  0
                ]}
                minPointSize={3}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }


  return (
    <div className="analytics-category-chart">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -14,
            bottom: 10
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e4e8ef"
          />

          <XAxis
            dataKey="CategoryName"
            tickFormatter={
              truncateAxisLabel
            }
            tick={{
              fill:
                '#6b7688',
              fontSize: 10
            }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />

          <YAxis
            allowDecimals={false}
            tick={{
              fill:
                '#6b7688',
              fontSize: 10
            }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            content={
              <AnalyticsTooltip
                labelKey="CategoryName"
              />
            }
          />

          <Bar
            dataKey="IssueCount"
            fill="#f2a93d"
            radius={[
              5,
              5,
              0,
              0
            ]}
            maxBarSize={44}
            minPointSize={3}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


// =============================================================
// TOP CATEGORIES
// =============================================================

function TopCategorySummary({
  data
}) {
  return (
    <div className="analytics-top-categories">
      <div className="analytics-top-categories-heading">
        <span>
          Top Issue Drivers
        </span>

        <span>
          Count · Share
        </span>
      </div>


      <div className="analytics-top-categories-grid">
        {data
          .slice(0, 3)
          .map((item) => (
            <div
              key={
                item.CategoryName
              }
              className="analytics-top-category"
            >
              <span
                title={
                  item.CategoryName
                }
              >
                {item.CategoryName}
              </span>

              <strong>
                {formatCount(
                  item.IssueCount
                )}

                <em>
                  {formatPercent(
                    item.percentage
                  )}
                </em>
              </strong>
            </div>
          ))}
      </div>
    </div>
  );
}


// =============================================================
// CATEGORY DONUT
// =============================================================

function CategoryDonut({
  data,
  totalIssues
}) {
  const primary =
    data[0];

  return (
    <div className="analytics-donut-layout">
      <div className="analytics-donut-visual">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <PieChart>
            <Pie
              data={data}
              dataKey="IssueCount"
              nameKey="CategoryName"
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={68}
              paddingAngle={1.5}
              stroke="#ffffff"
              strokeWidth={2}
            >
              {data.map(
                (item) => (
                  <Cell
                    key={
                      item.CategoryName
                    }
                    fill={
                      item.color
                    }
                  />
                )
              )}
            </Pie>

            <Tooltip
              content={
                <AnalyticsTooltip
                  labelKey="CategoryName"
                />
              }
            />
          </PieChart>
        </ResponsiveContainer>


        <div className="analytics-donut-center">
          <span>
            Total
          </span>

          <strong>
            {formatCount(
              totalIssues
            )}
          </strong>

          <small>
            Issues
          </small>
        </div>
      </div>


      <div className="analytics-donut-legend">
        {data.map(
          (item) => (
            <div
              key={
                item.CategoryName
              }
              className="analytics-donut-legend-row"
            >
              <span className="analytics-legend-label">
                <i
                  style={{
                    background:
                      item.color
                  }}
                />

                <span
                  title={
                    item.CategoryName
                  }
                >
                  {item.CategoryName}
                </span>
              </span>

              <strong>
                {formatCount(
                  item.IssueCount
                )}

                <small>
                  {formatPercent(
                    item.percentage
                  )}
                </small>
              </strong>
            </div>
          )
        )}
      </div>


      {primary && (
        <div className="analytics-primary-driver">
          <span>
            Primary Driver
          </span>

          <strong>
            {primary.CategoryName}
          </strong>

          <em>
            {formatPercent(
              primary.percentage
            )}
          </em>
        </div>
      )}
    </div>
  );
}


// =============================================================
// RESOLUTION
// =============================================================

function ResolutionPerformance({
  rate,
  total,
  resolved,
  open
}) {
  const safeRate =
    clampPercent(rate);

  return (
    <section className="analytics-resolution-card">
      <div className="analytics-resolution-header">
        <div>
          <h3>
            Resolution Performance
          </h3>

          <p>
            Current closure rate for
            the filtered report set
          </p>
        </div>

        <span className="analytics-resolution-badge">
          {safeRate}%
        </span>
      </div>


      <div className="analytics-resolution-content">
        <ResolutionGauge
          value={
            safeRate
          }
        />

        <div className="analytics-resolution-stats">
          <div>
            <span>
              Estimated Resolved
            </span>

            <strong>
              {formatCount(
                resolved
              )}
              {' '}
              /{' '}
              {formatCount(
                total
              )}
            </strong>
          </div>

          <div>
            <span>
              Remaining Open
            </span>

            <strong>
              {formatCount(
                open
              )}
            </strong>
          </div>

          <p>
            Estimated from the
            current resolution rate.
          </p>
        </div>
      </div>
    </section>
  );
}


function ResolutionGauge({
  value
}) {
  const radius = 26;

  const circumference =
    2 *
    Math.PI *
    radius;

  const offset =
    circumference -
    (
      value /
      100
    ) *
    circumference;

  return (
    <div className="analytics-resolution-gauge">
      <svg
        viewBox="0 0 64 64"
        aria-hidden="true"
      >
        <circle
          cx="32"
          cy="32"
          r={radius}
          className="analytics-resolution-track"
        />

        <circle
          cx="32"
          cy="32"
          r={radius}
          className="analytics-resolution-value"
          strokeDasharray={
            circumference
          }
          strokeDashoffset={
            offset
          }
        />
      </svg>

      <strong>
        {value}%
      </strong>
    </div>
  );
}


// =============================================================
// LOCATION CHART
// =============================================================

function LocationBarChart({
  data
}) {
  const sorted =
    [...data].sort(
      (a, b) =>
        b.IssueCount -
        a.IssueCount
    );

  return (
    <>
      <div className="analytics-location-chart">
        <div
          style={{
            height:
              Math.max(
                230,
                sorted.length * 42
              )
          }}
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={sorted}
              layout="vertical"
              margin={{
                top: 5,
                right: 20,
                left: 12,
                bottom: 5
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#e4e8ef"
              />

              <XAxis
                type="number"
                allowDecimals={false}
                tick={{
                  fill:
                    '#6b7688',
                  fontSize: 10
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                type="category"
                dataKey="LocationName"
                width={165}
                tick={
                  <LocationAxisTick />
                }
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                content={
                  <AnalyticsTooltip
                    labelKey="LocationName"
                  />
                }
              />

              <Bar
                dataKey="IssueCount"
                radius={[
                  0,
                  5,
                  5,
                  0
                ]}
                minPointSize={3}
              >
                {sorted.map(
                  (
                    item,
                    index
                  ) => (
                    <Cell
                      key={
                        item.LocationName
                      }
                      fill={
                        index === 0
                          ? '#f2a93d'
                          : '#16283f'
                      }
                    />
                  )
                )}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>


      <div className="analytics-location-footer">
        <span>
          <MapPin size={14} />

          Locations are ranked by
          reported issue volume.
        </span>

        <strong>
          {sorted.length}
          {' '}
          {sorted.length === 1
            ? 'location'
            : 'locations'}
        </strong>
      </div>
    </>
  );
}


function LocationAxisTick({
  x,
  y,
  payload
}) {
  const value =
    String(
      payload?.value ||
      ''
    );

  const display =
    value.length > 25
      ? `${value.slice(
          0,
          23
        )}…`
      : value;

  return (
    <g
      transform={
        `translate(${x},${y})`
      }
    >
      <text
        x={-8}
        y={0}
        dy={4}
        textAnchor="end"
        fill="#1a2740"
        fontSize={10}
      >
        {display}
      </text>
    </g>
  );
}


// =============================================================
// BREAKDOWN TABLE
// =============================================================

function CategoryBreakdown({
  data
}) {
  return (
    <section className="analytics-breakdown-card">
      <div className="analytics-chart-header">
        <div>
          <h2>
            Category Breakdown
          </h2>

          <p>
            Issue count and proportional
            share for every category.
          </p>
        </div>

        <span className="analytics-chart-badge">
          Dynamic %
        </span>
      </div>


      {!data.length ? (
        <div className="analytics-breakdown-empty">
          No category breakdown
          data to display.
        </div>
      ) : (
        <>
          <div className="analytics-breakdown-table-wrap">
            <table className="analytics-breakdown-table">
              <thead>
                <tr>
                  <th>
                    Category
                  </th>

                  <th className="analytics-number-column">
                    Issues
                  </th>

                  <th>
                    Share
                  </th>

                  <th className="analytics-number-column">
                    %
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.map(
                  (item) => (
                    <tr
                      key={
                        item.CategoryName
                      }
                    >
                      <td>
                        <span className="analytics-category-name">
                          <i
                            style={{
                              background:
                                item.color
                            }}
                          />

                          {item.CategoryName}
                        </span>
                      </td>

                      <td className="analytics-number-column">
                        <strong>
                          {formatCount(
                            item.IssueCount
                          )}
                        </strong>
                      </td>

                      <td>
                        <div className="analytics-share-bar">
                          <span
                            style={{
                              width:
                                `${Math.min(
                                  100,
                                  item.percentage
                                )}%`,

                              background:
                                item.color
                            }}
                          />
                        </div>
                      </td>

                      <td className="analytics-number-column">
                        <strong>
                          {formatPercent(
                            item.percentage
                          )}
                        </strong>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>


          <div className="analytics-breakdown-mobile">
            {data.map(
              (item) => (
                <article
                  key={
                    item.CategoryName
                  }
                  className="analytics-breakdown-mobile-card"
                >
                  <div className="analytics-breakdown-mobile-heading">
                    <span className="analytics-category-name">
                      <i
                        style={{
                          background:
                            item.color
                        }}
                      />

                      {item.CategoryName}
                    </span>

                    <strong>
                      {formatPercent(
                        item.percentage
                      )}
                    </strong>
                  </div>

                  <div className="analytics-share-bar">
                    <span
                      style={{
                        width:
                          `${Math.min(
                            100,
                            item.percentage
                          )}%`,

                        background:
                          item.color
                      }}
                    />
                  </div>

                  <div className="analytics-breakdown-mobile-count">
                    {formatCount(
                      item.IssueCount
                    )}
                    {' '}
                    issues
                  </div>
                </article>
              )
            )}
          </div>
        </>
      )}
    </section>
  );
}


// =============================================================
// TOOLTIP
// =============================================================

function AnalyticsTooltip({
  active,
  payload,
  labelKey
}) {
  if (
    !active ||
    !payload?.length
  ) {
    return null;
  }

  const row =
    payload[0]?.payload ||
    {};

  const count =
    numberOrZero(
      row.IssueCount
    );

  const percentage =
    Number(
      row.percentage
    );

  const label =
    row[labelKey] ||
    payload[0]?.name ||
    'Analytics';

  return (
    <div className="analytics-tooltip">
      <strong>
        {label}
      </strong>

      <span>
        {formatCount(count)}
        {' '}
        {count === 1
          ? 'issue'
          : 'issues'}
      </span>

      {Number.isFinite(
        percentage
      ) && (
        <small>
          {formatPercent(
            percentage
          )}
        </small>
      )}
    </div>
  );
}


// =============================================================
// ERROR / EMPTY
// =============================================================

function ErrorBanner({
  message,
  onRetry,
  onDismiss
}) {
  return (
    <div
      className="analytics-error-banner"
      role="alert"
    >
      <span className="analytics-error-icon">
        <AlertTriangle
          size={18}
        />
      </span>

      <div>
        <strong>
          Analytics could not
          be loaded.
        </strong>

        <p>
          {message}
        </p>
      </div>

      <div className="analytics-error-actions">
        <button
          type="button"
          className="btn btn-danger"
          onClick={onRetry}
        >
          Retry
        </button>

        <button
          type="button"
          className="analytics-error-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}


function GlobalEmptyState({
  onReset
}) {
  return (
    <section className="analytics-global-empty">
      <span>
        <Filter size={28} />
      </span>

      <h2>
        No analytics data
        matches the selected filters.
      </h2>

      <p>
        Try a wider date range,
        another category or another
        location.
      </p>

      <button
        type="button"
        className="btn btn-primary"
        onClick={onReset}
      >
        <RotateCcw size={15} />

        Reset Filters
      </button>
    </section>
  );
}


function ChartEmptyState({
  title,
  text,
  onReset,
  compact = false
}) {
  return (
    <div
      className={
        compact
          ? 'analytics-chart-empty analytics-chart-empty--compact'
          : 'analytics-chart-empty'
      }
    >
      <BarChart3 size={24} />

      <strong>
        {title}
      </strong>

      {text && (
        <p>
          {text}
        </p>
      )}

      {onReset && (
        <button
          type="button"
          onClick={onReset}
        >
          Reset Filters
        </button>
      )}
    </div>
  );
}


// =============================================================
// SKELETON
// =============================================================

function AnalyticsSkeleton() {
  return (
    <div className="analytics-skeleton">
      <div className="analytics-skeleton-kpis">
        {Array
          .from({
            length: 5
          })
          .map(
            (_, index) => (
              <div
                key={index}
                className="analytics-skeleton-card"
              >
                <span />
                <strong />
                <em />
              </div>
            )
          )}
      </div>

      <div className="analytics-skeleton-main">
        <div className="analytics-skeleton-chart analytics-skeleton-chart--large" />

        <div className="analytics-skeleton-side">
          <div className="analytics-skeleton-chart" />
          <div className="analytics-skeleton-chart analytics-skeleton-chart--small" />
        </div>
      </div>

      <div className="analytics-skeleton-chart" />
    </div>
  );
}


// =============================================================
// API NORMALISATION
// =============================================================

function normaliseAnalyticsData(
  value
) {
  const source =
    value &&
    typeof value === 'object'
      ? value
      : {};

  return {
    ResolutionRate:
      numberOrZero(
        source.ResolutionRate
      ),

    AvgResponseHours:
      nullableNumber(
        source.AvgResponseHours
      ),

    AvgResolutionDays:
      nullableNumber(
        source.AvgResolutionDays
      ),

    TotalWorkers:
      numberOrZero(
        source.TotalWorkers
      ),

    TotalIssues:
      numberOrZero(
        source.TotalIssues
      ),

    byCategory:
      normaliseCategoryData(
        source.byCategory
      ),

    byLocation:
      normaliseLocationData(
        source.byLocation
      )
  };
}


function normaliseCategoryData(
  value
) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => ({
      CategoryName:
        String(
          item?.CategoryName ??
          'Uncategorised'
        ),

      IssueCount:
        numberOrZero(
          item?.IssueCount
        )
    }))
    .sort(
      (a, b) =>
        b.IssueCount -
        a.IssueCount
    );
}


function normaliseLocationData(
  value
) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item) =>
        item?.LocationName
    )
    .map((item) => ({
      LocationName:
        String(
          item.LocationName
        ),

      IssueCount:
        numberOrZero(
          item?.IssueCount
        )
    }))
    .sort(
      (a, b) =>
        b.IssueCount -
        a.IssueCount
    );
}


// =============================================================
// FILTER PARAMS
// =============================================================

function buildAnalyticsParams(
  filters
) {
  const params = {};

  const range =
    resolveDateRange(
      filters
    );

  if (range.from) {
    params.from =
      range.from;
  }

  if (range.to) {
    params.to =
      range.to;
  }

  if (filters.categoryId) {
    params.categoryId =
      filters.categoryId;
  } else if (
    filters.categoryName
  ) {
    params.category =
      filters.categoryName;
  }

  if (filters.locationId) {
    params.locationId =
      filters.locationId;
  } else if (
    filters.locationName
  ) {
    params.location =
      filters.locationName;
  }

  return params;
}


function resolveDateRange(
  filters
) {
  const today =
    startOfLocalDay(
      new Date()
    );

  switch (
    filters.dateRange
  ) {
    case 'today':
      return {
        from:
          formatDateForApi(
            today
          ),

        to:
          formatDateForApi(
            today
          )
      };

    case '7d':
      return {
        from:
          formatDateForApi(
            addDays(
              today,
              -6
            )
          ),

        to:
          formatDateForApi(
            today
          )
      };

    case '30d':
      return {
        from:
          formatDateForApi(
            addDays(
              today,
              -29
            )
          ),

        to:
          formatDateForApi(
            today
          )
      };

    case '90d':
      return {
        from:
          formatDateForApi(
            addDays(
              today,
              -89
            )
          ),

        to:
          formatDateForApi(
            today
          )
      };

    case 'custom':
      return {
        from:
          filters.from || '',

        to:
          filters.to || ''
      };

    default:
      return {
        from: '',
        to: ''
      };
  }
}


function buildFilterSummary(
  filters
) {
  const labels = {
    all:
      'All Time',

    today:
      'Today',

    '7d':
      'Last 7 Days',

    '30d':
      'Last 30 Days',

    '90d':
      'Last 90 Days',

    custom:
      filters.from &&
      filters.to
        ? `${filters.from} → ${filters.to}`
        : 'Custom Range'
  };

  return [
    labels[
      filters.dateRange
    ] || 'All Time',

    filters.categoryName ||
      'All Categories',

    filters.locationName ||
      'All Locations'
  ].join(' · ');
}


// =============================================================
// HELPERS
// =============================================================

function optionValue(
  item
) {
  if (!item) {
    return '';
  }

  return item.id
    ? `id:${item.id}`
    : `name:${item.name}`;
}


function selectedOptionValue(
  items,
  id,
  name
) {
  if (
    !id &&
    !name
  ) {
    return '';
  }

  const selected =
    items.find(
      (item) =>
        (
          id &&
          String(item.id) ===
          String(id)
        ) ||
        (
          !id &&
          name &&
          item.name === name
        )
    );

  return selected
    ? optionValue(selected)
    : '';
}


function numberOrZero(
  value
) {
  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : 0;
}


function nullableNumber(
  value
) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return null;
  }

  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : null;
}


function clampPercent(
  value
) {
  return Math.min(
    100,
    Math.max(
      0,
      Math.round(
        numberOrZero(value)
      )
    )
  );
}


function formatMetric(
  value,
  suffix
) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(
      Number(value)
    )
  ) {
    return '—';
  }

  const number =
    Number(value);

  return `${
    Number.isInteger(number)
      ? number
      : number.toFixed(1)
  }${suffix}`;
}


function formatCount(
  value
) {
  return numberOrZero(
    value
  ).toLocaleString(
    'en-ZA'
  );
}


function formatPercent(
  value
) {
  return `${numberOrZero(
    value
  ).toFixed(1)}%`;
}


function truncateAxisLabel(
  value
) {
  const text =
    String(
      value || ''
    );

  return text.length <= 12
    ? text
    : `${text.slice(
        0,
        10
      )}…`;
}


function startOfLocalDay(
  date
) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
}


function addDays(
  date,
  days
) {
  const next =
    new Date(date);

  next.setDate(
    next.getDate() +
    days
  );

  return next;
}


function formatDateForApi(
  date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      '0'
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      '0'
    );

  return `${year}-${month}-${day}`;
}