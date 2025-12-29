import React, { createContext, useState, useContext, useEffect } from "react";
const AuthContext = createContext();

const ROLE_KEYS = {
  user: { token: "token_user", user: "user_user" },
  organizer: { token: "token_organizer", user: "user_organizer" },
  admin: { token: "adminToken", user: "user_admin" },
};

const readSession = (role) => {
  const keys = ROLE_KEYS[role];
  if (!keys) return { token: null, user: null };
  const token = localStorage.getItem(keys.token);
  const userRaw = localStorage.getItem(keys.user);
  let user = null;
  try {
    if (userRaw && userRaw !== "undefined") user = JSON.parse(userRaw);
  } catch (err) {
    localStorage.removeItem(keys.user);
  }
  return { token, user };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [activeRole, setActiveRole] = useState(null);

  useEffect(() => {
    // Load active role or pick first available
    const storedActive = localStorage.getItem("activeRole");
    const available = getAvailableRoles();
    let role = storedActive;
    if (!role || !available.includes(role)) {
      role = available[0] || null;
    }

    setActiveRole(role);
    if (role) {
      const sess = readSession(role);
      setToken(sess.token);
      setUser(sess.user);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAvailableRoles = () => {
    return Object.keys(ROLE_KEYS).filter((r) => {
      const k = ROLE_KEYS[r];
      return !!localStorage.getItem(k.token);
    });
  };

  const login = (userData, token) => {
    const role = userData.role || "user";
    const keys = ROLE_KEYS[role] || ROLE_KEYS.user;
    localStorage.setItem(keys.token, token);
    localStorage.setItem(keys.user, JSON.stringify(userData));
    localStorage.setItem("activeRole", role);

    setActiveRole(role);
    setUser(userData);
    setToken(token);
  };

  const logout = () => {
    if (!activeRole) return;
    const keys = ROLE_KEYS[activeRole];
    localStorage.removeItem(keys.token);
    localStorage.removeItem(keys.user);
    // clear activeRole or switch to another
    const remaining = getAvailableRoles().filter((r) => r !== activeRole);
    const next = remaining[0] || null;
    if (next) {
      const sess = readSession(next);
      localStorage.setItem("activeRole", next);
      setActiveRole(next);
      setUser(sess.user);
      setToken(sess.token);
    } else {
      localStorage.removeItem("activeRole");
      setActiveRole(null);
      setUser(null);
      setToken(null);
    }
  };

  const switchRole = (role) => {
    if (!ROLE_KEYS[role]) return;
    const sess = readSession(role);
    if (!sess.token) return;
    localStorage.setItem("activeRole", role);
    setActiveRole(role);
    setUser(sess.user);
    setToken(sess.token);
  };

  const updateUser = (userData) => {
    if (!activeRole) return;
    const keys = ROLE_KEYS[activeRole];
    setUser(userData);
    localStorage.setItem(keys.user, JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        activeRole,
        availableRoles: getAvailableRoles(),
        login,
        logout,
        switchRole,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
