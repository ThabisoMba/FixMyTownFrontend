/**
 * TermsGateModal.jsx
 * ------------------
 * A consent gate for the FixMyTown Terms of Service. Unlike the
 * generic Modal component, this one deliberately cannot be closed
 * by clicking the backdrop or a stray X button - the only way out
 * is an explicit "I Accept" or "I Do Not Accept" choice, since a
 * terms gate that can be dismissed for free isn't really a gate.
 *
 * The "I Accept" button stays disabled until the user has actually
 * scrolled the terms text to the bottom, so accepting means having
 * at least scrolled past everything, not just clicking through.
 *
 * Full legal text also lives at /terms-of-service (see
 * pages/public/TermsOfService.jsx) for anyone who wants to read it
 * outside this gate - this modal links there too.
 */

import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScrollText, Check, X as XIcon } from 'lucide-react';

export default function TermsGateModal({ onAccept, onDecline }) {
  const [reachedEnd, setReachedEnd] = useState(false);
  const scrollRef = useRef(null);

  function handleScroll(e) {
    const el = e.target;
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    if (atBottom) setReachedEnd(true);
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 33, 54, 0.72)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20000,
        padding: 20
      }}
    >
      <div
        className="card"
        style={{
          width: 620,
          maxWidth: '100%',
          maxHeight: '86vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-modal)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '18px 22px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0
          }}
        >
          <ScrollText size={19} color="var(--navy-800)" />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15.5 }}>
              Terms of Service
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Please read and accept before continuing
            </div>
          </div>
        </div>

        {/* Scrollable terms content */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            padding: '18px 22px',
            overflowY: 'auto',
            fontSize: 13,
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            flex: 1
          }}
        >
          <p>
            <strong>Last updated: August 2026</strong>
          </p>

          <h4>1. Acceptance of Terms</h4>
          <p>
            By accessing or using FixMyTown, you agree to comply with these
            Terms of Service. If you do not agree with these terms, please
            do not use the platform.
          </p>

          <h4>2. About FixMyTown</h4>
          <p>
            FixMyTown is a municipal citizen reporting platform designed to
            help residents report community issues and follow the progress
            of municipal service requests. The platform may allow users to
            report issues such as potholes, water leaks, electricity
            problems, sanitation issues, damaged street lights, parks
            maintenance and other municipal concerns.
          </p>

          <h4>3. User Accounts</h4>
          <p>
            Certain features may require users to create an account. Users
            are responsible for providing accurate information during
            registration and keeping their account credentials secure. You
            are responsible for activity performed through your account and
            should notify the appropriate platform administrators if you
            believe your account has been compromised.
          </p>

          <h4>4. Reporting Issues</h4>
          <p>
            Users should submit reports that are accurate, relevant and
            related to legitimate municipal or community issues. Users must
            not knowingly submit false, misleading, fraudulent or abusive
            reports.
          </p>

          <h4>5. Prohibited Use</h4>
          <p>You agree not to use FixMyTown to:</p>
          <ul style={{ margin: '4px 0 12px', paddingLeft: 20 }}>
            <li>Submit knowingly false reports.</li>
            <li>Harass or threaten other users or municipal employees.</li>
            <li>Upload unlawful, offensive or malicious content.</li>
            <li>Attempt to gain unauthorized access to the platform.</li>
            <li>Interfere with the operation or security of the system.</li>
            <li>Use another person's account without authorization.</li>
            <li>Abuse automated systems or APIs.</li>
          </ul>

          <h4>6. Report Processing</h4>
          <p>
            Submitting a report does not guarantee that the reported issue
            will be resolved within a particular period. Reports may be
            reviewed, categorized, assigned to relevant municipal
            departments and updated as work progresses.
          </p>

          <h4>7. Public Information</h4>
          <p>
            Some information associated with municipal reports may be
            displayed publicly, including general issue categories,
            locations, statuses and statistics. Users should avoid
            including unnecessary personal or confidential information in
            public report descriptions.
          </p>

          <h4>8. Platform Availability</h4>
          <p>
            We aim to keep FixMyTown available and reliable, but the
            platform may occasionally be unavailable because of
            maintenance, technical problems, network failures or other
            circumstances.
          </p>

          <h4>9. Intellectual Property</h4>
          <p>
            The FixMyTown name, interface, design, software and related
            materials may be protected by applicable intellectual property
            laws. Users may not reproduce, modify or redistribute
            protected platform materials without appropriate
            authorization.
          </p>

          <h4>10. Privacy</h4>
          <p>
            Your use of FixMyTown may involve the collection and
            processing of information necessary to operate the platform.
            For information about how personal information is handled,
            please review our{' '}
            <Link to="/privacy-policy" target="_blank">
              Privacy Policy
            </Link>
            .
          </p>

          <h4>11. Changes to These Terms</h4>
          <p>
            These Terms of Service may be updated from time to time.
            Updated terms will be published on this page with a revised
            update date.
          </p>

          <h4>12. Contact</h4>
          <p>
            If you have questions about these Terms of Service, please
            contact the FixMyTown support team at support@fixmytown.gov.za
            or 0800 123 456.
          </p>

          <p style={{ marginTop: 16 }}>
            <Link to="/terms-of-service" target="_blank">
              View full Terms of Service page ↗
            </Link>
          </p>
        </div>

        {/* Footer actions */}
        <div
          style={{
            padding: '16px 22px',
            borderTop: '1px solid var(--border)',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}
        >
          {!reachedEnd && (
            <div
              style={{
                fontSize: 11.5,
                color: 'var(--text-secondary)',
                textAlign: 'center'
              }}
            >
              Scroll to the end of the terms to enable Accept.
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={onDecline}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <XIcon size={14} /> I Do Not Accept
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={onAccept}
              disabled={!reachedEnd}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                opacity: reachedEnd ? 1 : 0.5,
                cursor: reachedEnd ? 'pointer' : 'not-allowed'
              }}
            >
              <Check size={14} /> I Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
