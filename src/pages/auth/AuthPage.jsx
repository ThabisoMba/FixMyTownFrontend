import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { User, ShieldCheck, HardHat, Mail, Lock, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ForgotPasswordModal from './ForgotPasswordModal';
import PasswordHint from '../../components/PasswordHint';
import { isPasswordValid } from '../../utils/passwordValidation';
import LandingNavBar from '../../components/LandingNavBar';
import PageTransition from "../../components/PageTransition";
import './AuthPage.css';

const ROLES = [
  { key: 'citizen', label: 'Citizen', icon: User },
  { key: 'admin', label: 'Admin', icon: ShieldCheck },
  { key: 'worker', label: 'Worker', icon: HardHat }
];

export default function AuthPage() {
  const [searchParams] = useSearchParams();

  const initialMode = searchParams.get("mode") === "register"? "register": "login";
  const [role, setRole] = useState('citizen');
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function switchRole(newRole) {
    setRole(newRole);
    setMode('login'); // only citizens can register, so reset to login for admin/worker
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (mode === 'register' && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (mode === 'register' && !isPasswordValid(form.password)) {
      setError('Please meet all the password requirements below.');
      return;
    }

    setLoading(true);
    try {
      let user;
      if (mode === 'login') {
        user = await login(form.email, form.password, role);
      } else {
        user = await register(form.fullName, form.email, form.password, form.phone);
      }
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    <PageTransition>
    <LandingNavBar />

    <div
      style={{
          marginTop: "70px", // leaves space below the fixed navbar
          minHeight: "calc(100vh - 120px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px 60px",
          position: "relative",
          overflow: "hidden",
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
          backgroundImage: "url('/MunicalWorkers.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(2px)",
          zIndex: 0,
        }}
      />

      {/* Dark overlay for contrast against the card */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(10, 20, 40, 0.35)",
          zIndex: 1,
        }}
      />

      <div
        className="card auth-card"
        style={{
          display: 'flex',
          width: 920,
          maxWidth: '100%',
          overflow: 'hidden',
          minHeight: 560,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Left branding panel */}
        <div
          style={{
            flex: '0 0 44%',
            background: 'linear-gradient(160deg, var(--navy-700), var(--navy-900))',
            color: 'white',
            padding: '40px 36px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 40 }}>
            <ShieldCheck size={22} color="var(--gold-500)" />
            <span style={{ fontWeight: 700, fontSize: 19 }}>
              Fix <span style={{ color: 'var(--gold-500)' }}>MyTown</span>
            </span>
          </div>

          <h1 style={{ fontSize: 30, lineHeight: 1.25, margin: '0 0 14px' }}>
            Report issues.
            <br />
            Improve your city.
          </h1>
          <p style={{ color: '#b7c4d8', fontSize: 14, lineHeight: 1.6, marginBottom: 26 }}>
            Citizens can report potholes, broken lights, illegal dumping and track municipal progress.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 26 }}>
            {['Potholes', 'Street lights', 'Parks', 'Illegal dumping', 'Drainage'].map((tag) => (
              <span
                key={tag}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 999,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 26, fontSize: 12, color: '#8296b3' }}>
            Secure municipal citizen portal
          </div>
        </div>

        {/* Right form panel */}
        <div style={{ flex: 1, padding: '36px 40px', display: 'flex', flexDirection: 'column' }}>
          {/* Role tabs */}
          <div style={{ display: 'flex', background: 'var(--bg-page)', borderRadius: 999, padding: 4, marginBottom: 16 }}>
            {ROLES.map((r) => (
              <button
                key={r.key}
                onClick={() => switchRole(r.key)}
                style={{
                  flex: 1,
                  border: 'none',
                  background: role === r.key ? 'white' : 'transparent',
                  boxShadow: role === r.key ? 'var(--shadow-card)' : 'none',
                  borderRadius: 999,
                  padding: '9px 0',
                  fontWeight: 600,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  color: role === r.key ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}
              >
                <r.icon size={15} /> {r.label}
              </button>
            ))}
          </div>

          {/* Login / Register toggle - citizens only get Register */}
          <div style={{ display: 'flex', background: 'var(--bg-page)', borderRadius: 999, padding: 4, marginBottom: 24 }}>
            <button
              onClick={() => setMode('login')}
              style={{
                flex: 1,
                border: 'none',
                background: mode === 'login' ? 'var(--navy-800)' : 'transparent',
                color: mode === 'login' ? 'white' : 'var(--text-secondary)',
                borderRadius: 999,
                padding: '9px 0',
                fontWeight: 600,
                fontSize: 13
              }}
            >
              Login
            </button>
            {role === 'citizen' && (
              <button
                onClick={() => setMode('register')}
                style={{
                  flex: 1,
                  border: 'none',
                  background: mode === 'register' ? 'var(--navy-800)' : 'transparent',
                  color: mode === 'register' ? 'white' : 'var(--text-secondary)',
                  borderRadius: 999,
                  padding: '9px 0',
                  fontWeight: 600,
                  fontSize: 13
                }}
              >
                Register
              </button>
            )}
          </div>

          <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>
            {mode === 'login' ? `${capitalize(role)} Login` : 'Create Citizen Account'}
          </h2>
          <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-secondary)' }}>
            {mode === 'login'
              ? role === 'admin'
                ? 'Secure access for municipal administrators only'
                : role === 'worker'
                ? 'Sign in with credentials provided by your administrator'
                : 'Sign in to your citizen account to report and track issues'
              : 'Join your municipality to start reporting issues'}
          </p>

          {role !== 'citizen' && mode === 'login' && (
            <div
              style={{
                background: 'var(--gold-100)',
                border: '1px solid #f3d9a8',
                color: '#8a5a12',
                fontSize: 13,
                padding: '10px 14px',
                borderRadius: 8,
                marginBottom: 18,
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              {role === 'admin'
                ? 'Admin access is restricted to authorized municipal personnel only.'
                : "Worker accounts are created by your municipal administrator. If you don't have credentials, please contact your admin."}
            </div>
          )}

          {error && (
            <div style={{ background: '#fdecec', color: '#c0362c', fontSize: 13, padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="field">
                <label>Full Name</label>
                <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Enter full name" required />
              </div>
            )}

            <div className="field">
              <label>{mode === 'login' ? 'Email or Username' : 'Email'}</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder={mode === 'login' ? 'Enter email or username' : 'Enter email address'}
                  style={{ paddingLeft: 34 }}
                  required
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="field">
                <label>Phone (optional)</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Enter phone number" />
              </div>
            )}

            <div className="field">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={mode === 'login' ? 'Enter password' : 'Create password'}
                  style={{ paddingLeft: 34 }}
                  required
                />
              </div>
              {mode === 'register' && <PasswordHint password={form.password} />}
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--navy-800)',
                    fontSize: 12.5,
                    fontWeight: 600,
                    padding: 0,
                    marginTop: 8,
                    display: 'block'
                  }}
                >
                  Forgot password?
                </button>
              )}
            </div>

            {mode === 'register' && (
              <div className="field">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '13px 0', fontSize: 14 }} disabled={loading}>
              {mode === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
              {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
            </button>
          </form>

          {role === 'citizen' && (
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginTop: 18 }}>
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button onClick={() => setMode('register')} style={{ background: 'none', border: 'none', color: 'var(--navy-800)', fontWeight: 700, padding: 0 }}>
                    Create account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: 'var(--navy-800)', fontWeight: 700, padding: 0 }}>
                    Login
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      </div>

      {forgotPasswordOpen && <ForgotPasswordModal onClose={() => setForgotPasswordOpen(false)} />}
    </div>
    </PageTransition>
    </>
  );
}

function RoleLegend({ color, label, note }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <span>
        <strong>{label}</strong> <span style={{ color: '#9aabc4' }}>— {note}</span>
      </span>
    </div>
  );
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}