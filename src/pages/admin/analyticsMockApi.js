import realApi from '../../api/api';


/*
 * ============================================================
 * FIX MY TOWN - ANALYTICS FRONTEND DATA ADAPTER
 * ============================================================
 *
 * Analytics.jsx still talks to this file as though it were
 * talking to:
 *
 *   GET /admin/analytics
 *   GET /lookups/categories
 *   GET /lookups/locations
 *
 * But this adapter now builds analytics from REAL data that
 * already exists in the deployed backend:
 *
 *   GET /admin/reports
 *   GET /admin/workers
 *
 * Report details are also used for resolution-time calculations.
 *
 * Nothing in this file contains fake report totals, fake workers,
 * fake categories, fake locations, or fake chart values.
 * ============================================================
 */


/* ============================================================
   CACHE

   Analytics.jsx requests analytics + two lookup endpoints at
   almost the same time.

   This tiny cache prevents that from producing three identical
   /admin/reports requests during initial page load.

   After a few seconds the next refresh gets fresh server data.
============================================================ */

const CACHE_DURATION_MS = 3000;

let baseDataCache = null;

let baseDataPromise = null;

let baseDataExpiresAt = 0;


/*
 * Report detail cache.
 *
 * Used when calculating average resolution time.
 */
const detailCache =
  new Map();

const DETAIL_CACHE_DURATION_MS =
  30000;


/* ============================================================
   PUBLIC ADAPTER
============================================================ */

const analyticsMockApi = {
  async get(
    path,
    config = {}
  ) {

    /* ========================================================
       CATEGORY LOOKUP

       Do not hard-code categories.

       Get the real reports and extract the unique categories
       already present in the system.
    ======================================================== */

    if (
      path ===
      '/lookups/categories'
    ) {
      const {
        reports
      } =
        await loadBaseData();

      return {
        data:
          buildCategoryLookup(
            reports
          )
      };
    }


    /* ========================================================
       LOCATION LOOKUP

       Same principle: locations already exist in the reports,
       so there is no reason to maintain a second hard-coded list.
    ======================================================== */

    if (
      path ===
      '/lookups/locations'
    ) {
      const {
        reports
      } =
        await loadBaseData();

      return {
        data:
          buildLocationLookup(
            reports
          )
      };
    }


    /* ========================================================
       ANALYTICS

       Build the analytics response from existing real endpoints.
    ======================================================== */

    if (
      path ===
      '/admin/analytics'
    ) {
      const params =
        config?.params ||
        {};

      const {
        reports,
        workers
      } =
        await loadBaseData();


      const filteredReports =
        reports.filter(
          (report) =>
            matchesAnalyticsFilters(
              report,
              params
            )
        );


      const response =
        await buildAnalyticsResponse(
          filteredReports,
          workers
        );


      console.log(
        '[Analytics] filters:',
        params
      );

      console.log(
        '[Analytics] reports:',
        filteredReports
      );

      console.log(
        '[Analytics] response:',
        response
      );


      return {
        data:
          response
      };
    }


    /*
     * Pass through anything else to the normal Axios API.
     *
     * This keeps this adapter safe if Analytics.jsx later adds
     * another normal API request.
     */
    return realApi.get(
      path,
      config
    );
  }
};


export default analyticsMockApi;


/* ============================================================
   LOAD REAL BASE DATA
============================================================ */

async function loadBaseData() {
  const now =
    Date.now();


  if (
    baseDataCache &&
    now <
      baseDataExpiresAt
  ) {
    return baseDataCache;
  }


  /*
   * If another request is already loading the data,
   * share the same promise instead of requesting it again.
   */
  if (
    baseDataPromise
  ) {
    return baseDataPromise;
  }


  baseDataPromise =
    Promise.all([
      realApi.get(
        '/admin/reports'
      ),

      realApi.get(
        '/admin/workers'
      )
    ])
      .then(
        ([
          reportsResponse,
          workersResponse
        ]) => {

          const reports =
            Array.isArray(
              reportsResponse.data
            )
              ? reportsResponse.data
                  .map(
                    normaliseReport
                  )
                  .filter(Boolean)
              : [];


          const workers =
            Array.isArray(
              workersResponse.data
            )
              ? workersResponse.data
              : [];


          baseDataCache = {
            reports,
            workers
          };


          baseDataExpiresAt =
            Date.now() +
            CACHE_DURATION_MS;


          return baseDataCache;
        }
      )
      .finally(
        () => {
          baseDataPromise =
            null;
        }
      );


  return baseDataPromise;
}


/* ============================================================
   ANALYTICS RESPONSE
============================================================ */

async function buildAnalyticsResponse(
  reports,
  workers
) {

  /* ========================================================
     TOTAL ISSUES

     Derived from the actual filtered /admin/reports rows.
  ======================================================== */

  const totalIssues =
    reports.length;


  /* ========================================================
     RESOLVED REPORTS
  ======================================================== */

  const resolvedReports =
    reports.filter(
      (report) =>
        normaliseStatus(
          report.Status
        ) ===
        'Resolved'
    );


  const resolvedCount =
    resolvedReports.length;


  /* ========================================================
     RESOLUTION RATE
  ======================================================== */

  const resolutionRate =
    totalIssues === 0
      ? 0
      : Math.round(
          (
            resolvedCount /
            totalIssues
          ) *
          100
        );


  /* ========================================================
     ACTIVE MUNICIPAL WORKERS

     /admin/workers includes active and inactive workers.

     The Analytics KPI specifically says:
       "Active municipal workers"

     Therefore count only IsActive === true.
  ======================================================== */

  const totalWorkers =
    workers.filter(
      (worker) =>
        getBooleanValue(
          worker,
          'IsActive',
          'isActive'
        ) === true
    ).length;


  /* ========================================================
     AVERAGE RESPONSE TIME

     This can only be calculated if /admin/reports exposes an
     AssignedAt timestamp.

     The restored backend currently may not expose that field.

     We deliberately return null instead of inventing a value.
     Analytics.jsx already renders null as "—".

     If AssignedAt becomes available later, this starts working
     automatically without changing Analytics.jsx.
  ======================================================== */

  const avgResponseHours =
    calculateAverageResponseHours(
      reports
    );


  /* ========================================================
     AVERAGE RESOLUTION TIME

     The report list does not expose ResolvedAt.

     For resolved reports we therefore request the existing
     report-details endpoint, which gives us UpdatedAt.

     In your backend, UpdatedAt is set when report status changes,
     so it is the best real frontend-accessible fallback for the
     resolution timestamp.

     If a future API exposes ResolvedAt, this code prefers it.
  ======================================================== */

  const avgResolutionDays =
    await calculateAverageResolutionDays(
      resolvedReports
    );


  /* ========================================================
     ISSUES BY CATEGORY
  ======================================================== */

  const byCategory =
    groupReports(
      reports,
      (report) =>
        report.CategoryName
    )
      .map(
        ([
          CategoryName,
          IssueCount
        ]) => ({
          CategoryName,
          IssueCount
        })
      )
      .sort(
        (
          first,
          second
        ) =>
          second.IssueCount -
            first.IssueCount ||
          first.CategoryName
            .localeCompare(
              second.CategoryName
            )
      );


  /* ========================================================
     ISSUES BY LOCATION
  ======================================================== */

  const byLocation =
    groupReports(
      reports,
      (report) =>
        report.LocationName
    )
      .map(
        ([
          LocationName,
          IssueCount
        ]) => ({
          LocationName,
          IssueCount
        })
      )
      .sort(
        (
          first,
          second
        ) =>
          second.IssueCount -
            first.IssueCount ||
          first.LocationName
            .localeCompare(
              second.LocationName
            )
      );


  /* ========================================================
     FINAL RESPONSE

     This has the exact shape Analytics.jsx already expects.
  ======================================================== */

  return {
    TotalIssues:
      totalIssues,

    TotalWorkers:
      totalWorkers,

    ResolutionRate:
      resolutionRate,

    AvgResponseHours:
      avgResponseHours,

    AvgResolutionDays:
      avgResolutionDays,

    byCategory,

    byLocation
  };
}


/* ============================================================
   NORMALISE REPORT

   The project has used slightly different naming conventions
   over time.

   Normalising here makes the frontend work with either form.
============================================================ */

function normaliseReport(
  report
) {
  if (
    !report ||
    typeof report !==
      'object'
  ) {
    return null;
  }


  return {
    ...report,

    ReportID:
      report.ReportID ??
      report.ReportId ??
      report.reportID ??
      report.reportId ??
      null,

    ReportCode:
      report.ReportCode ??
      report.ReferenceNumber ??
      report.reportCode ??
      report.referenceNumber ??
      '',

    Title:
      report.Title ??
      report.title ??
      '',

    Status:
      normaliseStatus(
        report.Status ??
        report.status
      ),

    Priority:
      report.Priority ??
      report.priority ??
      '',

    CategoryID:
      report.CategoryID ??
      report.CategoryId ??
      report.categoryID ??
      report.categoryId ??
      null,

    CategoryName:
      report.CategoryName ??
      report.categoryName ??
      '',

    LocationID:
      report.LocationID ??
      report.LocationId ??
      report.locationID ??
      report.locationId ??
      null,

    LocationName:
      report.LocationName ??
      report.locationName ??
      '',

    WorkerName:
      report.WorkerName ??
      report.workerName ??
      null,

    CreatedAt:
      report.CreatedAt ??
      report.createdAt ??
      null,

    AssignedAt:
      report.AssignedAt ??
      report.assignedAt ??
      null,

    ResolvedAt:
      report.ResolvedAt ??
      report.resolvedAt ??
      null,

    UpdatedAt:
      report.UpdatedAt ??
      report.updatedAt ??
      null
  };
}


/* ============================================================
   ANALYTICS FILTERS
============================================================ */

function matchesAnalyticsFilters(
  report,
  params
) {
  return (
    matchesDateFilter(
      report,
      params
    ) &&
    matchesCategoryFilter(
      report,
      params
    ) &&
    matchesLocationFilter(
      report,
      params
    )
  );
}


/* ============================================================
   DATE FILTER
============================================================ */

function matchesDateFilter(
  report,
  params
) {
  const createdAt =
    parseDate(
      report.CreatedAt
    );


  if (!createdAt) {
    return false;
  }


  const from =
    parseLocalDate(
      params.from
    );


  const to =
    parseLocalDate(
      params.to
    );


  if (
    from &&
    createdAt <
      from
  ) {
    return false;
  }


  if (to) {
    const endExclusive =
      addDays(
        to,
        1
      );


    if (
      createdAt >=
      endExclusive
    ) {
      return false;
    }
  }


  return true;
}


/* ============================================================
   CATEGORY FILTER
============================================================ */

function matchesCategoryFilter(
  report,
  params
) {

  /*
   * If IDs are available in a future API response,
   * support them.
   */
  if (
    params.categoryId &&
    report.CategoryID !==
      null &&
    report.CategoryID !==
      undefined
  ) {
    return (
      String(
        report.CategoryID
      ) ===
      String(
        params.categoryId
      )
    );
  }


  /*
   * Current frontend-derived category options use names.
   */
  if (
    params.category
  ) {
    return sameText(
      report.CategoryName,
      params.category
    );
  }


  return true;
}


/* ============================================================
   LOCATION FILTER
============================================================ */

function matchesLocationFilter(
  report,
  params
) {
  if (
    params.locationId &&
    report.LocationID !==
      null &&
    report.LocationID !==
      undefined
  ) {
    return (
      String(
        report.LocationID
      ) ===
      String(
        params.locationId
      )
    );
  }


  if (
    params.location
  ) {
    return sameText(
      report.LocationName,
      params.location
    );
  }


  return true;
}


/* ============================================================
   CATEGORY LOOKUP

   Generated from REAL report data.
============================================================ */

function buildCategoryLookup(
  reports
) {
  const names =
    uniqueStrings(
      reports.map(
        (report) =>
          report.CategoryName
      )
    );


  return names.map(
    (name) => ({
      /*
       * Analytics.jsx supports a lookup without an ID.
       *
       * It will therefore send:
       *
       *   category=<name>
       *
       * rather than:
       *
       *   categoryId=<id>
       */
      CategoryID:
        '',

      Name:
        name
    })
  );
}


/* ============================================================
   LOCATION LOOKUP

   Generated from REAL report data.
============================================================ */

function buildLocationLookup(
  reports
) {
  const names =
    uniqueStrings(
      reports.map(
        (report) =>
          report.LocationName
      )
    );


  return names.map(
    (name) => ({
      LocationID:
        '',

      Name:
        name
    })
  );
}


/* ============================================================
   AVERAGE RESPONSE TIME
============================================================ */

function calculateAverageResponseHours(
  reports
) {
  const values =
    reports
      .map(
        (report) => {
          const createdAt =
            parseDate(
              report.CreatedAt
            );


          const assignedAt =
            parseDate(
              report.AssignedAt
            );


          if (
            !createdAt ||
            !assignedAt ||
            assignedAt <
              createdAt
          ) {
            return null;
          }


          return (
            assignedAt.getTime() -
            createdAt.getTime()
          ) /
          (
            1000 *
            60 *
            60
          );
        }
      )
      .filter(
        Number.isFinite
      );


  if (
    values.length ===
    0
  ) {
    /*
     * No fake response-time number.
     *
     * Analytics.jsx will render this as "—".
     */
    return null;
  }


  return roundToOne(
    average(
      values
    )
  );
}


/* ============================================================
   AVERAGE RESOLUTION TIME
============================================================ */

async function calculateAverageResolutionDays(
  resolvedReports
) {
  if (
    resolvedReports.length ===
    0
  ) {
    return null;
  }


  const durations =
    await Promise.all(
      resolvedReports.map(
        async (
          report
        ) => {
          const detail =
            await loadReportDetail(
              report
            );


          /*
           * Use the detail response where possible.
           *
           * Prefer ResolvedAt if a newer backend eventually
           * exposes it.
           */
          const createdAt =
            parseDate(
              detail?.CreatedAt ??
              detail?.createdAt ??
              report.CreatedAt
            );


          const resolvedAt =
            parseDate(
              detail?.ResolvedAt ??
              detail?.resolvedAt ??
              report.ResolvedAt
            );


          const updatedAt =
            parseDate(
              detail?.UpdatedAt ??
              detail?.updatedAt ??
              report.UpdatedAt
            );


          const finishedAt =
            resolvedAt ||
            updatedAt;


          if (
            !createdAt ||
            !finishedAt ||
            finishedAt <
              createdAt
          ) {
            return null;
          }


          return (
            finishedAt.getTime() -
            createdAt.getTime()
          ) /
          (
            1000 *
            60 *
            60 *
            24
          );
        }
      )
    );


  const validDurations =
    durations.filter(
      Number.isFinite
    );


  if (
    validDurations.length ===
    0
  ) {
    return null;
  }


  return roundToOne(
    average(
      validDurations
    )
  );
}


/* ============================================================
   REPORT DETAILS
============================================================ */

async function loadReportDetail(
  report
) {
  const cacheKey =
    report.ReportID ??
    report.ReportCode;


  if (!cacheKey) {
    return null;
  }


  const cached =
    detailCache.get(
      cacheKey
    );


  if (
    cached &&
    Date.now() <
      cached.expiresAt
  ) {
    return cached.data;
  }


  let detail =
    null;


  /* ========================================================
     FIRST TRY:
     Admin report detail endpoint
  ======================================================== */

  if (
    report.ReportID !==
      null &&
    report.ReportID !==
      undefined
  ) {
    try {
      const response =
        await realApi.get(
          `/admin/reports/${
            report.ReportID
          }`
        );


      detail =
        response.data;
    } catch {
      /*
       * Fall through to the existing report-code search.
       */
    }
  }


  /* ========================================================
     FALLBACK:
     This is the same endpoint AllReports.jsx already uses
     when the admin clicks the eye icon.
  ======================================================== */

  if (
    !detail &&
    report.ReportCode
  ) {
    try {
      const response =
        await realApi.get(
          '/issues/search',
          {
            params: {
              code:
                report.ReportCode
            }
          }
        );


      detail =
        response.data;
    } catch {
      detail =
        null;
    }
  }


  detailCache.set(
    cacheKey,
    {
      data:
        detail,

      expiresAt:
        Date.now() +
        DETAIL_CACHE_DURATION_MS
    }
  );


  return detail;
}


/* ============================================================
   GROUP REPORTS
============================================================ */

function groupReports(
  reports,
  keySelector
) {
  const counts =
    new Map();


  reports.forEach(
    (report) => {
      const rawKey =
        keySelector(
          report
        );


      const key =
        String(
          rawKey ||
          ''
        ).trim();


      if (!key) {
        return;
      }


      counts.set(
        key,
        (
          counts.get(
            key
          ) ||
          0
        ) +
        1
      );
    }
  );


  return Array.from(
    counts.entries()
  );
}


/* ============================================================
   UNIQUE STRINGS
============================================================ */

function uniqueStrings(
  values
) {
  const map =
    new Map();


  values.forEach(
    (value) => {
      const clean =
        String(
          value ||
          ''
        ).trim();


      if (!clean) {
        return;
      }


      const key =
        clean.toLowerCase();


      if (
        !map.has(
          key
        )
      ) {
        map.set(
          key,
          clean
        );
      }
    }
  );


  return Array.from(
    map.values()
  ).sort(
    (
      first,
      second
    ) =>
      first.localeCompare(
        second
      )
  );
}


/* ============================================================
   STATUS NORMALISATION
============================================================ */

function normaliseStatus(
  value
) {
  const status =
    String(
      value ||
      ''
    ).trim();


  if (
    status ===
    'InProgress'
  ) {
    return 'In Progress';
  }


  return status;
}


/* ============================================================
   TEXT COMPARISON
============================================================ */

function sameText(
  first,
  second
) {
  return (
    String(
      first ||
      ''
    )
      .trim()
      .toLowerCase() ===
    String(
      second ||
      ''
    )
      .trim()
      .toLowerCase()
  );
}


/* ============================================================
   BOOLEAN VALUE
============================================================ */

function getBooleanValue(
  object,
  ...keys
) {
  for (
    const key of keys
  ) {
    if (
      typeof object?.[key] ===
      'boolean'
    ) {
      return object[
        key
      ];
    }
  }


  return false;
}


/* ============================================================
   DATE HELPERS
============================================================ */

function parseDate(
  value
) {
  if (!value) {
    return null;
  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }


  return date;
}


function parseLocalDate(
  value
) {
  if (!value) {
    return null;
  }


  const parts =
    String(
      value
    )
      .split('-')
      .map(
        Number
      );


  if (
    parts.length !==
      3 ||
    parts.some(
      (part) =>
        !Number.isFinite(
          part
        )
    )
  ) {
    return null;
  }


  const [
    year,
    month,
    day
  ] =
    parts;


  return new Date(
    year,
    month - 1,
    day
  );
}


function addDays(
  date,
  numberOfDays
) {
  const copy =
    new Date(
      date
    );


  copy.setDate(
    copy.getDate() +
    numberOfDays
  );


  return copy;
}


/* ============================================================
   NUMBER HELPERS
============================================================ */

function average(
  values
) {
  if (
    values.length ===
    0
  ) {
    return null;
  }


  return (
    values.reduce(
      (
        total,
        value
      ) =>
        total +
        value,
      0
    ) /
    values.length
  );
}


function roundToOne(
  value
) {
  return (
    Math.round(
      value *
      10
    ) /
    10
  );
}