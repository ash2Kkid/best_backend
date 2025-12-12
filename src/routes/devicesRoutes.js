import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { registerDevice, getMyDevices, sendCommand } from "../controllers/deviceController.js";

const router = Router();
router.post("/register", auth, registerDevice);
router.get("/my", auth, getMyDevices);
router.post("/cmd", auth, sendCommand);
export default router;
