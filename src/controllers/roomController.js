import Room from "../models/Room.js";
import Home from "../models/Home.js";
import Device from "../models/Device.js";

/**
 * CREATE ROOM (Admin only)
 * POST /admin/homes/:homeId/rooms
 */
export const createRoom = async (req, res) => {
  try {
    const { homeId } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ msg: "Room name is required" });
    }

    const home = await Home.findById(homeId);
    if (!home) return res.status(404).json({ msg: "Home not found" });

    if (home.roleMap.get(req.user.id) !== "ADMIN") {
      return res.status(403).json({ msg: "Admins only" });
    }

    // 🧠 Prevent duplicate room names inside same home
    const existing = await Room.findOne({
      home: homeId,
      name: name.trim()
    });

    if (existing) {
      return res
        .status(409)
        .json({ msg: "Room with this name already exists" });
    }

    const room = await Room.create({
      name: name.trim(),
      home: homeId
    });

    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * GET ROOMS FOR A HOME
 * GET /homes/:homeId/rooms
 */
export const getRoomsByHome = async (req, res) => {
  try {
    const { homeId } = req.params;

    const home = await Home.findById(homeId);
    if (!home) return res.status(404).json({ msg: "Home not found" });

    if (!home.members.some(m => m.toString() === req.user.id)) {
      return res.status(403).json({ msg: "Access denied" });
    }

    const rooms = await Room.find({ home: homeId });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * UPDATE ROOM (Admin only)
 * PUT /admin/rooms/:roomId
 */
export const updateRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ msg: "Room name is required" });
    }

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ msg: "Room not found" });

    const home = await Home.findById(room.home);
    if (!home) return res.status(404).json({ msg: "Home not found" });

    if (home.roleMap.get(req.user.id) !== "ADMIN") {
      return res.status(403).json({ msg: "Admins only" });
    }

    // 🧠 Prevent duplicate name on update
    const duplicate = await Room.findOne({
      _id: { $ne: roomId },
      home: room.home,
      name: name.trim()
    });

    if (duplicate) {
      return res
        .status(409)
        .json({ msg: "Another room with this name already exists" });
    }

    room.name = name.trim();
    await room.save();

    res.json(room);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

/**
 * DELETE ROOM (Admin only)
 * DELETE /admin/rooms/:roomId
 */
export const deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ msg: "Room not found" });

    const home = await Home.findById(room.home);
    if (!home) return res.status(404).json({ msg: "Home not found" });

    if (home.roleMap.get(req.user.id) !== "ADMIN") {
      return res.status(403).json({ msg: "Admins only" });
    }

    // 🧹 Cascade delete devices
    await Device.deleteMany({ room: roomId });

    // 🧹 Delete room
    await Room.findByIdAndDelete(roomId);

    res.json({ msg: "Room and its devices deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};