import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { getDeviceData } from "../controllers/dataController.js";

const router = Router();
router.get("/:deviceId", auth, getDeviceData);
export default router;
