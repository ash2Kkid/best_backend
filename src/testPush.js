import admin from "./config/firebase.js";

async function test() {
  console.log("Firebase initialized:", !!admin.apps.length);
}

test();