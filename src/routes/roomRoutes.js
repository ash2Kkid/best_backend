import { Router } from "express";
import auth from "../middleware/auth.js";
import { getRoomsByHome } from "../controllers/roomController.js";

const router = Router();

/*
  USER SIDE
  =========
  Read-only access
*/

// Get rooms of a home (member access)
router.get("/homes/:homeId/rooms", auth, getRoomsByHome);

export default router;