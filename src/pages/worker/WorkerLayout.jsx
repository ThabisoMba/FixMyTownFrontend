
import { Outlet } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Loader, CheckCircle2, UserCircle } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';

export default function WorkerLayout() {
  const { user } = useAuth();

  const sections = [
    {
      heading: 'My Work',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/worker/dashboard', end: true },
        { label: 'My Assignments', icon: ClipboardList, path: '/worker/assignments' },
        { label: 'In Progress', icon: Loader, path: '/worker/in-progress' },
        { label: 'Completed', icon: CheckCircle2, path: '/worker/completed' }
      ]
    },
    {
      heading: 'Account',
      items: [{ label: 'My Profile', icon: UserCircle, path: '/worker/profile' }]
    }
  ];

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar sections={sections} roleLabel="WORKER" userName={user?.fullName} userSubtitle={user?.role} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </div>
    </div>
  );
}
