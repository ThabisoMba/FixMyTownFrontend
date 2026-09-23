import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import TopBar from '../../components/TopBar';
import api from '../../api/api';
import { UserCircle, Phone, Building2 } from 'lucide-react';

export default function MyProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get('/worker/profile').then((res) => setProfile(res.data)).catch(() => {});
  }, []);

  const fullName = profile?.fullName || user?.fullName;
  const email = profile?.email || user?.email;

  return (
    <div>
      <TopBar section="Worker" page="My Profile" />
      <div style={{ padding: 24, maxWidth: 420 }}>
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <UserCircle size={54} color="var(--navy-800)" style={{ marginBottom: 12 }} />
          <div style={{ fontWeight: 700, fontSize: 17 }}>{fullName}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{email}</div>
          <div className="badge" style={{ background: 'var(--gold-100)', color: 'var(--gold-600)', marginTop: 10 }}>WORKER</div>

          {profile && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Phone size={16} color="var(--text-secondary)" />
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Phone Number</div>
                  <div style={{ fontSize: 14 }}>{profile.phoneNumber || 'Not provided'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Building2 size={16} color="var(--text-secondary)" />
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Department</div>
                  <div style={{ fontSize: 14 }}>{profile.department}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

