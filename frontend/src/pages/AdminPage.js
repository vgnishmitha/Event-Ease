import React, { useState, useEffect } from "react";
import { CheckCircle, Clock, Users } from "lucide-react";
import { registrationService, eventService } from "../services/eventService";
import { Alert, LoadingSpinner } from "../components/Alert";
import ProtectedRoute from "../components/ProtectedRoute";

const AdminPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [regsResponse, eventsResponse] = await Promise.all([
        registrationService.allRegistrations(),
        eventService.getEvents({ status: "pending" }),
      ]);
      // Backend returns: { success: true, message: "...", data: [...] }
      setRegistrations(regsResponse.data?.data || regsResponse.data || []);
      setPendingEvents(eventsResponse.data?.data || eventsResponse.data || []);
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
      setSuccess("Event approved!");
      setPendingEvents(pendingEvents.filter((e) => e._id !== eventId));
      fetchAdminData(); // Refresh data
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to approve event"
      );
    }
  };

  return (
    <ProtectedRoute
      element={
        <div className="min-h-screen bg-primary-50">
          {/* Header */}
          <div className="bg-white border-b border-primary-100">
            <div className="section-container py-8">
              <h1 className="text-3xl font-bold text-primary-900">
                Admin Dashboard
              </h1>
              <p className="text-primary-600 mt-2">
                Manage events and registrations
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="section-container py-12">
            {error && (
              <Alert
                type="error"
                title="Error"
                message={error}
                onClose={() => setError(null)}
              />
            )}
            {success && (
              <Alert
                type="success"
                title="Success"
                message={success}
                onClose={() => setSuccess(null)}
              />
            )}

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Events */}
                <div>
                  <div className="card p-6">
                    <div className="flex items-center space-x-2 mb-6">
                      <Clock className="w-6 h-6 text-primary-600" />
                      <h2 className="text-2xl font-bold text-primary-900">
                        Pending Events
                      </h2>
                      <span className="ml-auto bg-yellow-100 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full">
                        {pendingEvents.length}
                      </span>
                    </div>

                    {pendingEvents.length === 0 ? (
                      <p className="text-primary-600">No pending events</p>
                    ) : (
                      <div className="space-y-4">
                        {pendingEvents.map((event) => (
                          <div
                            key={event._id}
                            className="border border-primary-200 rounded-lg p-4 hover:bg-primary-50 transition"
                          >
                            <h3 className="font-semibold text-primary-900 mb-2">
                              {event.title}
                            </h3>
                            <p className="text-sm text-primary-600 mb-3">
                              {event.description}
                            </p>
                            <button
                              onClick={() => handleApproveEvent(event._id)}
                              className="btn-primary w-full flex items-center justify-center space-x-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Approve Event</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistics */}
                <div>
                  <div className="space-y-6">
                    <div className="card p-6">
                      <div className="flex items-center space-x-4">
                        <Users className="w-8 h-8 text-blue-500" />
                        <div>
                          <p className="text-sm text-primary-600">
                            Total Registrations
                          </p>
                          <p className="text-3xl font-bold text-primary-900">
                            {registrations.length}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="card p-6">
                      <div className="flex items-center space-x-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                        <div>
                          <p className="text-sm text-primary-600">
                            Approved Events
                          </p>
                          <p className="text-3xl font-bold text-primary-900">
                            {pendingEvents.length === 0 ? "All" : "..."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="card p-6">
                      <div className="flex items-center space-x-4">
                        <Clock className="w-8 h-8 text-yellow-500" />
                        <div>
                          <p className="text-sm text-primary-600">
                            Pending Approval
                          </p>
                          <p className="text-3xl font-bold text-primary-900">
                            {pendingEvents.length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      }
      requiredRole="admin"
    />
  );
};

export default AdminPage;
