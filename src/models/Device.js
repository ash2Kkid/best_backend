import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    // ---------------- BASIC ----------------
    deviceId: { type: String, unique: true, required: true },
    name: { type: String, required: true },

    // ---------------- OWNERSHIP ----------------
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    home: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Home",
      default: null // assigned after approval
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      default: null // assigned after approval
    },

    // ---------------- SECURITY ----------------
    deviceSecret: {
      type: String,
      default: null // generated after approval
    },

    // ---------------- ONBOARDING ----------------
    status: {
      type: String,
      enum: ["unregistered", "pending", "active", "rejected"],
      default: "unregistered"
    },

    provisioningKey: {
      type: String,
      default: null
    },

    provisioningExpiresAt: {
      type: Date,
      default: null
    },

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

    // ---------------- NOTIFICATIONS ----------------
    notifiedOffline: {
      type: Boolean,
      default: false
    },

    // ---------------- FLEX DATA ----------------
    meta: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true }
);

export default mongoose.model("Device", deviceSchema);