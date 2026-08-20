import {
  Landmark,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from "lucide-react";

import { Link } from "react-router-dom";
import TermsOfService from "../pages/public/TermsOfService";
import PrivacyPolicy from "../pages/public/PrivacyPolicy";


export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="landing-footer" id="contact">

      <div className="footer-container">

        {/* ================= BRAND ================= */}
        <div className="footer-column footer-brand">

          <div className="footer-logo">
            <Landmark size={30} />

            <div>
              <h2>
                Fix<span>MyTown</span>
              </h2>

              <p>Municipal Citizen Reporting Platform</p>
            </div>
          </div>

          <p className="footer-description">
            Connecting citizens with municipalities through a modern,
            transparent and efficient reporting system that improves
            service delivery across communities.
          </p>

          {/* Social Media */}
          <div className="footer-socials">

            <a
              href="#"
              aria-label="Facebook"
              onClick={(e) => e.preventDefault()}
            >
              <Facebook size={18} />
            </a>

            <a
              href="#"
              aria-label="Twitter"
              onClick={(e) => e.preventDefault()}
            >
              <Twitter size={18} />
            </a>

            <a
              href="#"
              aria-label="Instagram"
              onClick={(e) => e.preventDefault()}
            >
              <Instagram size={18} />
            </a>

            <a
              href="#"
              aria-label="LinkedIn"
              onClick={(e) => e.preventDefault()}
            >
              <Linkedin size={18} />
            </a>

          </div>

        </div>


        {/* ================= QUICK LINKS ================= */}
        <div className="footer-column">

          <h3>Quick Links</h3>

          <a href="/#home">
            Home
          </a>

          <a href="/#about">
            About
          </a>

          <a href="/#services">
            Services
          </a>

          <a href="/#statistics">
            Statistics
          </a>

          <a href="/#contact">
            Contact
          </a>

        </div>


        {/* ================= SERVICES ================= */}
        <div className="footer-column">

          <h3>Services</h3>

          <a href="/login?mode=register">
            Report an Issue
          </a>

          <a href="/login">
            Track Reports
          </a>

          <a href="/#home">
            Municipality Map
          </a>

          <a href="/#statistics">
            Community Updates
          </a>

          <a href="/#contact">
            Help Centre
          </a>

        </div>


        {/* ================= CONTACT ================= */}
        <div className="footer-column">

          <h3>Contact</h3>

          <div className="footer-contact">
            <Phone size={17} />
            <span>0800 123 456</span>
          </div>

          <div className="footer-contact">
            <Mail size={17} />
            <span>support@fixmytown.gov.za</span>
          </div>

          <div className="footer-contact">
            <MapPin size={17} />
            <span>Nelson Mandela Bay Municipality</span>
          </div>

        </div>

      </div>


      {/* ================= FOOTER BOTTOM ================= */}
      <div className="footer-bottom">

        <p>
          © {year} FixMyTown. All Rights Reserved.
        </p>

        <div className="footer-bottom-links">
          <Link to="/privacy-policy" element={<PrivacyPolicy />}>
            Privacy Policy
          </Link>

          <Link to="/terms-of-service" element={<TermsOfService />}>
            Terms of Service
          </Link>

        </div>

      </div>

    </footer>
  );
}