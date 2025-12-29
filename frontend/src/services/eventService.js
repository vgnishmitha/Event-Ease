import api from "./api";

export const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
  logout: () => {
    // remove all role-specific sessions and active role
    localStorage.removeItem("token_user");
    localStorage.removeItem("user_user");
    localStorage.removeItem("token_organizer");
    localStorage.removeItem("user_organizer");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("user_admin");
    localStorage.removeItem("activeRole");
  },
  getUsers: () => api.get("/admin/users"),
  blockUser: (id) => api.put(`/auth/block/${id}`),
};

export const eventService = {
  getEvents: (filters) => api.get("/events", { params: filters }),
  getEvent: (id) => api.get(`/events/${id}`),
  createEvent: (data) => api.post("/events", data),
  updateEvent: (id, data) => api.put(`/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  approveEvent: (id, data) => api.put(`/events/approve/${id}`, data),
  myEvents: () => api.get("/my-events"),
  blockUserFromEvent: (eventId, userId) => api.put(`/events/${eventId}/block`, { userId }),
  unblockUserFromEvent: (eventId, userId) => api.put(`/events/${eventId}/unblock`, { userId }),
  // Admin helpers
  adminUpdateEvent: (id, data) => api.put(`/admin/events/${id}`, data),
  adminDeleteEvent: (id) => api.delete(`/admin/events/${id}`),
};

export const registrationService = {
  registerForEvent: (eventId) => api.post(`/registrations/${eventId}`),
  myRegistrations: () => api.get("/registrations/my"),
  cancelRegistration: (id) => api.delete(`/registrations/${id}`),
  allRegistrations: () => api.get("/registrations"),
  getEventRegistrations: (eventId) =>
    api.get(`/registrations/event/${eventId}`),
  getRegistrationCount: (eventId) => api.get(`/registrations/count/${eventId}`),
};
