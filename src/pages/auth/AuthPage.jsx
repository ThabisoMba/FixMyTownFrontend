import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  User,
  ShieldCheck,
  HardHat,
  Mail,
  LogIn,
  UserPlus,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import ForgotPasswordModal from "./ForgotPasswordModal";
import PasswordHint from "../../components/PasswordHint";
import PasswordInput from "../../components/PasswordInput";
import TermsGateModal from "../../components/TermsGateModal";
import {
  hasAcceptedTerms,
  acceptTerms,
  declineTerms,
} from "../../utils/termsConsent";
import { isPasswordValid } from "../../utils/passwordValidation";
import LandingNavBar from "../../components/LandingNavBar";
import PageTransition from "../../components/PageTransition";
import "./AuthPage.css";

const ROLES = [
  { key: "citizen", label: "Citizen", icon: User },
  { key: "admin", label: "Admin", icon: ShieldCheck },
  { key: "worker", label: "Worker", icon: HardHat },
];

export default function AuthPage() {
  const [searchParams] = useSearchParams();

  const initialMode =
    searchParams.get("mode") === "register" ? "register" : "login";

  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState("citizen");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [showTermsGate, setShowTermsGate] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");

    // Registration is always a citizen registration.
    if (nextMode === "register") {
      setRole("citizen");
    }
  }

  function switchRole(nextRole) {
    setRole(nextRole);
    setError("");
  }

  async function performAuth() {
    setLoading(true);
    setError("");

    try {
      let user;

      if (mode === "login") {
        user = await login(
          form.email.trim(),
          form.password,
          role
        );
      } else {
        user = await register(
          form.fullName.trim(),
          form.email.trim(),
          form.password,
          form.phone.trim()
        );
      }

      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.Message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (mode === "register") {
      if (!form.fullName.trim()) {
        setError("Please enter your full name.");
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      if (!isPasswordValid(form.password)) {
        setError("Please meet all the password requirements below.");
        return;
      }
    }

    if (!hasAcceptedTerms()) {
      setShowTermsGate(true);
      return;
    }

    await performAuth();
  }

  function handleAcceptTerms() {
    acceptTerms();
    setShowTermsGate(false);
    performAuth();
  }

  function handleDeclineTerms() {
    declineTerms();
    setShowTermsGate(false);
    setError(
      "You need to accept the Terms of Service to log in or create an account."
    );
  }

  const isLogin = mode === "login";

  return (
    <>
      <PageTransition>
        <LandingNavBar />

        <main className="auth-page">
          <div className="auth-page__background" />
          <div className="auth-page__overlay" />

          <section className="card auth-card">
            <aside className="auth-brand-panel">
              <div className="auth-brand">
                <ShieldCheck size={22} color="var(--gold-500)" />
                <span>
                  Fix <strong>MyTown</strong>
                </span>
              </div>

              <div className="auth-brand-copy">
                <h1>
                  Report issues.
                  <br />
                  Improve your city.
                </h1>

                <p>
                  Report municipal problems, follow their progress and stay
                  connected with your community.
                </p>

                <div className="auth-tags">
                  {[
                    "Potholes",
                    "Street lights",
                    "Parks",
                    "Illegal dumping",
                    "Drainage",
                  ].map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>

              <div className="auth-brand-footer">
                Secure municipal community portal
              </div>
            </aside>

            <div className="auth-form-panel">
              <div className="auth-mode-switch" aria-label="Authentication mode">
                <button
                  type="button"
                  className={isLogin ? "active" : ""}
                  onClick={() => switchMode("login")}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  className={!isLogin ? "active" : ""}
                  onClick={() => switchMode("register")}
                >
                  Create Account
                </button>
              </div>

              <div className="auth-heading">
                <h2>
                  {isLogin ? "Welcome back" : "Create your citizen account"}
                </h2>

                <p>
                  {isLogin
                    ? "Sign in to continue to Fix MyTown."
                    : "Create an account to report municipal issues and track their progress."}
                </p>
              </div>

              {isLogin && (
                <div className="auth-role-section">
                  <span className="auth-role-label">Signing in as</span>

                  <div className="auth-role-switch">
                    {ROLES.map((item) => {
                      const Icon = item.icon;
                      const selected = role === item.key;

                      return (
                        <button
                          key={item.key}
                          type="button"
                          className={selected ? "active" : ""}
                          onClick={() => switchRole(item.key)}
                        >
                          <Icon size={15} />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {isLogin && role !== "citizen" && (
                <div className="auth-role-notice">
                  <AlertCircle size={16} />

                  <span>
                    {role === "admin"
                      ? "Admin access is restricted to authorized municipal personnel."
                      : "Worker accounts are created by a municipal administrator. Use the credentials provided to you."}
                  </span>
                </div>
              )}

              {!isLogin && (
                <div className="auth-register-note">
                  <User size={16} />
                  <span>
                    Public account registration creates a citizen account.
                    Admin and worker accounts are managed by the municipality.
                  </span>
                </div>
              )}

              {error && (
                <div className="auth-error" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                {!isLogin && (
                  <div className="field">
                    <label htmlFor="fullName">Full Name</label>
                    <input
                      id="fullName"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      required
                    />
                  </div>
                )}

                <div className="field">
                  <label htmlFor="email">Email</label>

                  <div className="auth-input-with-icon">
                    <Mail size={15} />

                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className="field">
                    <label htmlFor="phone">Phone (optional)</label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      autoComplete="tel"
                    />
                  </div>
                )}

                <div className="field">
                  <label htmlFor="password">Password</label>

                  <PasswordInput
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder={
                      isLogin ? "Enter your password" : "Create a password"
                    }
                    autoComplete={
                      isLogin ? "current-password" : "new-password"
                    }
                    required
                  />

                  {!isLogin && (
                    <PasswordHint password={form.password} />
                  )}

                  {isLogin && (
                    <button
                      type="button"
                      className="auth-forgot-button"
                      onClick={() => setForgotPasswordOpen(true)}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                {!isLogin && (
                  <div className="field">
                    <label htmlFor="confirmPassword">
                      Confirm Password
                    </label>

                    <PasswordInput
                      id="confirmPassword"
                      showIcon={false}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary auth-submit-button"
                  disabled={loading}
                >
                  {isLogin ? (
                    <LogIn size={16} />
                  ) : (
                    <UserPlus size={16} />
                  )}

                  {loading
                    ? "Please wait..."
                    : isLogin
                      ? `Sign In as ${
                          role.charAt(0).toUpperCase() + role.slice(1)
                        }`
                      : "Create Account"}
                </button>
              </form>

              <p className="auth-footer-switch">
                {isLogin ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("register")}
                    >
                      Create account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          </section>

          {forgotPasswordOpen && (
            <ForgotPasswordModal
              onClose={() => setForgotPasswordOpen(false)}
            />
          )}

          {showTermsGate && (
            <TermsGateModal
              onAccept={handleAcceptTerms}
              onDecline={handleDeclineTerms}
            />
          )}
        </main>
      </PageTransition>
    </>
  );
}
