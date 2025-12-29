import Event from "../models/Event.js";
import { success, error } from "../helper/responseHelper.js";

export const createEvent = async (req, res) => {
  try {
    if (req.user.role !== "organizer") {
      return error(
        res,
        "Only event organizers can create events. Attendees can register for events.",
        403
      );
    }

    const { title, date, category, location } = req.body;

    // Check duplicate event for same organizer
    const existingEvent = await Event.findOne({
      title,
      date,
      category,
      organizer: req.user._id,
    });

    if (existingEvent) {
      return error(
        res,
        "Event already exists with same title, date and category",
        400
      );
    }

    // Create event
    const event = await Event.create({
      ...req.body,
      organizer: req.user._id,
    });

    success(res, "Event created", event);
  } catch (err) {
    error(res, err.message);
  }
};

/**
 * Get all events with optional filtering
 */
export const getEvents = async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    const query = {};
    if (status) query.status = status;
    if (typeof upcoming !== "undefined") {
      // treat truthy values ('true', '1') as true
      const isUpcoming =
        upcoming === "true" || upcoming === "1" || upcoming === true;
      query.isUpcoming = isUpcoming;
    }

    // If user is authenticated, exclude events where they're blocked
    if (req.user && req.user._id) {
      query.blockedUsers = { $ne: req.user._id };
    }

    const events = await Event.find(query).populate("organizer");
    success(res, "Events fetched", events);
  } catch (err) {
    error(res, err.message || "Failed to fetch events", 500);
  }
};

/**
 * Get a single event by ID
 */
export const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("organizer");
    if (!event) {
      return error(res, "Event not found", 404);
    }
    // If the requester is authenticated and is blocked from this event, deny access
    if (req.user && event.blockedUsers && event.blockedUsers.length) {
      const isBlocked = event.blockedUsers.some(
        (id) => id.toString() === req.user._id.toString()
      );
      if (isBlocked) return error(res, "You are blocked from viewing this event", 403);
    }
    success(res, "Event fetched", event);
  } catch (err) {
    error(res, err.message || "Failed to fetch event", 500);
  }
};

// Update event
export const updateEvent = async (req, res) => {
  try {
    // Ensure only organizers can update events
    if (req.user.role !== "organizer") {
      return error(res, "Only event organizers can update events", 403);
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return error(res, "Event not found", 404);
    }

    // Ensure the organizer owns this event
    if (event.organizer.toString() !== req.user._id.toString()) {
      return error(res, "You can only update your own events", 403);
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    success(res, "Event updated successfully", updatedEvent);
  } catch (err) {
    error(res, err.message, 500);
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    // Ensure only organizers can delete events
    if (req.user.role !== "organizer") {
      return error(res, "Only event organizers can delete events", 403);
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return error(res, "Event not found", 404);
    }

    // Ensure the organizer owns this event
    if (event.organizer.toString() !== req.user._id.toString()) {
      return error(res, "You can only delete your own events", 403);
    }

    await Event.findByIdAndDelete(req.params.id);
    success(res, "Event deleted");
  } catch (err) {
    error(res, err.message);
  }
};

// Approve/reject event
export const approveEvent = async (req, res) => {
  try {
    const { status } = req.body; // status: "approved" or "rejected"
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    success(res, `Event ${status}`, event);
  } catch (err) {
    error(res, err.message);
  }
};

// Admin update any event (status, isUpcoming or other fields)
export const adminUpdateEvent = async (req, res) => {
  try {
    const updates = req.body;
    const event = await Event.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate("organizer");
    if (!event) return error(res, "Event not found", 404);
    success(res, "Event updated by admin", event);
  } catch (err) {
    error(res, err.message);
  }
};

// Admin delete any event
export const adminDeleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return error(res, "Event not found", 404);
    await Event.findByIdAndDelete(req.params.id);
    success(res, "Event deleted by admin");
  } catch (err) {
    error(res, err.message);
  }
};

// My events for organizer
export const myEvents = async (req, res) => {
  try {
    // Ensure only organizers can view their created events
    if (req.user.role !== "organizer") {
      return error(
        res,
        "Only event organizers can view their created events. Use 'My Registrations' to see events you've registered for.",
        403
      );
    }

    const organizerId = req.user._id;
    const events = await Event.find({ organizer: organizerId }).populate(
      "organizer"
    );

    success(res, "Organizer events fetched", events);
  } catch (err) {
    error(res, err.message || "Server error", 500);
  }
};

// Organizer blocks a user from viewing a specific event
export const blockUserFromEvent = async (req, res) => {
  try {
    const { userId } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return error(res, "Event not found", 404);
    if (event.organizer.toString() !== req.user._id.toString())
      return error(res, "You can only modify your own events", 403);
    if (!userId) return error(res, "userId is required", 400);
    if (!event.blockedUsers) event.blockedUsers = [];
    if (event.blockedUsers.includes(userId))
      return error(res, "User already blocked for this event", 400);
    event.blockedUsers.push(userId);
    await event.save();
    success(res, "User blocked for this event", event);
  } catch (err) {
    error(res, err.message);
  }
};

// Organizer unblocks a user for a specific event
export const unblockUserFromEvent = async (req, res) => {
  try {
    const { userId } = req.body;
    const event = await Event.findById(req.params.id);
    if (!event) return error(res, "Event not found", 404);
    if (event.organizer.toString() !== req.user._id.toString())
      return error(res, "You can only modify your own events", 403);
    if (!userId) return error(res, "userId is required", 400);
    event.blockedUsers = (event.blockedUsers || []).filter(
      (id) => id.toString() !== userId
    );
    await event.save();
    success(res, "User unblocked for this event", event);
  } catch (err) {
    error(res, err.message);
  }
};
