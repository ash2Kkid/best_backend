import UserDeviceToken from "../models/UserDeviceToken.js";

export const registerPushToken = async (req, res) => {
  try {
    const { token, platform } = req.body;

    if (!token || !platform) {
      return res.status(400).json({ error: "token and platform required" });
    }

    await UserDeviceToken.findOneAndUpdate(
      { token },
      {
        user: req.user.id,
        platform
      },
      { upsert: true }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Push token register error:", err.message);
    res.status(500).json({ error: "Failed to register push token" });
  }
};