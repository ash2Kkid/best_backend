import mongoose from "mongoose";

const HomeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  roleMap: { type: Map, of: String }, // userId -> role: ADMIN | USER
}, { timestamps: true });

export default mongoose.model("Home", HomeSchema);
