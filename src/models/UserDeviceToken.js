import mongoose from "mongoose";

const userDeviceTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    token: {
      type: String,
      required: true
    },
    platform: {
      type: String,
      enum: ["android", "ios", "web"],
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("UserDeviceToken", userDeviceTokenSchema);