import React, { useState, useEffect } from "react";
import { Trash2, Loader } from "lucide-react";
import EventCard from "../components/EventCard";
import { registrationService } from "../services/eventService";
import { Alert, LoadingSpinner } from "../components/Alert";
import ProtectedRoute from "../components/ProtectedRoute";

const MyRegistrationsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await registrationService.myRegistrations();
      // Backend returns: { success: true, message: "...", data: [...] }
      setRegistrations(response.data?.data || response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load your registrations"
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
      setSuccess("Registration cancelled successfully");
      setRegistrations(registrations.filter((r) => r._id !== registrationId));
    } catch (err) {
      setError("Failed to cancel registration");
    } finally {
      setCancelingId(null);
    }
  };

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
            ) : registrations.length === 0 ? (
              <div className="text-center py-16 card p-8">
                <p className="text-2xl text-primary-600 mb-4">
                  No registrations yet
                </p>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="btn-primary inline-block"
                >
                  Browse Events
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {registrations.map((registration) => (
                  <div key={registration._id} className="relative">
                    <EventCard
                      event={registration.event}
                      onAction={() =>
                        (window.location.href = `/event/${registration.event._id}`)
                      }
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
            )}
          </div>
        </div>
      }
    />
  );
};

export default MyRegistrationsPage;
