const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.resetNotificationsDaily = functions.pubsub.schedule("0 0 * * *").timeZone("America/Edmonton").onRun(async (context) => {
  console.log("Running daily reset of notifications at midnight");

  const notificationsRef = admin.firestore().collection("notifications");

  // Query only completed notifications to reduce writes
  const completedNotifsSnapshot = await notificationsRef.where("completed", "==", true).get();

  if (completedNotifsSnapshot.empty) {
    console.log("No completed notifications to reset.");
    return null;
  }

  const batch = admin.firestore().batch();

  completedNotifsSnapshot.forEach((doc) => {
    batch.update(doc.ref, { completed: false });
  });

  await batch.commit();

  console.log(`Reset ${completedNotifsSnapshot.size} notifications.`);

  return null;
});

