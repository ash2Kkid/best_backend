import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
  name: { type: String },
  deviceId: { type: String, required: true, unique: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  lastData: { type: Object },
  lastUpdated: { type: Date }
});

const Device = mongoose.model("Device", deviceSchema);
export default Device;
