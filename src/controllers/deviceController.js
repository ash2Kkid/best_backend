import Device from "../models/Device.js";

export const registerDevice = async (req, res) => {
  const { name, deviceId } = req.body;

  const device = await Device.create({
    name,
    deviceId,
    owner: req.user
  });

  res.json(device);
};
