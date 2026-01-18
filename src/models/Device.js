import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    deviceId: { type: String, unique: true, required: true },
    name: { type: String, required: true },

    home: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Home",
      required: true
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },

    deviceSecret: { type: String, required: true },

    // ---------------- CORE STATE ----------------
    state: {
      type: String,
      enum: ["ON", "OFF"],
      default: "OFF"
    },

    lastStateSync: {
      type: Date,
      default: null
    },

    // ---------------- LIVENESS ----------------
    isActive: {
      type: Boolean,
      default: false
    },

    lastSeen: {
      type: Date,
      default: null
    },

    // ---------------- NOTIFICATION CONTROL ----------------
    notifiedOffline: {
      type: Boolean,
      default: false
    },

    meta: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true }
);

// ✅ THIS LINE WAS MISSING
export default mongoose.model("Device", deviceSchema);