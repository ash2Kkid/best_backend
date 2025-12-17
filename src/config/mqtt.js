import Device from "../models/Device.js";

client.on("connect", () => {
  console.log("MQTT Connected");

  // Subscribe to all device status topics
  client.subscribe("device/bnest/+/status", (err) => {
    if (err) console.error("MQTT subscription error:", err);
  });
});

// Handle incoming messages
client.on("message", async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());

    // Only handle heartbeat/status messages
    if (topic.includes("/status") && payload.deviceId && payload.status) {
      const isOnline = payload.status === "online";

      await Device.findOneAndUpdate(
        { deviceId: payload.deviceId },
        {
          isActive: isOnline,
          lastSeen: isOnline ? new Date() : undefined
        }
      );

      console.log(`Device ${payload.deviceId} is now ${isOnline ? "online" : "offline"}`);
    }
  } catch (err) {
    console.error("Heartbeat processing error:", err.message);
  }
});

// Optional: periodically mark devices offline if heartbeat missed
setInterval(async () => {
  const threshold = new Date(Date.now() - 30000); // 30 seconds
  await Device.updateMany(
    { lastSeen: { $lt: threshold } },
    { isActive: false }
  );
}, 30000);