import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, DollarSign, Tag, Image } from "lucide-react";
import { eventService } from "../services/eventService";
import { Alert } from "../components/Alert";
import ProtectedRoute from "../components/ProtectedRoute";

const CreateEventPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    category: "conference",
    price: 0,
    image: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "price" ? parseFloat(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (
      !formData.title ||
      !formData.description ||
      !formData.location ||
      !formData.date
    ) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      await eventService.createEvent(formData);
      setSuccess("Event created successfully! Redirecting...");
      setTimeout(() => navigate("/my-events"), 1500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create event. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    "conference",
    "workshop",
    "networking",
    "webinar",
    "meetup",
  ];

  return (
    <ProtectedRoute
      element={
        <div className="min-h-screen bg-gray-50">
          {/* Simple Header */}
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-2xl mx-auto px-6 py-5">
              <h1 className="text-lg font-medium text-gray-900">
                Create New Event
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Launch your event and reach attendees
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="max-w-2xl mx-auto px-6 py-8">
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

            <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Event Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm resize-none"
                    rows="4"
                    required
                  ></textarea>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Price ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Event Image URL
                  </label>
                  <div className="relative">
                    <Image className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-sm"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {loading ? "Creating Event..." : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
      requiredRole="organizer"
    />
  );
};

export default CreateEventPage;
