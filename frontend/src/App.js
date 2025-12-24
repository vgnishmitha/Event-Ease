import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EventDetailPage from "./pages/EventDetailPage";
import CreateEventPage from "./pages/CreateEventPage";
import MyEventsPage from "./pages/MyEventsPage";
import MyRegistrationsPage from "./pages/MyRegistrationsPage";
import AdminPage from "./pages/AdminPage";

// Admin Pages
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import AdminRoute from "./admin/AdminRoute";

// Styles
import "./index.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/event/:id" element={<EventDetailPage />} />

            {/* Protected Routes */}
            <Route
              path="/create-event"
              element={
                <ProtectedRoute
                  element={<CreateEventPage />}
                  requiredRole="organizer"
                />
              }
            />
            <Route
              path="/my-events"
              element={
                <ProtectedRoute
                  element={<MyEventsPage />}
                  requiredRole="organizer"
                />
              }
            />
            <Route
              path="/my-registrations"
              element={<ProtectedRoute element={<MyRegistrationsPage />} />}
            />
            <Route
              path="/admin/panel"
              element={
                <ProtectedRoute
                  element={<AdminPage />}
                  requiredRole="admin"
                />
              }
            />

            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
