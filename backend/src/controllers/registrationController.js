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
    // Populate user and event before returning
    const populatedReg = await registration.populate([
      { path: "event", select: "title date location" },
      { path: "user", select: "name email role" },
    ]);
    console.log("New registration created:", populatedReg);
    success(res, "Registered successfully", populatedReg);
  } catch (err) {
    console.error("Error in registerForEvent:", err);
    error(res, err.message);
  }
};

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

export const allRegistrations = async (req, res) => {
  try {
    // Admin only
    if (req.user.role !== "admin") {
      return error(res, "Admin access required", 403);
    }
    const registrations = await Registration.find()
      .populate("user", "name email role")
      .populate("event", "title date location status")
      .sort({ createdAt: -1 });
    console.log("Total registrations found:", registrations.length);
    success(res, "All registrations fetched", registrations);
  } catch (err) {
    console.error("Error in allRegistrations:", err);
    error(res, err.message || "Failed to fetch registrations", 500);
  }
};

export const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return error(res, "Event not found", 404);
    }

    // Allow organizer or admin to view registrations
    if (
      req.user.role !== "admin" &&
      event.organizer.toString() !== req.user._id.toString()
    ) {
      return error(
        res,
        "Unauthorized. Only admin or event organizer can view registrations.",
        403
      );
    }

    // Get all registrations for this event with user details
    const registrations = await Registration.find({ event: eventId })
      .populate("user", "name email role")
      .sort({ createdAt: -1 }); // Most recent first

    success(res, "Event registrations fetched", registrations);
  } catch (err) {
    error(res, err.message || "Failed to fetch event registrations", 500);
  }
};

/**
 * Get registration count for a specific event (public)
 */
export const getEventRegistrationCount = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return error(res, "Event not found", 404);
    }

    // Count registrations for this event
    const registrationCount = await Registration.countDocuments({
      event: eventId,
    });

    success(res, "Registration count fetched", {
      count: registrationCount,
      eventId,
    });
  } catch (err) {
    error(res, err.message || "Failed to fetch registration count", 500);
  }
};
