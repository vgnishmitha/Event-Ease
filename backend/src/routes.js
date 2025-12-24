// ================= AUTH CONTROLLERS =================
import {
  register,
  login,
  getProfile,
  updateProfile,
  blockUser,
} from "./controllers/authController.js";

// ================= EVENT CONTROLLERS =================
import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  approveEvent,
  myEvents,
} from "./controllers/eventController.js";

// ================= REGISTRATION CONTROLLERS =================
import {
  registerForEvent,
  myRegistrations,
  cancelRegistration,
  allRegistrations,
  getEventRegistrations,
} from "./controllers/registrationController.js";

// ================= MIDDLEWARES =================
import { auth, adminOnly, organizerOnly } from "./middlewares/auth.js";

const router = (app) => {
  // ============ AUTH ROUTES ============
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);
  app.get("/api/auth/profile", auth, getProfile);
  app.put("/api/auth/profile", auth, updateProfile);
  app.put("/api/auth/block/:id", auth, adminOnly, blockUser);

  // ============ EVENT ROUTES ============
  app.post("/api/events", auth, organizerOnly, createEvent);
  app.get("/api/events", getEvents);
  app.get("/api/events/:id", getEvent);
  app.put("/api/events/:id", auth, organizerOnly, updateEvent);
  app.delete("/api/events/:id", auth, organizerOnly, deleteEvent);
  app.put("/api/events/approve/:id", auth, adminOnly, approveEvent);
  app.get("/api/my-events", auth, organizerOnly, myEvents);

  // ============ REGISTRATION ROUTES ============
  app.post("/api/registrations/:eventId", auth, registerForEvent);
  app.get("/api/registrations/my", auth, myRegistrations);
  app.delete("/api/registrations/:id", auth, cancelRegistration);
  app.get("/api/registrations", auth, adminOnly, allRegistrations);
  app.get("/api/registrations/event/:eventId", auth, getEventRegistrations);
};

export default router;
