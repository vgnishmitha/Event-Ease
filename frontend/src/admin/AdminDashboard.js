import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  User,
  MapPin,
} from "lucide-react";
import { registrationService, eventService } from "../services/eventService";
import { Alert, LoadingSpinner } from "../components/Alert";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Check if admin is authenticated
    const adminToken = localStorage.getItem("adminToken");
    const token = localStorage.getItem("token");
    
    if (!adminToken || !token) {
      navigate("/admin");
      return;
    }

    // Verify user is admin
    try {
      const userRaw = localStorage.getItem("user");
      if (userRaw && userRaw !== "undefined") {
        const user = JSON.parse(userRaw);
        if (user.role !== "admin") {
          navigate("/admin");
          return;
        }
      }
    } catch (err) {
      navigate("/admin");
      return;
    }

    fetchAdminData();
  }, [navigate]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [regsResponse, eventsResponse, allEventsResponse] = await Promise.all([
        registrationService.allRegistrations(),
        eventService.getEvents({ status: "pending" }),
        eventService.getEvents(),
      ]);
      
      setRegistrations(regsResponse.data?.data || regsResponse.data || []);
      setPendingEvents(eventsResponse.data?.data || eventsResponse.data || []);
      setAllEvents(allEventsResponse.data?.data || allEventsResponse.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load admin data"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEvent = async (eventId) => {
    try {
      await eventService.approveEvent(eventId, { status: "approved" });
      const approvedEvent = pendingEvents.find((e) => e._id === eventId);
      setSuccess(
        `Event "${approvedEvent?.title || "Event"}" approved successfully! It is now visible to all users.`
      );
      setPendingEvents(pendingEvents.filter((e) => e._id !== eventId));
      // Refresh data to update statistics
      setTimeout(() => {
        fetchAdminData();
      }, 500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to approve event"
      );
    }
  };

  const handleRejectEvent = async (eventId) => {
    try {
      await eventService.approveEvent(eventId, { status: "rejected" });
      const rejectedEvent = pendingEvents.find((e) => e._id === eventId);
      setSuccess(
        `Event "${rejectedEvent?.title || "Event"}" has been rejected.`
      );
      setPendingEvents(pendingEvents.filter((e) => e._id !== eventId));
      // Refresh data to update statistics
      setTimeout(() => {
        fetchAdminData();
      }, 500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to reject event"
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin");
  };

  const approvedEvents = allEvents.filter((e) => e.status === "approved");

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-medium text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage events and registrations</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6">
            <Alert
              type="error"
              title="Error"
              message={error}
              onClose={() => setError(null)}
            />
          </div>
        )}
        {success && (
          <div className="mb-6">
            <Alert
              type="success"
              title="Success"
              message={success}
              onClose={() => setSuccess(null)}
            />
          </div>
        )}

        {/* Quick Stats - Simple and Natural */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total Events</p>
            <p className="text-2xl font-medium text-gray-900">{allEvents.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Approved</p>
            <p className="text-2xl font-medium text-green-600">{approvedEvents.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-2xl font-medium text-yellow-600">{pendingEvents.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Registrations</p>
            <p className="text-2xl font-medium text-gray-900">{registrations.length}</p>
          </div>
        </div>

        {/* Main Content - Focus on Pending Events */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-base font-medium text-gray-900 mb-1">
              Events Waiting for Approval
            </h2>
            <p className="text-sm text-gray-500">
              {pendingEvents.length === 0 
                ? "All caught up! No events pending approval." 
                : `${pendingEvents.length} event${pendingEvents.length > 1 ? 's' : ''} need your review.`}
            </p>
          </div>

          {pendingEvents.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No pending events</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingEvents.map((event) => (
                <div
                  key={event._id}
                  className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors"
                >
                  <div className="mb-3">
                    <h3 className="font-medium text-gray-900 mb-1.5">{event.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {event.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-500">
                    {event.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {event.organizer?.name && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>{event.organizer.name}</span>
                      </div>
                    )}
                  </div>

                  {event.organizer?.email && (
                    <p className="text-xs text-gray-500 mb-4">Organizer: {event.organizer.email}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveEvent(event._id)}
                      className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectEvent(event._id)}
                      className="flex-1 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

