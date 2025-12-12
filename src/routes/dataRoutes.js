import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getDeviceData } from "../controllers/dataController.js";

const router = Router();

router.get("/:deviceId", authMiddleware, getDeviceData);

export default router;
