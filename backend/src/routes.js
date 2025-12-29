//  AUTH CONTROLLERS
import {
  register,
  login,
  getProfile,
  updateProfile,
  blockUser,
  getAllUsers,
} from "./controllers/authController.js";

//EVENT CONTROLLERS
import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  approveEvent,
  adminUpdateEvent,
  adminDeleteEvent,
  myEvents,
  blockUserFromEvent,
  unblockUserFromEvent,
} from "./controllers/eventController.js";

//  REGISTRATION CONTROLLERS
import {
  registerForEvent,
  myRegistrations,
  cancelRegistration,
  allRegistrations,
  getEventRegistrations,
  getEventRegistrationCount,
} from "./controllers/registrationController.js";

//MIDDLEWARES
import { auth, adminOnly, organizerOnly, optionalAuth } from "./middlewares/auth.js";

const router = (app) => {
  // AUTH ROUTES
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);
  app.get("/api/auth/profile", auth, getProfile);
  app.put("/api/auth/profile", auth, updateProfile);
  app.put("/api/auth/block/:id", auth, adminOnly, blockUser);

  // Admin: manage users
  app.get("/api/admin/users", auth, adminOnly, getAllUsers);

  //  EVENT ROUTES
  app.post("/api/events", auth, organizerOnly, createEvent);
  app.get("/api/events", optionalAuth, getEvents);
  app.get("/api/events/:id", optionalAuth, getEvent);
  app.put("/api/events/:id", auth, organizerOnly, updateEvent);
  app.delete("/api/events/:id", auth, organizerOnly, deleteEvent);
  app.put("/api/events/approve/:id", auth, adminOnly, approveEvent);
  app.get("/api/my-events", auth, organizerOnly, myEvents);

  // Organizer block/unblock user for a specific event
  app.put(
    "/api/events/:id/block",
    auth,
    organizerOnly,
    blockUserFromEvent
  );
  app.put(
    "/api/events/:id/unblock",
    auth,
    organizerOnly,
    unblockUserFromEvent
  );

  // Admin: manage any event
  app.put("/api/admin/events/:id", auth, adminOnly, adminUpdateEvent);
  app.delete("/api/admin/events/:id", auth, adminOnly, adminDeleteEvent);

  // REGISTRATION ROUTES
  app.post("/api/registrations/:eventId", auth, registerForEvent);
  app.get("/api/registrations/my", auth, myRegistrations);
  app.delete("/api/registrations/:id", auth, cancelRegistration);
  app.get("/api/registrations", auth, adminOnly, allRegistrations);
  app.get("/api/registrations/event/:eventId", auth, getEventRegistrations);
  app.get("/api/registrations/count/:eventId", getEventRegistrationCount);
};

export default router;
