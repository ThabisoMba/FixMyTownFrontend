import { Link } from "react-router-dom";
import { Landmark, ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="legal-page">

      {/* Header */}
      <header className="legal-header">
        <div className="legal-header-container">

          <Link to="/" className="legal-logo">
            <Landmark size={28} />

            <span className="logo-fix">
              Fix
            </span>

            <span className="logo-town">
              MyTown
            </span>

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

        <div className="legal-container">

          <div className="legal-title">
            <span>LEGAL</span>
            <h1>Privacy Policy</h1>

            <p>
              How FixMyTown collects, uses, protects and manages
              information provided by citizens.
            </p>
          </div>


          <section className="legal-section">
            <h2>1. Introduction</h2>

            <p>
              FixMyTown is a municipal citizen reporting platform designed
              to help residents report community issues and track the
              progress of municipal service requests.
            </p>

            <p>
              We respect your privacy and are committed to protecting
              personal information submitted through the platform.
            </p>
          </section>


          <section className="legal-section">
            <h2>2. Information We Collect</h2>

            <p>
              Depending on the services you use, FixMyTown may collect
              information such as:
            </p>

            <ul>
              <li>Name and contact details</li>
              <li>Account login information</li>
              <li>Municipal issue reports</li>
              <li>Locations associated with reported issues</li>
              <li>Images or supporting evidence submitted with reports</li>
              <li>Communication and support requests</li>
            </ul>
          </section>


          <section className="legal-section">
            <h2>3. How We Use Information</h2>

            <p>
              Information collected through FixMyTown may be used to:
            </p>

            <ul>
              <li>Process and manage municipal reports</li>
              <li>Track the progress of reported issues</li>
              <li>Communicate with citizens</li>
              <li>Improve municipal service delivery</li>
              <li>Generate municipal performance statistics</li>
              <li>Improve the security and functionality of the platform</li>
            </ul>
          </section>


          <section className="legal-section">
            <h2>4. Location Information</h2>

            <p>
              FixMyTown may use location information when a citizen
              identifies the location of a municipal problem. This helps
              municipal departments identify where an issue is located
              and assign it to the appropriate team.
            </p>
          </section>


          <section className="legal-section">
            <h2>5. Information Security</h2>

            <p>
              We take reasonable measures to protect information stored
              within the platform against unauthorized access, alteration,
              disclosure or destruction.
            </p>
          </section>


          <section className="legal-section">
            <h2>6. Information Sharing</h2>

            <p>
              Information may be made available to authorized municipal
              personnel where necessary to investigate, assign and resolve
              reported issues.
            </p>
          </section>


          <section className="legal-section">
            <h2>7. Your Responsibilities</h2>

            <p>
              Users should provide accurate information and should not
              submit false, misleading or malicious reports.
            </p>
          </section>


          <section className="legal-section">
            <h2>8. Policy Updates</h2>

            <p>
              This Privacy Policy may be updated periodically to reflect
              changes to the FixMyTown platform, applicable requirements
              or operational practices.
            </p>
          </section>


          <section className="legal-section">
            <h2>9. Contact Us</h2>

            <p>
              If you have questions regarding this Privacy Policy,
              contact the FixMyTown support team.
            </p>

            <p>
              <strong>Email:</strong> support@fixmytown.gov.za
            </p>
          </section>


          <div className="legal-footer-action">
            <Link to="/" className="legal-button">
              <ArrowLeft size={17} />
              Return to FixMyTown
            </Link>
          </div>

        </div>

      </main>

    </div>
  );
}