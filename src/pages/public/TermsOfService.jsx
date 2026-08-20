import { Link } from "react-router-dom";
import { Landmark, ArrowLeft } from "lucide-react";
import "./LandingPage.css";

export default function TermsOfService() {
  return (
    <div className="legal-page">

      {/* Header */}
      <header className="legal-header">
        <div className="legal-header-container">

          <Link to="/" className="legal-logo">
            <Landmark size={26} />

            <span className="logo-fix">Fix</span>
            <span className="logo-town">MyTown</span>

            <span className="logo-badge">
              GOV
            </span>
          </Link>

          <Link to="/" className="legal-back">
            <ArrowLeft size={17} />
            Back to Home
          </Link>

        </div>
      </header>


      {/* Content */}
      <main className="legal-content">

        <div className="legal-hero">
          <h1>Terms of Service</h1>

          <p>
            Please read these terms carefully before using the FixMyTown
            municipal citizen reporting platform.
          </p>

          <span>
            Last updated: August 2026
          </span>
        </div>


        <section className="legal-card">

          <h2>1. Acceptance of Terms</h2>

          <p>
            By accessing or using FixMyTown, you agree to comply with
            these Terms of Service. If you do not agree with these terms,
            please do not use the platform.
          </p>


          <h2>2. About FixMyTown</h2>

          <p>
            FixMyTown is a municipal citizen reporting platform designed
            to help residents report community issues and follow the
            progress of municipal service requests.
          </p>

          <p>
            The platform may allow users to report issues such as
            potholes, water leaks, electricity problems, sanitation
            issues, damaged street lights, parks maintenance and other
            municipal concerns.
          </p>


          <h2>3. User Accounts</h2>

          <p>
            Certain features may require users to create an account.
            Users are responsible for providing accurate information
            during registration and keeping their account credentials
            secure.
          </p>

          <p>
            You are responsible for activity performed through your
            account and should notify the appropriate platform
            administrators if you believe your account has been
            compromised.
          </p>


          <h2>4. Reporting Issues</h2>

          <p>
            Users should submit reports that are accurate, relevant and
            related to legitimate municipal or community issues.
          </p>

          <p>
            Users must not knowingly submit false, misleading,
            fraudulent or abusive reports.
          </p>


          <h2>5. Prohibited Use</h2>

          <p>You agree not to use FixMyTown to:</p>

          <ul>
            <li>Submit knowingly false reports.</li>
            <li>Harass or threaten other users or municipal employees.</li>
            <li>Upload unlawful, offensive or malicious content.</li>
            <li>Attempt to gain unauthorized access to the platform.</li>
            <li>Interfere with the operation or security of the system.</li>
            <li>Use another person's account without authorization.</li>
            <li>Abuse automated systems or APIs.</li>
          </ul>


          <h2>6. Report Processing</h2>

          <p>
            Submitting a report does not guarantee that the reported
            issue will be resolved within a particular period.
          </p>

          <p>
            Reports may be reviewed, categorized, assigned to relevant
            municipal departments and updated as work progresses.
          </p>


          <h2>7. Public Information</h2>

          <p>
            Some information associated with municipal reports may be
            displayed publicly, including general issue categories,
            locations, statuses and statistics.
          </p>

          <p>
            Users should avoid including unnecessary personal or
            confidential information in public report descriptions.
          </p>


          <h2>8. Platform Availability</h2>

          <p>
            We aim to keep FixMyTown available and reliable, but the
            platform may occasionally be unavailable because of
            maintenance, technical problems, network failures or other
            circumstances.
          </p>


          <h2>9. Intellectual Property</h2>

          <p>
            The FixMyTown name, interface, design, software and related
            materials may be protected by applicable intellectual
            property laws.
          </p>

          <p>
            Users may not reproduce, modify or redistribute protected
            platform materials without appropriate authorization.
          </p>


          <h2>10. Privacy</h2>

          <p>
            Your use of FixMyTown may involve the collection and
            processing of information necessary to operate the platform.
          </p>

          <p>
            For information about how personal information is handled,
            please review our{" "}
            <Link to="/privacy-policy">
              Privacy Policy
            </Link>.
          </p>


          <h2>11. Changes to These Terms</h2>

          <p>
            These Terms of Service may be updated from time to time.
            Updated terms will be published on this page with a revised
            update date.
          </p>


          <h2>12. Contact</h2>

          <p>
            If you have questions about these Terms of Service, please
            contact the FixMyTown support team.
          </p>

          <div className="legal-contact">
            <strong>FixMyTown Support</strong>
            <br />
            Email: support@fixmytown.gov.za
            <br />
            Phone: 0800 123 456
          </div>

        </section>

      </main>


      {/* Footer */}
      <footer className="legal-footer">

        <p>
          © {new Date().getFullYear()} FixMyTown. All Rights Reserved.
        </p>

        <div>
          <Link to="/privacy-policy">
            Privacy Policy
          </Link>

          <Link to="/terms-of-service">
            Terms of Service
          </Link>
        </div>

      </footer>

    </div>
  );
}