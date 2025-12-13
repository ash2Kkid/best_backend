import mongoose from "mongoose";

const homeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      role: { type: String, enum: ["ADMIN", "USER"], default: "USER" }
    }
  ]
});

export default mongoose.model("Home", homeSchema);
