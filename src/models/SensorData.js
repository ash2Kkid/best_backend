import mongoose from "mongoose";

const sensorDataSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  topic: { type: String },
  data: { type: Object },
  timestamp: { type: Date, default: Date.now }
});

const SensorData = mongoose.model("SensorData", sensorDataSchema);
export default SensorData;
