import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import bcrypt from "bcrypt";

dotenv.config();

const ADMIN_EMAIL = "nishmithavg@gmail.com";
const ADMIN_PASSWORD = "admin123";
const ADMIN_NAME = "Admin User";

/**
 * Create admin user if it doesn't exist, or update existing one
 */
const ensureAdminExists = async () => {
  try {
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      // Update existing admin - ensure role, password, and status are correct
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      existingAdmin.role = "admin";
      existingAdmin.isBlocked = false;
      existingAdmin.password = hashedPassword; // Reset password to ensure it matches
      await existingAdmin.save();
      console.log(" Admin user verified and updated in database");
      return;
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
      isBlocked: false,
    });
    console.log("Admin user created in database");
  } catch (err) {
    console.log(" Could not create admin user:", err.message);
    // Don't exit - server can still run without admin
  }
};

const connectDB = async () => {
  try {
    console.log("Mongo URL:", process.env.MONGO_URL);

    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL is not defined in .env");
    }

    await mongoose.connect(process.env.MONGO_URL, {
      dbName: process.env.DB_NAME,
    });

    console.log("✅ MongoDB Connected");

    // Ensure admin user exists
    await ensureAdminExists();
  } catch (err) {
    console.log(" DB Connection Error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
