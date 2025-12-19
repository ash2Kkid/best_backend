import mqtt from "mqtt";
import Device from "../models/Device.js";

const MQTT_HOST = process.env.MQTT_HOST || "mqtt://broker.hivemq.com";

const options = {};
if (process.env.MQTT_USERNAME) options.username = process.env.MQTT_USERNAME;
if (process.env.MQTT_PASSWORD) options.password = process.env.MQTT_PASSWORD;

// Create client
const client = mqtt.connect(MQTT_HOST, options);

// ---------- CONNECTION ----------
client.on("connect", () => {
  console.log("✅ MQTT Connected");

  // Subscribe to device heartbeat topics
  client.subscribe("device/bnest/+/status", (err) => {
    if (err) console.error("❌ MQTT subscription error:", err);
    else console.log("📡 Subscribed to device status topics");
  });
});

client.on("error", (err) => {
  console.error("❌ MQTT Error:", err.message);
});

// ---------- HEARTBEAT HANDLER ----------
client.on("message", async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());

    if (!topic.includes("/status")) return;
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
  } catch (err) {
    console.error("❌ Heartbeat processing error:", err.message);
  }
});

// ---------- OFFLINE FALLBACK ----------
setInterval(async () => {
  const threshold = new Date(Date.now() - 20000); // 20s

  const res = await Device.updateMany(
    {
      lastSeen: { $lt: threshold },
      isActive: true
    },
    { isActive: false }
  );

  if (res.modifiedCount > 0) {
    console.log("Marked devices offline due to missed heartbeat");
  }
}, 10000);