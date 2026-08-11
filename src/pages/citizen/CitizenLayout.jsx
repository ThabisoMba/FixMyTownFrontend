import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Landmark, Plus, Phone, Mail, LogOut, ChevronDown } from 'lucide-react';
import ReportWizard from './ReportWizard';
import NotificationBell from '../../components/NotificationBell';

export default function CitizenLayout() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardLocation, setWizardLocation] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(
  localStorage.getItem('fixmytown_user') ||
  sessionStorage.getItem('fixmytown_user') ||
  '{}'
);

  console.log("Stored user:", user);
  console.log("Full name:", user.fullName);
  console.log("Stored user:", JSON.stringify(user, null, 2));

  function openWizard(location) {
    setWizardLocation(location || null);
    setWizardOpen(true);
  }

  function closeWizard() {
    setWizardOpen(false);
    setWizardLocation(null);
  }

  function getInitials() {
    const name = user.fullName || user.name || user.email || '';
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  function handleLogout() {
    localStorage.removeItem('fixmytown_token');
localStorage.removeItem('fixmytown_user');
sessionStorage.removeItem('fixmytown_token');
sessionStorage.removeItem('fixmytown_user');
    navigate('/login');
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <div
        style={{
          background: 'var(--navy-900)',
          color: '#b7c4d8',
          fontSize: 12,
          padding: '6px 28px',
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', gap: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={12} /> 0800 123 456</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={12} /> support@fixmytown.gov.za</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <span>English</span> | <span>Afrikaans</span> | <span>isiZulu</span>
        </div>
      </div>

      <div
        style={{
          background: 'var(--navy-800)',
          padding: '14px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: 24
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white', fontWeight: 700, fontSize: 18 }}>
          <Landmark size={20} color="var(--gold-500)" />
          Fix <span style={{ color: 'var(--gold-500)' }}>MyTown</span>
          <span style={{ fontSize: 10, background: 'var(--navy-600)', padding: '2px 8px', borderRadius: 999 }}>GOV</span>
        </div>

        <nav style={{ display: 'flex', gap: 8 }}>
          {[
            { to: '/citizen/dashboard', label: 'Dashboard' },
            { to: '/citizen/map', label: 'Map View' },
            { to: '/citizen/reports', label: 'My Reports' }
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                padding: '8px 14px',
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                color: isActive ? 'var(--navy-900)' : '#c7d3e3',
                background: isActive ? 'var(--gold-500)' : 'transparent'
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <NotificationBell />
          <button className="btn btn-gold" onClick={() => openWizard()}>
            <Plus size={15} /> Report Issue
          </button>

          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setProfileOpen(!profileOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.2s'
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'var(--gold-500)',
                  color: 'var(--navy-900)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 13
                }}
              >
                {getInitials()}
              </div>
              <div style={{ color: 'white', fontSize: 13, fontWeight: 500 }}>
                {user.fullName || user.name || 'User'}
              </div>
              <ChevronDown size={14} color="white" />
            </div>

            {profileOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 8,
                  background: 'white',
                  borderRadius: 8,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  minWidth: 220,
                  zIndex: 1000,
                  overflow: 'hidden'
                }}
              >
                <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'var(--navy-800)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 15
                      }}
                    >
                      {getInitials()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                        {user.fullName || user.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: '#ef4444',
                    fontSize: 13,
                    fontWeight: 500,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
                  onMouseLeave={(e) => e.target.style.background = 'none'}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <main style={{ padding: 28 }}>
        <Outlet context={{ openWizard }} />
      </main>

      {wizardOpen && <ReportWizard initialLocation={wizardLocation} onClose={closeWizard} />}
    </div>
  );
}