import Room from "../models/Room.js";
import Home from "../models/Home.js";

export const createRoom = async (req, res) => {
  const { homeId, name } = req.body;

  const home = await Home.findById(homeId);
  if (!home) return res.status(404).json({ msg: "Home not found" });

  if (!home.members.includes(req.user)) {
    return res.status(403).json({ msg: "Not authorized" });
  }

  const room = await Room.create({
    home: homeId,
    name
  });

  res.status(201).json(room);
};

export const getRoomsByHome = async (req, res) => {
  const { homeId } = req.params;

  const rooms = await Room.find({ home: homeId });
  res.json(rooms);
};
