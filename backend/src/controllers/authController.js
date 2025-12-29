import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { success, error } from "../helper/responseHelper.js";

// Admin: Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    success(res, "Users fetched", users);
  } catch (err) {
    error(res, err.message || "Failed to fetch users", 500);
  }
};

// Register user
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    //  Validate required fields
    if (!name) return error(res, "Name is required");
    if (!email) return error(res, "Email is required");
    if (!password) return error(res, "Password is required");
    if (!role) return error(res, "Role is required");

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) return error(res, "Email already registered");

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
    });

    success(res, "Registered successfully", user);
  } catch (err) {
    error(res, err.message);
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Log request for debugging (remove in production)
    if (process.env.NODE_ENV !== "production") {
      console.log("Login attempt:", { email, hasPassword: !!password });
    }

    // Validate required fields
    if (!email || !email.trim()) {
      return error(res, "Email is required", 400);
    }
    if (!password || !password.trim()) {
      return error(res, "Password is required", 400);
    }

    // Validate JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured!");
      return error(
        res,
        "JWT_SECRET is not configured in environment variables",
        500
      );
    }

    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return error(res, "Invalid email or password", 401);
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return error(
        res,
        "Your account has been blocked. Please contact administrator.",
        403
      );
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return error(res, "Invalid email or password", 401);
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Remove password from user object before sending
    const userResponse = user.toObject();
    delete userResponse.password;

    success(res, "Login successful", { user: userResponse, token });
  } catch (err) {
    console.error("Login error:", err);
    error(res, err.message || "Login failed. Please try again.", 500);
  }
};

// Get profile
export const getProfile = (req, res) => {
  success(res, "Profile fetched", req.user);
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    });
    success(res, "Profile updated", user);
  } catch (err) {
    error(res, err.message);
  }
};

// Block/unblock user
export const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return error(res, "User not found", 404);
    user.isBlocked = !user.isBlocked;
    await user.save();
    success(res, `User ${user.isBlocked ? "blocked" : "unblocked"}`, user);
  } catch (err) {
    error(res, err.message);
  }
};
