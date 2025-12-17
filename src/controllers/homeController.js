import Home from "../models/Home.js";
import User from "../models/User.js";
import Room from "../models/Room.js";
import Device from "../models/Device.js";

/**
 * CREATE HOME (Admin only)
 */
export const createHome = async (req, res) => {
  try {
    const { name, location, userId } = req.body;

    const adminId = req.user.id.toString();

    const members = [adminId];
    const roleMap = new Map([[adminId, "ADMIN"]]);

    if (userId && userId !== adminId) {
      members.push(userId);
      roleMap.set(userId.toString(), "USER");
    }

    const home = await Home.create({
      name,
      location,
      owner: adminId,
      members,
      roleMap
    });

    res.status(201).json(home);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * GET HOMES FOR LOGGED-IN USER
 */
export const getMyHomes = async (req, res) => {
  try {
    const homes = await Home.find({ members: req.user.id.toString() });
    res.json(homes);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * UPDATE HOME (Admin only)
 * ✅ Allows changing assigned USER
 */
export const updateHome = async (req, res) => {
  try {
    const { homeId } = req.params;
    const { name, location, userId } = req.body;

    const adminId = req.user.id.toString();

    const home = await Home.findById(homeId);
    if (!home) return res.status(404).json({ msg: "Home not found" });

    // 🔐 ADMIN CHECK (FIXED)
    if (home.roleMap.get(adminId) !== "ADMIN") {
      return res.status(403).json({ msg: "Admins only" });
    }

    if (name) home.name = name;
    if (location) home.location = location;

    // 🔄 UPDATE ASSIGNED USER
    if (userId) {
      // Remove all non-admin users
      home.members = home.members.filter(
        id => home.roleMap.get(id.toString()) === "ADMIN"
      );

      // Reset roleMap except admin
      home.roleMap.forEach((_, key) => {
        if (key !== adminId) home.roleMap.delete(key);
      });

      // Add new user
      home.members.push(userId);
      home.roleMap.set(userId.toString(), "USER");
    }

    await home.save();
    res.json({ msg: "Home updated", home });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * DELETE HOME (Admin only)
 * ✅ FIXED
 */
export const deleteHome = async (req, res) => {
  try {
    const { homeId } = req.params;

    const home = await Home.findById(homeId);
    if (!home) return res.status(404).json({ msg: "Home not found" });

    if (home.roleMap.get(req.user.id) !== "ADMIN") {
      return res.status(403).json({ msg: "Not authorized" });
    }

    // 🔥 Get all rooms of this home
    const rooms = await Room.find({ home: homeId }).select("_id");

    const roomIds = rooms.map(r => r._id);

    // 🧹 Delete all devices in those rooms
    await Device.deleteMany({ room: { $in: roomIds } });

    // 🧹 Delete rooms
    await Room.deleteMany({ home: homeId });

    // 🧹 Delete home
    await Home.findByIdAndDelete(homeId);

    res.json({ msg: "Home, rooms and devices deleted" });
  } catch (err) {
    console.error("DELETE HOME ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

/**
 * INVITE USER TO HOME (Admin only)
 */
export const inviteUser = async (req, res) => {
  try {
    const { homeId } = req.params;
    const { email, role } = req.body;

    const adminId = req.user.id.toString();

    const home = await Home.findById(homeId);
    if (!home) return res.status(404).json({ msg: "Home not found" });

    if (home.roleMap.get(adminId) !== "ADMIN") {
      return res.status(403).json({ msg: "Admins only" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (!home.members.map(String).includes(user._id.toString())) {
      home.members.push(user._id);
    }

    home.roleMap.set(user._id.toString(), role || "USER");
    await home.save();

    res.json({ msg: "User invited", home });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


