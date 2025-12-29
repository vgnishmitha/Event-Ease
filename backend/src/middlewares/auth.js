import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { error } from "../helper/responseHelper.js";

export const auth = async (req, res, next) => {
  try {
    // Validate JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      return error(
        res,
        "JWT_SECRET is not configured in environment variables",
        500
      );
    }

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return error(res, "No token provided", 401);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return error(res, "No token provided", 401);
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID from token
    const user = await User.findById(decoded.id);
    if (!user) {
      return error(res, "User not found", 404);
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return error(res, "User account is blocked", 403);
    }

    // Attach user to request object for use in routes
    req.user = user;
    next();
  } catch (err) {
    // Handle invalid or expired tokens
    return error(res, "Invalid or expired token", 401);
  }
};

// Optional auth: if token present, set req.user, otherwise continue without error
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next();
    const token = authHeader.split(" ")[1];
    if (!token) return next();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return next();
    if (user.isBlocked) return error(res, "User account is blocked", 403);
    req.user = user;
    return next();
  } catch (err) {
    return next();
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return error(res, "Admin access required", 403);
  }
  next();
};

export const organizerOnly = (req, res, next) => {
  if (req.user.role !== "organizer") {
    return error(res, "Organizer access required", 403);
  }
  next();
};
