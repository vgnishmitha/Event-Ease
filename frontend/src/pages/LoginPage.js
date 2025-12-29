import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { authService } from "../services/eventService";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/Alert";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Try to login through backend API (works for both admin and regular users)
      const response = await authService.login(formData);
      // backend responses are wrapped as { success, message, data }
      const payload = response.data?.data || response.data || {};
      const user = payload.user || payload;
      const token = payload.token || response.data?.token;

      // Use role-aware login to store session per role
      login(user, token);

      if (user.role === "admin") {
        setSuccess("Welcome! Taking you to admin dashboard...");
        setTimeout(() => {
          navigate("/admin/dashboard", { replace: true });
        }, 500);
        return;
      }

      if (user.role === "organizer") {
        setSuccess("Welcome organizer! Redirecting to your events...");
        setTimeout(() => navigate("/my-events"), 700);
        return;
      }

      // Regular attendee
      setSuccess("Welcome back! Taking you home...");
      setTimeout(() => navigate("/home"), 700);
    } catch (err) {
      setError(
        err.response?.data?.message || "Wrong email or password. Try again?"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="card p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-primary-900 mb-2">
              Welcome Back
            </h2>
            <p className="text-primary-600">
              Sign in to your EventEase account
            </p>
          </div>

          {/* Messages */}
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          )}
          {success && (
            <Alert
              type="success"
              message={success}
              onClose={() => setSuccess(null)}
            />
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-primary-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-primary-900 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-primary-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-primary-200"></div>
            <span className="px-3 text-sm text-primary-600">or</span>
            <div className="flex-1 border-t border-primary-200"></div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-primary-600">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-primary-900 hover:underline"
            >
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
