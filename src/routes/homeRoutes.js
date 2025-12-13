import express from "express";
import { createHome, getMyHomes, inviteUser } from "../controllers/homeController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// All routes require JWT auth
router.use(authMiddleware);

// Create a home (Admin)
router.post("/", createHome);

// Fetch homes for logged-in user
router.get("/my", getMyHomes);

// Invite a user to home
router.post("/:homeId/invite", inviteUser);

export default router;
