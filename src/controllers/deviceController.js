import Device from "../models/Device.js";
import Room from "../models/Room.js";
import Home from "../models/Home.js";
import crypto from "crypto";
import mqttClient from "../config/mqtt.js";

// ADMIN: Register device
export const registerDevice = async (req, res) => {
  try {
    const { homeId, roomId, name, deviceId } = req.body;

    const home = await Home.findById(homeId);
    if (!home) return res.status(404).json({ msg: "Home not found" });

    if (home.roleMap.get(req.user.id) !== "ADMIN") {
      return res.status(403).json({ msg: "Admins only" });
    }

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ msg: "Room not found" });

    const deviceSecret = crypto.randomBytes(24).toString("hex");

    const device = await Device.create({
      deviceId,
      name,
      home: homeId,
      room: roomId,
      deviceSecret
    });

    res.status(201).json({
      deviceId: device.deviceId,
      deviceSecret
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// USER + ADMIN: List devices by room
export const getDevicesByRoom = async (req, res) => {
  const { roomId } = req.params;
  const devices = await Device.find({ room: roomId, isActive: true });
  res.json(devices);
};

// ADMIN: Update device
export const updateDevice = async (req, res) => {
  const device = await Device.findByIdAndUpdate(
    req.params.deviceId,
    req.body,
    { new: true }
  );
  res.json(device);
};

// ADMIN: Delete device
export const deleteDevice = async (req, res) => {
  await Device.findByIdAndDelete(req.params.deviceId);
  res.json({ msg: "Device deleted" });
};

// USER + ADMIN: Send command to device
export const sendCommand = async (req, res) => {
  try {
    const { deviceId, command } = req.body;

    if (!deviceId || !command) {
      return res.status(400).json({ msg: "deviceId and command required" });
    }

    const device = await Device.findOne({ deviceId });
    if (!device) return res.status(404).json({ msg: "Device not found" });

    const home = await Home.findById(device.home);
    if (!home) return res.status(404).json({ msg: "Home not found" });

    // 🔐 Authorization: must belong to the home
    const isMember = home.members
      .map(id => id.toString())
      .includes(req.user.id);

    if (!isMember) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    // 📡 Publish command
    mqttClient.publish(
      `device/bnest/${deviceId}/cmd`,
      JSON.stringify(command)
    );

    res.json({ msg: "Command sent" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};