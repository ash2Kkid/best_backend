import { Router } from "express";
import auth from "../middleware/auth.js";
import adminOnly from "../middleware/adminOnly.js";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/adminController.js";

const router = Router();

// Admin-only users CRUD
router.get("/users", auth, adminOnly, getAllUsers);
router.post("/users", auth, adminOnly, createUser);
router.put("/users/:userId", auth, adminOnly, updateUser);
router.delete("/users/:userId", auth, adminOnly, deleteUser);

export default router;