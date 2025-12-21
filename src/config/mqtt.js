import mqtt from "mqtt";
import Device from "../models/Device.js";


const MQTT_HOST = process.env.MQTT_HOST || "mqtt://broker.hivemq.com";

const options = {};
if (process.env.MQTT_USERNAME) options.username = process.env.MQTT_USERNAME;
if (process.env.MQTT_PASSWORD) options.password = process.env.MQTT_PASSWORD;

// ---------------- CLIENT ----------------
const client = mqtt.connect(MQTT_HOST, options);

// ---------------- ACK TRACKING ----------------
const pendingCommands = new Map();
// cmdId -> { resolve, reject, timeout }

// ---------------- CONNECTION ----------------
client.on("connect", () => {
  console.log("✅ MQTT Connected");

  client.subscribe(
    ["device/bnest/+/status", "device/bnest/+/ack"],
    err => {
      if (err) console.error("❌ MQTT subscribe error:", err);
      else console.log("📡 Subscribed to status + ack topics");
    }
  );
});

client.on("error", err => {
  console.error("❌ MQTT Error:", err.message);
});

// ---------------- MESSAGE HANDLER ----------------
client.on("message", async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());

    // -------- HEARTBEAT --------
    if (topic.endsWith("/status")) {
      if (!payload.deviceId || !payload.status) return;

      const isOnline = payload.status === "online";

      await Device.findOneAndUpdate(
        { deviceId: payload.deviceId },
        {
          isActive: isOnline,
          lastSeen: new Date()
        }
      );

      console.log(
        `🟢 Device ${payload.deviceId} → ${isOnline ? "ONLINE" : "OFFLINE"}`
      );
      return;
    }

    // -------- ACK --------
    if (topic.endsWith("/ack")) {
      const { cmdId, status } = payload;

      if (!cmdId) return;

      const pending = pendingCommands.get(cmdId);
      if (pending) {
        pending.resolve(status);
        clearTimeout(pending.timeout);
        pendingCommands.delete(cmdId);
        console.log(`✅ ACK received for ${cmdId}: ${status}`);
      }
    }

  } catch (err) {
    console.error("❌ MQTT message error:", err.message);
  }
});

// ---------------- WATCHDOG ----------------
setInterval(async () => {
  try {
    const threshold = new Date(Date.now() - 20000);

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

// ---------------- COMMAND HELPER ----------------
export function publishWithAck(topic, payload, cmdId, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingCommands.delete(cmdId);
      reject(new Error("ACK timeout"));
    }, timeoutMs);

    pendingCommands.set(cmdId, { resolve, reject, timeout });

    client.publish(topic, JSON.stringify(payload), { qos: 1 });
  });
}

export default client;

client.on("message", (topic, message) => {
  try {
    if (!topic.endsWith("/ack")) return;

    
  } catch (err) {
    console.error("ACK ERROR:", err.message);
  }
});