const providerModel = require("../models/provider");
const admin = require("firebase-admin");
const serviceAccount = require("../config/firebase-secret.json");
const userModel = require("../models/userModel");
const bookingModel = require("../models/bookingModel");
const calculateDistance = require("./distanceCalculator").calculateDistance;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

/*
initializing the Firebase Admin SDK . It is using the
`admin.initializeApp()` function to set up the SDK with the provided configuration options.
it is using a service account credential object (`serviceAccount`). 
*/

//=========================================== sendNotificationToUnlicencedDoctors ==============================================//
/**
 * The function `sendNotificationToUnlicencedDoctors` sends a notification to unlicensed doctors based
 * on their location and updates the notification status in the database.
 * @param notificationMessage - The `notificationMessage` parameter is an object that contains the
 * description and time of the notification. It has the following structure:
 * @param notificationCheck - The `notificationCheck` parameter is an object that contains information
 * about the notification. It includes the latitude and longitude coordinates of the notification
 * location.
 */
const sendNotificationToUnlicencedDoctors = async (notificationCheck) => {
  try {
    let latitude = notificationCheck.latitude;
    let longitude = notificationCheck.longitude;
    const providers = await providerModel.find({
      licensed: false,
    });
    const userCoordinates = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };

    const providersWithDistance = providers.map((provider) => {
      const providerCoordinates = {
        latitude: provider.location.coordinates[0],
        longitude: provider.location.coordinates[1],
      };
      var distance = calculateDistance(userCoordinates, providerCoordinates);
      return {
        provider,
        distance,
      };
    });

    let forwardedTo = [];
    const fcmTokens = [];

    for (const provider of providers) {
      const providerTokens = provider.device_info
        .filter((device) => device.device_token)
        .map((device) => device.device_token);

      if (providerTokens.length > 0) {
        forwardedTo.push(provider._id);
        fcmTokens.push(...providerTokens);
      }
    }
    payload = {
      notification: {
        title: "Booking Confirmation: New Booking Request Recieved",
        body: "You recieve new booking request ",
      },
      data: {
        type: "6",
      },
    };

    const response = await admin.messaging().sendToDevice(fcmTokens, payload);

    console.log("Notification sent successfully:", response);

    const updateNotification = providersWithDistance.map((provider) => {
      return {
        provider: {
          _id: provider.provider._id,
          name: provider.provider.name,
          imageUrl: provider.provider.imageUrl,
          userProfile: provider.provider.userProfile,
        },
        distance: provider.distance,
      };
    });

    const updatedNotification = await bookingModel.findByIdAndUpdate(
      notificationCheck._id,
      { $set: { forwardedTo: updateNotification, isForward: 1 } },
      { new: true }
    );
    console.log("afterUpdate", updatedNotification);
    return { status: 200, message: "Notification sent successfully" };
  } catch (err) {
    console.error("Error sending notification:", err);
    return {
      status: 500,
      message: "Failed to send notification",
      error: err.message,
    };
  }
};

//==========================================Send Notification with TYpe=====================================================================//
const sendNotification = async (
  recipientId,
  recipientType,
  notificationType,
  bookingData
) => {
  try {
    let recipient = null;
    let fcmTokens = [];

    if (recipientType === "user") {
      recipient = await userModel.findById(recipientId);
    } else if (recipientType === "provider") {
      recipient = await providerModel.findById(recipientId);
    }

    if (!recipient) {
      return { status: 404, message: "Recipient not found" };
    }

    fcmTokens = recipient.device_info
      .filter((device) => device.device_token)
      .map((device) => device.device_token);

    if (fcmTokens.length === 0) {
      return { status: 400, message: "FCM tokens not found for the recipient" };
    }

    let payload = {};

    switch (notificationType) {
      case "bookingConfirmation":
        payload = {
          notification: {
            title: "Booking Confirmation: Your Booking Has Been Accepted",
            body: "Your Booking Has Been Accepted",
          },
          data: {
            type: "1",
          },
        };
        break;
      case "bookingRejection":
        payload = {
          notification: {
            type: "3",
            title:
              "consider making a new request and chose a different provider",
            body: "Your Booking has been rejected",
          },
          data: {
            type: "3",
          },
        };
        break;
      case "bookingStart":
        payload = {
          notification: {
            title: "Booking Confirmation: Your booking is starting now",
            body: "Your booking is starting now",
          },
          data: {
            type: "4",
          },
        };
        break;
      case "bookingEnd":
        payload = {
          notification: {
            title: "Booking Confirmation: Your booking is Ended now",
            body: "Your booking is Ended now",
          },
          data: {
            type: "5",
          },
        };
        break;
      case "bookingRequest":
        payload = {
          notification: {
            title: "Booking Confirmation: New Booking Request Recieved",
            body: "You recieve new booking request ",
          },
          data: {
            type: "2",
          },
        };
        break;

      case "InsuranceReject":
        payload = {
          notification: {
            title:
              "Insurance Confirmation: Your Insurance has been rejected By admin",
            body: "",
          },
          data: {
            type: "7",
          },
        };
        break;

      default:
        return { status: 400, message: "Invalid notification type" };
    }

    const response = await admin.messaging().sendToDevice(fcmTokens, payload);
    console.log("Notification sent successfully:", response);
    return { status: 200, message: "Notification sent successfully" };
  } catch (err) {
    console.error("Error sending notification:", err.message);
    throw new Error("Failed to send notification");
  }
};

//=================================================================================================================//

module.exports = {
  sendNotificationToUnlicencedDoctors,
  sendNotification,
};
