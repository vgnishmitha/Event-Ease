import api from "./api";

export const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export const eventService = {
  getEvents: (filters) => api.get("/events", { params: filters }),
  getEvent: (id) => api.get(`/events/${id}`),
  createEvent: (data) => api.post("/events", data),
  updateEvent: (id, data) => api.put(`/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  approveEvent: (id, data) => api.put(`/events/approve/${id}`, data),
  myEvents: () => api.get("/my-events"),
};

export const registrationService = {
  registerForEvent: (eventId) => api.post(`/registrations/${eventId}`),
  myRegistrations: () => api.get("/registrations/my"),
  cancelRegistration: (id) => api.delete(`/registrations/${id}`),
  allRegistrations: () => api.get("/registrations"),
  getEventRegistrations: (eventId) => api.get(`/registrations/event/${eventId}`),
};
