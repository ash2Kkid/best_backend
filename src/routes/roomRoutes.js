import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  createRoom,
  getRoomsByHome,
  updateRoom,
  deleteRoom
} from "../controllers/roomController.js";

const router = Router();

// Admin routes
router.post("/admin/homes/:homeId/rooms", auth, createRoom);
router.put("/admin/rooms/:roomId", auth, updateRoom);
router.delete("/admin/rooms/:roomId", auth, deleteRoom);

// User-accessible
router.get("/homes/:homeId/rooms", auth, getRoomsByHome);

export default router;