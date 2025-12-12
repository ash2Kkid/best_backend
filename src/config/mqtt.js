import mqtt from "mqtt";

const host = process.env.MQTT_HOST || "mqtt://broker.hivemq.com";
const port = process.env.MQTT_PORT ? Number(process.env.MQTT_PORT) : undefined;

const options = {};
if (process.env.MQTT_USERNAME) options.username = process.env.MQTT_USERNAME;
if (process.env.MQTT_PASSWORD) options.password = process.env.MQTT_PASSWORD;
if (port) options.port = port;

// If full URL is provided in MQTT_HOST (e.g. mqtts://your-host:8883), mqtt.connect will use it.
const client = mqtt.connect(host, options);

client.on("connect", () => {
  console.log("MQTT Connected");
});
client.on("error", (err) => {
  console.error("MQTT Error:", err);
});

export default client;
