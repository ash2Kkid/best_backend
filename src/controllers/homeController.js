import Home from "../models/Home.js";
import User from "../models/User.js";

// Create a new home (Admin only)
export const createHome = async (req, res) => {
  try {
    const { name, location } = req.body;

    const home = await Home.create({
      name,
      location,
      owner: req.user.id,          // Use only ID
      members: [req.user.id],      // array of IDs
      roleMap: { [req.user.id]: "ADMIN" } // key = user ID
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

    // Admin check
    if (home.roleMap.get(req.user.id) !== "ADMIN") {
      return res.status(403).json({ msg: "Not authorized" });
    }

    await Home.findByIdAndDelete(homeId); // ✅

    res.json({ msg: "Home deleted" });
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