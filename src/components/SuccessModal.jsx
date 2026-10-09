import {
  useEffect,
  useState
} from 'react';

import {
  CheckCircle2,
  X
} from 'lucide-react';

const ADMIN_DESKTOP_BREAKPOINT =
  900;

export default function SuccessModal({
  open = true,
  title = 'Success',
  message = '',
  details = [],
  note = '',
  onClose,
  primaryLabel = 'Done',
  onPrimary,
  secondaryLabel = '',
  onSecondary,
  width = 560
}) {
  const [
    isDesktop,
    setIsDesktop
  ] = useState(
    typeof window !== 'undefined'
      ? window.innerWidth >
          ADMIN_DESKTOP_BREAKPOINT
      : true
  );

  /*
   * Admin pages have a 260px desktop sidebar.
   *
   * We keep the dark backdrop over the WHOLE screen,
   * but center the modal inside the usable admin
   * content area to the right of the sidebar.
   */
  const isAdminPage =
    typeof window !== 'undefined' &&
    window.location.pathname.startsWith(
      '/admin'
    );

  const useAdminOffset =
    isAdminPage &&
    isDesktop;

  useEffect(() => {
    function handleResize() {
      setIsDesktop(
        window.innerWidth >
          ADMIN_DESKTOP_BREAKPOINT
      );
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

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow =
      document.body.style
        .overflow;

    document.body.style
      .overflow =
      'hidden';

    function handleKeyDown(
      event
    ) {
      if (
        event.key ===
        'Escape'
      ) {
        onClose?.();
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      document.body.style
        .overflow =
        previousOverflow;

      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [
    open,
    onClose
  ]);

  if (!open) {
    return null;
  }

  function handlePrimary() {
    if (onPrimary) {
      onPrimary();

      return;
    }

    onClose?.();
  }

  return (
    <div
      role="presentation"
      onClick={() =>
        onClose?.()
      }
      style={{
        position: 'fixed',
        inset: 0,

        zIndex: 15000,

        background:
          'rgba(15, 33, 54, 0.62)',

        overflowY: 'auto',

        /*
         * Keep overlay covering sidebar too.
         */
        boxSizing:
          'border-box'
      }}
    >
      {/* =====================================================
          MODAL POSITIONING AREA

          Desktop Admin:
          260px sidebar | centered remaining content

          Mobile / Citizen:
          centered across entire viewport
      ===================================================== */}

      <div
        style={{
          position:
            'relative',

          width: '100%',

          minHeight:
            '100vh',

          minHeight:
            '100dvh',

          boxSizing:
            'border-box',

          display: 'flex',

          alignItems:
            'center',

          justifyContent:
            'center',

          /*
           * This is the important part.
           *
           * Padding removes the 260px sidebar
           * from the available centering area.
           */
          paddingLeft:
            useAdminOffset
              ? 'var(--sidebar-width)'
              : 0,

          paddingTop:
            24,

          paddingRight:
            24,

          paddingBottom:
            24
        }}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-modal-title"
          onClick={(
            event
          ) =>
            event.stopPropagation()
          }
          style={{
            width,

            maxWidth:
              'min(100%, 680px)',

            maxHeight:
              'calc(100dvh - 48px)',

            overflowY:
              'auto',

            background:
              '#ffffff',

            borderRadius:
              14,

            boxShadow:
              '0 24px 70px rgba(15, 33, 54, 0.30)',

            border:
              '1px solid var(--border)',

            position:
              'relative',

            boxSizing:
              'border-box'
          }}
        >
          {/* =================================================
              CLOSE
          ================================================= */}

          <button
            type="button"
            aria-label="Close"
            onClick={() =>
              onClose?.()
            }
            style={{
              position:
                'absolute',

              top: 14,

              right: 14,

              width: 36,

              height: 36,

              borderRadius:
                '50%',

              border:
                '1px solid var(--border)',

              background:
                '#ffffff',

              color:
                'var(--text-secondary)',

              cursor:
                'pointer',

              display:
                'flex',

              alignItems:
                'center',

              justifyContent:
                'center',

              zIndex: 2
            }}
          >
            <X
              size={18}
            />
          </button>

          {/* =================================================
              SUCCESS HEADER
          ================================================= */}

          <div
            style={{
              padding:
                '30px 28px 24px',

              textAlign:
                'center'
            }}
          >
            <div
              style={{
                width: 62,

                height: 62,

                margin:
                  '0 auto 16px',

                borderRadius:
                  '50%',

                background:
                  '#e9f9ef',

                color:
                  '#16a34a',

                display:
                  'flex',

                alignItems:
                  'center',

                justifyContent:
                  'center'
              }}
            >
              <CheckCircle2
                size={34}
                strokeWidth={2}
              />
            </div>

            <h2
              id="success-modal-title"
              style={{
                margin: 0,

                color:
                  'var(--text-primary)',

                fontSize: 21,

                lineHeight:
                  1.3
              }}
            >
              {title}
            </h2>

            {message && (
              <p
                style={{
                  maxWidth:
                    460,

                  margin:
                    '9px auto 0',

                  color:
                    'var(--text-secondary)',

                  fontSize:
                    13.5,

                  lineHeight:
                    1.6
                }}
              >
                {message}
              </p>
            )}
          </div>

          {/* =================================================
              DETAILS
          ================================================= */}

          {details.length >
            0 && (
            <div
              style={{
                margin:
                  '0 24px 22px',

                border:
                  '1px solid var(--border)',

                borderRadius:
                  10,

                overflow:
                  'hidden'
              }}
            >
              {details.map(
                (
                  detail,
                  index
                ) => (
                  <div
                    key={`${detail.label}-${index}`}
                    style={{
                      display:
                        'grid',

                      gridTemplateColumns:
                        'minmax(120px, 0.8fr) minmax(0, 1.4fr)',

                      gap: 18,

                      alignItems:
                        'start',

                      padding:
                        '12px 15px',

                      borderBottom:
                        index ===
                        details.length -
                          1
                          ? 'none'
                          : '1px solid var(--border)',

                      background:
                        detail.emphasis
                          ? '#fff8e8'
                          : '#ffffff'
                    }}
                  >
                    <div
                      style={{
                        color:
                          'var(--text-secondary)',

                        fontSize:
                          11.5,

                        fontWeight:
                          700,

                        textTransform:
                          'uppercase',

                        letterSpacing:
                          '0.35px'
                      }}
                    >
                      {
                        detail.label
                      }
                    </div>

                    <div
                      style={{
                        color:
                          detail.emphasis
                            ? 'var(--navy-900)'
                            : 'var(--text-primary)',

                        fontSize:
                          detail.emphasis
                            ? 14
                            : 13,

                        fontWeight:
                          detail.emphasis
                            ? 800
                            : 600,

                        fontFamily:
                          detail.monospace
                            ? 'monospace'
                            : 'inherit',

                        wordBreak:
                          'break-word',

                        whiteSpace:
                          'pre-wrap'
                      }}
                    >
                      {detail.value ??
                        '—'}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* =================================================
              NOTE
          ================================================= */}

          {note && (
            <div
              style={{
                margin:
                  '-4px 24px 22px',

                padding:
                  '12px 14px',

                borderRadius:
                  8,

                background:
                  'var(--bg-page)',

                color:
                  'var(--text-secondary)',

                fontSize:
                  12.5,

                lineHeight:
                  1.55
              }}
            >
              {note}
            </div>
          )}

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div
            style={{
              display:
                'flex',

              justifyContent:
                'flex-end',

              gap: 10,

              flexWrap:
                'wrap',

              padding:
                '16px 24px',

              borderTop:
                '1px solid var(--border)',

              background:
                '#fafafa'
            }}
          >
            {secondaryLabel && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={
                  onSecondary
                }
              >
                {
                  secondaryLabel
                }
              </button>
            )}

            <button
              type="button"
              className="btn btn-primary"
              onClick={
                handlePrimary
              }
            >
              {primaryLabel}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}