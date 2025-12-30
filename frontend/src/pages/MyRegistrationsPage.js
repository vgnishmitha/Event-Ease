import React, { useState, useEffect } from "react";
import { Trash2, Loader, Ban, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EventCard from "../components/EventCard";
import { registrationService } from "../services/eventService";
import { useAuth } from "../context/AuthContext";
import { Alert, LoadingSpinner } from "../components/Alert";
import ProtectedRoute from "../components/ProtectedRoute";

const MyRegistrationsPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);

  useEffect(() => {
    if (user?.isBlocked) {
      setLoading(false);
      return;
    }
    fetchRegistrations();
  }, [user]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await registrationService.myRegistrations();
      // Backend returns: { success: true, message: "...", data: [...] }
      setRegistrations(response.data?.data || response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Couldn't load your registrations"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (registrationId, eventTitle) => {
    if (!window.confirm(`Cancel registration for "${eventTitle}"?`)) return;

    try {
      setCancelingId(registrationId);
      await registrationService.cancelRegistration(registrationId);
      setSuccess("Registration cancelled");
      setRegistrations(registrations.filter((r) => r._id !== registrationId));
    } catch (err) {
      setError("Couldn't cancel registration");
    } finally {
      setCancelingId(null);
    }
  };

  // Separate blocked and active registrations
  const blockedRegistrations = registrations.filter((r) => r.isBlocked);
  const activeRegistrations = registrations.filter((r) => !r.isBlocked);

  // If user is globally blocked by admin
  if (user?.isBlocked) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 text-center">
            <div className="p-4 bg-red-100 rounded-full w-fit mx-auto mb-6">
              <Ban className="w-16 h-16 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-red-700 mb-4">
              Account Blocked
            </h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Your account has been blocked by the administrator. You cannot view or register for any events.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              If you believe this is a mistake, please contact the administrator for assistance.
            </p>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="btn-primary w-full"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute
      element={
        <div className="min-h-screen bg-primary-50">
          {/* Header */}
          <div className="bg-white border-b border-primary-100">
            <div className="section-container py-8">
              <div>
                <h1 className="text-3xl font-bold text-primary-900 mb-2">
                  My Registrations
                </h1>
                <p className="text-primary-600">Events you're registered for</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="section-container py-12">
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

            {/* Blocked Events Warning */}
            {blockedRegistrations.length > 0 && (
              <div className="mb-8">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-red-100 rounded-full">
                      <Ban className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-800 mb-2">
                        You have been blocked from {blockedRegistrations.length} event(s)
                      </h3>
                      <p className="text-red-600 mb-4">
                        The organizer has blocked you from the following events. You will not be able to view or attend these events.
                      </p>
                      <div className="space-y-2">
                        {blockedRegistrations.map((registration) => (
                          <div
                            key={registration._id}
                            className="flex items-center justify-between bg-white rounded-lg p-4 border border-red-200"
                          >
                            <div className="flex items-center space-x-3">
                              <AlertTriangle className="w-5 h-5 text-red-500" />
                              <div>
                                <p className="font-medium text-gray-900">
                                  {registration.event?.title || "Unknown Event"}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Blocked by organizer
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                handleCancel(registration._id, registration.event?.title)
                              }
                              disabled={cancelingId === registration._id}
                              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition"
                            >
                              {cancelingId === registration._id ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : (
                                "Remove"
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
              </div>
            ) : activeRegistrations.length === 0 && blockedRegistrations.length === 0 ? (
              <div className="text-center py-16 card p-8">
                <p className="text-2xl text-primary-600 mb-4">
                  No registrations yet
                </p>
                <button
                  onClick={() => navigate("/home")}
                  className="btn-primary inline-block"
                >
                  Browse Events
                </button>
              </div>
            ) : activeRegistrations.length === 0 ? (
              <div className="text-center py-16 card p-8">
                <p className="text-xl text-primary-600 mb-4">
                  No active registrations
                </p>
                <button
                  onClick={() => navigate("/home")}
                  className="btn-primary inline-block"
                >
                  Browse Events
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-primary-900 mb-4">
                  Active Registrations ({activeRegistrations.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeRegistrations.map((registration) => (
                    <div key={registration._id} className="relative">
                      <EventCard
                        event={registration.event}
                        onAction={() => navigate(`/event/${registration.event._id}`)}
                        actionLabel="View Event"
                      />
                      <button
                        onClick={() =>
                          handleCancel(registration._id, registration.event.title)
                        }
                        disabled={cancelingId === registration._id}
                        className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                      >
                        {cancelingId === registration._id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      }
    />
  );
};

export default MyRegistrationsPage;
