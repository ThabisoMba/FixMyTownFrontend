import { useEffect, useState } from 'react';
import {
  ClipboardList,
  Eye,
  UserPlus,
  Search,
  X
} from 'lucide-react';

import api from '../../api/api';
import TopBar from '../../components/TopBar';
import StatusBadge from '../../components/StatusBadge';
import PriorityDot from '../../components/PriorityDot';

const STATUSES = [
  'All Status',
  'Reported',
  'Assigned',
  'In Progress',
  'Resolved'
];

// Backend URL where wwwroot/uploads is served
const API_ORIGIN = 'http://localhost:5000';

export default function AllReports() {
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState('All Status');
  const [search, setSearch] = useState('');

  const [selectedReport, setSelectedReport] = useState(null);
  const [searchingCode, setSearchingCode] = useState(false);
  const [searchError, setSearchError] = useState('');

  function load() {
    api
      .get('/admin/reports', {
        params: {
          status,
          search
        }
      })
      .then((res) => {
        setReports(res.data);
      })
      .catch(() => {});
  }

  useEffect(() => {
    load();
  }, [status, search]);

  /*
   * Converts the backend photo URL:
   *
   * /uploads/photo.jpg
   *
   * into:
   *
   * http://localhost:5000/uploads/photo.jpg
   *
   * This is important because React is running on a different
   * port from the ASP.NET Core backend.
   */
  function getPhotoUrl(photo) {
    if (!photo) {
      return '';
    }

    // If backend already returned a complete URL
    if (
      photo.startsWith('http://') ||
      photo.startsWith('https://')
    ) {
      return photo;
    }

    // Make sure there is a slash between the host and path
    if (photo.startsWith('/')) {
      return `${API_ORIGIN}${photo}`;
    }

    return `${API_ORIGIN}/${photo}`;
  }

  async function handleSearchByCode() {
    const code = search.trim();

    if (!code) {
      setSearchError('');
      setSelectedReport(null);
      load();
      return;
    }

    const looksLikeReportCode =
      /^GRP-\d{6}-\d{4}$/i.test(code);

    if (!looksLikeReportCode) {
      setSearchError(
        'Please enter a valid report code, for example GRP-260807-0002.'
      );
      return;
    }

    setSearchingCode(true);
    setSearchError('');
    setSelectedReport(null);

    try {
      const response = await api.get('/issues/search', {
        params: {
          code
        }
      });

      setSelectedReport(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setSearchError(
          `No report found with code "${code}".`
        );
      } else {
        setSearchError(
          err.response?.data?.message ||
          'Could not search for this report.'
        );
      }
    } finally {
      setSearchingCode(false);
    }
  }

  function handleSearchKeyDown(e) {
    if (e.key === 'Enter') {
      handleSearchByCode();
    }
  }

  function clearCodeSearch() {
    setSearch('');
    setSelectedReport(null);
    setSearchError('');
  }

  /*
   * Called when the eye button is clicked.
   *
   * It gets the complete report details from:
   * GET /api/issues/search?code=...
   *
   * Then selectedReport is populated and the modal opens.
   */
  async function viewReport(report) {
    try {
      setSearchError('');
      setSearchingCode(true);

      const response = await api.get('/issues/search', {
        params: {
          code: report.ReportCode
        }
      });

      setSelectedReport(response.data);
    } catch (err) {
      setSearchError(
        err.response?.data?.message ||
        'Could not load report details.'
      );
    } finally {
      setSearchingCode(false);
    }
  }

  function closeModal() {
    setSelectedReport(null);
  }

  return (
    <div>
      <TopBar
        section="Admin"
        page="All Reports"
        onRefresh={load}
        showExport
      />

      <div style={{ padding: 24 }}>
        <div className="card">

          {/* HEADER */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
              gap: 12,
              flexWrap: 'wrap'
            }}
          >
            <strong
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <ClipboardList size={17} />
              All Reports ({reports.length})
            </strong>

            <div
              style={{
                marginLeft: 'auto',
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                flexWrap: 'wrap'
              }}
            >
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  fontSize: 13
                }}
              >
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Search
                  size={14}
                  style={{
                    position: 'absolute',
                    left: 10,
                    color: 'var(--text-muted)'
                  }}
                />

                <input
                  placeholder="Search by report ID..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSearchError('');
                    setSelectedReport(null);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  style={{
                    padding: '8px 12px 8px 30px',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    fontSize: 13,
                    width: 220
                  }}
                />
              </div>

              <button
                className="btn btn-primary"
                onClick={handleSearchByCode}
                disabled={searchingCode}
                style={{
                  padding: '8px 14px',
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Search size={14} />

                {searchingCode
                  ? 'Searching...'
                  : 'Search'}
              </button>

              {search && (
                <button
                  onClick={clearCodeSearch}
                  style={{
                    width: 32,
                    height: 32,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-page)',
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {/* SEARCH ERROR */}
          {searchError && (
            <div
              style={{
                margin: '16px 20px 0',
                padding: '10px 14px',
                borderRadius: 8,
                background: '#fdecec',
                color: '#c0362c',
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>{searchError}</span>

              <button
                onClick={() => setSearchError('')}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'inherit'
                }}
              >
                <X size={15} />
              </button>
            </div>
          )}

          {/* REPORTS TABLE */}
          <div
            style={{
              overflowX: 'auto'
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 13
              }}
            >
              <thead>
                <tr
                  style={{
                    textAlign: 'left',
                    color: 'var(--text-secondary)',
                    fontSize: 11,
                    textTransform: 'uppercase'
                  }}
                >
                  {[
                    'ID',
                    'Issue',
                    'Category',
                    'Priority',
                    'Location',
                    'Status',
                    'Worker',
                    'Reported',
                    'View'
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: '10px 16px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {reports.map((report) => (
                  <tr
                    key={report.ReportID}
                    style={{
                      borderTop: '1px solid var(--border)'
                    }}
                  >
                    <td
                      style={{
                        padding: '12px 16px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      #{report.ReportCode}
                    </td>

                    <td
                      style={{
                        padding: '12px 16px'
                      }}
                    >
                      {report.Title}
                    </td>

                    <td
                      style={{
                        padding: '12px 16px'
                      }}
                    >
                      {report.CategoryName}
                    </td>

                    <td
                      style={{
                        padding: '12px 16px'
                      }}
                    >
                      <PriorityDot
                        priority={report.Priority}
                      />
                    </td>

                    <td
                      style={{
                        padding: '12px 16px'
                      }}
                    >
                      {report.LocationName}
                    </td>

                    <td
                      style={{
                        padding: '12px 16px'
                      }}
                    >
                      <StatusBadge
                        status={report.Status}
                      />
                    </td>

                    <td
                      style={{
                        padding: '12px 16px'
                      }}
                    >
                      {report.WorkerName || '—'}
                    </td>

                    <td
                      style={{
                        padding: '12px 16px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {new Date(
                        report.CreatedAt
                      ).toLocaleDateString()}
                    </td>

                    {/* ACTIONS */}
                    <td
                      style={{
                        padding: '12px 16px'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          gap: 6,
                          alignItems: 'center'
                        }}
                      >
                        {/* EYE BUTTON */}
                        <IconBtn
                          icon={<Eye size={15} />}
                          onClick={() =>
                            viewReport(report)
                          }
                          title="View report"
                        />

                      </div>
                    </td>
                  </tr>
                ))}

                {reports.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        padding: 24,
                        textAlign: 'center',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      No reports match this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =====================================================
          REPORT DETAILS MODAL
          ===================================================== */}
      {selectedReport && (
        <ReportModal
          report={selectedReport}
          onClose={closeModal}
          getPhotoUrl={getPhotoUrl}
        />
      )}
    </div>
  );
}


/* =========================================================
   REPORT MODAL
   ========================================================= */

function ReportModal({
  report,
  onClose,
  getPhotoUrl
}) {
  /*
   * Close the modal when the user clicks the darkened
   * background.
   */
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  /*
   * Close modal with Escape key.
   */
  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener(
      'keydown',
      handleEscape
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleEscape
      );
    };
  }, [onClose]);

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,

        // Slightly darken and blur the reports behind it
        background: 'rgba(15, 23, 42, 0.35)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        padding: 20
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Report details"
        style={{
          position: 'relative',

          width: '100%',
          maxWidth: 850,

          maxHeight: '90vh',
          overflowY: 'auto',

          background: 'var(--bg-card, white)',
          borderRadius: 14,

          boxShadow:
            '0 20px 60px rgba(0, 0, 0, 0.25)',

          padding: 24
        }}
      >

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          aria-label="Close report details"
          title="Close"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,

            width: 36,
            height: 36,

            borderRadius: '50%',
            border: '1px solid var(--border)',

            background: 'var(--bg-page)',
            color: 'var(--text-primary)',

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',

            cursor: 'pointer',

            zIndex: 2
          }}
        >
          <X size={18} />
        </button>

        {/* HEADER */}
        <div
          style={{
            paddingRight: 50,
            paddingBottom: 18,
            borderBottom:
              '1px solid var(--border)',
            marginBottom: 20
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              marginBottom: 5
            }}
          >
            Report ID
          </div>

          <div
            style={{
              fontSize: 20,
              fontWeight: 800
            }}
          >
            #{report.ReportCode}
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 17,
              fontWeight: 700
            }}
          >
            {report.Title}
          </div>
        </div>

        {/* DETAILS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 18
          }}
        >
          <DetailItem
            label="Status"
            value={
              <StatusBadge
                status={report.Status}
              />
            }
          />

          <DetailItem
            label="Priority"
            value={
              <PriorityDot
                priority={report.Priority}
              />
            }
          />

          <DetailItem
            label="Category"
            value={report.CategoryName}
          />

          <DetailItem
            label="Department"
            value={
              report.DepartmentName || '—'
            }
          />

          <DetailItem
            label="Location"
            value={
              report.LocationName || '—'
            }
          />

          <DetailItem
            label="Reported"
            value={new Date(
              report.CreatedAt
            ).toLocaleString()}
          />
        </div>

        {/* DESCRIPTION */}
        <div
          style={{
            marginTop: 22
          }}
        >
          <SectionTitle>
            DESCRIPTION
          </SectionTitle>

          <div
            style={{
              padding: 14,
              borderRadius: 8,
              background: 'var(--bg-page)',
              lineHeight: 1.6,
              fontSize: 13
            }}
          >
            {report.Description ||
              'No description provided.'}
          </div>
        </div>

        {/* PHOTOS */}
        {report.Photos &&
          report.Photos.length > 0 && (
            <div
              style={{
                marginTop: 22
              }}
            >
              <SectionTitle>
                PHOTOS ({report.Photos.length})
              </SectionTitle>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: 12
                }}
              >
                {report.Photos.map(
                  (photo, index) => {
                    const photoUrl =
                      getPhotoUrl(photo);

                    return (
                      <div
                        key={`${photo}-${index}`}
                        style={{
                          border:
                            '1px solid var(--border)',
                          borderRadius: 10,
                          overflow: 'hidden',
                          background:
                            'var(--bg-page)'
                        }}
                      >
                        <img
                          src={photoUrl}
                          alt={`Report photo ${
                            index + 1
                          }`}
                          style={{
                            width: '100%',
                            height: 180,
                            objectFit: 'cover',
                            display: 'block'
                          }}
                          onError={(e) => {
                            console.error(
                              'Failed to load report photo:',
                              photoUrl
                            );

                            e.currentTarget.style.display =
                              'none';

                            const parent =
                              e.currentTarget
                                .parentElement;

                            if (parent) {
                              parent.innerHTML =
                                `
                                <div style="
                                  height:180px;
                                  display:flex;
                                  align-items:center;
                                  justify-content:center;
                                  padding:15px;
                                  text-align:center;
                                  font-size:12px;
                                  color:#777;
                                ">
                                  Photo could not be loaded
                                </div>
                                `;
                            }
                          }}
                        />

                        <div
                          style={{
                            padding:
                              '8px 10px',
                            fontSize: 11,
                            color:
                              'var(--text-secondary)',
                            borderTop:
                              '1px solid var(--border)'
                          }}
                        >
                          Report photo{' '}
                          {index + 1}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}

        {/* NO PHOTOS */}
        {(!report.Photos ||
          report.Photos.length === 0) && (
          <div
            style={{
              marginTop: 22
            }}
          >
            <SectionTitle>
              PHOTOS
            </SectionTitle>

            <div
              style={{
                padding: 20,
                textAlign: 'center',
                border:
                  '1px dashed var(--border)',
                borderRadius: 10,
                color:
                  'var(--text-secondary)',
                fontSize: 13
              }}
            >
              No photos attached to this
              report.
            </div>
          </div>
        )}

        {/* PROGRESS UPDATES */}
        {report.Updates &&
          report.Updates.length > 0 && (
            <div
              style={{
                marginTop: 22
              }}
            >
              <SectionTitle>
                PROGRESS UPDATES
              </SectionTitle>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}
              >
                {report.Updates.map(
                  (update, index) => (
                    <div
                      key={index}
                      style={{
                        padding: 14,
                        border:
                          '1px solid var(--border)',
                        borderRadius: 8
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent:
                            'space-between',
                          gap: 15,
                          marginBottom: 6,
                          flexWrap: 'wrap'
                        }}
                      >
                        <strong
                          style={{
                            fontSize: 13
                          }}
                        >
                          {update.WorkerName ||
                            'Unknown Worker'}
                        </strong>

                        <span
                          style={{
                            fontSize: 11,
                            color:
                              'var(--text-secondary)'
                          }}
                        >
                          {new Date(
                            update.CreatedAt
                          ).toLocaleString()}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: 13
                        }}
                      >
                        {update.Note ||
                          'No progress note provided.'}
                      </div>

                      <div
                        style={{
                          marginTop: 8
                        }}
                      >
                        <StatusBadge
                          status={
                            update.StatusAtUpdate
                          }
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}


/* =========================================================
   DETAIL ITEM
   ========================================================= */

function DetailItem({
  label,
  value
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          textTransform: 'uppercase',
          color: 'var(--text-secondary)',
          marginBottom: 5
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 600
        }}
      >
        {value}
      </div>
    </div>
  );
}


/* =========================================================
   SECTION TITLE
   ========================================================= */

function SectionTitle({ children }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--text-secondary)',
        marginBottom: 10
      }}
    >
      {children}
    </div>
  );
}


/* =========================================================
   ACTION BUTTON
   ========================================================= */

function IconBtn({
  icon,
  dark,
  onClick,
  title
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        border: 'none',

        background: dark
          ? 'var(--navy-800)'
          : 'var(--bg-page)',

        color: dark
          ? 'white'
          : 'var(--text-secondary)',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        cursor: 'pointer'
      }}
    >
      {icon}
    </button>
  );
}