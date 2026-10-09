import {
  useEffect,
  useState
} from 'react';

import {
  NavLink,
  Outlet,
  useNavigate
} from 'react-router-dom';

import {
  Landmark,
  Plus,
  Phone,
  Mail,
  LogOut,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

import api from '../../api/api';

import ReportWizard from './ReportWizard';

import NotificationBell from '../../components/NotificationBell';

import SuccessModal from '../../components/SuccessModal';

const MOBILE_BREAKPOINT =
  860;

function asArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (
    Array.isArray(
      value?.$values
    )
  ) {
    return value.$values;
  }

  if (
    Array.isArray(
      value?.items
    )
  ) {
    return value.items;
  }

  return [];
}

export default function CitizenLayout() {
  const [
    wizardOpen,
    setWizardOpen
  ] = useState(false);

  const [
    wizardLocation,
    setWizardLocation
  ] = useState(null);

  const [
    profileOpen,
    setProfileOpen
  ] = useState(false);

  const [
    mobileMenuOpen,
    setMobileMenuOpen
  ] = useState(false);

  const [
    reportSuccess,
    setReportSuccess
  ] = useState(null);

  const [
    isMobile,
    setIsMobile
  ] = useState(
    typeof window !==
      'undefined'
      ? window.innerWidth <=
          MOBILE_BREAKPOINT
      : false
  );

  const navigate =
    useNavigate();

  const user =
    JSON.parse(
      localStorage.getItem(
        'fixmytown_user'
      ) ||
        sessionStorage.getItem(
          'fixmytown_user'
        ) ||
        '{}'
    );

  useEffect(() => {
    function handleResize() {
      const nowMobile =
        window.innerWidth <=
        MOBILE_BREAKPOINT;

      setIsMobile(
        nowMobile
      );

      if (!nowMobile) {
        setMobileMenuOpen(
          false
        );
      }
    }

    window.addEventListener(
      'resize',
      handleResize
    );

    return () =>
      window.removeEventListener(
        'resize',
        handleResize
      );
  }, []);

  const navItems = [
    {
      to:
        '/citizen/dashboard',
      label: 'Dashboard'
    },
    {
      to: '/citizen/map',
      label: 'Map View'
    },
    {
      to:
        '/citizen/reports',
      label: 'My Reports'
    }
  ];

  function openWizard(
    location
  ) {
    setWizardLocation(
      location || null
    );

    setWizardOpen(
      true
    );

    setMobileMenuOpen(
      false
    );
  }

  function closeWizard() {
    setWizardOpen(
      false
    );

    setWizardLocation(
      null
    );
  }

  async function handleReportSubmitted() {
    /*
     * ReportWizard already knows the POST succeeded.
     * Fetch the citizen's reports so we can show the
     * newly created report reference and details.
     */
    try {
      const response =
        await api.get(
          '/issues/mine'
        );

      const reports =
        asArray(
          response.data
        );

      const sorted =
        [...reports].sort(
          (a, b) => {
            const aTime =
              new Date(
                a.CreatedAt || 0
              ).getTime();

            const bTime =
              new Date(
                b.CreatedAt || 0
              ).getTime();

            return (
              bTime - aTime
            );
          }
        );

      const latest =
        sorted[0];

      if (latest) {
        setReportSuccess({
          reportId:
            latest.ReportID,

          reportCode:
            latest.ReportCode,

          title:
            latest.Title ||
            'Municipal issue',

          category:
            latest.CategoryName ||
            '—',

          priority:
            latest.Priority ||
            '—',

          location:
            latest.LocationName ||
            '—',

          status:
            latest.Status ||
            'Reported',

          createdAt:
            latest.CreatedAt
              ? new Date(
                  latest.CreatedAt
                ).toLocaleString()
              : 'Just now'
        });

        return;
      }
    } catch (error) {
      console.warn(
        'Report was submitted, but its details could not be refreshed:',
        error
      );
    }

    /*
     * The POST itself succeeded even if refreshing
     * the report list failed, so still show success.
     */
    setReportSuccess({
      reportCode: null,
      title:
        'Report submitted',
      category: '—',
      priority: '—',
      location: '—',
      status: 'Reported',
      createdAt:
        new Date().toLocaleString()
    });
  }

  function getInitials() {
    const name =
      user.fullName ||
      user.name ||
      user.email ||
      '';

    const names =
      name
        .trim()
        .split(' ')
        .filter(Boolean);

    if (
      names.length === 0
    ) {
      return 'U';
    }

    if (
      names.length === 1
    ) {
      return names[0]
        .charAt(0)
        .toUpperCase();
    }

    return (
      names[0]
        .charAt(0) +
      names[
        names.length - 1
      ].charAt(0)
    ).toUpperCase();
  }

  function handleLogout() {
    localStorage.removeItem(
      'fixmytown_token'
    );

    localStorage.removeItem(
      'fixmytown_user'
    );

    sessionStorage.removeItem(
      'fixmytown_token'
    );

    sessionStorage.removeItem(
      'fixmytown_user'
    );

    navigate('/login');
  }

  function toggleMobileMenu() {
    setMobileMenuOpen(
      value => !value
    );

    setProfileOpen(false);
  }

  function viewMyReports() {
    setReportSuccess(null);

    navigate(
      '/citizen/reports'
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'var(--bg-page)'
      }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1400
        }}
      >
        <div
          style={{
            background:
              'var(--navy-900)',
            color: '#b7c4d8',
            fontSize: 12,
            padding:
              isMobile
                ? '6px 14px'
                : '6px 28px',
            display: 'flex',
            justifyContent:
              'space-between',
            flexWrap: 'wrap',
            gap: 6
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 16,
              flexWrap: 'wrap'
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems:
                  'center',
                gap: 5,
                whiteSpace:
                  'nowrap'
              }}
            >
              <Phone
                size={12}
              />

              0800 123 456
            </span>

            {!isMobile && (
              <span
                style={{
                  display:
                    'flex',
                  alignItems:
                    'center',
                  gap: 5
                }}
              >
                <Mail
                  size={12}
                />

                support@fixmytown.gov.za
              </span>
            )}
          </div>

          {!isMobile && (
            <div
              style={{
                display:
                  'flex',
                gap: 10
              }}
            >
              <span>
                English
              </span>

              |

              <span>
                Afrikaans
              </span>

              |

              <span>
                isiZulu
              </span>
            </div>
          )}
        </div>

        <div
          style={{
            background:
              'var(--navy-800)',
            padding:
              isMobile
                ? '12px 14px'
                : '14px 28px',
            display: 'flex',
            alignItems:
              'center',
            gap:
              isMobile
                ? 12
                : 24,
            position:
              'relative'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems:
                'center',
              gap: 8,
              color: 'white',
              fontWeight: 700,
              fontSize:
                isMobile
                  ? 16
                  : 18,
              whiteSpace:
                'nowrap'
            }}
          >
            <Landmark
              size={20}
              color="var(--gold-500)"
            />

            Fix

            <span
              style={{
                color:
                  'var(--gold-500)'
              }}
            >
              MyTown
            </span>

            {!isMobile && (
              <span
                style={{
                  fontSize: 10,
                  background:
                    'var(--navy-600)',
                  padding:
                    '2px 8px',
                  borderRadius:
                    999
                }}
              >
                GOV
              </span>
            )}
          </div>

          {!isMobile && (
            <nav
              style={{
                display:
                  'flex',
                gap: 8
              }}
            >
              {navItems.map(
                item => (
                  <NavLink
                    key={
                      item.to
                    }
                    to={item.to}
                    style={({
                      isActive
                    }) => ({
                      padding:
                        '8px 14px',
                      borderRadius:
                        999,
                      fontSize:
                        13,
                      fontWeight:
                        600,
                      textDecoration:
                        'none',
                      color:
                        isActive
                          ? 'var(--navy-900)'
                          : '#c7d3e3',
                      background:
                        isActive
                          ? 'var(--gold-500)'
                          : 'transparent',
                      whiteSpace:
                        'nowrap'
                    })}
                  >
                    {
                      item.label
                    }
                  </NavLink>
                )
              )}
            </nav>
          )}

          <div
            style={{
              marginLeft:
                'auto',
              display: 'flex',
              alignItems:
                'center',
              gap:
                isMobile
                  ? 10
                  : 16
            }}
          >
            <NotificationBell />

            {!isMobile && (
              <button
                type="button"
                className="btn btn-gold"
                onClick={() =>
                  openWizard()
                }
              >
                <Plus
                  size={15}
                />

                Report Issue
              </button>
            )}

            {!isMobile && (
              <div
                style={{
                  position:
                    'relative'
                }}
              >
                <div
                  onClick={() =>
                    setProfileOpen(
                      !profileOpen
                    )
                  }
                  style={{
                    display:
                      'flex',
                    alignItems:
                      'center',
                    gap: 10,
                    padding:
                      '6px 12px',
                    borderRadius:
                      8,
                    cursor:
                      'pointer',
                    background:
                      'rgba(255,255,255,0.1)',
                    border:
                      '1px solid rgba(255,255,255,0.2)',
                    transition:
                      'all 0.2s'
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius:
                        '50%',
                      background:
                        'var(--gold-500)',
                      color:
                        'var(--navy-900)',
                      display:
                        'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                      fontWeight:
                        700,
                      fontSize:
                        13
                    }}
                  >
                    {getInitials()}
                  </div>

                  <div
                    style={{
                      color:
                        'white',
                      fontSize:
                        13,
                      fontWeight:
                        500
                    }}
                  >
                    {user.fullName ||
                      user.name ||
                      'User'}
                  </div>

                  <ChevronDown
                    size={14}
                    color="white"
                  />
                </div>

                {profileOpen && (
                  <div
                    style={{
                      position:
                        'absolute',
                      top:
                        '100%',
                      right: 0,
                      marginTop:
                        8,
                      background:
                        'white',
                      borderRadius:
                        8,
                      boxShadow:
                        '0 4px 20px rgba(0,0,0,0.15)',
                      minWidth:
                        220,
                      zIndex:
                        1000,
                      overflow:
                        'hidden'
                    }}
                  >
                    <div
                      style={{
                        padding:
                          '16px',
                        borderBottom:
                          '1px solid #e5e7eb'
                      }}
                    >
                      <div
                        style={{
                          display:
                            'flex',
                          alignItems:
                            'center',
                          gap: 12
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius:
                              '50%',
                            background:
                              'var(--navy-800)',
                            color:
                              'white',
                            display:
                              'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'center',
                            fontWeight:
                              700,
                            fontSize:
                              15
                          }}
                        >
                          {getInitials()}
                        </div>

                        <div>
                          <div
                            style={{
                              fontWeight:
                                600,
                              fontSize:
                                14,
                              color:
                                'var(--text-primary)'
                            }}
                          >
                            {user.fullName ||
                              user.name ||
                              'User'}
                          </div>

                          <div
                            style={{
                              fontSize:
                                12,
                              color:
                                'var(--text-secondary)',
                              marginTop:
                                2
                            }}
                          >
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleLogout
                      }
                      style={{
                        width:
                          '100%',
                        padding:
                          '12px 16px',
                        display:
                          'flex',
                        alignItems:
                          'center',
                        gap: 8,
                        border:
                          'none',
                        background:
                          'none',
                        cursor:
                          'pointer',
                        color:
                          '#ef4444',
                        fontSize:
                          13,
                        fontWeight:
                          500,
                        transition:
                          'background 0.2s'
                      }}
                      onMouseEnter={(
                        event
                      ) => {
                        event.currentTarget.style.background =
                          '#fef2f2';
                      }}
                      onMouseLeave={(
                        event
                      ) => {
                        event.currentTarget.style.background =
                          'none';
                      }}
                    >
                      <LogOut
                        size={16}
                      />

                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}

            {isMobile && (
              <button
                type="button"
                onClick={
                  toggleMobileMenu
                }
                aria-label={
                  mobileMenuOpen
                    ? 'Close menu'
                    : 'Open menu'
                }
                style={{
                  width: 38,
                  height: 38,
                  borderRadius:
                    8,
                  border:
                    '1px solid rgba(255,255,255,0.2)',
                  background:
                    'rgba(255,255,255,0.1)',
                  color:
                    'white',
                  display:
                    'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'center',
                  cursor:
                    'pointer',
                  flexShrink:
                    0
                }}
              >
                {mobileMenuOpen ? (
                  <X
                    size={20}
                  />
                ) : (
                  <Menu
                    size={20}
                  />
                )}
              </button>
            )}
          </div>

          {isMobile &&
            mobileMenuOpen && (
              <div
                style={{
                  position:
                    'absolute',
                  top:
                    '100%',
                  left: 0,
                  right: 0,
                  background:
                    'var(--navy-800)',
                  borderTop:
                    '1px solid rgba(255,255,255,0.1)',
                  boxShadow:
                    '0 12px 24px rgba(0,0,0,0.25)',
                  zIndex:
                    1000,
                  padding:
                    '14px',
                  display:
                    'flex',
                  flexDirection:
                    'column',
                  gap: 6
                }}
              >
                {navItems.map(
                  item => (
                    <NavLink
                      key={
                        item.to
                      }
                      to={
                        item.to
                      }
                      onClick={() =>
                        setMobileMenuOpen(
                          false
                        )
                      }
                      style={({
                        isActive
                      }) => ({
                        padding:
                          '12px 14px',
                        borderRadius:
                          8,
                        fontSize:
                          14,
                        fontWeight:
                          600,
                        textDecoration:
                          'none',
                        color:
                          isActive
                            ? 'var(--navy-900)'
                            : '#c7d3e3',
                        background:
                          isActive
                            ? 'var(--gold-500)'
                            : 'rgba(255,255,255,0.05)'
                      })}
                    >
                      {
                        item.label
                      }
                    </NavLink>
                  )
                )}

                <button
                  type="button"
                  className="btn btn-gold"
                  onClick={() =>
                    openWizard()
                  }
                  style={{
                    justifyContent:
                      'center',
                    marginTop:
                      6
                  }}
                >
                  <Plus
                    size={15}
                  />

                  Report Issue
                </button>

                <div
                  style={{
                    marginTop:
                      10,
                    paddingTop:
                      14,
                    borderTop:
                      '1px solid rgba(255,255,255,0.1)',
                    display:
                      'flex',
                    alignItems:
                      'center',
                    gap: 12
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius:
                        '50%',
                      background:
                        'var(--gold-500)',
                      color:
                        'var(--navy-900)',
                      display:
                        'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                      fontWeight:
                        700,
                      fontSize:
                        14,
                      flexShrink:
                        0
                    }}
                  >
                    {getInitials()}
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0
                    }}
                  >
                    <div
                      style={{
                        color:
                          'white',
                        fontSize:
                          14,
                        fontWeight:
                          600,
                        wordBreak:
                          'break-word'
                      }}
                    >
                      {user.fullName ||
                        user.name ||
                        'User'}
                    </div>

                    <div
                      style={{
                        color:
                          '#94a3b8',
                        fontSize:
                          12,
                        wordBreak:
                          'break-word'
                      }}
                    >
                      {user.email}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  style={{
                    marginTop:
                      4,
                    width:
                      '100%',
                    padding:
                      '12px 14px',
                    display:
                      'flex',
                    alignItems:
                      'center',
                    gap: 8,
                    border:
                      'none',
                    borderRadius:
                      8,
                    background:
                      'rgba(239, 68, 68, 0.12)',
                    cursor:
                      'pointer',
                    color:
                      '#f87171',
                    fontSize:
                      13.5,
                    fontWeight:
                      600
                  }}
                >
                  <LogOut
                    size={16}
                  />

                  Sign Out
                </button>
              </div>
            )}
        </div>
      </div>

      <main
        style={{
          padding:
            isMobile
              ? 16
              : 28
        }}
      >
        <Outlet
          context={{
            openWizard
          }}
        />
      </main>

      {wizardOpen && (
        <ReportWizard
          initialLocation={
            wizardLocation
          }
          onClose={
            closeWizard
          }
          onSubmitted={
            handleReportSubmitted
          }
        />
      )}

      <SuccessModal
        open={
          !!reportSuccess
        }
        title="Report submitted successfully"
        message="Your municipal issue has been recorded. Save the report reference and use My Reports to track its progress."
        onClose={() =>
          setReportSuccess(
            null
          )
        }
        primaryLabel="Done"
        onPrimary={() =>
          setReportSuccess(
            null
          )
        }
        secondaryLabel="View My Reports"
        onSecondary={
          viewMyReports
        }
        details={
          reportSuccess
            ? [
                {
                  label:
                    'Report Reference',
                  value:
                    reportSuccess.reportCode
                      ? `#${reportSuccess.reportCode}`
                      : reportSuccess.reportId ||
                        'Created successfully',
                  emphasis:
                    true
                },

                {
                  label: 'Issue',
                  value:
                    reportSuccess.title
                },

                {
                  label:
                    'Category',
                  value:
                    reportSuccess.category
                },

                {
                  label:
                    'Priority',
                  value:
                    reportSuccess.priority
                },

                {
                  label:
                    'Location',
                  value:
                    reportSuccess.location
                },

                {
                  label:
                    'Status',
                  value:
                    reportSuccess.status
                },

                {
                  label:
                    'Reported',
                  value:
                    reportSuccess.createdAt
                }
              ]
            : []
        }
      />
    </div>
  );
}