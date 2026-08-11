import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import LandingPage from "./pages/public/LandingPage";
import AuthPage from "./pages/auth/AuthPage";

import ProtectedRoute from "./components/ProtectedRoute";

import CitizenLayout from "./pages/citizen/CitizenLayout";
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import CitizenMap from "./pages/citizen/CitizenMap";
import MyReports from "./pages/citizen/MyReports";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AllReports from "./pages/admin/AllReports";
import AssignIssues from "./pages/admin/AssignIssues";
import Departments from "./pages/admin/Departments";
import ManageWorkers from "./pages/admin/ManageWorkers";
import RegisterWorker from "./pages/admin/RegisterWorker";
import Analytics from "./pages/admin/Analytics";
import DynamicReport from "./pages/admin/DynamicReport";

import WorkerLayout from "./pages/worker/WorkerLayout";
import WorkerDashboard from "./pages/worker/WorkerDashboard";
import MyAssignments from "./pages/worker/MyAssignments";
import InProgress from "./pages/worker/InProgress";
import Completed from "./pages/worker/Completed";
import MyProfile from "./pages/worker/MyProfile";

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ================= PUBLIC ================= */}

        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />

        {/* ================= CITIZEN ================= */}

        <Route
          path="/citizen"
          element={
            <ProtectedRoute role="citizen">
              <CitizenLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<CitizenDashboard />} />
          <Route path="map" element={<CitizenMap />} />
          <Route path="reports" element={<MyReports />} />
        </Route>

        {/* ================= ADMIN ================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="reports" element={<AllReports />} />
          <Route path="assign" element={<AssignIssues />} />
          <Route path="departments" element={<Departments />} />
          <Route path="workers" element={<ManageWorkers />} />
          <Route path="workers/new" element={<RegisterWorker />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="dynamic-report" element={<DynamicReport />} />
        </Route>

        {/* ================= WORKER ================= */}

        <Route
          path="/worker"
          element={
            <ProtectedRoute role="worker">
              <WorkerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<WorkerDashboard />} />
          <Route path="assignments" element={<MyAssignments />} />
          <Route path="in-progress" element={<InProgress />} />
          <Route path="completed" element={<Completed />} />
          <Route path="profile" element={<MyProfile />} />
        </Route>

        {/* ================= FALLBACK ================= */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}