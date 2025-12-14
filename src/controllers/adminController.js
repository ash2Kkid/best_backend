import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  try {
    // Only fetch users with role = "USER"
    const users = await User.find({ role: "USER" }).select("email role");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch users" });
  }
};