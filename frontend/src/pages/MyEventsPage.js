import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Calendar, X, User, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import EventCard from "../components/EventCard";
import { eventService, registrationService } from "../services/eventService";
import { Alert, LoadingSpinner } from "../components/Alert";
import ProtectedRoute from "../components/ProtectedRoute";

const MyEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.myEvents();
      // Backend returns: { success: true, message: "...", data: [...] }
      setEvents(response.data?.data || response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load your events"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await eventService.deleteEvent(eventId);
      setSuccess("Event deleted successfully");
      setEvents(events.filter((e) => e._id !== eventId));
    } catch (err) {
      setError("Failed to delete event");
    }
  };

  const handleViewRegistrations = async (event) => {
    setSelectedEvent(event);
    setLoadingRegistrations(true);
    setRegistrations([]);

    try {
      const response = await registrationService.getEventRegistrations(event._id);
      const data = response.data?.data || response.data || [];
      setRegistrations(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load registrations");
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setRegistrations([]);
  };

  return (
    <ProtectedRoute
      element={
        <div className="min-h-screen bg-primary-50">
          {/* Header */}
          <div className="bg-white border-b border-primary-100">
            <div className="section-container py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-primary-900 mb-2">
                    My Events
                  </h1>
                  <p className="text-primary-600">
                    Manage all your organized events
                  </p>
                </div>
                <Link
                  to="/create-event"
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Event</span>
                </Link>
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
            ) : events.length === 0 ? (
              <div className="text-center py-16 card p-8">
                <Calendar className="w-16 h-16 text-primary-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-primary-900 mb-2">
                  No Events Yet
                </h3>
                <p className="text-primary-600 mb-6">
                  Create your first event to get started
                </p>
                <Link to="/create-event" className="btn-primary inline-block">
                  Create Event
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div key={event._id} className="relative">
                    <EventCard 
                      event={event} 
                      actionLabel="View Registrations"
                      onAction={() => handleViewRegistrations(event)}
                    />
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <Link
                        to={`/edit-event/${event._id}`}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Registrations Modal */}
          {selectedEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg border border-gray-200 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      Registered Attendees
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {selectedEvent.title}
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-5">
                  {loadingRegistrations ? (
                    <div className="flex justify-center items-center py-12">
                      <LoadingSpinner />
                    </div>
                  ) : registrations.length === 0 ? (
                    <div className="text-center py-12">
                      <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No registrations yet</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Attendees will appear here once they register
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {registrations.map((registration) => (
                        <div
                          key={registration._id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <User className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {registration.user?.name || "Unknown User"}
                              </p>
                              {registration.user?.email && (
                                <div className="flex items-center space-x-1.5 mt-1">
                                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                                  <p className="text-sm text-gray-600">
                                    {registration.user.email}
                                  </p>
                                </div>
                              )}
                              <p className="text-xs text-gray-400 mt-2">
                                Registered on{" "}
                                {new Date(registration.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Total: <span className="font-medium">{registrations.length}</span>{" "}
                      {registrations.length === 1 ? "attendee" : "attendees"}
                    </p>
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      }
      requiredRole="organizer"
    />
  );
};

export default MyEventsPage;
