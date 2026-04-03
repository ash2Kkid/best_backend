import { Router } from "express";
import auth from "../middleware/auth.js";
import adminOnly from "../middleware/adminOnly.js";

import {
  getDevicesByRoom,
  sendCommand,
  getDeviceState,

  // 🆕 onboarding
  pairRequest,
  getProvisionStatus,
  approveDevice,
  getPendingRequests,
  rejectDevice

} from "../controllers/deviceController.js";

const router = Router();


// ---------------- EXISTING ----------------
router.get("/rooms/:roomId", auth, getDevicesByRoom);
router.post("/cmd", auth, sendCommand);
router.get("/:deviceId/state", auth, getDeviceState);


// ---------------- 🆕 ONBOARDING ----------------

// 📱 User scans QR
router.post("/pair-request", auth, pairRequest);

// ⚙️ Device polls for approval (NO auth)
router.get("/provision-status", getProvisionStatus);


// ---------------- 👨‍💼 ADMIN ----------------

// Get all pending requests
router.get("/pending", auth, adminOnly, getPendingRequests);

// Approve device
router.post("/approve", auth, adminOnly, approveDevice);

// Reject device
router.post("/reject", auth, adminOnly, rejectDevice);


export default router;