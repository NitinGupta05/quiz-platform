import bcrypt from "bcryptjs";
import User from "../models/User.js";

function normalizeText(value) {
  return String(value || "").trim();
}

export async function ensureAdminUser() {
  const adminEmail = normalizeText(process.env.ADMIN_EMAIL).toLowerCase();
  const adminPassword = normalizeText(process.env.ADMIN_PASSWORD);
  const adminName = normalizeText(process.env.ADMIN_NAME) || "Admin";

  if (!adminEmail || !adminPassword) {
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const existingUser = await User.findOne({ email: adminEmail });

  if (existingUser) {
    existingUser.name = existingUser.name || adminName;
    existingUser.password = hashedPassword;
    existingUser.role = "admin";
    existingUser.blocked = false;
    await existingUser.save();
    console.log(`Admin user ready: ${adminEmail}`);
    return;
  }

  await User.create({
    name: adminName,
    email: adminEmail,
    password: hashedPassword,
    role: "admin",
    blocked: false,
  });

  console.log(`Admin user created: ${adminEmail}`);
}
