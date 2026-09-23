import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ShieldCheck,
  Mail,
  LogIn,
  UserPlus
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import ForgotPasswordModal from "./ForgotPasswordModal";
import PasswordHint from "../../components/PasswordHint";
import PasswordInput from "../../components/PasswordInput";
import TermsGateModal from "../../components/TermsGateModal";
import {
  hasAcceptedTerms,
  acceptTerms,
  declineTerms
} from "../../utils/termsConsent";
import { isPasswordValid } from "../../utils/passwordValidation";
import LandingNavBar from "../../components/LandingNavBar";
import PageTransition from "../../components/PageTransition";
import "./AuthPage.css";

export default function AuthPage() {
  const [searchParams] = useSearchParams();

  const initialMode =
    searchParams.get("mode") === "register"
      ? "register"
      : "login";

  const [mode, setMode] = useState(initialMode);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [
    forgotPasswordOpen,
    setForgotPasswordOpen
  ] = useState(false);

  const [
    showTermsGate,
    setShowTermsGate
  ] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  function switchMode(newMode) {
    setMode(newMode);
    setError("");
  }

  /*
   * The current backend still expects a role
   * when logging in.
   *
   * Instead of asking the user to choose one,
   * try the supported roles automatically.
   */
  async function loginWithoutRoleSelection() {
    const roles = [
      "citizen",
      "admin",
      "worker"
    ];

    let lastError = null;

    for (const role of roles) {
      try {
        const user = await login(
          form.email,
          form.password,
          role
        );

        return user;
      } catch (err) {
        lastError = err;

        /*
         * 401 means either the credentials
         * did not match or this was not the
         * user's role, so try the next role.
         *
         * For another server error, stop.
         */
        if (
          err.response &&
          err.response.status !== 401
        ) {
          throw err;
        }
      }
    }

    throw lastError;
  }

  async function performAuth() {
    setLoading(true);
    setError("");

    try {
      let user;

      if (mode === "login") {
        user =
          await loginWithoutRoleSelection();
      } else {
        /*
         * Registration remains unchanged.
         * The backend automatically creates
         * a citizen account.
         */
        user = await register(
          form.fullName,
          form.email,
          form.password,
          form.phone
        );
      }

      navigate(
        `/${user.role}/dashboard`
      );
    } catch (err) {
      if (
        mode === "login" &&
        err.response?.status === 401
      ) {
        setError(
          "Invalid email or password."
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data?.Message ||
            "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");

    if (
      mode === "register" &&
      form.password !==
        form.confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    if (
      mode === "register" &&
      !isPasswordValid(form.password)
    ) {
      setError(
        "Please meet all the password requirements below."
      );

      return;
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

  return (
    <>
      <PageTransition>
        <LandingNavBar />

        <div
          style={{
            marginTop: "70px",
            minHeight:
              "calc(100vh - 120px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding:
              "40px 20px 60px",
            position: "relative",
            overflow: "hidden"
          }}
        >
          {/* Blurred background layer */}
          <div
            style={{
              position: "absolute",
              top: -20,
              left: -20,
              right: -20,
              bottom: -20,
              backgroundImage:
                "url('/grp-03-39/MunicipalWorkers.jpg')",
              backgroundSize:
                "cover",
              backgroundPosition:
                "center",
              backgroundRepeat:
                "no-repeat",
              filter: "blur(2px)",
              zIndex: 0
            }}
          />

          {/* Dark overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "rgba(10, 20, 40, 0.35)",
              zIndex: 1
            }}
          />

          <div
            className="card auth-card"
            style={{
              display: "flex",
              width: 920,
              maxWidth: "100%",
              overflow: "hidden",
              minHeight: 560,
              position: "relative",
              zIndex: 2
            }}
          >
            {/* Left branding panel */}
            <div
              style={{
                flex: "0 0 44%",
                background:
                  "linear-gradient(160deg, var(--navy-700), var(--navy-900))",
                color: "white",
                padding:
                  "40px 36px",
                display: "flex",
                flexDirection:
                  "column"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 40
                }}
              >
                <ShieldCheck
                  size={22}
                  color="var(--gold-500)"
                />

                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 19
                  }}
                >
                  Fix{" "}
                  <span
                    style={{
                      color:
                        "var(--gold-500)"
                    }}
                  >
                    MyTown
                  </span>
                </span>
              </div>

              <h1
                style={{
                  fontSize: 30,
                  lineHeight: 1.25,
                  margin:
                    "0 0 14px"
                }}
              >
                Report issues.
                <br />
                Improve your city.
              </h1>

              <p
                style={{
                  color: "#b7c4d8",
                  fontSize: 14,
                  lineHeight: 1.6,
                  marginBottom: 26
                }}
              >
                Citizens can report
                potholes, broken lights,
                illegal dumping and track
                municipal progress.
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 26
                }}
              >
                {[
                  "Potholes",
                  "Street lights",
                  "Parks",
                  "Illegal dumping",
                  "Drainage"
                ].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background:
                        "rgba(255,255,255,0.08)",
                      border:
                        "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 999,
                      padding:
                        "6px 12px",
                      fontSize: 12,
                      fontWeight: 600
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div
                style={{
                  marginTop: "auto",
                  paddingTop: 26,
                  fontSize: 12,
                  color: "#8296b3"
                }}
              >
                Secure municipal citizen
                portal
              </div>
            </div>

            {/* Right form panel */}
            <div
              style={{
                flex: 1,
                padding:
                  "36px 40px",
                display: "flex",
                flexDirection:
                  "column"
              }}
            >
              {/* Login / Register toggle */}
              <div
                style={{
                  display: "flex",
                  background:
                    "var(--bg-page)",
                  borderRadius: 999,
                  padding: 4,
                  marginBottom: 24
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    switchMode("login")
                  }
                  style={{
                    flex: 1,
                    border: "none",
                    background:
                      mode === "login"
                        ? "var(--navy-800)"
                        : "transparent",
                    color:
                      mode === "login"
                        ? "white"
                        : "var(--text-secondary)",
                    borderRadius: 999,
                    padding: "9px 0",
                    fontWeight: 600,
                    fontSize: 13
                  }}
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() =>
                    switchMode(
                      "register"
                    )
                  }
                  style={{
                    flex: 1,
                    border: "none",
                    background:
                      mode === "register"
                        ? "var(--navy-800)"
                        : "transparent",
                    color:
                      mode === "register"
                        ? "white"
                        : "var(--text-secondary)",
                    borderRadius: 999,
                    padding: "9px 0",
                    fontWeight: 600,
                    fontSize: 13
                  }}
                >
                  Register
                </button>
              </div>

              <h2
                style={{
                  margin:
                    "0 0 4px",
                  fontSize: 20
                }}
              >
                {mode === "login"
                  ? "Login"
                  : "Create Citizen Account"}
              </h2>

              <p
                style={{
                  margin:
                    "0 0 20px",
                  fontSize: 13,
                  color:
                    "var(--text-secondary)"
                }}
              >
                {mode === "login"
                  ? "Sign in to your account to continue"
                  : "Join your municipality to start reporting issues"}
              </p>

              {error && (
                <div
                  style={{
                    background:
                      "#fdecec",
                    color: "#c0362c",
                    fontSize: 13,
                    padding:
                      "10px 14px",
                    borderRadius: 8,
                    marginBottom: 16
                  }}
                >
                  {error}
                </div>
              )}

              <form
                onSubmit={
                  handleSubmit
                }
              >
                {mode ===
                  "register" && (
                  <div className="field">
                    <label>
                      Full Name
                    </label>

                    <input
                      name="fullName"
                      value={
                        form.fullName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                )}

                <div className="field">
                  <label>
                    {mode === "login"
                      ? "Email or Username"
                      : "Email"}
                  </label>

                  <div
                    style={{
                      position:
                        "relative"
                    }}
                  >
                    <Mail
                      size={15}
                      style={{
                        position:
                          "absolute",
                        left: 12,
                        top: 13,
                        color:
                          "var(--text-muted)"
                      }}
                    />

                    <input
                      type="email"
                      name="email"
                      value={
                        form.email
                      }
                      onChange={
                        handleChange
                      }
                      placeholder={
                        mode ===
                        "login"
                          ? "Enter email or username"
                          : "Enter email address"
                      }
                      style={{
                        paddingLeft: 34
                      }}
                      required
                    />
                  </div>
                </div>

                {mode ===
                  "register" && (
                  <div className="field">
                    <label>
                      Phone (optional)
                    </label>

                    <input
                      name="phone"
                      value={
                        form.phone
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter phone number"
                    />
                  </div>
                )}

                <div className="field">
                  <label>
                    Password
                  </label>

                  <PasswordInput
                    name="password"
                    value={
                      form.password
                    }
                    onChange={
                      handleChange
                    }
                    placeholder={
                      mode ===
                      "login"
                        ? "Enter password"
                        : "Create password"
                    }
                    required
                  />

                  {mode ===
                    "register" && (
                    <PasswordHint
                      password={
                        form.password
                      }
                    />
                  )}

                  {mode ===
                    "login" && (
                    <button
                      type="button"
                      onClick={() =>
                        setForgotPasswordOpen(
                          true
                        )
                      }
                      style={{
                        background:
                          "none",
                        border: "none",
                        color:
                          "var(--navy-800)",
                        fontSize: 12.5,
                        fontWeight: 600,
                        padding: 0,
                        marginTop: 8,
                        display: "block"
                      }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                {mode ===
                  "register" && (
                  <div className="field">
                    <label>
                      Confirm Password
                    </label>

                    <PasswordInput
                      showIcon={
                        false
                      }
                      name="confirmPassword"
                      value={
                        form.confirmPassword
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    width: "100%",
                    padding:
                      "13px 0",
                    fontSize: 14
                  }}
                  disabled={loading}
                >
                  {mode === "login" ? (
                    <LogIn
                      size={16}
                    />
                  ) : (
                    <UserPlus
                      size={16}
                    />
                  )}

                  {loading
                    ? "Please wait..."
                    : mode === "login"
                      ? "Login"
                      : "Register"}
                </button>
              </form>

              <p
                style={{
                  textAlign:
                    "center",
                  fontSize: 13,
                  color:
                    "var(--text-secondary)",
                  marginTop: 18
                }}
              >
                {mode === "login" ? (
                  <>
                    Don't have an
                    account?{" "}
                    <button
                      type="button"
                      onClick={() =>
                        switchMode(
                          "register"
                        )
                      }
                      style={{
                        background:
                          "none",
                        border:
                          "none",
                        color:
                          "var(--navy-800)",
                        fontWeight: 700,
                        padding: 0
                      }}
                    >
                      Create account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an
                    account?{" "}
                    <button
                      type="button"
                      onClick={() =>
                        switchMode(
                          "login"
                        )
                      }
                      style={{
                        background:
                          "none",
                        border:
                          "none",
                        color:
                          "var(--navy-800)",
                        fontWeight: 700,
                        padding: 0
                      }}
                    >
                      Login
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>

          {forgotPasswordOpen && (
            <ForgotPasswordModal
              onClose={() =>
                setForgotPasswordOpen(
                  false
                )
              }
            />
          )}

          {showTermsGate && (
            <TermsGateModal
              onAccept={
                handleAcceptTerms
              }
              onDecline={
                handleDeclineTerms
              }
            />
          )}
        </div>
      </PageTransition>
    </>
  );
}