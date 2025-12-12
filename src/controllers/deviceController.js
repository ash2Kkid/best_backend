import Device from "../models/Device.js";
import mqttClient from "../config/mqtt.js";

// Register a new device
export const registerDevice = async (req, res) => {
  const { name, deviceId } = req.body;

  try {
    const device = await Device.create({
      name,
      deviceId,
      owner: req.user
    });

    res.json(device);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Get all devices owned by the logged-in user
export const getMyDevices = async (req, res) => {
  try {
    const devices = await Device.find({ owner: req.user });
    res.json(devices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Send a command to device via MQTT
export const sendCommand = async (req, res) => {
  const { deviceId, command } = req.body;

  if (!deviceId || !command) {
    return res.status(400).json({ msg: "Missing fields" });
  }

  try {
    const topic = `device/${deviceId}/cmd`;
    mqttClient.publish(topic, JSON.stringify(command));

    res.json({ msg: "Command sent", topic });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "MQTT Error" });
  }
};
