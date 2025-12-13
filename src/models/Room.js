import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  home: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Home",
    required: true
  },
  name: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model("Room", RoomSchema);
