const mongoose = require("mongoose");

const sensorDataSchema = new mongoose.Schema({
  deviceId: String,
  timestamp: { type: Date, default: Date.now },
  data: Object
});

module.exports = mongoose.model("SensorData", sensorDataSchema);
