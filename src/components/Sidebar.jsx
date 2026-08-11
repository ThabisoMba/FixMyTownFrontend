/**
 * Sidebar.jsx
 * -----------
 * The dark navy sidebar used by both the Admin and Worker portals.
 * `sections` is an array of { heading, items: [{ label, icon, path, badge }] }
 * so each portal can define its own menu while sharing one look.
 */

import { NavLink } from 'react-router-dom';
import { Landmark, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ sections, roleLabel, userName, userSubtitle }) {
  const { logout } = useAuth();
  const initials = userName ? userName.split(' ').map((n) => n[0]).slice(0, 2).join('') : 'U';

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        minHeight: '100vh',
        background: 'var(--navy-800)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }}
    >
      <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--navy-600)' }}>
        <Landmark size={22} color="var(--gold-500)" />
        <span style={{ fontWeight: 700, fontSize: 17 }}>
          Fix <span style={{ color: 'var(--gold-500)' }}>MyTown</span>
        </span>
        {roleLabel && (
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 10,
              fontWeight: 700,
              background: 'var(--navy-600)',
              padding: '3px 8px',
              borderRadius: 999,
              letterSpacing: 0.5
            }}
          >
            {roleLabel}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 20px', borderBottom: '1px solid var(--navy-600)' }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'var(--gold-500)',
            color: 'var(--navy-900)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 14
          }}
        >
          {initials}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{userName}</div>
          <div style={{ fontSize: 12, color: '#9db2cc' }}>{userSubtitle}</div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        {sections.map((section) => (
          <div key={section.heading} style={{ marginBottom: 18 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#7186a3',
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                padding: '0 10px 8px'
              }}
            >
              {section.heading}
            </div>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 10px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: isActive ? 'var(--gold-500)' : '#c7d3e3',
                  background: isActive ? 'var(--navy-700)' : 'transparent',
                  marginBottom: 2
                })}
              >
                <item.icon size={17} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {!!item.badge && (
                  <span
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 999,
                      padding: '1px 7px'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <button
        onClick={logout}
        style={{
          margin: '12px',
          padding: '10px',
          background: 'transparent',
          border: '1px solid var(--navy-600)',
          borderRadius: 8,
          color: '#c7d3e3',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 14,
          fontWeight: 600
        }}
      >
        <LogOut size={16} /> Logout
      </button>
    </aside>
  );
}
