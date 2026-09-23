import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// ================= PUBLIC PAGES =================
import LandingPage from "./pages/public/LandingPage";
import PrivacyPolicy from "./pages/public/PrivacyPolicy";
import TermsOfService from "./pages/public/TermsOfService";
import AuthPage from "./pages/auth/AuthPage";

// ================= PROTECTED ROUTE =================
import ProtectedRoute from "./components/ProtectedRoute";

// ================= CITIZEN =================
import CitizenLayout from "./pages/citizen/CitizenLayout";
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import CitizenMap from "./pages/citizen/CitizenMap";
import MyReports from "./pages/citizen/MyReports";

// ================= ADMIN =================
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AllReports from "./pages/admin/AllReports";
import LateReports from "./pages/admin/LateReports";
import AssignIssues from "./pages/admin/AssignIssues";
import Departments from "./pages/admin/Departments";
import ManageWorkers from "./pages/admin/ManageWorkers";
import RegisterWorker from "./pages/admin/RegisterWorker";
import Analytics from "./pages/admin/Analytics";
import DynamicReport from "./pages/admin/DynamicReport";

// ================= WORKER =================
import WorkerLayout from "./pages/worker/WorkerLayout";
import WorkerDashboard from "./pages/worker/WorkerDashboard";
import MyAssignments from "./pages/worker/MyAssignments";
import RecentAssignments from "./pages/worker/RecentAssignments";
import InProgress from "./pages/worker/InProgress";
import Completed from "./pages/worker/Completed";
import MyProfile from "./pages/worker/MyProfile";

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes
        location={location}
        key={location.pathname}
      >

        {/* =====================================================
            PUBLIC ROUTES
        ===================================================== */}

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={<AuthPage />}
        />

        <Route
          path="/privacy-policy"
          element={<PrivacyPolicy />}
        />

        <Route
          path="/terms-of-service"
          element={<TermsOfService />}
        />


        {/* =====================================================
            CITIZEN ROUTES
        ===================================================== */}

        <Route
          path="/citizen"
          element={
            <ProtectedRoute role="citizen">
              <CitizenLayout />
            </ProtectedRoute>
          }
        >

          <Route
            path="dashboard"
            element={<CitizenDashboard />}
          />

          <Route
            path="map"
            element={<CitizenMap />}
          />

          <Route
            path="reports"
            element={<MyReports />}
          />

        </Route>


        {/* =====================================================
            ADMIN ROUTES
        ===================================================== */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >

          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="reports"
            element={<AllReports />}
          />

          <Route
            path="reports/late"
            element={<LateReports />}
          />

          <Route
            path="assign"
            element={<AssignIssues />}
          />

          <Route
            path="departments"
            element={<Departments />}
          />

          <Route
            path="workers"
            element={<ManageWorkers />}
          />

          <Route
            path="workers/new"
            element={<RegisterWorker />}
          />

          <Route
            path="analytics"
            element={<Analytics />}
          />

          <Route
            path="dynamic-report"
            element={<DynamicReport />}
          />

        </Route>


        {/* =====================================================
            WORKER ROUTES
        ===================================================== */}

        <Route
          path="/worker"
          element={
            <ProtectedRoute role="worker">
              <WorkerLayout />
            </ProtectedRoute>
          }
        >

          {/* Worker Dashboard */}
          <Route
            path="dashboard"
            element={<WorkerDashboard />}
          />

          {/* All Assignments */}
          <Route
            path="assignments"
            element={<MyAssignments />}
          />

          {/* Recently Assigned */}
          <Route
            path="recently-assigned"
            element={<RecentAssignments />}
          />

          {/* In Progress */}
          <Route
            path="in-progress"
            element={<InProgress />}
          />

          {/* Completed */}
          <Route
            path="completed"
            element={<Completed />}
          />

          {/* Profile */}
          <Route
            path="profile"
            element={<MyProfile />}
          />

        </Route>


        {/* =====================================================
            FALLBACK
        ===================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </AnimatePresence>
  );
}