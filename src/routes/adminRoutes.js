import { Router } from "express";
import auth from "../middleware/auth.js";
import adminOnly from "../middleware/adminOnly.js";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/adminController.js";
import {
    getAllHomes,
    createHome,
    updateHome,
    deleteHome,
} from "../controllers/homeController.js";

const router = Router();

// Admin-only users CRUD
router.get("/users", auth, adminOnly, getAllUsers);
router.post("/users", auth, adminOnly, createUser);
router.put("/users/:userId", auth, adminOnly, updateUser);
router.delete("/users/:userId", auth, adminOnly, deleteUser);

// Homes CRUD (admin only)
router.get("/homes", auth, adminOnly, getAllHomes);
router.post("/homes", auth, adminOnly, createHome);
router.put("/homes/:homeId", auth, adminOnly, updateHome);
router.delete("/homes/:homeId", auth, adminOnly, deleteHome);

export default router;