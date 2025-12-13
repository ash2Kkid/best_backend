import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import mqttClient from "./config/mqtt.js";

import authRoutes from "./routes/authRoutes.js";
import devicesRoutes from "./routes/devicesRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";

import SensorData from "./models/SensorData.js";
import homeRoutes from "./routes/homeRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";






const PORT = process.env.PORT || 5000;
const PREFIX = process.env.PREFIX || "bnest";

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/devices", devicesRoutes);
app.use("/data", dataRoutes);
app.use("/api/homes", homeRoutes);
app.use("/api/rooms", roomRoutes);

// DB + MQTT init
connectDB();

// MQTT message handling: only subscribe to device/<PREFIX>/+/data and accept valid JSON
mqttClient.on("connect", () => {
  console.log("MQTT Connected (server)");
  const topic = `device/${PREFIX}/+/data`;
  mqttClient.subscribe(topic, (err) => {
    if (err) console.error("Failed to subscribe:", err);
    else console.log("Subscribed to:", topic);
  });
});

mqttClient.on("message", async (topic, message) => {
  try {
    // topic format: device/<PREFIX>/<deviceId>/data
    const parts = topic.split("/");
    if (parts.length < 4) return; // unexpected topic

    const prefix = parts[1];
    const deviceId = parts[2];
    const suffix = parts[3];

    if (prefix !== PREFIX || suffix !== "data") return; // ignore others

    const text = message.toString();

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.warn(`Invalid JSON from ${deviceId}, skipping. payload: ${text}`);
      return; // strict JSON-only policy
    }

    // optional: ensure deviceId consistency (either in payload or from topic)
    if (!data.deviceId) data.deviceId = deviceId;

    // Save
    await SensorData.create({
      deviceId,
      topic,
      data,
      timestamp: new Date()
    });

    console.log(`Saved data from ${deviceId}`);
  } catch (err) {
    console.error("Error saving MQTT data:", err);
  }
});

app.get("/", (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || "dev" }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Available at your primary URL (Render will show actual URL)`);
});
