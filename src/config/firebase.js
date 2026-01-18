import admin from "firebase-admin";
import serviceAccount from "./botnest-b93ad-firebase-adminsdk-fbsvc-a2ed94eb44.json" assert { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const fcm = admin.messaging();



