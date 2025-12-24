import mqtt from "mqtt";
import Device from "../models/Device.js";
import Home from "../models/Home.js";
import { broadcastToUser } from "../config/sse.js";

/* --------------------------------------------------
   MQTT CONFIG
-------------------------------------------------- */
const MQTT_HOST = process.env.MQTT_HOST || "mqtt://broker.hivemq.com";

const options = {};
if (process.env.MQTT_USERNAME) options.username = process.env.MQTT_USERNAME;
if (process.env.MQTT_PASSWORD) options.password = process.env.MQTT_PASSWORD;

/* --------------------------------------------------
   CLIENT
-------------------------------------------------- */
const client = mqtt.connect(MQTT_HOST, options);

/* --------------------------------------------------
   ACK TRACKING
-------------------------------------------------- */
// cmdId -> { resolve, reject, timeout }
const pendingCommands = new Map();

/* --------------------------------------------------
   CONNECT
-------------------------------------------------- */
client.on("connect", () => {
  console.log("✅ MQTT Connected");

  client.subscribe(
    [
      "device/bnest/+/status",
      "device/bnest/+/ack",
      "device/bnest/+/state"
    ],
    err => {
      if (err) {
        console.error("❌ MQTT subscribe error:", err.message);
      } else {
        console.log("📡 Subscribed to status + ack + state topics");
      }
    }
  );
});

/* --------------------------------------------------
   ERROR
-------------------------------------------------- */
client.on("error", err => {
  console.error("❌ MQTT Error:", err.message);
});

/* --------------------------------------------------
   MESSAGE HANDLER
-------------------------------------------------- */
client.on("message", async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());

    /* ---------------- HEARTBEAT ---------------- */
    if (topic.endsWith("/status")) {
      const { deviceId, status } = payload;
      if (!deviceId || !status) return;

      const isOnline = status === "online";

      await Device.findOneAndUpdate(
        { deviceId },
        {
          isActive: isOnline,
          lastSeen: new Date()
        }
      );

      console.log(
        `🟢 Device ${deviceId} → ${isOnline ? "ONLINE" : "OFFLINE"}`
      );
      return;
    }

    /* ---------------- ACK ---------------- */
    if (topic.endsWith("/ack")) {
      const { cmdId, status } = payload;
      if (!cmdId) return;

      const pending = pendingCommands.get(cmdId);
      if (!pending) {
        console.warn(`⚠️ Late ACK ignored: ${cmdId}`);
        return;
      }

      clearTimeout(pending.timeout);
      pendingCommands.delete(cmdId);

      if (status === "OK") {
        pending.resolve("OK");
      } else {
        pending.reject(new Error(status || "ACK_ERROR"));
      }

      console.log(`✅ ACK received: ${cmdId} → ${status}`);
      return;
    }

    /* ---------------- STATE ---------------- */
    if (topic.endsWith("/state")) {
  const { deviceId, state } = payload;
  if (!deviceId || !state) return;

  const device = await Device.findOneAndUpdate(
    { deviceId },
    {
      state,
      lastStateSync: new Date()
    },
    { new: true }
  );

  if (!device) return;

  const home = await Home.findById(device.home);
  if (!home) return;

  for (const memberId of home.members) {
    broadcastToUser(memberId.toString(), "device_state", {
      deviceId,
      state
    });
  }

  console.log(`📡 SSE pushed: ${deviceId} → ${state}`);
  return;
}
  } catch (err) {
    console.error("❌ MQTT message error:", err.message);
  }
});

/* --------------------------------------------------
   WATCHDOG (DEVICE OFFLINE DETECTOR)
-------------------------------------------------- */
setInterval(async () => {
  try {
    const threshold = new Date(Date.now() - 20000); // 20s silence

    const result = await Device.updateMany(
      {
        isActive: true,
        lastSeen: { $lt: threshold }
      },
      { isActive: false }
    );

    if (result.modifiedCount > 0) {
      console.log(
        `⏱ Watchdog: ${result.modifiedCount} device(s) marked offline`
      );
    }
  } catch (err) {
    console.error("Watchdog error:", err.message);
  }
}, 10000);

/* --------------------------------------------------
   PUBLISH WITH ACK
-------------------------------------------------- */
export function publishWithAck(topic, payload, cmdId, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingCommands.delete(cmdId);
      reject(new Error("ACK timeout"));
    }, timeoutMs);

    pendingCommands.set(cmdId, {
      resolve,
      reject,
      timeout
    });

    client.publish(topic, JSON.stringify(payload), { qos: 1 });
  });
}

/* --------------------------------------------------
   DEBUG: PENDING COMMAND MONITOR
-------------------------------------------------- */
setInterval(() => {
  if (pendingCommands.size > 0) {
    console.log(`📊 Pending commands: ${pendingCommands.size}`);
  }
}, 5000);

/* --------------------------------------------------
   EXPORT CLIENT
-------------------------------------------------- */
export default client;