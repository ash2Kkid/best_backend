import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
  name: String,
  deviceId: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const device = mongoose.model("Device", deviceSchema);

export default device;
