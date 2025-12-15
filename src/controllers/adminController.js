import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Home from "../models/Home.js";
import Room from "../models/Room.js";
import Device from "../models/Device.js";

// --- Existing CRUD functions ---

export const getAllUsers = async (req, res) => {
  try {
    const populateHomes = req.query.populateHomes === "true";

    let users;

    if (populateHomes) {
      users = await User.find({ role: "USER" }).lean();

      const homes = await Home.find({
        members: { $in: users.map(u => u._id) }
      }).select("name members");

      users = users.map(user => {
        const userHomes = homes.filter(h =>
          h.members.some(m => m.toString() === user._id.toString())
        );
        return {
          ...user,
          homes: userHomes.map(h => ({ _id: h._id, name: h.name }))
        };
      });
    } else {
      users = await User.find({ role: "USER" }).select("email role");
    }

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to fetch users" });
  }
};

export const createUser = async (req, res) => {
  try {
    const { email, password } = req.body;
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

// --- New API: Users with Homes, Rooms, Devices ---
export const getUsersWithHomes = async (req, res) => {
  try {
    const users = await User.find({ role: "USER" }).lean();
    const result = [];

    for (const user of users) {
      const homes = await Home.find({ members: user._id }).lean();
      const homesWithRoomsAndDevices = [];

      for (const home of homes) {
        const rooms = await Room.find({ home: home._id }).lean();
        const roomsWithDevices = [];

        for (const room of rooms) {
          const devices = await Device.find({ room: room._id }).lean();
          roomsWithDevices.push({ ...room, devices });
        }

        homesWithRoomsAndDevices.push({ ...home, rooms: roomsWithDevices });
      }

      result.push({ ...user, homes: homesWithRoomsAndDevices });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};