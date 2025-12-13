import express from "express";
import { auth } from "../middleware/auth.js";
import { createHome, myHomes } from "../controllers/homeController.js";

const router = express.Router();

router.post("/", auth, createHome);
router.get("/my", auth, myHomes);

export default router;
