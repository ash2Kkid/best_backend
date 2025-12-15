import { Router } from "express";
import auth from "../middleware/auth.js";
import {
  getDevicesByRoom,
  sendCommand
} from "../controllers/deviceController.js";

const router = Router();

router.get("/rooms/:roomId", auth, getDevicesByRoom);
router.post("/cmd", auth, sendCommand);

export default router;