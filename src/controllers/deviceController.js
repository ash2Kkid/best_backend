import Device from "../models/Device.js";
import Home from "../models/Home.js";
import crypto from "crypto";
import mqttClient from "../config/mqtt.js";

/**
 * Register device (ADMIN only)
 */
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
    deviceId,
    deviceSecret
  });
};

/**
 * Get devices for a home
 */
export const getDevicesByHome = async (req, res) => {
  const { homeId } = req.params;
  const devices = await Device.find({ home: homeId }).select("-deviceSecret");
  res.json(devices);
};

/**
 * Send command to device
 */
export const sendCommand = async (req, res) => {
  const { deviceId, command } = req.body;

  const device = await Device.findOne({ deviceId });
  if (!device) return res.status(404).json({ msg: "Device not found" });

  const topic = `device/bnest/${deviceId}/cmd`;

  mqttClient.publish(
    topic,
    JSON.stringify({ cmd: command }),
    { qos: 1 }
  );

  res.json({ msg: "Command sent" });
};
