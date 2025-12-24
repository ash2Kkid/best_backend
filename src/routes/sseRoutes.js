import express from "express";
import { addClient, removeClient } from "../config/sse.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/events", auth, (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders();

  addClient(req.user.id, res);

  console.log(`🔌 SSE connected: ${req.user.id}`);

  req.on("close", () => {
    removeClient(req.user.id, res);
    console.log(`❌ SSE disconnected: ${req.user.id}`);
  });
});

export default router;