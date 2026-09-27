import {
  Outlet
} from 'react-router-dom';

import {
  LayoutDashboard,
  ClipboardList,
  Clock3,
  Loader,
  CheckCircle2,
  UserCircle
} from 'lucide-react';

import Sidebar from '../../components/Sidebar';

import {
  useAuth
} from '../../context/AuthContext';

export default function WorkerLayout() {
  const { user } = useAuth();

  const sections = [
    {
      heading: 'My Work',

      items: [
        {
          label: 'Dashboard',
          icon: LayoutDashboard,
          path: '/worker/dashboard',
          end: true
        },

        {
          label: 'All Assignments',
          icon: ClipboardList,
          path: '/worker/assignments',
          end: true
        },

        {
          label: 'Recently Assigned',
          icon: Clock3,
          path: '/worker/recently-assigned',
          end: true
        },

        {
          label: 'In Progress',
          icon: Loader,
          path: '/worker/in-progress',
          end: true
        },

        {
          label: 'Completed',
          icon: CheckCircle2,
          path: '/worker/completed',
          end: true
        }
      ]
    },

    {
      heading: 'Account',

      items: [
        {
          label: 'My Profile',
          icon: UserCircle,
          path: '/worker/profile'
        }
      ]
    }
  ];


  return (
    <div
      className="worker-portal-layout"
    >
      <Sidebar
        sections={sections}
        roleLabel="WORKER"
        userName={user?.fullName}
        userSubtitle={
          user?.role ||
          'Municipal Worker'
        }
      />


      <main
        className="worker-portal-main"
      >
        <Outlet />
      </main>


      <style>
        {`
          .worker-portal-layout {
            min-height: 100vh;

            display: flex;

            /*
             * Prevent the sidebar from
             * stretching with long content.
             */
            align-items: flex-start;
          }

          .worker-portal-main {
            flex: 1;

            min-width: 0;

            width: 100%;

            min-height: 100vh;
          }

          @media (max-width: 900px) {
            .worker-portal-layout {
              flex-direction: column;

              align-items: stretch;
            }

            .worker-portal-main {
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