import Event from "../models/Event.js";
import { success, error } from "../helper/responseHelper.js";

/**
 * Create a new event
 * Prevents duplicate events with same title, date, category for the same organizer
 */
export const createEvent = async (req, res) => {
  try {
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
    const { status } = req.query;
    const query = status ? { status } : {};
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
    success(res, "Event fetched", event);
  } catch (err) {
    error(res, err.message || "Failed to fetch event", 500);
  }
};

// Update event
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!event) {
      return error(res, "Event not found", 404);
    }

    success(res, "Event updated successfully", event);
  } catch (err) {
    error(res, err.message, 500);
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
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

// My events for organizer
export const myEvents = async (req, res) => {
  try {
    const organizerId = req.user._id; // Use _id for consistency

    const events = await Event.find({ organizer: organizerId }).populate(
      "organizer"
    );

    success(res, "Organizer events fetched", events);
  } catch (err) {
    error(res, err.message || "Server error", 500);
  }
};
