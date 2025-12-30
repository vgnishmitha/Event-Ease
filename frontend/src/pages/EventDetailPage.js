import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, User, Clock, Loader, Ban } from "lucide-react";
import { eventService, registrationService } from "../services/eventService";
import { useAuth } from "../context/AuthContext";
import { Alert, LoadingSpinner } from "../components/Alert";
import { formatDate, formatCurrency } from "../utils/helpers";

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const isOrganizer = user?.role === "organizer";
  const isEventOwner = event?.organizer?._id === user?._id || event?.organizer === user?._id;

  useEffect(() => {
    // If user is globally blocked, don't fetch event
    if (user?.isBlocked) {
      setLoading(false);
      return;
    }
    fetchEventDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEvent(id);
      // Backend returns: { success: true, message: "...", data: {...} }
      const eventData = response.data?.data || response.data;
      setEvent(eventData);

      // Check if user is blocked from this event
      if (user && eventData?.blockedUsers) {
        const blocked = eventData.blockedUsers.some(
          (blockedId) => blockedId.toString() === user._id?.toString()
        );
        setIsBlocked(blocked);
      }

      // Fetch registration count
      try {
        const countResponse = await registrationService.getRegistrationCount(
          id
        );
        setRegistrationCount(countResponse.data?.data?.count || 0);
      } catch (countErr) {
        console.warn("Failed to fetch registration count:", countErr);
        setRegistrationCount(0);
      }

      // Check if user is already registered
      if (user) {
        const registrations = await registrationService.myRegistrations();
        const regsData = registrations.data?.data || registrations.data || [];
        const registered = regsData.some(
          (reg) =>
            reg.event?._id === id || reg.event?._id === eventData?._id
        );
        setIsRegistered(registered);
      }
    } catch (err) {
      // Check if blocked error from backend
      if (err.response?.status === 403 && err.response?.data?.message?.toLowerCase().includes("blocked")) {
        setIsBlocked(true);
        setError("You are blocked from viewing this event");
      } else {
        setError(err.response?.data?.message || "Couldn't load event details");
      }
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

    // Organizers cannot register for events
    if (user.role === "organizer") {
      setError("Organizers cannot register for events. Please use an attendee account.");
      return;
    }

    try {
      setRegistering(true);
      await registrationService.registerForEvent(id);
      setSuccess("You're registered!");
      setIsRegistered(true);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't register. Try again?");
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

  if (!event) {
    // Show blocked message if user is blocked
    if (isBlocked) {
      return (
        <div className="min-h-screen bg-primary-50 flex items-center justify-center">
          <div className="text-center card p-8 max-w-md">
            <div className="p-4 bg-red-100 rounded-full w-fit mx-auto mb-4">
              <Ban className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-700 mb-2">
              Access Blocked
            </h2>
            <p className="text-gray-600 mb-6">
              You have been blocked from viewing this event by the organizer. 
              If you believe this is a mistake, please contact the event organizer.
            </p>
            <button onClick={() => navigate("/home")} className="btn-primary">
              Browse Other Events
            </button>
          </div>
        </div>
      );
    }
    
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
            onClick={() => navigate("/home")}
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
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}
        {success && (
          <Alert
            type="success"
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

                <div className="flex items-center space-x-3">
                  <User className="w-6 h-6 text-primary-500" />
                  <div>
                    <p className="text-sm text-primary-600">Registered</p>
                    <p className="font-semibold text-primary-900">
                      {registrationCount}{" "}
                      {registrationCount === 1 ? "person" : "people"}
                    </p>
                  </div>
                </div>
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
                disabled={registering || isRegistered || isBlocked || isOrganizer}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  isOrganizer
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : isBlocked
                    ? "bg-red-100 text-red-700 cursor-not-allowed"
                    : isRegistered
                    ? "bg-green-100 text-green-700 cursor-not-allowed"
                    : "btn-primary"
                }`}
              >
                {registering ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Registering...</span>
                  </span>
                ) : isOrganizer ? (
                  "Organizers Cannot Register"
                ) : isBlocked ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Ban className="w-4 h-4" />
                    <span>Blocked</span>
                  </span>
                ) : isRegistered ? (
                  "✓ Registered"
                ) : (
                  "Register for Event"
                )}
              </button>

              {isOrganizer && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  As an organizer, you can only create events, not register for them
                </p>
              )}

              {isBlocked && !isOrganizer && (
                <p className="text-center text-sm text-red-600 mt-4">
                  You have been blocked from this event by the organizer
                </p>
              )}

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
                    Attendance
                  </p>
                  <p className="text-lg font-bold text-primary-900 mt-2">
                    {registrationCount}{" "}
                    {registrationCount === 1 ? "person" : "people"} registered
                  </p>
                </div>
              </div>

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

              {user?.role === "admin" && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-primary-700 mb-2">
                    Admin Controls
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        try {
                          await eventService.adminUpdateEvent(id, {
                            isUpcoming: !event.isUpcoming,
                          });
                          setSuccess("Event updated");
                          fetchEventDetails();
                        } catch (err) {
                          setError(
                            err.response?.data?.message ||
                              "Failed to update event"
                          );
                        }
                      }}
                      className={`px-3 py-2 rounded-lg border text-sm ${
                        event.isUpcoming
                          ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                          : "bg-white border-gray-200 text-gray-700"
                      }`}
                    >
                      {event.isUpcoming ? "Unset Upcoming" : "Set as Upcoming"}
                    </button>
                    <button
                      onClick={async () => {
                        if (!window.confirm("Delete this event?")) return;
                        try {
                          await eventService.adminDeleteEvent(id);
                          setSuccess("Event deleted");
                          navigate("/");
                        } catch (err) {
                          setError(
                            err.response?.data?.message ||
                              "Failed to delete event"
                          );
                        }
                      }}
                      className="px-3 py-2 rounded-lg border bg-white border-gray-200 text-gray-700"
                    >
                      Delete Event
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
