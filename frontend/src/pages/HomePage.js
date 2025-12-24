import React, { useState, useEffect } from "react";
import { Search, MapPin, Filter } from "lucide-react";
import EventCard from "../components/EventCard";
import { eventService } from "../services/eventService";
import { Alert, LoadingSpinner } from "../components/Alert";

const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEvents({ status: "approved" });
      // Backend returns: { success: true, message: "...", data: [...] }
      setEvents(response.data?.data || response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load events. Please try again."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", "conference", "workshop", "networking", "webinar"];

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

        {/* Filters */}
        <div className="flex items-center space-x-2 mb-8 overflow-x-auto pb-2">
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
                  onAction={() =>
                    (window.location.href = `/event/${event._id}`)
                  }
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
