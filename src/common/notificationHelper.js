const bookingModel = require("../models/bookingModel");
const HttpResponse = require("../response/HttpResponse");
const {
  sendNotification,
  sendNotificationToUnlicencedDoctors,
} = require("../common/notification");

//======================================= Notifications ==================================================================//
/**
 * The function handles the rejection of a booking notification by updating the status, sending a
 * notification to the user, and returning a response.
 * @param notificationId - The ID of the notification that needs to be updated.
 * @param userId - The `userId` parameter represents the ID of the user for whom the notification is
 * being handled.
 * @param status - The `status` parameter represents the new status value that will be updated for the
 * notification.
 * @returns an API response with the updated notification object, an HTTP status code of 200 (HTTP_OK),
 * and a success message.
 */

const handleRejection = async (
  res,
  doctorId,
  notificationId,
  userId,
  status
) => {
  const notification = await bookingModel.updateOne(
    { _id: notificationId },
    { $set: { status: status } }
  );
  notification.doctorId = doctorId;

  await sendNotification(userId, "user", "bookingRejection");
  return HttpResponse.apiResponse(
    res,
    { notification },
    HttpResponse.HTTP_OK,
    "Request sent successfully."
  );
};

//=========================================================================================================//

/**
 * The function handles forwarding and accepting a notification, updating the notification status and
 * sending a booking confirmation notification to the user.
 * @param notification - The `notification` parameter is an object that represents a notification. It
 * contains information about the notification, such as its status, forwardedTo, and assignTo fields.
 * @param notificationId - The ID of the notification that needs to be handled.
 * @param userId - The `userId` parameter represents the ID of the user who will receive the
 * notification.
 * @param status - The `status` parameter is used to determine the status of the notification. It is
 * passed as an argument to the `handleForwardAndAccept` function.
 * @returns a Promise that resolves to an HTTP response.
 */

const handleForwardAndAccept = async (
  res,
  notification,
  notificationId,
  userId,
  doctorId,
  status
) => {
  if (notification.status === 1) {
    return res
      .status(200)
      .send({ status: 200, message: "Booking already accepted" });
  }

  // Update the forwardedTo and status fields
  const updatedNotification = await bookingModel.updateOne(
    { _id: notification._id },
    { $set: { forwardedTo: [], status: status, assignTo: doctorId } }
  );

  if (updatedNotification.nModified === 0) {
    return res
      .status(500)
      .send({ status: 500, message: "Failed to update notification" });
  }

  await sendNotification(userId, "user", "bookingConfirmation");
  const updatedBookingData = await bookingModel.findOne({
    _id: notificationId,
  });
  return HttpResponse.apiResponse(
    res,
    { updatedBookingData },
    HttpResponse.HTTP_OK,
    "Request sent successfully."
  );
};

//========================================================================================================//
/**
 * The `handleForward` function updates a notification's `isForward` property to 1, sends a
 * notification to unlicensed doctors, and returns a response with the updated notification.
 * @param notificationId - The `notificationId` parameter is the unique identifier of a notification in
 * the database. It is used to retrieve and update the notification information.
 * @returns an API response with the `notification` object, along with an HTTP status code of 200 and a
 * success message.
 */

const handleForward = async (res, notificationId) => {
  const notificationCheck = await bookingModel.findOne({
    _id: notificationId,
  });

  const notification = await bookingModel
    .findOneAndUpdate({ _id: notificationId }, { isForward: 1 }, { new: true })
    .populate({
      path: "userId",
      select: "name imageUrl _id",
      model: "user",
    });

  await sendNotificationToUnlicencedDoctors(notificationCheck);

  return HttpResponse.apiResponse(
    res,
    { notification },
    HttpResponse.HTTP_OK,
    "Request sent successfully."
  );
};

//==================================================================================================================//

/**
 * The `handleAccept` function accepts a notification ID, status, and user ID, updates the status of a
 * booking in the database, sends a notification to the user, and returns a successful response.
 * @param notificationId - The notificationId parameter is the unique identifier of the notification
 * that needs to be accepted.
 * @param status - The "status" parameter is used to update the status of a booking. It determines
 * whether the booking is accepted or not.
 * @param userId - The `userId` parameter is the ID of the user who will receive the notification.
 * @returns an API response with the bookingData object, an HTTP status code of 200 (HTTP_OK), and a
 * success message of "Request sent successfully."
 */

const handleAccept = async (res, notificationId, status, userId) => {
  const bookingData = await bookingModel
    .findOne({
      _id: notificationId,
    })
    .populate({
      path: "userId",
      select: "name imageUrl _id",
      model: "user",
    });
  bookingData.status = status;
  await bookingData.save();

  await sendNotification(userId, "user", "bookingConfirmation", bookingData);
  return HttpResponse.apiResponse(
    res,
    { bookingData },
    HttpResponse.HTTP_OK,
    "Request sent successfully."
  );
};

//=======================================================================================================//

module.exports = {
  handleRejection,
  handleForwardAndAccept,
  handleForward,
  handleAccept,
};
