import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { registerDevice, getMyDevices, sendCommand } from "../controllers/deviceController.js";

const router = express.Router();

router.post("/register", authMiddleware, registerDevice);
router.get("/my", authMiddleware, getMyDevices);
router.post("/cmd", authMiddleware, sendCommand);

export default router;
