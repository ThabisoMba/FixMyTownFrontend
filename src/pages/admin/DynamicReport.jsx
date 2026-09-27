import {
  useEffect,
  useState
} from 'react';

import {
  FileText,
  Download,
  RefreshCw
} from 'lucide-react';

import {
  jsPDF
} from 'jspdf';

import {
  autoTable
} from 'jspdf-autotable';

import api from '../../api/api';

import StatusBadge
  from '../../components/StatusBadge';

import PriorityDot
  from '../../components/PriorityDot';

import {
  useAuth
} from '../../context/AuthContext';


const STATUSES = [
  '',
  'Reported',
  'Assigned',
  'In Progress',
  'Resolved'
];


export default function DynamicReport() {
  const { user } =
    useAuth();

  const [
    categories,
    setCategories
  ] = useState([]);

  const [
    departments,
    setDepartments
  ] = useState([]);

  const [
    from,
    setFrom
  ] = useState('');

  const [
    to,
    setTo
  ] = useState('');

  const [
    categoryId,
    setCategoryId
  ] = useState('');

  const [
    departmentId,
    setDepartmentId
  ] = useState('');

  const [
    status,
    setStatus
  ] = useState('');

  const [
    report,
    setReport
  ] = useState(null);

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    exportingExcel,
    setExportingExcel
  ] = useState(false);

  const [
    exportingPdf,
    setExportingPdf
  ] = useState(false);


  /* ============================================================
     LOOKUPS
  ============================================================ */

  useEffect(() => {
    api
      .get('/lookups/categories')
      .then((res) =>
        setCategories(
          res.data
        )
      )
      .catch(() => {});

    api
      .get('/lookups/departments')
      .then((res) =>
        setDepartments(
          res.data
        )
      )
      .catch(() => {});
  }, []);


  /* ============================================================
     FILTER PARAMS
  ============================================================ */

  function buildParams() {
    const params = {};

    if (from) {
      params.from = from;
    }

    if (to) {
      params.to = to;
    }

    if (categoryId) {
      params.categoryId =
        categoryId;
    }

    if (departmentId) {
      params.departmentId =
        departmentId;
    }

    if (status) {
      params.status =
        status;
    }

    return params;
  }


  /* ============================================================
     LOAD REPORT
  ============================================================ */

  function loadReport() {
    setLoading(true);

    api
      .get(
        '/admin/reports/dynamic',
        {
          params:
            buildParams()
        }
      )
      .then((res) =>
        setReport(
          res.data
        )
      )
      .catch(() =>
        setReport(null)
      )
      .finally(() =>
        setLoading(false)
      );
  }


  useEffect(
    loadReport,
    []
  );


  /* ============================================================
     RESET
  ============================================================ */

  function resetFilters() {
    setFrom('');
    setTo('');
    setCategoryId('');
    setDepartmentId('');
    setStatus('');
  }


  /* ============================================================
     EXCEL EXPORT
     Existing backend export remains unchanged.
  ============================================================ */

  async function handleExportExcel() {
    setExportingExcel(true);

    try {
      const res =
        await api.get(
          '/admin/reports/export/excel',
          {
            params:
              buildParams(),

            responseType:
              'blob'
          }
        );

      const url =
        URL.createObjectURL(
          new Blob([
            res.data
          ])
        );

      const a =
        document.createElement(
          'a'
        );

      a.href = url;

      a.download =
        `fixmytown-issue-report-${
          new Date()
            .toISOString()
            .slice(0, 10)
        }.xlsx`;

      a.click();

      URL.revokeObjectURL(
        url
      );
    } catch {
      alert(
        'Could not export the Excel report right now. Please try again.'
      );
    } finally {
      setExportingExcel(false);
    }
  }


  /* ============================================================
     PDF EXPORT
     FRONTEND ONLY
  ============================================================ */

  async function handleExportPdf() {
    if (!report) {
      return;
    }

    const password =
      window.prompt(
        'Optional PDF password.\n\nLeave this blank if you do not want an opening password.\nThe exported PDF will still be read-only.',
        ''
      );

    /*
     * Cancel means the user does not
     * want to continue with the export.
     */
    if (password === null) {
      return;
    }

    setExportingPdf(true);

    try {
      const ownerPassword =
        `fixmytown-owner-${Date.now()}-${Math
          .random()
          .toString(36)
          .slice(2)}`;

      /*
       * A4 landscape gives the report table
       * enough width while remaining
       * print-friendly.
       *
       * Only "print" is given to the normal
       * PDF user.
       *
       * Modify/copy/annotation permissions
       * are deliberately not granted.
       */
      const doc =
        new jsPDF({
          orientation:
            'landscape',

          unit:
            'mm',

          format:
            'a4',

          compress:
            true,

          encryption: {
            userPassword:
              password,

            ownerPassword,

            userPermissions: [
              'print'
            ]
          }
        });


      const logo =
        await loadProjectLogo();

      const filters =
        report.filtersApplied ||
        {};

      const generatedAt =
        report.summary
          ?.GeneratedAt
          ? new Date(
              report.summary
                .GeneratedAt
            )
          : new Date();

      const requestedBy =
        user?.fullName ||
        'Municipal Administrator';


      /* ========================================================
         REPORT BRANDING / HEADING
      ======================================================== */

      drawPdfHeader(
        doc,
        logo
      );

      doc.setTextColor(
        22,
        40,
        63
      );

      doc.setFont(
        'helvetica',
        'bold'
      );

      doc.setFontSize(18);

      doc.text(
        'Issue Report',
        14,
        31
      );


      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.setFontSize(8.5);

      doc.setTextColor(
        107,
        118,
        136
      );

      doc.text(
        `Generated: ${
          generatedAt
            .toLocaleString(
              'en-ZA'
            )
        }`,
        283,
        30,
        {
          align: 'right'
        }
      );


      /* ========================================================
         PARAMETERS
      ======================================================== */

      doc.setFillColor(
        245,
        247,
        250
      );

      doc.setDrawColor(
        228,
        232,
        239
      );

      doc.roundedRect(
        14,
        37,
        269,
        22,
        2,
        2,
        'FD'
      );


      drawParameter(
        doc,
        'Date range',
        buildDateRange(
          filters
        ),
        18,
        43,
        59
      );

      drawParameter(
        doc,
        'Category',
        filters.CategoryName ||
          'All categories',
        84,
        43,
        59
      );

      drawParameter(
        doc,
        'Department',
        filters.DepartmentName ||
          'All departments',
        150,
        43,
        59
      );

      drawParameter(
        doc,
        'Status',
        filters.StatusName ||
          'All statuses',
        216,
        43,
        63
      );


      /* ========================================================
         REQUESTED BY
      ======================================================== */

      doc.setFontSize(8);

      doc.setFont(
        'helvetica',
        'bold'
      );

      doc.setTextColor(
        107,
        118,
        136
      );

      doc.text(
        'Report requested by:',
        14,
        65
      );


      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.setTextColor(
        26,
        39,
        64
      );

      doc.text(
        requestedBy,
        44,
        65
      );


      /* ========================================================
         REPORT TABLE
      ======================================================== */

      const rows =
        (
          report.lineItems ||
          []
        ).map(
          (item) => [
            `${item.Title || ''}\n#${
              item.ReportCode ||
              ''
            }`,

            item.CategoryName ||
              '-',

            item.Priority ||
              '-',

            item.Status ||
              '-',

            item.LocationName ||
              '-',

            formatReportDate(
              item.CreatedAt
            )
          ]
        );


      autoTable(
        doc,
        {
          startY: 71,

          margin: {
            top: 28,
            right: 14,
            bottom: 18,
            left: 14
          },

          head: [[
            'Report',
            'Category',
            'Priority',
            'Status',
            'Location',
            'Reported'
          ]],

          body:
            rows,

          theme:
            'grid',

          styles: {
            font:
              'helvetica',

            fontSize:
              8,

            textColor:
              [
                26,
                39,
                64
              ],

            cellPadding:
              2.7,

            lineColor:
              [
                228,
                232,
                239
              ],

            lineWidth:
              0.2,

            valign:
              'middle',

            overflow:
              'linebreak'
          },

          headStyles: {
            fillColor:
              [
                22,
                40,
                63
              ],

            textColor:
              [
                255,
                255,
                255
              ],

            fontStyle:
              'bold',

            fontSize:
              8
          },

          alternateRowStyles: {
            fillColor:
              [
                248,
                250,
                252
              ]
          },

          columnStyles: {
            0: {
              cellWidth:
                58
            },

            1: {
              cellWidth:
                38
            },

            2: {
              cellWidth:
                25
            },

            3: {
              cellWidth:
                31
            },

            4: {
              cellWidth:
                75
            },

            5: {
              cellWidth:
                30
            }
          },

          didDrawPage: () => {
            drawPdfHeader(
              doc,
              logo
            );
          }
        }
      );


      /* ========================================================
         SUBTOTALS / GRAND TOTAL
      ======================================================== */

      let summaryStartY =
        (
          doc.lastAutoTable
            ?.finalY ||
          70
        ) + 8;


      if (
        summaryStartY >
        165
      ) {
        doc.addPage();

        summaryStartY =
          34;

        drawPdfHeader(
          doc,
          logo
        );
      }


      autoTable(
        doc,
        {
          startY:
            summaryStartY,

          margin: {
            top: 28,
            right: 14,
            bottom: 18,
            left: 190
          },

          tableWidth:
            93,

          head: [[
            'Report Summary',
            'Count'
          ]],

          body: [
            [
              'Resolved subtotal',
              String(
                report.summary
                  ?.Resolved ??
                0
              )
            ],

            [
              'In progress subtotal',
              String(
                report.summary
                  ?.InProgress ??
                0
              )
            ],

            [
              'Grand total',
              String(
                report.summary
                  ?.TotalReports ??
                report.lineItems
                  ?.length ??
                0
              )
            ]
          ],

          theme:
            'grid',

          styles: {
            font:
              'helvetica',

            fontSize:
              8.5,

            cellPadding:
              3,

            lineColor:
              [
                228,
                232,
                239
              ],

            lineWidth:
              0.2
          },

          headStyles: {
            fillColor:
              [
                22,
                40,
                63
              ],

            textColor:
              [
                255,
                255,
                255
              ],

            fontStyle:
              'bold'
          },

          columnStyles: {
            0: {
              cellWidth:
                65
            },

            1: {
              cellWidth:
                28,

              halign:
                'right',

              fontStyle:
                'bold'
            }
          },

          didParseCell: (
            data
          ) => {
            if (
              data.section ===
                'body' &&
              data.row.index ===
                2
            ) {
              data.cell.styles
                .fontStyle =
                  'bold';

              data.cell.styles
                .fillColor =
                  [
                    253,
                    241,
                    222
                  ];
            }
          },

          didDrawPage: () => {
            drawPdfHeader(
              doc,
              logo
            );
          }
        }
      );


      /* ========================================================
         PAGE NUMBERS / FOOTERS
      ======================================================== */

      const pageCount =
        doc.getNumberOfPages();

      for (
        let page = 1;
        page <= pageCount;
        page += 1
      ) {
        doc.setPage(
          page
        );

        drawPdfFooter(
          doc,
          page,
          pageCount
        );
      }


      /* ========================================================
         PDF METADATA
      ======================================================== */

      doc.setProperties({
        title:
          'Fix MyTown Issue Report',

        subject:
          'Municipal issue report',

        author:
          requestedBy,

        creator:
          'Fix MyTown'
      });


      /* ========================================================
         SAVE
      ======================================================== */

      doc.save(
        `fixmytown-issue-report-${
          new Date()
            .toISOString()
            .slice(0, 10)
        }.pdf`
      );
    } catch (
      error
    ) {
      console.error(
        'PDF export error:',
        error
      );

      alert(
        'Could not export the PDF report right now. Please try again.'
      );
    } finally {
      setExportingPdf(false);
    }
  }


  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <div
      style={{
        padding: 24
      }}
    >
      <div
        className="card"
        style={{
          padding: 20,
          marginBottom: 20
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 4
          }}
        >
          <FileText
            size={18}
          />

          Issue reports
        </div>


        <div
          style={{
            fontSize: 12.5,
            color:
              'var(--text-secondary)',
            marginBottom: 16
          }}
        >
          Dynamic report - live data from FixMyTownDB
        </div>


        {report && (
          <div
            style={{
              display:
                'flex',

              flexWrap:
                'wrap',

              gap:
                8,

              alignItems:
                'center',

              background:
                'var(--bg-page)',

              padding:
                '10px 14px',

              borderRadius:
                8,

              marginBottom:
                16,

              border:
                '1px solid var(--navy-100)'
            }}
          >
            <span
              style={{
                fontSize:
                  12.5,

                fontWeight:
                  700,

                color:
                  'var(--navy-800)'
              }}
            >
              Filters applied:
            </span>


            <span
              style={
                filterBadgeStyle
              }
            >
              Date:{' '}
              {report
                .filtersApplied
                .From ||
                '(any)'}
              {' '}
              →
              {' '}
              {report
                .filtersApplied
                .To ||
                '(any)'}
            </span>


            <span
              style={
                filterBadgeStyle
              }
            >
              Category:{' '}
              {
                report
                  .filtersApplied
                  .CategoryName
              }
            </span>


            <span
              style={
                filterBadgeStyle
              }
            >
              Department:{' '}
              {
                report
                  .filtersApplied
                  .DepartmentName
              }
            </span>


            <span
              style={{
                ...filterBadgeStyle,

                fontWeight:
                  700,

                color:
                  'var(--navy-900, var(--navy-800))',

                background:
                  'var(--lime-100, #eaffc7)',

                border:
                  '1px solid var(--lime-300, #c8f27a)'
              }}
            >
              Status:{' '}
              {
                report
                  .filtersApplied
                  .StatusName
              }
            </span>
          </div>
        )}


        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color:
              'var(--text-secondary)',
            textTransform:
              'uppercase',
            marginBottom: 8
          }}
        >
          Filters
        </div>


        <div
          style={{
            display: 'grid',

            gridTemplateColumns:
              'repeat(6, 1fr)',

            gap: 10,

            alignItems:
              'end'
          }}
        >
          <div
            className="field"
            style={{
              marginBottom: 0
            }}
          >
            <label>
              From
            </label>

            <input
              type="date"
              value={from}
              onChange={(e) =>
                setFrom(
                  e.target.value
                )
              }
            />
          </div>


          <div
            className="field"
            style={{
              marginBottom: 0
            }}
          >
            <label>
              To
            </label>

            <input
              type="date"
              value={to}
              onChange={(e) =>
                setTo(
                  e.target.value
                )
              }
            />
          </div>


          <div
            className="field"
            style={{
              marginBottom: 0
            }}
          >
            <label>
              Category
            </label>

            <select
              value={
                categoryId
              }
              onChange={(e) =>
                setCategoryId(
                  e.target.value
                )
              }
            >
              <option value="">
                All categories
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={
                      category
                        .CategoryID
                    }
                    value={
                      category
                        .CategoryID
                    }
                  >
                    {category.Name}
                  </option>
                )
              )}
            </select>
          </div>


          <div
            className="field"
            style={{
              marginBottom: 0
            }}
          >
            <label>
              Department
            </label>

            <select
              value={
                departmentId
              }
              onChange={(e) =>
                setDepartmentId(
                  e.target.value
                )
              }
            >
              <option value="">
                All departments
              </option>

              {departments.map(
                (department) => (
                  <option
                    key={
                      department
                        .DepartmentID
                    }
                    value={
                      department
                        .DepartmentID
                    }
                  >
                    {department.Name}
                  </option>
                )
              )}
            </select>
          </div>


          <div
            className="field"
            style={{
              marginBottom: 0
            }}
          >
            <label>
              Status
            </label>

            <select
              value={
                status
              }
              onChange={(e) =>
                setStatus(
                  e.target.value
                )
              }
            >
              {STATUSES.map(
                (item) => (
                  <option
                    key={
                      item
                    }
                    value={
                      item
                    }
                  >
                    {
                      item ||
                      'All statuses'
                    }
                  </option>
                )
              )}
            </select>
          </div>


          <div
            style={{
              display: 'flex',
              gap: 8
            }}
          >
            <button
              className="btn btn-primary"
              onClick={
                loadReport
              }
              disabled={
                loading
              }
            >
              <RefreshCw
                size={14}
              />

              Apply
            </button>

            <button
              className="btn btn-outline"
              onClick={
                resetFilters
              }
            >
              Reset
            </button>
          </div>
        </div>
      </div>


      {/* ======================================================
          REPORT TABLE
      ====================================================== */}

      <div className="card">
        <table
          style={{
            width: '100%',
            borderCollapse:
              'collapse',
            fontSize: 13
          }}
        >
          <thead>
            <tr
              style={{
                textAlign:
                  'left',

                color:
                  'var(--text-secondary)',

                fontSize:
                  11,

                textTransform:
                  'uppercase'
              }}
            >
              {[
                'Report',
                'Category',
                'Priority',
                'Status',
                'Location',
                'Reported'
              ].map(
                (heading) => (
                  <th
                    key={
                      heading
                    }
                    style={{
                      padding:
                        '10px 16px'
                    }}
                  >
                    {heading}
                  </th>
                )
              )}
            </tr>
          </thead>


          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding:
                      24,

                    textAlign:
                      'center',

                    color:
                      'var(--text-secondary)'
                  }}
                >
                  Loading report...
                </td>
              </tr>
            )}


            {!loading &&
              report
                ?.lineItems
                .length ===
                0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding:
                        24,

                      textAlign:
                        'center',

                      color:
                        'var(--text-secondary)'
                    }}
                  >
                    No reports match
                    these filters.
                  </td>
                </tr>
              )}


            {!loading &&
              report
                ?.lineItems
                .map(
                  (item) => (
                    <tr
                      key={
                        item.ReportID
                      }
                      style={{
                        borderTop:
                          '1px solid var(--border)'
                      }}
                    >
                      <td
                        style={{
                          padding:
                            '12px 16px'
                        }}
                      >
                        <div
                          style={{
                            fontWeight:
                              600
                          }}
                        >
                          {item.Title}
                        </div>

                        <div
                          style={{
                            fontSize:
                              11,

                            color:
                              'var(--text-muted)'
                          }}
                        >
                          #
                          {
                            item
                              .ReportCode
                          }
                        </div>
                      </td>

                      <td
                        style={{
                          padding:
                            '12px 16px'
                        }}
                      >
                        {
                          item
                            .CategoryName
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            '12px 16px'
                        }}
                      >
                        <PriorityDot
                          priority={
                            item.Priority
                          }
                        />
                      </td>

                      <td
                        style={{
                          padding:
                            '12px 16px'
                        }}
                      >
                        <StatusBadge
                          status={
                            item.Status
                          }
                        />
                      </td>

                      <td
                        style={{
                          padding:
                            '12px 16px'
                        }}
                      >
                        {
                          item
                            .LocationName
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            '12px 16px'
                        }}
                      >
                        {
                          new Date(
                            item.CreatedAt
                          )
                            .toLocaleDateString()
                        }
                      </td>
                    </tr>
                  )
                )}
          </tbody>
        </table>
      </div>


      {/* ======================================================
          SUMMARY / EXPORTS
      ====================================================== */}

      {report && (
        <div
          className="card"
          style={{
            marginTop: 12,

            padding:
              '14px 20px',

            display:
              'flex',

            alignItems:
              'center',

            gap:
              24,

            flexWrap:
              'wrap'
          }}
        >
          <div
            style={{
              fontSize:
                13,

              color:
                'var(--text-secondary)'
            }}
          >
            <strong
              style={{
                color:
                  'var(--text-primary)'
              }}
            >
              {
                report
                  .summary
                  .TotalReports
              }
            </strong>
            {' '}
            reports shown
          </div>


          <div
            style={{
              fontSize:
                13,

              color:
                'var(--text-secondary)'
            }}
          >
            <strong
              style={{
                color:
                  'var(--text-primary)'
              }}
            >
              {
                report
                  .summary
                  .Resolved
              }
            </strong>
            {' '}
            resolved
          </div>


          <div
            style={{
              fontSize:
                13,

              color:
                'var(--text-secondary)'
            }}
          >
            <strong
              style={{
                color:
                  'var(--text-primary)'
              }}
            >
              {
                report
                  .summary
                  .InProgress
              }
            </strong>
            {' '}
            in progress
          </div>


          <div
            style={{
              fontSize:
                12,

              color:
                'var(--text-muted)',

              marginLeft:
                'auto'
            }}
          >
            Generated{' '}
            {
              new Date(
                report
                  .summary
                  .GeneratedAt
              )
                .toLocaleString()
            }
          </div>


          {/* EXPORT EXCEL */}

          <button
            className="btn btn-gold"
            onClick={
              handleExportExcel
            }
            disabled={
              exportingExcel ||
              exportingPdf
            }
          >
            <Download
              size={14}
            />

            {
              exportingExcel
                ? 'Exporting...'
                : 'Export Excel'
            }
          </button>


          {/* EXPORT PDF */}

          <button
            className="btn btn-primary"
            onClick={
              handleExportPdf
            }
            disabled={
              exportingPdf ||
              exportingExcel
            }
          >
            <FileText
              size={14}
            />

            {
              exportingPdf
                ? 'Creating PDF...'
                : 'Export PDF'
            }
          </button>
        </div>
      )}
    </div>
  );
}


/* ============================================================
   FILTER BADGE STYLE
============================================================ */

const filterBadgeStyle = {
  fontSize: 12,

  fontWeight: 600,

  color:
    'var(--navy-800)',

  background:
    '#fff',

  border:
    '1px solid var(--navy-100)',

  borderRadius:
    999,

  padding:
    '4px 10px'
};


/* ============================================================
   PDF HEADER
============================================================ */

function drawPdfHeader(
  doc,
  logo
) {
  const pageWidth =
    doc.internal.pageSize
      .getWidth();


  doc.setFillColor(
    22,
    40,
    63
  );

  doc.rect(
    0,
    0,
    pageWidth,
    22,
    'F'
  );


  if (logo) {
    try {
      doc.addImage(
        logo,
        'PNG',
        14,
        5,
        12,
        12
      );
    } catch {
      /*
       * If the favicon is not a PNG
       * format supported by jsPDF,
       * the textual brand remains.
       */
    }
  }


  doc.setFont(
    'helvetica',
    'bold'
  );

  doc.setFontSize(13);

  doc.setTextColor(
    255,
    255,
    255
  );

  doc.text(
    'Fix',
    30,
    12.7
  );


  doc.setTextColor(
    242,
    169,
    61
  );

  doc.text(
    'MyTown',
    39,
    12.7
  );


  doc.setFont(
    'helvetica',
    'normal'
  );

  doc.setFontSize(8);

  doc.setTextColor(
    210,
    219,
    231
  );

  doc.text(
    'Municipal Issue Reporting',
    pageWidth - 14,
    12.7,
    {
      align:
        'right'
    }
  );
}


/* ============================================================
   PDF FOOTER / PAGE NUMBERS
============================================================ */

function drawPdfFooter(
  doc,
  pageNumber,
  pageCount
) {
  const pageWidth =
    doc.internal.pageSize
      .getWidth();

  const pageHeight =
    doc.internal.pageSize
      .getHeight();


  doc.setDrawColor(
    228,
    232,
    239
  );

  doc.line(
    14,
    pageHeight - 11,
    pageWidth - 14,
    pageHeight - 11
  );


  doc.setFont(
    'helvetica',
    'normal'
  );

  doc.setFontSize(7.5);

  doc.setTextColor(
    107,
    118,
    136
  );


  doc.text(
    'Fix MyTown Issue Report',
    14,
    pageHeight - 6
  );


  doc.text(
    `Page ${pageNumber} of ${pageCount}`,
    pageWidth - 14,
    pageHeight - 6,
    {
      align:
        'right'
    }
  );
}


/* ============================================================
   PDF PARAMETER FIELD
============================================================ */

function drawParameter(
  doc,
  label,
  value,
  x,
  y,
  width
) {
  doc.setFont(
    'helvetica',
    'bold'
  );

  doc.setFontSize(7);

  doc.setTextColor(
    107,
    118,
    136
  );

  doc.text(
    label.toUpperCase(),
    x,
    y
  );


  doc.setFont(
    'helvetica',
    'normal'
  );

  doc.setFontSize(8.2);

  doc.setTextColor(
    26,
    39,
    64
  );


  const fitted =
    doc.splitTextToSize(
      String(
        value ||
        '-'
      ),
      width
    );


  doc.text(
    fitted.slice(
      0,
      2
    ),
    x,
    y + 5
  );
}


/* ============================================================
   DATE RANGE FOR PDF PARAMETERS
============================================================ */

function buildDateRange(
  filters
) {
  const fromValue =
    filters?.From ||
    'Any';

  const toValue =
    filters?.To ||
    'Any';

  return `${fromValue} - ${toValue}`;
}


/* ============================================================
   TABLE DATE
============================================================ */

function formatReportDate(
  value
) {
  if (!value) {
    return '-';
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '-';
  }

  return date
    .toLocaleDateString(
      'en-ZA'
    );
}


/* ============================================================
   LOAD PROJECT LOGO
============================================================ */

async function loadProjectLogo() {
  try {
    /*
     * BASE_URL keeps this working when
     * deployed under /grp-03-39/.
     */
    const logoUrl =
      `${import.meta.env.BASE_URL}favicon.png`;

    const response =
      await fetch(
        logoUrl
      );

    if (!response.ok) {
      return null;
    }

    const blob =
      await response.blob();

    return await blobToDataUrl(
      blob
    );
  } catch {
    return null;
  }
}


/* ============================================================
   BLOB -> DATA URL
============================================================ */

function blobToDataUrl(
  blob
) {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      const reader =
        new FileReader();

      reader.onload =
        () =>
          resolve(
            reader.result
          );

      reader.onerror =
        () =>
          reject(
            reader.error
          );

      reader.readAsDataURL(
        blob
      );
    }
  );
}