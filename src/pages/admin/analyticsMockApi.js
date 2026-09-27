/*
 * ============================================================
 * FIX MY TOWN - ANALYTICS MOCK API
 * ============================================================
 *
 * Temporary frontend-only analytics data source.
 *
 * This file deliberately mimics the small part of Axios used by
 * Analytics.jsx:
 *
 *   api.get('/admin/analytics', { params })
 *   api.get('/lookups/categories')
 *   api.get('/lookups/locations')
 *
 * No backend request is made.
 *
 * The mock data is internally consistent:
 *
 * - TotalIssues comes from the filtered reports
 * - ResolutionRate comes from resolved / total
 * - AvgResponseHours comes from matching reports
 * - AvgResolutionDays comes from matching resolved reports
 * - byCategory comes from the same filtered reports
 * - byLocation comes from the same filtered reports
 *
 * The report dates are relative to the current date so:
 *
 * - Today
 * - Last 7 Days
 * - Last 30 Days
 * - Last 90 Days
 *
 * continue to work during the demo.
 * ============================================================
 */


/* ============================================================
   CATEGORIES
============================================================ */

const MOCK_CATEGORIES = [
  {
    CategoryID: 1,
    Name: 'Electricity'
  },
  {
    CategoryID: 2,
    Name: 'Graffiti'
  },
  {
    CategoryID: 3,
    Name: 'Other'
  },
  {
    CategoryID: 4,
    Name: 'Parks'
  },
  {
    CategoryID: 5,
    Name: 'Pothole'
  },
  {
    CategoryID: 6,
    Name: 'Public Safety'
  },
  {
    CategoryID: 7,
    Name: 'Sanitation'
  },
  {
    CategoryID: 8,
    Name: 'Street Light'
  },
  {
    CategoryID: 9,
    Name: 'Waste Management'
  },
  {
    CategoryID: 10,
    Name: 'Water Supply'
  }
];


/* ============================================================
   LOCATIONS
============================================================ */

const MOCK_LOCATIONS = [
  {
    LocationID: 1,
    Name: 'Gqeberha'
  },
  {
    LocationID: 2,
    Name: 'KuGompo City'
  },
  {
    LocationID: 3,
    Name: 'KwaZulu-Natal'
  },
  {
    LocationID: 4,
    Name: 'Long Street'
  },
  {
    LocationID: 5,
    Name: 'Main Street near post office'
  },
  {
    LocationID: 6,
    Name: 'Midvaal Local Municipality'
  },
  {
    LocationID: 7,
    Name: 'Mohokare Local Municipality'
  },
  {
    LocationID: 8,
    Name: 'Newcastle Local Municipality'
  },
  {
    LocationID: 9,
    Name: 'Ngagane, Newcastle Local Municipality'
  },
  {
    LocationID: 10,
    Name: 'Oak Road near school'
  },
  {
    LocationID: 11,
    Name: 'Queensburgh'
  },
  {
    LocationID: 12,
    Name: 'Smith Street'
  },
  {
    LocationID: 13,
    Name: 'Sol Plaatje Local Municipality'
  },
  {
    LocationID: 14,
    Name: 'Tswelopele Local Municipality'
  },
  {
    LocationID: 15,
    Name: 'Zone 3 park area'
  },
  {
    LocationID: 16,
    Name: 'iBhayi'
  },
  {
    LocationID: 17,
    Name: 'Karas'
  },
  {
    LocationID: 18,
    Name: '5th Avenue near library'
  },
  {
    LocationID: 19,
    Name: 'Chakaskraal, KwaDukuza Local Municipality'
  },
  {
    LocationID: 20,
    Name: 'Elias Motsoaledi Local Municipality'
  }
];


/* ============================================================
   REPORT FIXTURES
============================================================ */

/*
 * daysAgo is relative to the current browser date.
 *
 * This makes the date filters stay useful instead of becoming
 * stale after the demo date changes.
 *
 * The full unfiltered fixture intentionally contains:
 *
 *   34 reports
 *   10 resolved
 *   Resolution rate = 29%
 *   Average resolution = 4.3 days
 *   8 active workers
 *
 * These values are derived from the rows below. They are not
 * separately hard-coded into the response.
 */

const MOCK_REPORT_SPECS = [
  {
    id: 1,
    categoryId: 1,
    locationId: 1,
    daysAgo: 0,
    status: 'Resolved',
    responseHours: 1.2,
    resolutionDays: 2.4
  },

  {
    id: 2,
    categoryId: 8,
    locationId: 3,
    daysAgo: 0,
    status: 'Assigned',
    responseHours: 0.7,
    resolutionDays: null
  },

  {
    id: 3,
    categoryId: 10,
    locationId: 1,
    daysAgo: 0,
    status: 'InProgress',
    responseHours: 1.5,
    resolutionDays: null
  },

  {
    id: 4,
    categoryId: 8,
    locationId: 2,
    daysAgo: 1,
    status: 'Resolved',
    responseHours: 0.8,
    resolutionDays: 1.5
  },

  {
    id: 5,
    categoryId: 5,
    locationId: 4,
    daysAgo: 2,
    status: 'Resolved',
    responseHours: 2.2,
    resolutionDays: 2.8
  },

  {
    id: 6,
    categoryId: 2,
    locationId: 16,
    daysAgo: 3,
    status: 'Reported',
    responseHours: null,
    resolutionDays: null
  },

  {
    id: 7,
    categoryId: 8,
    locationId: 5,
    daysAgo: 4,
    status: 'Assigned',
    responseHours: 1.1,
    resolutionDays: null
  },

  {
    id: 8,
    categoryId: 10,
    locationId: 8,
    daysAgo: 5,
    status: 'Resolved',
    responseHours: 1.7,
    resolutionDays: 5.2
  },

  {
    id: 9,
    categoryId: 1,
    locationId: 3,
    daysAgo: 6,
    status: 'Assigned',
    responseHours: 0.5,
    resolutionDays: null
  },

  {
    id: 10,
    categoryId: 4,
    locationId: 15,
    daysAgo: 8,
    status: 'InProgress',
    responseHours: 2.5,
    resolutionDays: null
  },

  {
    id: 11,
    categoryId: 5,
    locationId: 1,
    daysAgo: 10,
    status: 'Assigned',
    responseHours: 1.3,
    resolutionDays: null
  },

  {
    id: 12,
    categoryId: 8,
    locationId: 12,
    daysAgo: 12,
    status: 'Resolved',
    responseHours: 0.6,
    resolutionDays: 3.1
  },

  {
    id: 13,
    categoryId: 9,
    locationId: 13,
    daysAgo: 14,
    status: 'Reported',
    responseHours: null,
    resolutionDays: null
  },

  {
    id: 14,
    categoryId: 10,
    locationId: 11,
    daysAgo: 17,
    status: 'Assigned',
    responseHours: 2.1,
    resolutionDays: null
  },

  {
    id: 15,
    categoryId: 5,
    locationId: 10,
    daysAgo: 20,
    status: 'Resolved',
    responseHours: 3.4,
    resolutionDays: 3.2
  },

  {
    id: 16,
    categoryId: 7,
    locationId: 1,
    daysAgo: 23,
    status: 'InProgress',
    responseHours: 1.8,
    resolutionDays: null
  },

  {
    id: 17,
    categoryId: 8,
    locationId: 17,
    daysAgo: 27,
    status: 'Assigned',
    responseHours: 0.9,
    resolutionDays: null
  },

  {
    id: 18,
    categoryId: 6,
    locationId: 3,
    daysAgo: 29,
    status: 'Assigned',
    responseHours: 1.4,
    resolutionDays: null
  },

  {
    id: 19,
    categoryId: 1,
    locationId: 7,
    daysAgo: 35,
    status: 'InProgress',
    responseHours: 2.7,
    resolutionDays: null
  },

  {
    id: 20,
    categoryId: 10,
    locationId: 6,
    daysAgo: 42,
    status: 'Assigned',
    responseHours: 1.9,
    resolutionDays: null
  },

  {
    id: 21,
    categoryId: 8,
    locationId: 18,
    daysAgo: 50,
    status: 'Assigned',
    responseHours: 0.7,
    resolutionDays: null
  },

  {
    id: 22,
    categoryId: 4,
    locationId: 20,
    daysAgo: 58,
    status: 'Resolved',
    responseHours: 2.3,
    resolutionDays: 7.4
  },

  {
    id: 23,
    categoryId: 5,
    locationId: 8,
    daysAgo: 67,
    status: 'Assigned',
    responseHours: 1.6,
    resolutionDays: null
  },

  {
    id: 24,
    categoryId: 2,
    locationId: 1,
    daysAgo: 74,
    status: 'Reported',
    responseHours: null,
    resolutionDays: null
  },

  {
    id: 25,
    categoryId: 8,
    locationId: 14,
    daysAgo: 82,
    status: 'Resolved',
    responseHours: 1.1,
    resolutionDays: 4.6
  },

  {
    id: 26,
    categoryId: 10,
    locationId: 19,
    daysAgo: 89,
    status: 'Resolved',
    responseHours: 1.8,
    resolutionDays: 6.1
  },

  {
    id: 27,
    categoryId: 9,
    locationId: 9,
    daysAgo: 95,
    status: 'InProgress',
    responseHours: 2.9,
    resolutionDays: null
  },

  {
    id: 28,
    categoryId: 7,
    locationId: 2,
    daysAgo: 103,
    status: 'Resolved',
    responseHours: 2.4,
    resolutionDays: 6.7
  },

  {
    id: 29,
    categoryId: 3,
    locationId: 3,
    daysAgo: 112,
    status: 'Reported',
    responseHours: null,
    resolutionDays: null
  },

  {
    id: 30,
    categoryId: 1,
    locationId: 1,
    daysAgo: 121,
    status: 'Assigned',
    responseHours: 0.4,
    resolutionDays: null
  },

  {
    id: 31,
    categoryId: 5,
    locationId: 7,
    daysAgo: 135,
    status: 'Assigned',
    responseHours: 1.2,
    resolutionDays: null
  },

  {
    id: 32,
    categoryId: 8,
    locationId: 13,
    daysAgo: 150,
    status: 'Assigned',
    responseHours: 0.8,
    resolutionDays: null
  },

  {
    id: 33,
    categoryId: 4,
    locationId: 16,
    daysAgo: 175,
    status: 'Assigned',
    responseHours: 2.0,
    resolutionDays: null
  },

  {
    id: 34,
    categoryId: 10,
    locationId: 5,
    daysAgo: 210,
    status: 'Reported',
    responseHours: null,
    resolutionDays: null
  }
];


/* ============================================================
   WORKERS
============================================================ */

const TOTAL_ACTIVE_WORKERS = 8;


/* ============================================================
   PUBLIC MOCK API
============================================================ */

const analyticsMockApi = {
  async get(path, config = {}) {
    /*
     * Small delay so Analytics.jsx behaves like it is receiving
     * a normal asynchronous response.
     */
    await delay(120);


    /* ========================================================
       CATEGORY LOOKUP
    ======================================================== */

    if (path === '/lookups/categories') {
      return {
        data: MOCK_CATEGORIES.map((item) => ({
          ...item
        }))
      };
    }


    /* ========================================================
       LOCATION LOOKUP
    ======================================================== */

    if (path === '/lookups/locations') {
      return {
        data: MOCK_LOCATIONS.map((item) => ({
          ...item
        }))
      };
    }


    /* ========================================================
       ANALYTICS
    ======================================================== */

    if (path === '/admin/analytics') {
      const params =
        config?.params || {};

      const response =
        buildAnalyticsResponse(
          params
        );

      /*
       * Useful during your demonstration:
       *
       * Open DevTools -> Console and you will see both the
       * applied filters and the generated analytics response.
       */
      console.log(
        '[Analytics Mock] filters:',
        params
      );

      console.log(
        '[Analytics Mock] response:',
        response
      );

      return {
        data: response
      };
    }


    throw new Error(
      `Analytics mock API does not support: ${path}`
    );
  }
};


export default analyticsMockApi;


/* ============================================================
   RESPONSE BUILDER
============================================================ */

function buildAnalyticsResponse(
  params
) {
  const reports =
    createReports();

  const filteredReports =
    reports.filter(
      (report) =>
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


  /* ========================================================
     TOTAL ISSUES
  ======================================================== */

  const totalIssues =
    filteredReports.length;


  /* ========================================================
     RESOLVED
  ======================================================== */

  const resolvedReports =
    filteredReports.filter(
      (report) =>
        report.Status ===
        'Resolved'
    );

  const resolvedCount =
    resolvedReports.length;


  /* ========================================================
     RESPONSE TIME
  ======================================================== */

  const responseValues =
    filteredReports
      .map(
        (report) =>
          report.ResponseHours
      )
      .filter(
        (value) =>
          Number.isFinite(
            value
          )
      );

  const avgResponseHours =
    average(
      responseValues
    );


  /* ========================================================
     RESOLUTION TIME
  ======================================================== */

  const resolutionValues =
    resolvedReports
      .map(
        (report) =>
          report.ResolutionDays
      )
      .filter(
        (value) =>
          Number.isFinite(
            value
          )
      );

  const avgResolutionDays =
    average(
      resolutionValues
    );


  /* ========================================================
     CATEGORY COUNTS
  ======================================================== */

  const byCategory =
    groupReports(
      filteredReports,
      (report) =>
        report.CategoryName
    )
      .map(
        ([CategoryName, IssueCount]) => ({
          CategoryName,
          IssueCount
        })
      )
      .sort(sortCounts);


  /* ========================================================
     LOCATION COUNTS
  ======================================================== */

  const byLocation =
    groupReports(
      filteredReports,
      (report) =>
        report.LocationName
    )
      .map(
        ([LocationName, IssueCount]) => ({
          LocationName,
          IssueCount
        })
      )
      .sort(
        (a, b) =>
          b.IssueCount -
            a.IssueCount ||
          a.LocationName.localeCompare(
            b.LocationName
          )
      );


  /* ========================================================
     FINAL RESPONSE
  ======================================================== */

  return {
    TotalIssues:
      totalIssues,

    TotalWorkers:
      TOTAL_ACTIVE_WORKERS,

    ResolutionRate:
      totalIssues === 0
        ? 0
        : Math.round(
            (
              resolvedCount /
              totalIssues
            ) *
            100
          ),

    AvgResponseHours:
      avgResponseHours === null
        ? null
        : roundToOne(
            avgResponseHours
          ),

    AvgResolutionDays:
      avgResolutionDays === null
        ? null
        : roundToOne(
            avgResolutionDays
          ),

    byCategory,

    byLocation
  };
}


/* ============================================================
   CREATE FULL REPORT OBJECTS
============================================================ */

function createReports() {
  const today =
    startOfLocalDay(
      new Date()
    );

  return MOCK_REPORT_SPECS.map(
    (spec) => {
      const category =
        MOCK_CATEGORIES.find(
          (item) =>
            item.CategoryID ===
            spec.categoryId
        );

      const location =
        MOCK_LOCATIONS.find(
          (item) =>
            item.LocationID ===
            spec.locationId
        );

      return {
        ReportID:
          spec.id,

        CategoryID:
          spec.categoryId,

        CategoryName:
          category?.Name ||
          'Other',

        LocationID:
          spec.locationId,

        LocationName:
          location?.Name ||
          'Unknown',

        CreatedAt:
          addDays(
            today,
            -spec.daysAgo
          ),

        Status:
          spec.status,

        ResponseHours:
          spec.responseHours,

        ResolutionDays:
          spec.resolutionDays
      };
    }
  );
}


/* ============================================================
   DATE FILTER
============================================================ */

function matchesDateFilter(
  report,
  params
) {
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
    report.CreatedAt < from
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
      report.CreatedAt >=
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
  if (
    params.categoryId !==
      undefined &&
    params.categoryId !==
      null &&
    params.categoryId !==
      ''
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


  if (
    params.category
  ) {
    return (
      report.CategoryName ===
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
    params.locationId !==
      undefined &&
    params.locationId !==
      null &&
    params.locationId !==
      ''
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
    return (
      report.LocationName ===
      params.location
    );
  }


  return true;
}


/* ============================================================
   GROUPING
============================================================ */

function groupReports(
  reports,
  keySelector
) {
  const counts =
    new Map();

  reports.forEach(
    (report) => {
      const key =
        keySelector(
          report
        );

      counts.set(
        key,
        (
          counts.get(key) ||
          0
        ) + 1
      );
    }
  );

  return Array.from(
    counts.entries()
  );
}


function sortCounts(
  a,
  b
) {
  return (
    b.IssueCount -
      a.IssueCount ||
    a.CategoryName.localeCompare(
      b.CategoryName
    )
  );
}


/* ============================================================
   DATE HELPERS
============================================================ */

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
  amount
) {
  const copy =
    new Date(date);

  copy.setDate(
    copy.getDate() +
    amount
  );

  return startOfLocalDay(
    copy
  );
}


function parseLocalDate(
  value
) {
  if (!value) {
    return null;
  }

  const parts =
    String(value)
      .split('-')
      .map(Number);

  if (
    parts.length !== 3 ||
    parts.some(
      (part) =>
        !Number.isFinite(part)
    )
  ) {
    return null;
  }

  const [
    year,
    month,
    day
  ] = parts;

  return new Date(
    year,
    month - 1,
    day
  );
}


/* ============================================================
   NUMBER HELPERS
============================================================ */

function average(
  values
) {
  if (!values.length) {
    return null;
  }

  return (
    values.reduce(
      (total, value) =>
        total + value,
      0
    ) /
    values.length
  );
}


function roundToOne(
  value
) {
  return Math.round(
    value * 10
  ) / 10;
}


/* ============================================================
   ASYNC HELPER
============================================================ */

function delay(
  milliseconds
) {
  return new Promise(
    (resolve) => {
      setTimeout(
        resolve,
        milliseconds
      );
    }
  );
}