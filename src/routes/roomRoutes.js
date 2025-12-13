import express from "express";
import auth from "../middleware/auth.js";
import { createRoom, getRoomsByHome } from "../controllers/roomController.js";

const router = express.Router();
router.use(auth);

router.post("/", createRoom);
router.get("/:homeId", getRoomsByHome);

export default router;
