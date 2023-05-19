const providerModel=require('../models/provider')
const admin = require("firebase-admin");
const serviceAccount = require("../config/firebase-secret.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Add any other configuration options if needed
});

const sendNotificationToDoctor = async (doctorId, notificationMessage) => {
    return new Promise(async (resolve, reject) => {
      try {
        // Get the doctor's FCM token from the database
        const doctor = await providerModel.findById(doctorId);
        const fcmToken = doctor?.device_token;
  console.log(doctor)
        // if (!fcmToken || fcmToken == null) {
        //   return reject({ status: 400, message: "Doctor FCM token not found" });
        // }
  
        const payload = {
          notification: {
            title: "New Notification",
            body: notificationMessage,
          },
        };
  
        const response = await admin.messaging().sendToDevice(fcmToken, payload);
  
        console.log("Notification sent successfully:", response);
        resolve();
      } catch (err) {
        console.error("Error sending notification:", err);
        reject({ status: 500, message: "Failed to send notification" });
      }
    });
  };
  
  module.exports = { sendNotificationToDoctor };
  