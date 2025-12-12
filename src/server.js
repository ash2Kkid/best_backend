import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import mqttClient from "./config/mqtt.js";
import SensorData from "./models/SensorData.js";

// MongoDB connection
connectDB();

// MQTT message handler
mqttClient.on("message", async (topic, message) => {
  try {
    const deviceId = topic.split("/")[1];

    await SensorData.create({
      deviceId,
      data: JSON.parse(message.toString())
    });

    console.log("Saved data for device:", deviceId);
  } catch (err) {
    console.error("Error saving MQTT data:", err.message);
  }
});

const app = express();
app.use(cors());
app.use(express.json());

// Routes (add .js extension for ESM)
import authRoutes from "./routes/authRoutes.js";
import deviceRoutes from "./routes/devicesRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";

app.use("/auth", authRoutes);
app.use("/device", deviceRoutes);
app.use("/data", dataRoutes);

app.listen(5000, () => console.log("Server running on 5000"));
