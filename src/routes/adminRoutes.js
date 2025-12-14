import { Router } from "express";
import auth from "../middleware/auth.js";
import adminOnly from "../middleware/adminOnly.js";
import { getAllUsers } from "../controllers/adminController.js";

const router = Router();

router.get("/users", auth, adminOnly, getAllUsers);

export default router;