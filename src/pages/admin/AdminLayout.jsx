import { Outlet } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, UserCog, Building2, Users, UserPlus, BarChart3, FileText } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { user } = useAuth();

  const sections = [
    {
      heading: 'Overview',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', end: true },
        { label: 'All Reports', icon: ClipboardList, path: '/admin/reports' }
      ]
    },
    {
      heading: 'Management',
      items: [
        { label: 'Assign Issues', icon: UserCog, path: '/admin/assign' },
        { label: 'Departments', icon: Building2, path: '/admin/departments' },
        { label: 'Manage Workers', icon: Users, path: '/admin/workers' },
        { label: 'Register Worker', icon: UserPlus, path: '/admin/workers/new' }
      ]
    },
    {
      heading: 'Reports',
      items: [
        { label: 'Dynamic Report', icon: FileText, path: '/admin/dynamic-report' },
        { label: 'Analytics', icon: BarChart3, path: '/admin/analytics' }
      ]
    }
  ];

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar sections={sections} roleLabel="ADMIN" userName={user?.fullName} userSubtitle="Municipal Administrator" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </div>
    </div>
  );
}
