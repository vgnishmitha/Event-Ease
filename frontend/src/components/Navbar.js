import React from "react";
import { Link } from "react-router-dom";
import { Menu, X, LogOut, User, Calendar } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-primary-100">
      <div className="section-container">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/home" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-900 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:inline font-bold text-lg text-primary-900">
              EventEase
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/home" className="btn-ghost">
              Browse Events
            </Link>
            {user?.role === "organizer" && (
              <Link to="/create-event" className="btn-ghost">
                Create Event
              </Link>
            )}
            {user?.role === "admin" && (
              <Link to="/admin" className="btn-ghost">
                Admin
              </Link>
            )}
            {user && (
              <Link to="/my-registrations" className="btn-ghost">
                My Events
              </Link>
            )}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-2">
            {user ? (
              <div className="hidden sm:flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-primary-50">
                  <User className="w-4 h-4 text-primary-700" />
                  <span className="text-sm font-medium text-primary-700">
                    {user.name}
                  </span>
                </div>
                <button onClick={handleLogout} className="btn-ghost">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link to="/login" className="btn-ghost">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary">
                  Create Account
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="w-6 h-6 text-primary-900" />
              ) : (
                <Menu className="w-6 h-6 text-primary-900" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-primary-100 pt-4">
            <Link to="/home" className="block btn-ghost w-full text-left">
              Browse Events
            </Link>
            {user?.role === "organizer" && (
              <Link
                to="/create-event"
                className="block btn-ghost w-full text-left"
              >
                Create Event
              </Link>
            )}
            {user?.role === "admin" && (
              <Link to="/admin" className="block btn-ghost w-full text-left">
                Admin
              </Link>
            )}
            {user && (
              <Link
                to="/my-registrations"
                className="block btn-ghost w-full text-left"
              >
                My Events
              </Link>
            )}
            {!user ? (
              <>
                <Link to="/login" className="block btn-ghost w-full text-left">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block btn-primary w-full text-center"
                >
                  Create Account
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="block btn-ghost w-full text-left"
              >
                Log Out
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
