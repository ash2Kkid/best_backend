import mongoose from "mongoose";
import Device from "../models/Device.js";
import Room from "../models/Room.js";
import Home from "../models/Home.js";
import crypto from "crypto";
import mqttClient from "../config/mqtt.js";

// ADMIN: Register device
// ADMIN: Register device
export const registerDevice = async (req, res) => {
  try {
    const { homeId, roomId, name, deviceId } = req.body;

    if (!homeId || !roomId || !name || !deviceId) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(homeId) ||
      !mongoose.Types.ObjectId.isValid(roomId)
    ) {
      return res.status(400).json({ msg: "Invalid homeId or roomId" });
    }

    const home = await Home.findById(homeId);
    if (!home) return res.status(404).json({ msg: "Home not found" });

    if (home.roleMap.get(req.user.id) !== "ADMIN") {
      return res.status(403).json({ msg: "Admins only" });
    }

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ msg: "Room not found" });

    // 🔒 CRITICAL LINK CHECK (THIS WAS MISSING)
    if (room.home.toString() !== homeId) {
      return res
        .status(400)
        .json({ msg: "Room does not belong to this home" });
    }

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
    console.error("REGISTER DEVICE ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// USER + ADMIN: List devices by room
export const getDevicesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    if (!roomId) return res.status(400).json({ msg: "roomId is required" });

    const devices = await Device.find({ room: roomId })
      .select("name deviceId isActive lastSeen home room") // add lastSeen
      .populate("home", "name")
      .populate("room", "name");

    res.json(devices);
  } catch (err) {
    console.error("getDevicesByRoom error:", err);
    res.status(500).json({ msg: err.message });
  }
};

// ADMIN: Update device
export const updateDevice = async (req, res) => {
  try {
    const device = await Device.findByIdAndUpdate(
      req.params.deviceId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!device) {
      return res.status(404).json({ msg: "Device not found" });
    }

    res.json(device);
  } catch (err) {
    console.error("UPDATE DEVICE ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// ADMIN: Delete device
export const deleteDevice = async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.deviceId);
    if (!device) {
      return res.status(404).json({ msg: "Device not found" });
    }
    res.json({ msg: "Device deleted" });
  } catch (err) {
    console.error("DELETE DEVICE ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

// USER + ADMIN: Send command to device
// USER + ADMIN: Send command to device
export const sendCommand = async (req, res) => {
  try {
    const { deviceId, command } = req.body;

    if (!deviceId || !command) {
      return res.status(400).json({ msg: "deviceId and command required" });
    }

    // Find device and ensure it is active
    const device = await Device.findOne({ deviceId, isActive: true });
    if (!device) return res.status(404).json({ msg: "Device not found" });

    // Check if user is a member of the home
    const home = await Home.findById(device.home);
    if (!home) return res.status(404).json({ msg: "Home not found" });

    const isMember = home.members
      .map(id => id.toString())
      .includes(req.user.id);

    if (!isMember) return res.status(403).json({ msg: "Not authorized" });

    if (!mqttClient.connected) {
      return res.status(503).json({ msg: "MQTT broker not connected" });
    }

    // Include deviceSecret in payload for ESP32 to verify
    const payload = JSON.stringify({
      command,
      deviceSecret: device.deviceSecret
    });

    mqttClient.publish(`device/bnest/${deviceId}/cmd`, payload);

    res.json({ msg: "Command sent" });
  } catch (err) {
    console.error("SEND COMMAND ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

export const testDeviceConnection = async (req, res) => {
  const { deviceId } = req.params;

  const device = await Device.findOne({ deviceId });
  if (!device) return res.status(404).json({ msg: "Device not found" });

  mqttClient.publish(
    `device/bnest/${deviceId}/cmd`,
    JSON.stringify({ command: "ping" })
  );

  res.json({ msg: "Ping sent to device" });
};

