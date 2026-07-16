import mongoose from "mongoose";
import crypto from "crypto";

import Device from "../models/Device.js";
import Room from "../models/Room.js";
import Home from "../models/Home.js";

import { publishWithAck } from "../config/mqtt.js";


// =========================
// 🔐 ADMIN: REGISTER DEVICE (QR GENERATION)
// =========================
export const registerDevice = async (req, res) => {
  try {
    const { deviceId, name } = req.body;

    if (!deviceId || !name) {
      return res.status(400).json({ msg: "deviceId and name required" });
    }

    const existing = await Device.findOne({ deviceId });
    if (existing) {
      return res.status(400).json({ msg: "Device already exists" });
    }

    const provisioningKey = crypto.randomBytes(8).toString("hex");

    const device = await Device.create({
      deviceId,
      name,

      status: "unregistered",
      provisioningKey,
      provisioningExpiresAt: new Date(Date.now() + 10 * 60 * 1000)
    });

    res.status(201).json({
      msg: "Device registered for onboarding",
      deviceId,
      provisioningKey
    });

  } catch (err) {
    console.error("REGISTER DEVICE ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};


// =========================
// 📱 USER: REQUEST PAIRING (QR SCAN)
// =========================
export const pairRequest = async (req, res) => {
  try {
    const { deviceId, provisioningKey } = req.body;

    const device = await Device.findOne({ deviceId });

    if (!device) {
      return res.status(404).json({ msg: "Device not found" });
    }

    if (
      device.provisioningKey !== provisioningKey ||
      device.provisioningExpiresAt < new Date()
    ) {
      return res.status(400).json({ msg: "Invalid or expired QR" });
    }

    device.status = "pending";
    device.requestedBy = req.user.id;

    await device.save();

    res.json({ msg: "Request sent for admin approval" });

  } catch (err) {
    console.error("PAIR REQUEST ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};


// =========================
// 👨‍💼 ADMIN: GET PENDING DEVICES
// =========================
export const getPendingRequests = async (req, res) => {
  try {
    const devices = await Device.find({ status: "pending" })
      .populate("requestedBy", "email")
      .select("deviceId name requestedBy createdAt");

    res.json(devices);

  } catch (err) {
    console.error("GET PENDING ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};


// =========================
// 👨‍💼 ADMIN: APPROVE DEVICE
// =========================
export const approveDevice = async (req, res) => {
  try {
    const { deviceId, homeId, roomId } = req.body;

    const device = await Device.findOne({ deviceId });

    if (!device) {
      return res.status(404).json({ msg: "Device not found" });
    }

    if (device.status !== "pending") {
      return res.status(400).json({ msg: "Device not awaiting approval" });
    }

    // validate home + room
    const home = await Home.findById(homeId);
    const room = await Room.findById(roomId);

    if (!home || !room) {
      return res.status(404).json({ msg: "Invalid home or room" });
    }

    if (room.home.toString() !== homeId) {
      return res.status(400).json({ msg: "Room does not belong to home" });
    }

    // 🔐 final secret for MQTT/auth
    const deviceSecret = crypto.randomBytes(24).toString("hex");

    device.status = "active";
    device.home = homeId;
    device.room = roomId;
    device.owner = device.requestedBy;
    device.deviceSecret = deviceSecret;

    // cleanup provisioning
    device.provisioningKey = null;
    device.provisioningExpiresAt = null;

    await device.save();

    res.json({
      msg: "Device approved successfully",
      deviceSecret
    });

  } catch (err) {
    console.error("APPROVE DEVICE ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};


// =========================
// 👨‍💼 ADMIN: REJECT DEVICE
// =========================
export const rejectDevice = async (req, res) => {
  try {
    const { deviceId } = req.body;

    const device = await Device.findOne({ deviceId });

    if (!device) {
      return res.status(404).json({ msg: "Device not found" });
    }

    device.status = "rejected";
    device.requestedBy = null;

    await device.save();

    res.json({ msg: "Device rejected" });

  } catch (err) {
    console.error("REJECT DEVICE ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};


// =========================
// ⚙️ DEVICE: POLL FOR STATUS
// =========================
export const getProvisionStatus = async (req, res) => {
  try {
    const { deviceId } = req.query;

    const device = await Device.findOne({ deviceId });

    if (!device) {
      return res.status(404).json({ msg: "Device not found" });
    }

    if (device.status === "active") {
      return res.json({
        status: "approved",
        deviceSecret: device.deviceSecret
      });
    }

    res.json({ status: device.status });

  } catch (err) {
    console.error("PROVISION STATUS ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};


// =========================
// 📦 USER + ADMIN: LIST DEVICES
// =========================
export const getDevicesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const devices = await Device.find({ room: roomId })
      .select("name deviceId deviceSecret isActive lastSeen home room")
      .populate("home", "name")
      .populate("room", "name");

    const formatted = devices.map(d => ({
      _id: d._id,
      name: d.name,
      deviceId: d.deviceId,
      deviceSecret: d.deviceSecret,
      isActive: d.isActive,
      lastSeen: d.lastSeen,
      homeName: d.home?.name,
      roomName: d.room?.name
    }));

    res.json(formatted);

  } catch (err) {
    console.error("GET DEVICES ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};


// =========================
// 👨‍💼 ADMIN: UPDATE DEVICE
// =========================
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


// =========================
// 👨‍💼 ADMIN: DELETE DEVICE
// =========================
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


// =========================
// 📡 USER + ADMIN: SEND COMMAND
// =========================
export const sendCommand = async (req, res) => {
  try {
    const { deviceId, command } = req.body;

    if (!deviceId || !command) {
      return res.status(400).json({ msg: "deviceId and command required" });
    }

    const device = await Device.findOne({ deviceId, isActive: true });

    if (!device) {
      return res.status(404).json({ msg: "Device offline or not found" });
    }

    const home = await Home.findById(device.home);

    if (!home) return res.status(404).json({ msg: "Home not found" });

    const isMember = home.members
      .map(id => id.toString())
      .includes(req.user.id);

    if (!isMember) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    const cmdId = crypto.randomUUID();

    const payload = {
      cmdId,
      command,
      deviceSecret: device.deviceSecret
    };

    const ackStatus = await publishWithAck(
      `device/bnest/${deviceId}/cmd`,
      payload,
      cmdId,
      5000
    );

    if (ackStatus !== "OK") {
      return res.status(500).json({ msg: "Device rejected command" });
    }

    device.state = command;
    await device.save();

    res.json({ msg: "Command executed", state: command });

  } catch (err) {
    console.error("SEND COMMAND ERROR:", err.message);
    res.status(504).json({ msg: "Device did not acknowledge command" });
  }
};


// =========================
// 📊 GET DEVICE STATE
// =========================
export const getDeviceState = async (req, res) => {
  try {
    const device = await Device.findOne({ deviceId: req.params.deviceId });

    if (!device) {
      return res.status(404).json({ msg: "Device not found" });
    }

    res.json({
      deviceId: device.deviceId,
      state: device.state,
      isOnline: device.isActive
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};