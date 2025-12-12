const mqtt = require("mqtt");

const client = mqtt.connect(process.env.MQTT_HOST);

client.on("connect", () => {
  console.log("MQTT Connected");

  // subscribe for device publishes
  client.subscribe("device/+/data");
});

client.on("message", (topic, message) => {
  console.log("MQTT Incoming →", topic, message.toString());
});

module.exports = client;
