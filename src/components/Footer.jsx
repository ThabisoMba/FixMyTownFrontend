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


export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="landing-footer" id="contact">

      <div className="footer-container">

        <div className="footer-column footer-brand">

          <div className="footer-logo">
            <Landmark size={30} />
            <div>
              <h2>Fix<span>MyTown</span></h2>
              <p>Municipal Citizen Reporting Platform</p>
            </div>
          </div>

          <p className="footer-description">
            Connecting citizens with municipalities through a modern,
            transparent and efficient reporting system that improves
            service delivery across communities.
          </p>

          <div className="footer-socials">
            <a href="#"><Facebook size={18} /></a>
            <a href="#"><Twitter size={18} /></a>
            <a href="#"><Instagram size={18} /></a>
            <a href="#"><Linkedin size={18} /></a>
          </div>

        </div>

        <div className="footer-column">

          <h3>Quick Links</h3>

          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#statistics">Statistics</a>
          <a href="#contact">Contact</a>

        </div>

        <div className="footer-column">

          <h3>Services</h3>

          <a href="#">Report an Issue</a>
          <a href="#">Track Reports</a>
          <a href="#">Municipality Map</a>
          <a href="#">Community Updates</a>
          <a href="#">Help Centre</a>

        </div>

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

      <div className="footer-bottom">

        <p>
          © {year} FixMyTown. All Rights Reserved.
        </p>

        <div className="footer-bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>

      </div>

    </footer>
  );
}