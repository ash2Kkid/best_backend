import Room from "../models/Room.js";
import Home from "../models/Home.js";

/**
 * CREATE ROOM (Admin only)
 * POST /admin/homes/:homeId/rooms
 */
export const createRoom = async (req, res) => {
  try {
    const { homeId } = req.params;
    const { name } = req.body;

    const home = await Home.findById(homeId);
    if (!home) return res.status(404).json({ msg: "Home not found" });

    if (home.roleMap.get(req.user.id) !== "ADMIN") {
      return res.status(403).json({ msg: "Admins only" });
    }

    const room = await Room.create({
      name,
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

    if (!home.members.includes(req.user.id)) {
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

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ msg: "Room not found" });

    const home = await Home.findById(room.home);
    if (home.roleMap.get(req.user.id) !== "ADMIN") {
      return res.status(403).json({ msg: "Admins only" });
    }

    room.name = name || room.name;
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
    if (home.roleMap.get(req.user.id) !== "ADMIN") {
      return res.status(403).json({ msg: "Admins only" });
    }

    await Room.findByIdAndDelete(roomId);
    res.json({ msg: "Room deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};