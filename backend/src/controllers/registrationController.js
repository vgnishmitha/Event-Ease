import Registration from "../models/Registration.js";
import Event from "../models/Event.js";
import { success, error } from "../helper/responseHelper.js";

// Register for an event
export const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) return error(res, "Event not found", 404);

    const existing = await Registration.findOne({
      event: eventId,
      user: req.user._id,
    });
    if (existing) return error(res, "Already registered");

    const registration = await Registration.create({
      event: eventId,
      user: req.user._id,
    });
    success(res, "Registered successfully", registration);
  } catch (err) {
    error(res, err.message);
  }
};

/**
 * Get current user's event registrations
 */
export const myRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({
      user: req.user._id,
    }).populate("event");
    success(res, "My registrations fetched", registrations);
  } catch (err) {
    error(res, err.message || "Failed to fetch registrations", 500);
  }
};

/**
 * Cancel a registration
 * Only the user who registered can cancel their own registration
 */
export const cancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    
    if (!registration) {
      return error(res, "Registration not found", 404);
    }

    // Ensure user can only cancel their own registration
    if (registration.user.toString() !== req.user._id.toString()) {
      return error(res, "Unauthorized to cancel this registration", 403);
    }

    await Registration.findByIdAndDelete(req.params.id);
    success(res, "Registration cancelled successfully");
  } catch (err) {
    error(res, err.message || "Failed to cancel registration", 500);
  }
};

/**
 * Get all registrations (admin only)
 */
export const allRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find()
      .populate("user")
      .populate("event");
    success(res, "All registrations fetched", registrations);
  } catch (err) {
    error(res, err.message || "Failed to fetch registrations", 500);
  }
};

/**
 * Get registrations for a specific event (organizer only)
 */
export const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Find the event and verify the organizer
    const event = await Event.findById(eventId);
    if (!event) {
      return error(res, "Event not found", 404);
    }

    // Verify that the current user is the organizer of this event
    if (event.organizer.toString() !== req.user._id.toString()) {
      return error(res, "Unauthorized. You can only view registrations for your own events.", 403);
    }

    // Get all registrations for this event with user details
    const registrations = await Registration.find({ event: eventId })
      .populate("user", "name email")
      .sort({ createdAt: -1 }); // Most recent first

    success(res, "Event registrations fetched", registrations);
  } catch (err) {
    error(res, err.message || "Failed to fetch event registrations", 500);
  }
};
