import express from "express";
import { createHome, getMyHomes, inviteUser } from "../controllers/homeController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

// All routes require JWT auth
router.use(auth);

// Create a home (Admin)
router.post("/", createHome);

// Fetch homes for logged-in user
router.get("/my", getMyHomes);

// Invite a user to home
router.post("/:homeId/invite", inviteUser);

export default router;
