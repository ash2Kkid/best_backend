import express from "express";
import auth from "../middleware/auth.js";
import {
  registerDevice,
  getDevicesByHome
} from "../controllers/deviceController.js";

const router = express.Router();
router.use(auth);

// Admin registers a device for a home/room
router.post("/", registerDevice);

// Get devices belonging to a home
router.get("/:homeId", getDevicesByHome);

router.post("/cmd", auth, sendCommand);


export default router;
