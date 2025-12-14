import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Get all users (only role = USER)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "USER" }).select("email role");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch users" });
  }
};

// Create new user
export const createUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, role: "USER" });

    res.status(201).json({ email: user.email, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to create user" });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, password } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (email) user.email = email;
    if (password) user.passwordHash = await bcrypt.hash(password, 10);

    await user.save();
    res.json({ msg: "User updated", email: user.email, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to update user" });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({ msg: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to delete user" });
  }
};