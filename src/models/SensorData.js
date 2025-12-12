import mongoose from "mongoose";

const sensorDataSchema = new mongoose.Schema({
  deviceId: String,
  timestamp: { type: Date, default: Date.now },
  data: Object
});

const sensorData = mongoose.model("SensorData", sensorDataSchema);

export default sensorData;