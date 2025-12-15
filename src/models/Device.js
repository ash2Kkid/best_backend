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
    isActive: { type: Boolean, default: true },

    meta: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true }
);

export default mongoose.model("Device", deviceSchema);