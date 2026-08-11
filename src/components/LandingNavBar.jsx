import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Landmark,
  Menu,
  X,
  LogIn,
  UserPlus,
} from "lucide-react";

export default function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header className="landing-navbar">
      <div className="landing-navbar-container">
        {/* Logo */}
        <Link to="/" className="landing-logo">
          <Landmark size={24} color="var(--gold-500)" />

          <span className="logo-fix">Fix</span>

          <span className="logo-town">MyTown</span>

          <span className="logo-badge">GOV</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="landing-nav">
          {links.map((item) => (
            <a key={item.label} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Buttons */}
        <div className="landing-actions">
          <Link to="/login" className="btn-outline">
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
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          {links.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
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