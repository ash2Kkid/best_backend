require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const mqttClient = require("./config/mqtt");
const SensorData = require("./models/SensorData");

connectDB();

mqttClient.on("message", async (topic, message) => {
  const deviceId = topic.split("/")[1];

  await SensorData.create({
    deviceId,
    data: JSON.parse(message.toString())
  });

  console.log("Saved data for device:", deviceId);
});

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", require("./routes/authRoutes"));
app.use("/device", require("./routes/deviceRoutes"));
app.use("/data", require("./routes/dataRoutes"));

app.listen(5000, () => console.log("Server running on 5000"));
