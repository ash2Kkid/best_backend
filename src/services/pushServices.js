import admin from "firebase-admin";
import UserDeviceToken from "../models/UserDeviceToken.js";

export async function sendPushToUsers(userIds, title, body) {
  const tokens = await UserDeviceToken.find({
    user: { $in: userIds }
  });

  if (!tokens.length) return;

  const messages = tokens.map(t => ({
    token: t.token,
    notification: {
      title,
      body
    },
    android: {
      priority: "high"
    }
  }));

  await Promise.all(
    messages.map(msg =>
      admin.messaging().send(msg).catch(err => {
        console.error("FCM error:", err.message);
      })
    )
  );
}