import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, User, Clock, Loader } from "lucide-react";
import { eventService, registrationService } from "../services/eventService";
import { useAuth } from "../context/AuthContext";
import { Alert, LoadingSpinner } from "../components/Alert";
import { formatDate, formatCurrency } from "../utils/helpers";

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEvent(id);
      // Backend returns: { success: true, message: "...", data: {...} }
      setEvent(response.data?.data || response.data);

      // Check if user is already registered
      if (user) {
        const registrations = await registrationService.myRegistrations();
        const regsData = registrations.data?.data || registrations.data || [];
        const registered = regsData.some(
          (reg) => reg.event?._id === id || reg.event?._id === response.data?.data?._id
        );
        setIsRegistered(registered);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load event details"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setRegistering(true);
      await registrationService.registerForEvent(id);
      setSuccess("Successfully registered for event!");
      setIsRegistered(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to register. Please try again."
      );
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-900 mb-2">
            Event Not Found
          </h2>
          <button onClick={() => navigate("/")} className="btn-primary mt-4">
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header with back button */}
      <div className="bg-white border-b border-primary-100 sticky top-16 z-40">
        <div className="section-container">
          <button
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 py-4 text-primary-600 hover:text-primary-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Events</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image */}
            <div className="rounded-xl overflow-hidden mb-8 h-96 bg-gradient-to-br from-primary-200 to-primary-100">
              {event.image ? (
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary-300">
                  <Calendar className="w-24 h-24" />
                </div>
              )}
            </div>

            {/* Event Title and Description */}
            <div className="card p-8 mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-primary-900 mb-2">
                    {event.title}
                  </h1>
                  <p className="text-lg text-primary-600">
                    Organized by {event.organizer?.name || "Unknown"}
                  </p>
                </div>
                {event.status && (
                  <span
                    className={`text-sm font-semibold px-4 py-2 rounded-full ${
                      event.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {event.status.charAt(0).toUpperCase() +
                      event.status.slice(1)}
                  </span>
                )}
              </div>

              <div className="prose prose-sm max-w-none mb-8">
                <p className="text-primary-700 whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>

              {/* Event Details Grid */}
              <div className="grid grid-cols-2 gap-6 pt-8 border-t border-primary-100">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-6 h-6 text-primary-500" />
                  <div>
                    <p className="text-sm text-primary-600">Date & Time</p>
                    <p className="font-semibold text-primary-900">
                      {formatDate(event.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <MapPin className="w-6 h-6 text-primary-500" />
                  <div>
                    <p className="text-sm text-primary-600">Location</p>
                    <p className="font-semibold text-primary-900">
                      {event.location}
                    </p>
                  </div>
                </div>

                {event.category && (
                  <div className="flex items-center space-x-3">
                    <User className="w-6 h-6 text-primary-500" />
                    <div>
                      <p className="text-sm text-primary-600">Category</p>
                      <p className="font-semibold text-primary-900">
                        {event.category}
                      </p>
                    </div>
                  </div>
                )}

                {event.price && (
                  <div className="flex items-center space-x-3">
                    <Clock className="w-6 h-6 text-primary-500" />
                    <div>
                      <p className="text-sm text-primary-600">Price</p>
                      <p className="font-semibold text-primary-900">
                        {formatCurrency(event.price)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-8 sticky top-32">
              <div className="mb-6">
                <p className="text-sm text-primary-600 mb-1">Price</p>
                <p className="text-4xl font-bold text-primary-900">
                  {event.price ? formatCurrency(event.price) : "Free"}
                </p>
              </div>

              <button
                onClick={handleRegister}
                disabled={registering || isRegistered}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  isRegistered
                    ? "bg-green-100 text-green-700 cursor-not-allowed"
                    : "btn-primary"
                }`}
              >
                {registering ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Registering...</span>
                  </span>
                ) : isRegistered ? (
                  "✓ Registered"
                ) : (
                  "Register for Event"
                )}
              </button>

              {!user && (
                <p className="text-center text-sm text-primary-600 mt-4">
                  <button
                    onClick={() => navigate("/login")}
                    className="text-primary-900 font-semibold hover:underline"
                  >
                    Sign in
                  </button>{" "}
                  to register
                </p>
              )}

              <div className="mt-8 pt-8 border-t border-primary-100 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
                    About This Event
                  </p>
                  <p className="text-sm text-primary-700 mt-2">
                    Join us for an amazing event. Limited seats available.
                    Register now to secure your spot.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
