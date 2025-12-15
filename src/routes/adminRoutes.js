import { Router } from "express";
import auth from "../middleware/auth.js";
import adminOnly from "../middleware/adminOnly.js";
import {
  getAllUsers,
  getUsersWithHomes,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/adminController.js";
import {
    getMyHomes,
    createHome,
    updateHome,
    deleteHome,
} from "../controllers/homeController.js";
import {
  createRoom,
  getRoomsByHome,
  updateRoom,
  deleteRoom
} from "../controllers/roomController.js";
import {
  registerDevice,
  updateDevice,
  deleteDevice,
  getDevicesByRoom
} from "../controllers/deviceController.js";

const router = Router();

// Admin-only users CRUD
router.get("/users", auth, adminOnly, getAllUsers);
router.get("/users/hierarchy", auth, adminOnly, getUsersWithHomes);
router.post("/users", auth, adminOnly, createUser);
router.put("/users/:userId", auth, adminOnly, updateUser);
router.delete("/users/:userId", auth, adminOnly, deleteUser);

// Homes CRUD (admin only)
router.get("/homes", auth, adminOnly, getMyHomes);
router.post("/homes", auth, adminOnly, createHome);
router.put("/homes/:homeId", auth, adminOnly, updateHome);
router.delete("/homes/:homeId", auth, adminOnly, deleteHome);

// Rooms CRUD (admin only)
router.post("/homes/:homeId/rooms", auth,adminOnly, createRoom);
router.put("/rooms/:roomId", auth, adminOnly, updateRoom);
router.delete("/rooms/:roomId", auth, adminOnly, deleteRoom);
router.get("/homes/:homeId/rooms", auth, adminOnly, getRoomsByHome);

// Devices CRUD (admin only)
router.post("/devices", auth, adminOnly, registerDevice);
router.put("/devices/:deviceId", auth, adminOnly, updateDevice);
router.delete("/devices/:deviceId", auth, adminOnly, deleteDevice);
router.get("/rooms/:roomId/devices", auth, adminOnly, getDevicesByRoom);

export default router;











