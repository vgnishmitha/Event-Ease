import React from "react";
import { AlertCircle } from "lucide-react";

const ProtectedRoute = ({ element, requiredRole }) => {
  let user = null;
  const activeRole =
    localStorage.getItem("activeRole") ||
    (localStorage.getItem("adminToken")
      ? "admin"
      : localStorage.getItem("token_organizer")
      ? "organizer"
      : "user");
  const tokenKey =
    activeRole === "admin"
      ? "adminToken"
      : activeRole === "organizer"
      ? "token_organizer"
      : "token_user";
  try {
    const raw = localStorage.getItem(
      activeRole === "admin"
        ? "user_admin"
        : activeRole === "organizer"
        ? "user_organizer"
        : "user_user"
    );
    if (raw && raw !== "undefined") {
      user = JSON.parse(raw);
    }
  } catch (err) {
    // Clean up invalid stored user to avoid parse errors later
    localStorage.removeItem(
      activeRole === "admin"
        ? "user_admin"
        : activeRole === "organizer"
        ? "user_organizer"
        : "user_user"
    );
    user = null;
  }

  if (!localStorage.getItem(tokenKey) || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary-900 mb-2">
            Access Denied
          </h2>
          <p className="text-primary-600 mb-4">Please log in to continue</p>
          <a href="/login" className="btn-primary inline-block">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-primary-900 mb-2">
            Not Authorized
          </h2>
          <p className="text-primary-600 mb-4">
            You don't have permission to access this page
          </p>
          <a href="/home" className="btn-primary inline-block">
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return element;
};

export default ProtectedRoute;
