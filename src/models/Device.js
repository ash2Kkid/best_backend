import mongoose from "mongoose";

const DeviceSchema = new mongoose.Schema({
  home: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Home",
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room"
  },
  name: String,
  deviceId: { type: String, unique: true },
  deviceSecret: String,
  online: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Device", DeviceSchema);
