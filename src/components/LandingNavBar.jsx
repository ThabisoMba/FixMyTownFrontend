import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Landmark,
  Menu,
  X,
  LogIn,
  UserPlus,
} from "lucide-react";

const LINKS = [
  { label: "Home", id: "home" },
  { label: "About", id: "about" },
  { label: "Services", id: "services" },
  { label: "Contact", id: "contact" },
];

export default function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinkStyle = {
    color: "var(--gold-500)",
    textDecoration: "none",
  };

  function handleNavClick(e, id) {
    e.preventDefault();
    setMobileOpen(false);

    if (location.pathname === "/") {
      scrollToId(id);
    } else {
      navigate(`/#${id}`);
    }
  }

  function scrollToId(id) {
    const el = document.getElementById(id);

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    } else if (id === "home") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  return (
    <header className="landing-navbar">
      <div className="landing-navbar-container">

        {/* Logo */}
        <Link
          to="/"
          className="landing-logo"
          style={{
            textDecoration: "none",
          }}
        >
          <Landmark
            size={24}
            color="var(--gold-500)"
          />

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

        {/* Desktop Navigation */}
        <nav className="landing-nav">
          {LINKS.map((item) => (
            <a
              key={item.label}
              href={`/#${item.id}`}
              onClick={(e) => handleNavClick(e, item.id)}
              style={navLinkStyle}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Buttons */}
        <div className="landing-actions">

          <Link
            to="/login"
            className="btn-outline"
          >
            <LogIn size={16} />
            Sign In
          </Link>

          {/* Opens Register tab immediately */}
          <Link
            to="/login?mode=register"
            className="btn-primary"
          >
            <UserPlus size={16} />
            Register
          </Link>

        </div>

        {/* Mobile Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          type="button"
        >
          {mobileOpen ? (
            <X size={24} />
          ) : (
            <Menu size={24} />
          )}
        </button>

      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="mobile-menu">

          {LINKS.map((item) => (
            <a
              key={item.label}
              href={`/#${item.id}`}
              onClick={(e) => handleNavClick(e, item.id)}
              style={navLinkStyle}
            >
              {item.label}
            </a>
          ))}

          <Link
            to="/login"
            className="btn-outline"
            onClick={() => setMobileOpen(false)}
          >
            <LogIn size={16} />
            Sign In
          </Link>

          <Link
            to="/login?mode=register"
            className="btn-primary"
            onClick={() => setMobileOpen(false)}
          >
            <UserPlus size={16} />
            Register
          </Link>

        </div>
      )}

    </header>
  );
}