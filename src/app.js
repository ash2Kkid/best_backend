import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import deviceRoutes from "./routes/devicesRoutes.js";

const app = express();
app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/devices", deviceRoutes);

export default app;
