import express from "express";
import { registerPushToken } from "../controllers/notificationController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/**
 * Register / update a push notification token
 */
router.post("/push/register", auth, registerPushToken);

export default router;