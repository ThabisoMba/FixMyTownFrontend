import { useAuth } from '../../context/AuthContext';
import TopBar from '../../components/TopBar';
import { UserCircle } from 'lucide-react';

export default function MyProfile() {
  const { user } = useAuth();

  return (
    <div>
      <TopBar section="Worker" page="My Profile" />
      <div style={{ padding: 24, maxWidth: 420 }}>
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <UserCircle size={54} color="var(--navy-800)" style={{ marginBottom: 12 }} />
          <div style={{ fontWeight: 700, fontSize: 17 }}>{user?.fullName}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{user?.email}</div>
          <div className="badge" style={{ background: 'var(--gold-100)', color: 'var(--gold-600)', marginTop: 10 }}>WORKER</div>
        </div>
      </div>
    </div>
  );
}
