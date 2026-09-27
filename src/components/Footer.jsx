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

          <Link to="/#home">
            Home
          </Link>

          <Link to="/#about">
            About
          </Link>

          <Link to="/#services">
            Services
          </Link>

          <Link to="/#statistics">
            Statistics
          </Link>

          <Link to="/#contact">
            Contact
          </Link>

        </div>


        {/* ================= SERVICES ================= */}
        <div className="footer-column">

          <h3>Services</h3>

          <Link to="/login?mode=register">
            Report an Issue
          </Link>

          <Link to="/login">
            Track Reports
          </Link>

          <Link to="/#home">
            Municipality Map
          </Link>

          <Link to="/#statistics">
            Community Updates
          </Link>

          <Link to="/#contact">
            Help Centre
          </Link>

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
          <Link to="/privacy-policy">
            Privacy Policy
          </Link>

          <Link to="/terms-of-service">
            Terms of Service
          </Link>

        </div>

      </div>

    </footer>
  );
}
