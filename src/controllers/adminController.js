import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-passwordHash");
  res.json(users);
};