import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import LeaveHistory from "./pages/LeaveHistory";
import ManagerDashboard from "./pages/ManagerDashboard";
import TeamRequests from "./pages/TeamRequests";
import EmployeeStats from "./pages/EmployeeStats";

function RoleHome() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "manager" ? "/manager" : "/employee"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<RoleHome />} />

        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/history"
          element={
            <ProtectedRoute allowedRoles={["employee"]}>
              <LeaveHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/requests"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <TeamRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/stats"
          element={
            <ProtectedRoute allowedRoles={["manager"]}>
              <EmployeeStats />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
