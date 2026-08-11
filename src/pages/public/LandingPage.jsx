import LandingNavbar from "../../components/LandingNavbar";
import HeroStats from "../../components/HeroStats";
import LiveSearch from "../../components/LiveSearch";
import CategoryFilters from "../../components/CategoryFilters";
import StatisticsCards from "../../components/StatisticsCards";
import HowItWorks from "../../components/HowItWorks";
import RecentActivity from "../../components/RecentActivity";
import Testimonials from "../../components/Testimonials";
import Footer from "../../components/Footer";
import PublicMap from "../../components/PublicMap";

import "./LandingPage.css";

export default function LandingPage() {
  return (
    <div className="landing-page">

      {/* ================= NAVIGATION ================= */}
      <LandingNavbar />

      {/* ================= HERO / LIVE MAP ================= */}
      <section className="hero-section">

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

          <HeroStats />

          <LiveSearch />

          <CategoryFilters />

 

        </div>

      </section>

      {/* ================= STATISTICS ================= */}
      <StatisticsCards />

      {/* ================= HOW IT WORKS ================= */}
      <HowItWorks />

      {/* ================= RECENT ACTIVITY ================= */}
      <RecentActivity />

      {/* ================= TESTIMONIALS ================= */}
      <Testimonials />

      {/* ================= FOOTER ================= */}
      <Footer />

    </div>
  );
}