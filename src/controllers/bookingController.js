const bookingModel = require("../models/bookingModel");
const HttpResponse = require("../response/HttpResponse");
const providerModel = require("../models/provider");
const userModel = require("../models/userModel");
const Rating = require("../models/reviewModel");
const skillModel = require("../models/skillModel");
const BookingPrice = require("../models/bookingPrice");
const {
  sendNotification,
  sendNotificationToUnlicencedDoctors,
} = require("../common/notification");
const calculateDistance =
  require("../common/distanceCalculator").calculateDistance;
const {handleRejection ,handleForwardAndAccept, handleForward, handleAccept}=require("../common/notificationHelper")
//===========================================================================================================================//

//================================================= bookNow ===============================================================//

/**
 * The `bookNow` function  that handles the process of booking an
 * appointment with a doctor, including validating user and doctor information, creating a booking
 * request, sending a notification to the doctor, and returning a response to the client.
 * @returns an HTTP response with the following properties:
 * - `bookRequest`: The created booking request object.
 * - `doctorData`: The doctor's data.
 * - `status`: The HTTP status code (200 for success).
 * - `message`: A success message indicating that the request was sent successfully.
 */

const bookNow = async (req, res, next) => {
  try {
    const {
      doctorId,
      healthComplaint,
      description,
      selectedDateTime,
      bookingTime,
      bookingPrice,
      latitude,
      longitude,
      price,
      address,
      distance,
    } = req.body;

    const isUserExist = await userModel.findById(req.checkIfExist._id);
    if (!isUserExist) {
      return HttpResponse.apiResponse(
        res,
        {},
        HttpResponse.HTTP_NOT_FOUND,
        "No user found with this email address."
      );
    }
    if (!doctorId) {
      return HttpResponse.apiResponse(
        res,
        {},
        HttpResponse.HTTP_NOT_FOUND,
        "No Dr. found."
      );
    }

    const healthComplaintData = await skillModel.findById(healthComplaint);
    const currentPrice = await BookingPrice.findById({ _id: price });
    const doctorData = await providerModel.findById(doctorId);

    const bookRequest = await bookingModel.create({
      userId: req.checkIfExist._id,
      doctorId: doctorId,
      healthComplaint: healthComplaintData,
      description,
      bookingPrice,
      latitude,
      bookingTime,
      longitude,
      address,
      distance,
      price: currentPrice.price,
      selectedDateTime,
    });

    const userDetails = await userModel.findById(req.checkIfExist._id);
    bookRequest.user = userDetails;
    await bookRequest.save();

    /* The below code is sending a notification to a doctor with the specified doctorId. It is using the
   function sendNotification() to send the notification with the parameters doctorId, 'provider',
   and NotificationType 'bookingRequest'. */

    await sendNotification(doctorId, "provider", "bookingRequest")
      .then(() => {
        return HttpResponse.apiResponse(
          res,
          { bookRequest, doctorData },
          HttpResponse.HTTP_OK,
          "Request sent successfully."
        );
      })
      .catch((error) => {
        return HttpResponse.apiResponse(
          res,
          {},
          error.status || HttpResponse.HTTP_INTERNAL_SERVER_ERROR,
          error.message || "Error sending notification."
        );
      });
  } catch (err) {
    return res.status(500).json({ status: 500, message: err.message });
  }
};

//====================================================================================================================//

/**
 * The function `acceptOrDecline` that handles the logic for accepting or
 * declining a booking request, updating the notification status, and sending notifications to the
 * relevant users.
 * user authentication details. In this code snippet, `req` is used to access the user's ID (`req.user`)
 */

const acceptOrDecline = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { userId, notificationId, status, forward } = req.body;
    const isUserExist = await providerModel.findById(req.user._id);

    const notification = await bookingModel.findOne({ _id: notificationId });
    if (!isUserExist) {
      return HttpResponse.apiResponse(
        res,
        {},
        HttpResponse.HTTP_NOT_FOUND,
        "No user found"
      );
    }
    if (status === 3) {
     handleRejection(res,doctorId,notificationId, userId ,status)
    }else if(notification.isForward === 1 && status === 1) {
     handleForwardAndAccept(res,notification,notificationId,userId,doctorId,status)
    }else if (forward === 1) {
      handleForward(res,notificationId)
    } else if (status == 1 && notification.isForward == 0) {
      handleAccept(res,notificationId,status,userId)
    }
  } catch (error) {
    return res
      .status(500)
      .send({ status: 500, message: "Invalid request", error: error.message });
  }
};

//============================================== searchNearBy ========================================================//

/**
 * The `searchNearBy` function  that takes in a request and response object,
 * and it searches for nearby providers based on the given longitude, latitude, health complaint, and
 * booking time parameters.
 *   The  code is using Promise.all to handle multiple asynchronous operations. It is waiting
     for both the countPromise and providersPromise to resolve, and then it executes the callback
     function with the resolved values as an array
 */

const searchNearBy = async (req, res) => {
  try {
    const { longitude, latitude, healthComplaint, bookingTime } = req.body;

    if (!longitude || !latitude) {
      return res
        .status(400)
        .json({ status: 400, message: "Invalid query parameters" });
    }

    if (isNaN(parseFloat(longitude)) || isNaN(parseFloat(latitude))) {
      return res
        .status(400)
        .json({ status: 400, message: "Invalid longitude or latitude" });
    }

    const healthComplaintIds = healthComplaint;

    const userLocation = {
      type: "Point",
      coordinates: [parseFloat(latitude), parseFloat(longitude)],
    };

    if (healthComplaintIds) {
      const providers = await providerModel.find({
        licensed: true,
        location: {
          $nearSphere: {
            $geometry: userLocation,
            $maxDistance: parseInt(10000),
          },
        },
      });

      if (providers.length === 0) {
        // Return an empty list if no providers are found
        return res.json({
          status: 200,
          metaData: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
          },
          list: [],
        });
      }

      const userCoordinates = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };

      const matchingProviders = providers.filter((provider) => {
        const matchingSkills = provider.skills.some(
          (skill) => skill._id.toString() === healthComplaintIds.toString()
        );

        return matchingSkills;
      });

      const matchingProvidersWithDistance = await Promise.all(
        matchingProviders.map(async (provider) => {
          const providerCoordinates = {
            latitude: provider.location.coordinates[0],
            longitude: provider.location.coordinates[1],
          };

          const distance = calculateDistance(
            userCoordinates,
            providerCoordinates
          );

          return {
            provider,
            distance,
          };
        })
      );

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const countPromise = providerModel
        .countDocuments(matchingProviders)
        .exec();
      const providersPromise = providerModel
        .find({})
        .skip(skip)
        .limit(limit)
        .exec();

      /* The below code is using Promise.all to wait for two promises (countPromise and
      providersPromise) to resolve. Once both promises have resolved, it executes the callback
      function. Inside the callback function, it calculates the total number of pages based on the
      total count and the limit per page. It also checks if there is a next page based on the
      current page and the total number of pages. */

      Promise.all([countPromise, providersPromise]).then(
        async ([total, providers]) => {
          const totalPages = Math.ceil(total / limit);
          const hasNextPage = page < totalPages;

          const providersWithRatings = await Promise.all(
            matchingProvidersWithDistance.map(async (e) => {
              const providerId = e.provider._id;
              const ratingData = await Rating.aggregate([
                {
                  $match: { providerId },
                },
                {
                  $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 },
                  },
                },
              ]);

              let averageRating = 0;
              let totalReviews = 0;

              if (ratingData.length > 0) {
                // Calculate averageRating with 2 decimal points
                averageRating = parseFloat(
                  ratingData[0].averageRating.toFixed(2)
                );
                totalReviews = ratingData[0].totalReviews;
              }

              /* 
              The above code is using the MongoDB aggregation framework to calculate the average
             rating and total number of reviews for a given provider.
              It is querying the "Rating" collection and filtering the documents based on the "providerId" field.
              Then, it groups the matching documents and calculates the average rating using the  operator and
             the total number of reviews using the  operator
              */

              return {
                ...e.provider.toObject(),
                distance: e.distance,
                averageRating,
                totalReviews,
              };
            })
          );

          return res.json({
            status: 200,
            metaData: {
              page: page,
              limit: limit,
              total: total,
              totalPages: totalPages,
              hasNextPage: hasNextPage,
            },
            list: providersWithRatings,
          });
        }
      );
    } else {
      /* below here we performing a search for providers based on their location using the
       '$nearSphere ,  $geometry'operator in MongoDB. It retrieves the provider details from the database and
      calculates the distance between the user's location and each provider's location using the
      `calculateDistance` function. */

      const providersDetails = await providerModel
        .find({
          location: {
            $nearSphere: {
              $geometry: userLocation,
              $maxDistance: parseInt(10000000),
            },
          },
        })
        .select("-specialization");

      const userCoordinates = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };

      const providersWithDistance = providersDetails.map((provider) => {
        const providerCoordinates = {
          latitude: provider.location.coordinates[0],
          longitude: provider.location.coordinates[1],
        };

        const distance = calculateDistance(
          userCoordinates,
          providerCoordinates
        );
        return {
          provider,
          distance,
        };
      });
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const countPromise = providerModel
        .countDocuments(providersDetails)
        .exec();
      const providersPromise = providerModel
        .find({})
        .skip(skip)
        .limit(limit)
        .exec();

      Promise.all([countPromise, providersPromise]).then(
        ([total, providers]) => {
          const totalPages = Math.ceil(total / limit);
          const hasNextPage = page < totalPages;

          res.json({
            status: 200,
            metaData: {
              page: page,
              limit: limit,
              total: total,
              totalPages: totalPages,
              hasNextPage: hasNextPage,
            },
            list: providersWithDistance.map((e) => ({
              ...e.provider.toObject(),
              distance: e.distance,
            })),
          });
        }
      );

      /* 
      The above code is using Promise.all to wait for two promises, countPromise and providersPromise,
      to resolve. Once both promises have resolved, it retrieves the total count and providers from the
      resolved values 
     */
    }
  } catch (error) {
    return res
      .status(500)
      .send({ status: 500, message: "Invalid request", error: error.message });
  }
};
//==================================================================================================================//

//===================================================================================================================//

/**
 * The function `getNotification` retrieves notifications based on the status parameter and user ID.
 * The function checking the value of the variable "status". If the value is 0 or 1, it
       executes a query using the "bookingModel" to find documents that match the "query" criteria.
      The results are then sorted in ascending order by "status", descending order by "endTime", and
      descending order by "updatedAt". The query results are then limited to a certain number of
      documents and populated with additional data from the "userId", "healthComplaint", and
      "assignTo" collections. If the value of "status" is not 0 or 1
 */

const getNotification = async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.user._id;

    const query = {
      $or: [
        { doctorId: userId },
        { assignTo: userId },
        { "forwardedTo.provider._id": userId },
      ],
    };

    if (status >= 0 && status <= 6) {
      if (status == 0 || status == 1) {
        query.status = { $in: [0, 1] };
      } else if (status == 2 || status == 4) {
        query.status = { $in: [2, 4] };
      } else if (status == 3 || status == 5 || status == 6) {
        query.status = { $in: [3, 5, 6] };
      }
      /* The above code is checking the value of the variable "status" and based on its value, it is
    assigning a specific value to the "query.status" property. */
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const countPromise = bookingModel.countDocuments(query).exec();
      let providersPromise;

      if (status == 0 || status == 1) {
        providersPromise = bookingModel
          .find(query)
          .sort({ status: 1, endTime: -1, updatedAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("userId", "name userProfile _id")
          .populate("healthComplaint")
          .populate("assignTo", "name userProfile _id")
          .exec();
      } else {
        providersPromise = bookingModel
          .find(query)
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("userId", "name userProfile _id")
          .populate("healthComplaint")
          .populate("assignTo", "name userProfile _id")
          .exec();
      }

      Promise.all([countPromise, providersPromise]).then(
        ([total, providers]) => {
          const totalPages = Math.ceil(total / limit);
          const hasNextPage = page < totalPages;
          const metaData = {
            page: page,
            limit: limit,
            total: total,
            totalPages: totalPages,
            hasNextPage: hasNextPage,
          };

          return res.json({
            status: 200,
            metaData: metaData,
            list: providers,
            message: "Notifications retrieved successfully",
          });
        }
      );

      /* The above code is using Promise.all to wait for two promises, `countPromise` and
      `providersPromise`, to resolve. Once both promises have resolved, it extracts the resolved
      values into the variables `total` and `providers`. */
    } else {
      return res.status(400).json({
        status: 400,
        message: "Invalid status parameter. Must be between 0 and 5.",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: 500, message: "Invalid request", error: error.message });
  }
};

//================================================ umcomingNotification =======================================================//

/**
 * The function retrieves upcoming notifications for a specific doctor.
 * @returns a response with status code 200 and the following data:
 * - status: 200
 * - metaData: an object containing information about the pagination (page, limit, total, totalPages,
 * hasNextPage)
 * - list: an array of upcoming notifications
 * - message: "Upcoming notifications retrieved successfully"
 */

const umcomingNotification = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const query = {
      doctorId: req.user._id,
      status: "accepted",
      selectedDateTime: { $gt: new Date() },
    };
    const options = { page: parseInt(page), limit: parseInt(limit) };

    const result = await bookingModel.paginate(query, options);

    const upcomingNotifications = await bookingModel.find({
      $and: [
        { doctorId: req.user._id },
        { status: "accepted" },
        { selectedDateTime: { $gt: new Date() } },
      ],
    });

    /* The above code is using the Mongoose library in JavaScript to query the database for upcoming
   notifications. It is finding all documents in the "bookingModel" collection that meet the
   following conditions*/

    const metaData = {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
    };

    return res.status(200).send({
      status: 200,
      metaData: metaData,
      list: upcomingNotifications,
      message: "Upcoming notifications retrieved successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .send({ status: 500, message: "Invalid request", error: error.message });
  }
};

//========================================================================================================================//

module.exports = {
  bookNow,
  acceptOrDecline,
  searchNearBy,
  getNotification,
  umcomingNotification,
};

//==========================================================================================================================//
