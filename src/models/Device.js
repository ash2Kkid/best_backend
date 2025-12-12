const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  name: String,
  deviceId: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Device", deviceSchema);
