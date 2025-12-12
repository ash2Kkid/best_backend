import mqtt from "mqtt";

const client = mqtt.connect(process.env.MQTT_HOST);

client.on("connect", () => {
  console.log("MQTT Connected");
  client.subscribe("device/+/data");
});

client.on("message", (topic, message) => {
  console.log("MQTT Incoming →", topic, message.toString());
});

export default client;
