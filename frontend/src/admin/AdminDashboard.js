import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, User, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import {
  registrationService,
  eventService,
  authService,
} from "../services/eventService";
import { Alert, LoadingSpinner } from "../components/Alert";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [eventRegistrations, setEventRegistrations] = useState({});
  const [loadingRegs, setLoadingRegs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Check if admin is authenticated
    const adminToken = localStorage.getItem("adminToken");
    const adminUserRaw =
      localStorage.getItem("user_admin") || localStorage.getItem("user");

    if (!adminToken) {
      navigate("/admin");
      return;
    }

    // Verify user is admin
    try {
      if (adminUserRaw && adminUserRaw !== "undefined") {
        const user = JSON.parse(adminUserRaw);
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
      const [regsResponse, eventsResponse, allEventsResponse, usersResponse] =
        await Promise.all([
          registrationService.allRegistrations(),
          eventService.getEvents({ status: "pending" }),
          eventService.getEvents(),
          authService.getUsers(),
        ]);

      console.log("All registrations response:", regsResponse);
      console.log("Registrations data:", regsResponse.data);
      const regsData = regsResponse.data?.data || regsResponse.data || [];
      console.log("Final registrations count:", regsData.length);

      setRegistrations(regsData);
      setPendingEvents(eventsResponse.data?.data || eventsResponse.data || []);
      setAllEvents(
        allEventsResponse.data?.data || allEventsResponse.data || []
      );
      setUsers(usersResponse.data?.data || usersResponse.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin data");
      console.error("Error fetching admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEvent = async (eventId) => {
    try {
      await eventService.approveEvent(eventId, { status: "approved" });
      const approvedEvent = pendingEvents.find((e) => e._id === eventId);
      setSuccess(
        `Event "${
          approvedEvent?.title || "Event"
        }" approved successfully! It is now visible to all users.`
      );
      setPendingEvents(pendingEvents.filter((e) => e._id !== eventId));
      // Refresh data to update statistics
      setTimeout(() => {
        fetchAdminData();
      }, 500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve event");
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
      setError(err.response?.data?.message || "Failed to reject event");
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
  const upcomingEvents = allEvents.filter((e) => e.isUpcoming);

  const fetchEventRegistrations = async (eventId) => {
    if (eventRegistrations[eventId]) {
      setExpandedEventId(expandedEventId === eventId ? null : eventId);
      return;
    }
    try {
      setLoadingRegs((prev) => ({ ...prev, [eventId]: true }));
      const response = await registrationService.getEventRegistrations(eventId);
      const regs = response.data?.data || response.data || [];
      console.log("Fetched registrations:", regs); // Debug log
      setEventRegistrations((prev) => ({ ...prev, [eventId]: regs }));
      setExpandedEventId(eventId);
    } catch (err) {
      console.error("Error fetching registrations:", err);
      setError(err.response?.data?.message || "Failed to load registrations");
    } finally {
      setLoadingRegs((prev) => ({ ...prev, [eventId]: false }));
    }
  };

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
              <h1 className="text-lg font-medium text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage events and registrations
              </p>
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
            <p className="text-2xl font-medium text-gray-900">
              {allEvents.length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Approved</p>
            <p className="text-2xl font-medium text-green-600">
              {approvedEvents.length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-2xl font-medium text-yellow-600">
              {pendingEvents.length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Registrations</p>
            <p className="text-2xl font-medium text-gray-900">
              {registrations.length}
            </p>
          </div>
        </div>

        {/* Users Management */}
        <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-base font-medium text-gray-900 mb-4">
            Manage Users
          </h2>
          {users.length === 0 ? (
            <p className="text-sm text-gray-500">No users found.</p>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u._id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-500">
                      {u.email} — {u.role}
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={async () => {
                        try {
                          await authService.blockUser(u._id);
                          setSuccess(`${u.name} updated`);
                          fetchAdminData();
                        } catch (err) {
                          setError(
                            err.response?.data?.message ||
                              "Failed to update user"
                          );
                        }
                      }}
                      className={`px-3 py-1 rounded-lg text-sm font-medium border ${
                        u.isBlocked
                          ? "bg-red-50 border-red-300 text-red-700"
                          : "bg-white border-gray-200 text-gray-700"
                      }`}
                    >
                      {u.isBlocked ? "Unblock" : "Block"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Event Registrations */}
        <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-base font-medium text-gray-900 mb-4">
            Event Registrations
          </h2>
          {allEvents.length === 0 ? (
            <p className="text-sm text-gray-500">No events available.</p>
          ) : (
            <div className="space-y-3">
              {allEvents.map((event) => {
                const eventRegs = eventRegistrations[event._id] || [];
                const isExpanded = expandedEventId === event._id;
                const isLoading = loadingRegs[event._id];
                return (
                  <div
                    key={event._id}
                    className="border border-gray-200 rounded-lg"
                  >
                    <button
                      onClick={() => fetchEventRegistrations(event._id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="text-left flex-1">
                        <p className="font-medium text-gray-900">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {eventRegs.length} registered
                        </p>
                      </div>
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                      ) : isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                    {isExpanded && eventRegs.length > 0 && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-3">
                        {eventRegs.map((reg) => {
                          // Handle both direct user object and populated user reference
                          const userData = reg.user || {};
                          return (
                            <div
                              key={reg._id}
                              className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {userData.name || "Unknown User"}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {userData.email || "No email"}
                                </p>
                                {userData.role && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Role: {userData.role}
                                  </p>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(reg.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {isExpanded && eventRegs.length === 0 && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50 text-center text-sm text-gray-500">
                        No registrations yet
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Events Management */}
        <div className="mb-8 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-base font-medium text-gray-900 mb-4">
            All Events & Upcoming
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Upcoming events: {upcomingEvents.length}
          </p>
          {allEvents.length === 0 ? (
            <p className="text-sm text-gray-500">No events available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allEvents.map((event) => (
                <div
                  key={event._id}
                  className="card overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
                >
                  {/* Image Container */}
                  <div className="relative h-48 bg-gradient-to-br from-primary-200 to-primary-100 overflow-hidden">
                    {event.image ? (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary-300">
                        <Calendar className="w-16 h-16" />
                      </div>
                    )}
                    {event.status && (
                      <div className="absolute top-3 left-3">
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            event.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : event.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {event.status.charAt(0).toUpperCase() +
                            event.status.slice(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-primary-900 mb-2 line-clamp-2">
                      {event.title}
                    </h3>

                    <p className="text-sm text-primary-600 mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => fetchEventRegistrations(event._id)}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={async () => {
                          if (!window.confirm("Delete this event?")) return;
                          try {
                            setDeletingId(event._id);
                            await eventService.adminDeleteEvent(event._id);
                            setSuccess("Event deleted");
                            await fetchAdminData();
                          } catch (err) {
                            setError(
                              err.response?.data?.message ||
                                "Failed to delete event"
                            );
                          } finally {
                            setDeletingId(null);
                          }
                        }}
                        disabled={deletingId === event._id}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        {deletingId === event._id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                : `${pendingEvents.length} event${
                    pendingEvents.length > 1 ? "s" : ""
                  } need your review.`}
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
                    <h3 className="font-medium text-gray-900 mb-1.5">
                      {event.title}
                    </h3>
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
                    <p className="text-xs text-gray-500 mb-4">
                      Organizer: {event.organizer.email}
                    </p>
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
