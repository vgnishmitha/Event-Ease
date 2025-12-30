import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Filter, Heart, Ban } from "lucide-react";
import EventCard from "../components/EventCard";
import { eventService, registrationService } from "../services/eventService";
import { useAuth } from "../context/AuthContext";
import { Alert, LoadingSpinner } from "../components/Alert";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRegistered, setLoadingRegistered] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    // Redirect organizers to my-events page
    if (user?.role === "organizer") {
      navigate("/my-events", { replace: true });
      return;
    }
    
    // If user is globally blocked, don't fetch anything
    if (user?.isBlocked) {
      setLoading(false);
      return;
    }
    fetchEvents();
    if (user) {
      fetchRegisteredEvents();
    }
  }, [user, navigate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEvents({ status: "approved" });
      // Backend returns: { success: true, message: "...", data: [...] }
      setEvents(response.data?.data || response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load events. Please try again."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisteredEvents = async () => {
    try {
      setLoadingRegistered(true);
      const response = await registrationService.myRegistrations();
      const regsData = response.data?.data || response.data || [];
      // Store full registration data with blocked status
      setRegistrations(regsData);
    } catch (err) {
      console.error("Failed to load registered events:", err);
      setRegistrations([]);
    } finally {
      setLoadingRegistered(false);
    }
  };

  // Separate active and blocked registrations
  const activeRegistrations = registrations.filter((reg) => !reg.isBlocked && reg.event);
  const blockedRegistrations = registrations.filter((reg) => reg.isBlocked && reg.event);

  const filteredEvents = events.filter((event) => {
    const title = (event.title || "").toString();
    const description = (event.description || "").toString();
    const term = (searchTerm || "").toString().toLowerCase();
    const matchesSearch =
      title.toLowerCase().includes(term) ||
      description.toLowerCase().includes(term);
    const matchesCategory =
      selectedCategory === "all" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", "conference", "workshop", "networking", "webinar"];

  // If user is globally blocked by admin, show blocked message
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
    <div className="min-h-screen bg-primary-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-primary-100">
        <div className="section-container py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-900 mb-4">
              Discover Events That <span className="text-gradient">Matter</span>
            </h1>
            <p className="text-lg text-primary-600 mb-8">
              Explore, register, and attend amazing events. Connect with
              professionals and grow your network.
            </p>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-primary-400" />
              <input
                type="text"
                placeholder="Search events by name or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-12 text-lg"
              />
            </div>
          </div>
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

        {/* Registered Events Section - Only for logged in users */}
        {user && (
          <div className="mb-16">
            {/* Blocked Events Warning */}
            {blockedRegistrations.length > 0 && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <Ban className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">
                      You've been blocked from {blockedRegistrations.length} event(s)
                    </p>
                    <p className="text-sm text-red-600">
                      <button 
                        onClick={() => navigate("/my-registrations")}
                        className="underline hover:no-underline"
                      >
                        View details
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3 mb-6">
              <Heart className="w-6 h-6 text-red-500" />
              <h2 className="text-3xl font-bold text-primary-900">
                Your Registered Events
              </h2>
            </div>

            {loadingRegistered ? (
              <div className="flex justify-center items-center h-32">
                <LoadingSpinner />
              </div>
            ) : activeRegistrations.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center border border-primary-100">
                <Heart className="w-16 h-16 text-primary-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-primary-900 mb-2">
                  No Registered Events Yet
                </h3>
                <p className="text-primary-600 mb-4">
                  Browse events below and register to get started!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {activeRegistrations.map((reg) => (
                  <div key={reg._id}>
                    <EventCard
                      event={reg.event}
                      onAction={() => navigate(`/event/${reg.event._id}`)}
                      actionLabel="View Details"
                    />
                  </div>
                ))}
              </div>
            )}
            <hr className="my-12 border-primary-200" />
          </div>
        )}

        {/* Filters */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-primary-900 mb-6">
            Explore All Events
          </h2>
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <Filter className="w-5 h-5 text-primary-600 flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? "bg-primary-900 text-white"
                    : "bg-white text-primary-700 border border-primary-200 hover:bg-primary-50"
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="w-16 h-16 text-primary-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-primary-900 mb-2">
              No Events Found
            </h3>
            <p className="text-primary-600">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={event._id}>
                <EventCard
                  event={event}
                  onAction={() => navigate(`/event/${event._id}`)}
                  actionLabel="View Details"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
