import React, { useState, useEffect } from "react";
import { MapPin, Calendar, Loader, Users } from "lucide-react";
import { formatDate, formatCurrency } from "../utils/helpers";
import { registrationService } from "../services/eventService";

const EventCard = ({
  event,
  onAction,
  actionLabel = "View Details",
  isLoading = false,
}) => {
  const [registrationCount, setRegistrationCount] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);

  useEffect(() => {
    fetchRegistrationCount();
  }, [event._id]);

  const fetchRegistrationCount = async () => {
    try {
      setLoadingCount(true);
      const response = await registrationService.getRegistrationCount(
        event._id
      );
      setRegistrationCount(response.data?.data?.count || 0);
    } catch (err) {
      console.warn("Failed to fetch registration count:", err);
      setRegistrationCount(0);
    } finally {
      setLoadingCount(false);
    }
  };
  return (
    <div className="card overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow">
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
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
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

        {/* Event Details */}
        <div className="space-y-2 mb-4 text-sm text-primary-700">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-primary-500" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-primary-500" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-primary-500" />
            <span>
              {loadingCount ? (
                <span className="text-xs text-primary-500">Loading...</span>
              ) : (
                `${registrationCount} ${
                  registrationCount === 1 ? "person" : "people"
                } registered`
              )}
            </span>
          </div>
          {event.price && (
            <div className="flex items-center space-x-2">
              <span className="font-semibold">
                {formatCurrency(event.price)}
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={onAction}
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <span>{actionLabel}</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default EventCard;
