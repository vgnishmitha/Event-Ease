import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../models/User.js";

// Load environment variables
dotenv.config();

const ADMIN_EMAIL = "nishmithavg@gmail.com";
const ADMIN_PASSWORD = "admin123";
const ADMIN_NAME = "Admin User";

/**
 * Create admin user in MongoDB
 * This script should be run once to create the admin user
 */
const createAdmin = async () => {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URL, {
      dbName: process.env.DB_NAME,
    });
    console.log("✅ MongoDB Connected");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      // Update existing admin - ensure role, password, and status are correct
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      existingAdmin.role = "admin";
      existingAdmin.isBlocked = false;
      existingAdmin.password = hashedPassword; // Reset password to ensure it matches
      await existingAdmin.save();
      console.log("✅ Existing admin user updated");
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD} (reset)`);
      console.log(`   Role: admin`);
      await mongoose.connection.close();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Create admin user
    const admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
      isBlocked: false,
    });

    console.log("✅ Admin user created successfully!");
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Role: admin`);

    // Close connection
    await mongoose.connection.close();
    console.log("✅ Database connection closed");
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    process.exit(1);
  }
};

// Run the script
createAdmin();

