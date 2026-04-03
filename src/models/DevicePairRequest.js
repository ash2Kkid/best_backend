const mongoose = require("mongoose");

const pairRequestSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
}, { timestamps: true });

module.exports = mongoose.model("DevicePairRequest", pairRequestSchema);