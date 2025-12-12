import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  devices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Device" }]
});

const User = mongoose.model("User", userSchema);
export default User;
