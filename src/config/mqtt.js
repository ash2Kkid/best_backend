import mqtt from "mqtt";
import Device from "../models/Device.js";
import Home from "../models/Home.js";
import { broadcastToUser } from "../config/sse.js";
import { sendPushToUsers } from "../services/pushServices.js";

/* --------------------------------------------------
   MQTT CONFIG
-------------------------------------------------- */
const MQTT_HOST = process.env.MQTT_HOST || "mqtt://broker.hivemq.com";

const options = {};
if (process.env.MQTT_USERNAME) options.username = process.env.MQTT_USERNAME;
if (process.env.MQTT_PASSWORD) options.password = process.env.MQTT_PASSWORD;

/* --------------------------------------------------
   MQTT CLIENT
-------------------------------------------------- */
const client = mqtt.connect(MQTT_HOST, options);

/* --------------------------------------------------
   ACK TRACKING
-------------------------------------------------- */
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
      const { deviceId, status, deviceSecret } = payload;

      if (!deviceId || !status || !deviceSecret) return;

      const device = await Device.findOne({ deviceId });

      if (!device || device.deviceSecret !== deviceSecret) {
        console.warn(`❌ Unauthorized device (status): ${deviceId}`);
        return;
      }

      if (device.status !== "active") return;

      await Device.findOneAndUpdate(
        { deviceId },
        {
          isActive: status === "online",
          lastSeen: new Date(),
          notifiedOffline: false
        }
      );

      console.log(`🟢 [MQTT] ${deviceId} → ${status}`);
      return;
    }

    /* ---------------- ACK ---------------- */
    if (topic.endsWith("/ack")) {
      const { cmdId, status, deviceId } = payload;

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
        pending.reject({
          type: "DEVICE_ACK_FAILED",
          status
        });
      }

      console.log(`✅ ACK received: ${cmdId} → ${status}`);
      return;
    }

    /* ---------------- STATE ---------------- */
    if (topic.endsWith("/state")) {
      const { deviceId, state, deviceSecret } = payload;

      if (!deviceId || !state || !deviceSecret) return;
      if (!["ON", "OFF"].includes(state)) return;

      const device = await Device.findOne({ deviceId });

      if (!device || device.deviceSecret !== deviceSecret) {
        console.warn(`❌ Unauthorized device (state): ${deviceId}`);
        return;
      }

      if (device.status !== "active") return;

      const updated = await Device.findOneAndUpdate(
        { deviceId },
        {
          state,
          lastStateSync: new Date(),
          lastSeen: new Date(),
          isActive: true
        },
        { new: true }
      );

      if (!updated) return;

      const home = await Home.findById(updated.home);
      if (!home) return;

      // SSE broadcast
      for (const memberId of home.members) {
        broadcastToUser(memberId.toString(), "device_state", {
          deviceId,
          state
        });
      }

      console.log(`📡 [MQTT] ${deviceId} → STATE ${state}`);
      return;
    }
  } catch (err) {
    console.error("❌ MQTT message error:", err.message);
  }
});

/* --------------------------------------------------
   WATCHDOG (OFFLINE DETECTOR)
-------------------------------------------------- */
setInterval(async () => {
  try {
    const threshold = new Date(Date.now() - 20000);

    const devices = await Device.find({
      isActive: true,
      lastSeen: { $lt: threshold }
    }).populate("home");

    for (const device of devices) {
      device.isActive = false;

      if (!device.notifiedOffline && device.home) {
        await sendPushToUsers(
          device.home.members,
          "Device Offline",
          `${device.name} went offline`
        );

        device.notifiedOffline = true;

        console.log(`🔔 Push sent: ${device.name} offline`);
      }

      await device.save();
    }
  } catch (err) {
    console.error("❌ Watchdog error:", err.message);
  }
}, 10000);

/* --------------------------------------------------
   PUBLISH WITH ACK
-------------------------------------------------- */
export function publishWithAck(topic, payload, cmdId, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingCommands.delete(cmdId);
      reject({
        type: "ACK_TIMEOUT",
        cmdId
      });
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
   DEBUG MONITOR
-------------------------------------------------- */
setInterval(() => {
  if (pendingCommands.size > 0) {
    console.log(`📊 Pending commands: ${pendingCommands.size}`);
  }
}, 5000);

/* --------------------------------------------------
   EXPORT
-------------------------------------------------- */
export default client;