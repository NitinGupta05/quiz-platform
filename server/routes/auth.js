import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// JWT secret must be provided via environment
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in environment");
}
const PLACEHOLDER_NAMES = new Set([
  "unknown",
  "anonymous",
  "user",
  "guest",
  "test",
  "na",
  "n/a",
  "-",
]);

function normalizeText(value) {
  return String(value || "").trim();
}

function isInvalidDisplayName(name) {
  const normalized = normalizeText(name).toLowerCase();
  if (!normalized) return true;
  if (PLACEHOLDER_NAMES.has(normalized)) return true;
  return normalized.length < 2;
}

function isInvalidEmail(email) {
  const normalized = normalizeText(email).toLowerCase();
  if (!normalized) return true;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) return true;

  const [localPart] = normalized.split("@");
  return localPart === "unknown" || localPart === "anonymous";
}

function validateProfileImage(image) {
  const normalized = normalizeText(image);
  if (!normalized) return "";

  const allowedPattern = /^data:image\/(png|jpe?g|webp|gif);base64,/i;
  if (!allowedPattern.test(normalized)) {
    throw new Error("Profile image must be a PNG, JPG, WEBP, or GIF data URL");
  }

  const approxBytes = Math.ceil((normalized.length * 3) / 4);
  const maxBytes = 1.5 * 1024 * 1024;
  if (approxBytes > maxBytes) {
    throw new Error("Profile image must be smaller than 1.5 MB");
  }

  return normalized;
}

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const name = normalizeText(req.body.name);
    const email = normalizeText(req.body.email).toLowerCase();
    const password = normalizeText(req.body.password);

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (isInvalidDisplayName(name)) {
      return res.status(400).json({ message: "Please enter a valid name" });
    }

    if (isInvalidEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "user",
      blocked: false,
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if blocked
    if (user.blocked) {
      return res.status(403).json({ message: "Account is blocked. Contact admin." });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// ADMIN LOGIN
router.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin user
    const user = await User.findOne({ email, role: "admin" });
    if (!user) {
      return res.status(400).json({ message: "Invalid admin credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid admin credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET CURRENT USER
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE PROFILE
router.put("/profile", auth, async (req, res) => {
  try {
    const { phone, country, gender, dob } = req.body;
    const name = normalizeText(req.body.name);
    const image = validateProfileImage(req.body.image);

    if (name && isInvalidDisplayName(name)) {
      return res.status(400).json({ message: "Please enter a valid name" });
    }

    const updates = { phone, country, gender, dob, image };
    if (name) {
      updates.name = name;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (error) {
    console.error("Update profile error:", error);
    const isValidationError = error.message?.includes("Profile image");
    res.status(isValidationError ? 400 : 500).json({ message: isValidationError ? error.message : "Server error" });
  }
});

// CHANGE PASSWORD
router.put("/password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const normalizedNewPassword = normalizeText(newPassword);

    if (normalizedNewPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashed = await bcrypt.hash(normalizedNewPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ADMIN: GET ALL USERS
router.get("/admin/users", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ADMIN: BLOCK/UNBLOCK USER
router.put("/admin/users/:id/block", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.blocked = !user.blocked;
    await user.save();

    res.json({ message: `User ${user.blocked ? "blocked" : "unblocked"} successfully` });
  } catch (error) {
    console.error("Block user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;

