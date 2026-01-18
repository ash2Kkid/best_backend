import admin from "firebase-admin";
import UserDeviceToken from "../models/UserDeviceToken.js";

export async function sendPushToUsers(userIds, title, body) {
  const tokens = await UserDeviceToken.find({
    user: { $in: userIds }
  }).select("token");

  if (!tokens.length) return;

  const message = {
    notification: { title, body },
    tokens: tokens.map(t => t.token)
  };

  await admin.messaging().sendEachForMulticast(message);
}