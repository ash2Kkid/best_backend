import Device from "../models/Device.js";
import Home from "../models/Home.js";
import crypto from "crypto";

export const registerDevice = async (req, res) => {
  const { homeId, roomId, name, deviceId } = req.body;

  const home = await Home.findById(homeId);
  if (!home) return res.status(404).json({ msg: "Home not found" });

  if (home.roleMap.get(req.user) !== "ADMIN") {
    return res.status(403).json({ msg: "Admin only" });
  }

  const deviceSecret = crypto.randomBytes(24).toString("hex");

  const device = await Device.create({
    home: homeId,
    room: roomId,
    name,
    deviceId,
    deviceSecret
  });

  res.status(201).json({
    deviceId: device.deviceId,
    deviceSecret
  });
};

export const getDevicesByHome = async (req, res) => {
  const { homeId } = req.params;
  const devices = await Device.find({ home: homeId });
  res.json(devices);
};
