import Home from "../models/Home.js";
import User from "../models/User.js";

// Create a new home (Admin only)
export const createHome = async (req, res) => {
  try {
    const { name, location, userId } = req.body;

    const members = [req.user.id];
    const roleMap = new Map([[req.user.id.toString(), "ADMIN"]]);

    if (userId) {
      members.push(userId);
      roleMap.set(userId.toString(), "USER");
    }

    const home = await Home.create({
      name,
      location,
      owner: req.user.id,
      members,
      roleMap
    });

    res.status(201).json(home);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get all homes for logged-in user
export const getMyHomes = async (req, res) => {
  try {
    const homes = await Home.find({ members: req.user.id });
    res.json(homes);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Update home (Admin only)
export const updateHome = async (req, res) => {
  try {
    const { homeId } = req.params;
    const { name, location } = req.body;

    const home = await Home.findById(homeId);
    if (!home) return res.status(404).json({ msg: "Home not found" });

    // Admin check using user ID
    if (home.roleMap.get(req.user.id) !== "ADMIN") {
      return res.status(403).json({ msg: "Not authorized" });
    }

    if (name) home.name = name;
    if (location) home.location = location;

    await home.save();
    res.json({ msg: "Home updated", home });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Delete home (Admin only)
export const deleteHome = async (req, res) => {
  try {
    const { homeId } = req.params;

    const home = await Home.findById(homeId);
    if (!home) return res.status(404).json({ msg: "Home not found" });

    // 🔐 Admin check
    if (home.roleMap.get(req.user.id) !== "ADMIN") {
      return res.status(403).json({ msg: "Admins only" });
    }

    // 🔎 Get rooms
    const rooms = await Room.find({ home: homeId }).select("_id");

    const roomIds = rooms.map(r => r._id);

    // 🧹 DELETE DEVICES
    await Device.deleteMany({ room: { $in: roomIds } });

    // 🧹 DELETE ROOMS
    await Room.deleteMany({ home: homeId });

    // 🧹 DELETE HOME
    await Home.findByIdAndDelete(homeId);

    res.json({ msg: "Home, rooms and devices deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Invite a user to home (Admin only)
export const inviteUser = async (req, res) => {
  try {
    const { homeId } = req.params;
    const { email, role } = req.body;

    const home = await Home.findById(homeId);
    if (!home) return res.status(404).json({ msg: "Home not found" });

    // Admin check using user ID
    if (home.roleMap.get(req.user.id) !== "ADMIN") {
      return res.status(403).json({ msg: "Not authorized" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (!home.members.includes(user._id)) {
      home.members.push(user._id);
    }
    home.roleMap.set(user._id.toString(), role || "USER");
    await home.save();

    res.json({ msg: "User invited", home });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};