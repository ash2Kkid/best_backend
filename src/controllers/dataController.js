import SensorData from "../models/SensorData.js";

export const getDeviceData = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const data = await SensorData.find({ deviceId }).sort({ timestamp: -1 }).limit(500);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error fetching device data" });
  }
};
