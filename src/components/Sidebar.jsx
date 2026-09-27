import {
  useEffect,
  useState
} from 'react';

import {
  NavLink,
  useLocation
} from 'react-router-dom';

import {
  LogOut,
  Menu,
  X
} from 'lucide-react';

import {
  useAuth
} from '../context/AuthContext';


const MOBILE_BREAKPOINT = 900;


/*
 * logo2.png lives in /public.
 *
 * Using BASE_URL is important because the production app
 * is deployed under:
 *
 *   /grp-03-39/
 *
 * Development:
 *   /logo2.png
 *
 * Production:
 *   /grp-03-39/logo2.png
 */
const LOGO_URL =
  `${import.meta.env.BASE_URL}favicon3.jpeg`;


/* =============================================================
   SIDEBAR
============================================================= */

export default function Sidebar({
  sections,
  roleLabel,
  userName,
  userSubtitle
}) {
  const {
    logout
  } = useAuth();


  const location =
    useLocation();


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


  const [
    mobileOpen,
    setMobileOpen
  ] = useState(false);


  const initials =
    getInitials(
      userName
    );


  /* ==========================================================
     RESPONSIVE BREAKPOINT
  ========================================================== */

  useEffect(() => {
    function handleResize() {
      const mobile =
        window.innerWidth <=
        MOBILE_BREAKPOINT;


      setIsMobile(
        mobile
      );


      if (!mobile) {
        setMobileOpen(
          false
        );
      }
    }


    window.addEventListener(
      'resize',
      handleResize
    );


    return () => {
      window.removeEventListener(
        'resize',
        handleResize
      );
    };
  }, []);


  /* ==========================================================
     CLOSE MOBILE MENU AFTER NAVIGATION
  ========================================================== */

  useEffect(() => {
    setMobileOpen(
      false
    );
  }, [
    location.pathname
  ]);


  /* ==========================================================
     PREVENT BODY SCROLL WHILE DRAWER IS OPEN
  ========================================================== */

  useEffect(() => {
    if (
      !isMobile ||
      !mobileOpen
    ) {
      return;
    }


    const previousOverflow =
      document.body.style
        .overflow;


    document.body.style
      .overflow =
        'hidden';


    return () => {
      document.body.style
        .overflow =
          previousOverflow;
    };
  }, [
    isMobile,
    mobileOpen
  ]);


  /* ==========================================================
     MOBILE
  ========================================================== */

  if (isMobile) {
    return (
      <>
        <header
          style={{
            height: 58,

            width: '100%',

            background:
              'var(--navy-800)',

            color:
              'white',

            display:
              'flex',

            alignItems:
              'center',

            gap:
              10,

            padding:
              '0 14px',

            position:
              'sticky',

            top:
              0,

            zIndex:
              1500,

            borderBottom:
              '1px solid var(--navy-600)'
          }}
        >

          {/* =================================================
              MOBILE LOGO
          ================================================= */}

          <BrandLogo
            mobile
          />


          {roleLabel && (
            <span
              style={{
                fontSize:
                  9,

                fontWeight:
                  800,

                background:
                  'var(--navy-600)',

                color:
                  '#d9e4f1',

                padding:
                  '3px 7px',

                borderRadius:
                  999,

                letterSpacing:
                  0.6,

                whiteSpace:
                  'nowrap'
              }}
            >
              {roleLabel}
            </span>
          )}


          {/* MENU BUTTON */}

          <button
            type="button"
            onClick={() =>
              setMobileOpen(
                (
                  open
                ) => !open
              )
            }
            aria-label={
              mobileOpen
                ? 'Close navigation'
                : 'Open navigation'
            }
            aria-expanded={
              mobileOpen
            }
            style={{
              marginLeft:
                'auto',

              width:
                38,

              height:
                38,

              borderRadius:
                9,

              border:
                '1px solid rgba(255,255,255,0.16)',

              background:
                'rgba(255,255,255,0.08)',

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
            {mobileOpen
              ? (
                <X
                  size={20}
                />
              )
              : (
                <Menu
                  size={20}
                />
              )}
          </button>
        </header>


        {/* ===================================================
            MOBILE DRAWER
        =================================================== */}

        {mobileOpen && (
          <div
            style={{
              position:
                'fixed',

              top:
                58,

              left:
                0,

              right:
                0,

              bottom:
                0,

              zIndex:
                1490,

              background:
                'rgba(15, 33, 54, 0.58)',

              display:
                'flex'
            }}
            onClick={() =>
              setMobileOpen(
                false
              )
            }
          >
            <aside
              style={{
                width:
                  'min(88vw, 360px)',

                height:
                  'calc(100dvh - 58px)',

                background:
                  'var(--navy-800)',

                color:
                  'white',

                display:
                  'flex',

                flexDirection:
                  'column',

                boxShadow:
                  '12px 0 32px rgba(0,0,0,0.28)',

                overflow:
                  'hidden'
              }}
              onClick={(
                event
              ) =>
                event
                  .stopPropagation()
              }
            >
              <UserBlock
                initials={
                  initials
                }
                userName={
                  userName
                }
                userSubtitle={
                  userSubtitle
                }
              />


              <PortalNavigation
                sections={
                  sections
                }
                onNavigate={() =>
                  setMobileOpen(
                    false
                  )
                }
              />


              <LogoutButton
                onLogout={
                  logout
                }
              />
            </aside>
          </div>
        )}
      </>
    );
  }


  /* ==========================================================
     DESKTOP
  ========================================================== */

  return (
    <aside
      style={{
        width:
          'var(--sidebar-width)',

        height:
          '100vh',

        maxHeight:
          '100vh',

        position:
          'sticky',

        top:
          0,

        alignSelf:
          'flex-start',

        background:
          'var(--navy-800)',

        color:
          'white',

        display:
          'flex',

        flexDirection:
          'column',

        flexShrink:
          0,

        overflow:
          'hidden'
      }}
    >

      {/* =====================================================
          BRAND
      ===================================================== */}

      <div
        style={{
          minHeight:
            78,

          padding:
            '12px 18px',

          display:
            'flex',

          alignItems:
            'center',

          gap:
            10,

          borderBottom:
            '1px solid var(--navy-600)',

          flexShrink:
            0
        }}
      >

        <BrandLogo />


        {roleLabel && (
          <span
            style={{
              marginLeft:
                'auto',

              fontSize:
                9,

              fontWeight:
                800,

              background:
                'var(--navy-600)',

              color:
                '#d9e4f1',

              padding:
                '4px 8px',

              borderRadius:
                999,

              letterSpacing:
                0.5,

              whiteSpace:
                'nowrap'
            }}
          >
            {roleLabel}
          </span>
        )}
      </div>


      {/* =====================================================
          USER
      ===================================================== */}

      <UserBlock
        initials={
          initials
        }
        userName={
          userName
        }
        userSubtitle={
          userSubtitle
        }
      />


      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <PortalNavigation
        sections={
          sections
        }
      />


      {/* =====================================================
          LOGOUT
      ===================================================== */}

      <LogoutButton
        onLogout={
          logout
        }
      />
    </aside>
  );
}


/* =============================================================
   BRAND LOGO
============================================================= */

function BrandLogo({
  mobile = false
}) {
  const [
    failed,
    setFailed
  ] = useState(false);


  /*
   * No white card/background is placed behind the logo.
   *
   * The image sits directly on the same navy colour as the
   * sidebar, which lets a transparent logo2.png blend naturally.
   */
  if (failed) {
    return (
      <div
        style={{
          color:
            'white',

          fontWeight:
            800,

          fontSize:
            mobile
              ? 15
              : 17,

          whiteSpace:
            'nowrap'
        }}
      >
        Fix{' '}

        <span
          style={{
            color:
              'var(--gold-500)'
          }}
        >
          MyTown
        </span>
      </div>
    );
  }


  return (
    <div
      style={{
        width:
          mobile
            ? 122
            : 138,

        height:
          mobile
            ? 40
            : 52,

        display:
          'flex',

        alignItems:
          'center',

        justifyContent:
          'flex-start',

        overflow:
          'hidden',

        flexShrink:
          0,

        background:
          'transparent'
      }}
    >
      <img
        src={
          LOGO_URL
        }
        alt="Fix MyTown"
        onError={() =>
          setFailed(
            true
          )
        }
        style={{
          display:
            'block',

          width:
            '100%',

          height:
            '100%',

          objectFit:
            'contain',

          objectPosition:
            'left center',

          background:
            'transparent',

          /*
           * Small adjustment only.
           *
           * There is intentionally no border, card, white
           * background or heavy shadow around the image.
           */
          filter:
            'brightness(1.04) contrast(1.04)'
        }}
      />
    </div>
  );
}


/* =============================================================
   USER BLOCK
============================================================= */

function UserBlock({
  initials,
  userName,
  userSubtitle
}) {
  return (
    <div
      style={{
        display:
          'flex',

        alignItems:
          'center',

        gap:
          10,

        padding:
          '18px 20px',

        borderBottom:
          '1px solid var(--navy-600)',

        flexShrink:
          0
      }}
    >
      <div
        style={{
          width:
            38,

          height:
            38,

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
        {initials}
      </div>


      <div
        style={{
          minWidth:
            0
        }}
      >
        <div
          style={{
            fontWeight:
              600,

            fontSize:
              14,

            overflow:
              'hidden',

            textOverflow:
              'ellipsis',

            whiteSpace:
              'nowrap'
          }}
        >
          {userName ||
            'User'}
        </div>


        <div
          style={{
            fontSize:
              12,

            color:
              '#9db2cc',

            overflow:
              'hidden',

            textOverflow:
              'ellipsis',

            whiteSpace:
              'nowrap'
          }}
        >
          {userSubtitle ||
            ''}
        </div>
      </div>
    </div>
  );
}


/* =============================================================
   NAVIGATION
============================================================= */

function PortalNavigation({
  sections,
  onNavigate
}) {
  return (
    <nav
      style={{
        flex:
          1,

        minHeight:
          0,

        padding:
          '16px 12px',

        overflowY:
          'auto',

        overflowX:
          'hidden'
      }}
    >
      {sections.map(
        (
          section
        ) => (
          <div
            key={
              section.heading
            }
            style={{
              marginBottom:
                18
            }}
          >
            <div
              style={{
                fontSize:
                  10,

                fontWeight:
                  700,

                color:
                  '#7186a3',

                letterSpacing:
                  0.8,

                textTransform:
                  'uppercase',

                padding:
                  '0 10px 8px'
              }}
            >
              {
                section.heading
              }
            </div>


            {section.items.map(
              (
                item
              ) => (
                <NavLink
                  key={
                    item.path
                  }
                  to={
                    item.path
                  }
                  end={
                    item.end
                  }
                  onClick={
                    onNavigate
                  }
                  style={({
                    isActive
                  }) => ({
                    display:
                      'flex',

                    alignItems:
                      'center',

                    gap:
                      10,

                    padding:
                      '11px 10px',

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
                        ? 'var(--gold-500)'
                        : '#c7d3e3',

                    background:
                      isActive
                        ? 'var(--navy-700)'
                        : 'transparent',

                    marginBottom:
                      3
                  })}
                >
                  <item.icon
                    size={17}
                    style={{
                      flexShrink:
                        0
                    }}
                  />


                  <span
                    style={{
                      flex:
                        1,

                      minWidth:
                        0
                    }}
                  >
                    {
                      item.label
                    }
                  </span>


                  {!!item.badge && (
                    <span
                      style={{
                        background:
                          '#ef4444',

                        color:
                          'white',

                        fontSize:
                          11,

                        fontWeight:
                          700,

                        borderRadius:
                          999,

                        padding:
                          '1px 7px',

                        flexShrink:
                          0
                      }}
                    >
                      {
                        item.badge
                      }
                    </span>
                  )}
                </NavLink>
              )
            )}
          </div>
        )
      )}
    </nav>
  );
}


/* =============================================================
   LOGOUT BUTTON
============================================================= */

function LogoutButton({
  onLogout
}) {
  return (
    <button
      type="button"
      onClick={
        onLogout
      }
      style={{
        margin:
          12,

        padding:
          '11px 12px',

        background:
          'transparent',

        border:
          '1px solid var(--navy-600)',

        borderRadius:
          8,

        color:
          '#c7d3e3',

        display:
          'flex',

        alignItems:
          'center',

        justifyContent:
          'center',

        gap:
          8,

        fontSize:
          14,

        fontWeight:
          600,

        cursor:
          'pointer',

        flexShrink:
          0
      }}
    >
      <LogOut
        size={16}
      />

      Logout
    </button>
  );
}


/* =============================================================
   INITIALS
============================================================= */

function getInitials(
  name
) {
  if (!name) {
    return 'U';
  }


  return (
    name
      .trim()
      .split(
        /\s+/
      )
      .filter(
        Boolean
      )
      .map(
        (
          part
        ) =>
          part[0]
      )
      .slice(
        0,
        2
      )
      .join('')
      .toUpperCase() ||
    'U'
  );
}