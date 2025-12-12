import Device from "../models/Device.js";
import mqttClient from "../config/mqtt.js";

export const registerDevice = async (req, res) => {
  try {
    const { name, deviceId } = req.body;
    const device = await Device.create({ name, deviceId, owner: req.user });
    res.json(device);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error registering device" });
  }
};

export const getMyDevices = async (req, res) => {
  try {
    const devices = await Device.find({ owner: req.user });
    res.json(devices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching devices" });
  }
};

export const sendCommand = async (req, res) => {
  try {
    const { deviceId, command } = req.body;
    if (!deviceId || !command) return res.status(400).json({ msg: "Missing deviceId or command" });

    const prefix = process.env.PREFIX || "bnest";
    const topic = `device/${prefix}/${deviceId}/cmd`;
    mqttClient.publish(topic, JSON.stringify(command), { qos: 0 }, (err) => {
      if (err) console.error("MQTT publish error:", err);
    });

    res.json({ msg: "Command published", topic });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error sending command" });
  }
};
