import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ["ADMIN", "USER"], default: "USER" }
});

export default mongoose.model("User", userSchema);
