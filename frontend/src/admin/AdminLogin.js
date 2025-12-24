import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Mail, Lock } from "lucide-react";
import { Alert } from "../components/Alert";
import { authService } from "../services/eventService";

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Authenticate through backend API
      const response = await authService.login(formData);
      const payload = response.data?.data || response.data || {};
      const user = payload.user || payload;
      const token = payload.token || response.data?.token;

      // Verify user is admin
      if (user.role !== "admin") {
        setError("Access denied. Admin credentials required.");
        return;
      }

      // Store admin session with JWT token
      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminEmail", user.email);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      // Redirect to admin dashboard with smooth transition
      setTimeout(() => {
        navigate("/admin/dashboard", { replace: true });
      }, 300);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid admin credentials. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-black rounded-lg mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Admin Portal
          </h1>
          <p className="text-sm text-gray-500">EventEase Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          {error && (
            <Alert
              type="error"
              title="Authentication Failed"
              message={error}
              onClose={() => setError(null)}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
                  placeholder="nishmithavg@gmail.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-black hover:bg-gray-800 text-white font-medium rounded-lg border border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="animate-spin">⏳</span>
                  <span>Signing In...</span>
                </span>
              ) : (
                "Sign In to Admin Panel"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          🔒 Secure Admin Access Only
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;

