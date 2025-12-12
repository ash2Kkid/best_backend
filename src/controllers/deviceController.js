const Device = require("../models/Device");

exports.registerDevice = async (req, res) => {
  const { name, deviceId } = req.body;

  const device = await Device.create({
    name,
    deviceId,
    owner: req.user
  });

  res.json(device);
};
