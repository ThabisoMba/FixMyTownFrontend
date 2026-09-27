import {
  Outlet
} from 'react-router-dom';

import {
  LayoutDashboard,
  ClipboardList,
  AlertTriangle,
  UserCog,
  Building2,
  Users,
  UserPlus,
  BarChart3,
  FileText
} from 'lucide-react';

import Sidebar from '../../components/Sidebar';

import {
  useAuth
} from '../../context/AuthContext';

export default function AdminLayout() {
  const { user } = useAuth();

  const sections = [
    {
      heading: 'Overview',

      items: [
        {
          label: 'Dashboard',
          icon: LayoutDashboard,
          path: '/admin/dashboard',
          end: true
        },

        {
          label: 'All Reports',
          icon: ClipboardList,
          path: '/admin/reports'
        },

        {
          label: 'Late Reports',
          icon: AlertTriangle,
          path: '/admin/reports/late'
        }
      ]
    },

    {
      heading: 'Management',

      items: [
        {
          label: 'Assign Issues',
          icon: UserCog,
          path: '/admin/assign'
        },

        {
          label: 'Departments',
          icon: Building2,
          path: '/admin/departments'
        },

        {
          label: 'Manage Workers',
          icon: Users,
          path: '/admin/workers'
        },

        {
          label: 'Register Worker',
          icon: UserPlus,
          path: '/admin/workers/new'
        }
      ]
    },

    {
      heading: 'Reports',

      items: [
        {
          label: 'Dynamic Report',
          icon: FileText,
          path: '/admin/dynamic-report'
        },

        {
          label: 'Analytics',
          icon: BarChart3,
          path: '/admin/analytics'
        }
      ]
    }
  ];


  return (
    <div
      className="admin-portal-layout"
    >
      <Sidebar
        sections={sections}
        roleLabel="ADMIN"
        userName={user?.fullName}
        userSubtitle="Municipal Administrator"
      />

      <main
        className="admin-portal-main"
      >
        <Outlet />
      </main>


      <style>
        {`
          .admin-portal-layout {
            min-height: 100vh;

            display: flex;

            /*
             * Prevent Sidebar from stretching
             * to match long dashboard content.
             */
            align-items: flex-start;
          }

          .admin-portal-main {
            flex: 1;

            min-width: 0;

            min-height: 100vh;

            width: 100%;
          }

          @media (max-width: 900px) {
            .admin-portal-layout {
              flex-direction: column;

              align-items: stretch;
            }

            .admin-portal-main {
              width: 100%;

              min-height:
                calc(100vh - 58px);
            }
          }
        `}
      </style>
    </div>
  );
}