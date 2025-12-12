const SensorData = require("../models/SensorData");

export const getDeviceData = async (req, res) => {
  const { deviceId } = req.params;

  const data = await SensorData.find({ deviceId }).sort({ timestamp: -1 });

  res.json(data);
};
