import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Protected route for admin pages
 * Checks if admin is authenticated via JWT token and has admin role
 */
const AdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem("adminToken");
  const token = localStorage.getItem("token");
  
  // Check for admin token (JWT)
  if (!adminToken || !token) {
    return <Navigate to="/admin" replace />;
  }

  // Verify user is admin
  try {
    const userRaw = localStorage.getItem("user");
    if (userRaw && userRaw !== "undefined") {
      const user = JSON.parse(userRaw);
      if (user.role !== "admin") {
        return <Navigate to="/admin" replace />;
      }
    }
  } catch (err) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default AdminRoute;

