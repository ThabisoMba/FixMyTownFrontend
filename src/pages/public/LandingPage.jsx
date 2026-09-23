import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import LandingNavBar from "../../components/LandingNavBar";
//import HeroStats from "../../components/HeroStats";
//import LiveSearch from "../../components/LiveSearch";
//import CategoryFilters from "../../components/CategoryFilters";
import StatisticsCards from "../../components/StatisticsCards";
import HowItWorks from "../../components/HowItWorks";
import About from "../../components/About";
import Services from "../../components/Services";
import RecentActivity from "../../components/RecentActivity";
import Testimonials from "../../components/Testimonials";
import Footer from "../../components/Footer";
import PublicMap from "../../components/PublicMap";
import TermsGateModal from "../../components/TermsGateModal";
import { useAuth } from "../../context/AuthContext";
import {
  hasAcceptedTerms,
  acceptTerms,
  declineTerms,
  hasPromptedThisSession,
  markPromptedThisSession
} from "../../utils/termsConsent";

import "./LandingPage.css";

export default function LandingPage() {
  const location = useLocation();
  const { user } = useAuth();
  const [showTermsGate, setShowTermsGate] = useState(false);

  useEffect(() => {
    if (!location.hash) return;

    const id = location.hash.replace("#", "");
    const el = document.getElementById(id);

    if (el) {
      // slight delay so the page has fully laid out before scrolling
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }, [location.hash]);

  useEffect(() => {
    // Only prompt guests who haven't already accepted/declined, and
    // only once per browser session so it doesn't nag on every visit.
    if (user || hasAcceptedTerms() || hasPromptedThisSession()) return;

    function handleFirstScroll() {
      setShowTermsGate(true);
      markPromptedThisSession();
      window.removeEventListener("scroll", handleFirstScroll);
    }

    window.addEventListener("scroll", handleFirstScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleFirstScroll);
  }, [user]);

  function handleAcceptTerms() {
    acceptTerms();
    setShowTermsGate(false);
  }

  function handleDeclineTerms() {
    declineTerms();
    setShowTermsGate(false);
    // Guests can still browse public info anonymously after declining -
    // the gate re-appears specifically when they try to register or log
    // in (see AuthPage.jsx), which is where accepting actually matters.
  }

  return (
    <div className="landing-page">

      {showTermsGate && (
        <TermsGateModal
          onAccept={handleAcceptTerms}
          onDecline={handleDeclineTerms}
        />
      )}

      {/* ================= NAVIGATION ================= */}
      <LandingNavBar />

      {/* ================= HERO / LIVE MAP ================= */}
      <section id="home" className="hero-section">

        {/* Live Leaflet Map */}
        <div className="landing-map-container">
          <PublicMap />
        </div>

        {/* Overlay Content */}
        <div className="hero-overlay">

          <div className="hero-heading">
            <h1>Building Better Communities Together</h1>

            <p>
              View municipal issues across your community in real time.
              Report problems, track progress, and help create a cleaner,
              safer and smarter municipality.
            </p>
          </div>

         

        </div>

      </section>

      {/* ================= STATISTICS ================= */}
      <StatisticsCards />

      {/* ================= ABOUT ================= */}
      <About />

      {/* ================= SERVICES ================= */}
      <Services />

      {/* ================= HOW IT WORKS ================= */}
      <HowItWorks />

      {/* ================= RECENT ACTIVITY ================= */}
      <RecentActivity />

      {/* ================= TESTIMONIALS ================= */}
      <Testimonials />

      {/* ================= CONTACT / FOOTER ================= */}
      <div id="contact">
        <Footer />
      </div>

    </div>
  );
}