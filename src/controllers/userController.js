const userProfileModel = require("../models/userModel");
const Rating = require("../models/reviewModel");
const HttpResponse = require("../response/HttpResponse");
const { sendOTP, generateOTP, sendUnAuthOTP } = require("../common/helper");
const InsurancePayment = require("../models/insurancePayment");
const bookingModel = require("../models/bookingModel");
const tokenUtils = require("../common/tokenUtils");
const transactionModel = require("../models/transaction");
const bcrypt = require("bcrypt");
const providerModel = require("../models/provider");
const saltRounds = 10;

//===================================================== signUp ==========================================================//

/**
 * The signUp function is responsible for creating a new user profile, hashing the password, generating
 * an OTP, saving the profile to the database, sending a verification OTP, and returning the user
 * profile and insurance data.
 */

const signUp = async (req, res, next) => {
  try {
    const { name, email, password, phone, countryCode } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    let OTP = generateOTP();
    let newProfile = await userProfileModel.create({ 
      name: name,
      email: email,

      password: hashedPassword,
      otp: OTP,
      phone: phone,
      countryCode: countryCode,
      device_info: [
        {
          device_id: req.headers.device_id,

          jwt_token: null,

          device_token: req.body.device_token,
          device_type: req.body.device_type,
        },
      ],
    });
    await newProfile.save();
    // To send verification OTP
    sendOTP(email, OTP, "register");

    if (req.files.length > 0) {
      /* This code is handling a file upload request. */

      const documents = req.files.map((file) => "/uploads/" + file.filename);
      if (documents) {
        const insurancePayment = new InsurancePayment({
          user: newProfile._id,
          documents,
        });
        await insurancePayment.save();
      }
    }
    let insuranceData = await InsurancePayment.findOne({
      user: newProfile._id,
    });

    if (!insuranceData) {
      insuranceData = null;
    }
    return res.status(200).json({
      status: 200,
      data: { user: newProfile, insuranceData: insuranceData },
    });
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

//=================================================== loginUser =============================================================//

/**
 * The loginUser function is used to handle the login process for a user, including checking the email
 * and password, verifying the account, and generating a token for authentication.
 */

const loginUser = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await userProfileModel.findOne({ email: email });

    if (!user) {
      return res.status(400).send({
        status: 400,
        data: {},
        message: "Account does not exist with this credential",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(400)
        .send({ status: 400, data: {}, message: "Incorrect password" });
    }

    if (user.isVerified != true) {
      let OTP = generateOTP();
      sendUnAuthOTP(email, OTP, "login");
      user.otp = OTP;
      await user.save();

      return res.status(401).send({
        status: 401,
        data: {},
        message:
          "Your account is not verified, we sent a verification code to your registered email, please verify.",
      });
    }

    const matchingDeviceInfo = user.device_info.find(
      (info) => info.device_id === req.headers.device_id
    );

    if (matchingDeviceInfo) {
      const token = tokenUtils.generateToken(user._id.toString());

      matchingDeviceInfo.jwt_token = token;
      await user.save();
      let insuranceData = await InsurancePayment.findOne({
        user: user._id,
      });

      if (!insuranceData) {
        insuranceData = null;
      }
      return res.status(200).json({
        status: 200,
        data: { user: user, insuranceData: insuranceData },
        token: token,
      });
    } else {
      const token = tokenUtils.generateToken(user._id.toString());

      user.device_info.push({
        device_id: req.headers.device_id,
        device_token: req.body.device_token,
        device_type: req.body.device_type,
        jwt_token: token,
      });
      await user.save();
      let insuranceData = await InsurancePayment.findOne({
        user: user._id,
      });

      if (!insuranceData) {
        insuranceData = null;
      }
      return res.status(200).send({
        status: 200,
        data: { user: user, insuranceData: insuranceData },
        token: token,
        message: "login Success",
      });
    }
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

//================================================ sendForgetOtp =======================================================//

/**
 * The function `sendForgetOtp` is an asynchronous function that sends a verification code to a user's
 * registered email for password reset.
 */
const sendForgetOtp = async (req, res, next) => {
  try {
    const email = req.body.email;
    const user = await userProfileModel.findOne({ email: email });
    console.log("user", user);
    if (!user) {
      return HttpResponse.apiResponse(
        res,
        {},
        HttpResponse.HTTP_NOT_FOUND,
        "user not found"
      );
    }

    /* The code is declaring a variable named "OTP" and assigning it the value returned by the
function "generateOTP()". */
    let OTP = generateOTP();
    if (user) {
      /* The `sendUnAuthOTP` with three parameters: `email`, `OTP`,
  and `"forgotPass"`. It is likely that this function is used to send an OTP (One-Time Password) to
  a user's email address for the purpose of password recovery. The third parameter `"forgotPass"`
  suggests that this OTP is being sent as part of a forgot password process. */

      sendUnAuthOTP(email, OTP, "forgotPass");
      user.otp = OTP;
      const deviceInfo = user.device_info.find(
        (info) => info.device_id === req.headers.device_id
      );

      if (deviceInfo) {
        deviceInfo.device_token = req.body.device_token;
        deviceInfo.device_type = req.body.device_type;
      } else {
        user.device_info.push({
          device_id: req.headers.device_id,
          device_token: req.body.device_token,
          device_type: req.body.device_type,
        });
      }

      user.save();

      return HttpResponse.apiResponse(
        res,
        user,
        HttpResponse.HTTP_OK,
        "we sent an verification code to your registered email, please verify."
      );
    } else {
      return HttpResponse.apiResponse(
        res,
        {},
        HttpResponse.HTTP_UNPROCESSABLE_ENTITY,
        "No user found"
      );
    }
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

//================================================== verifyOTP ==========================================================//

/**
 * The `verifyOTP` function is used to verify the OTP (One-Time Password) provided by the user and
 * update the user's verification status and device information accordingly.
 */

const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await userProfileModel.findOne({ email, otp });

    if (!user) {
      return res
        .status(404)
        .send({ status: 404, data: {}, message: "User Not Found" });
    }
    if (user.isVerified === false) {
      const token = tokenUtils.generateToken(user._id.toString());

      user.otp = -1;
      user.isVerified = true;
      user.device_info = [
        {
          device_id: req.headers.device_id,
          device_token: req.body.device_token,
          jwt_token: token,
          device_type: req.body.device_type,
        },
      ];
      await user.save();

      return res.status(200).send({
        status: 200,
        data: user,
        token: token,
        message: "OTP verified Successfully",
      });
    } else {
      /* Here we finding the index of a device in the `user.device_info` array that matches the
    `device_id` value from the `req.headers` object. */
      const deviceIndex = user.device_info.findIndex(
        (device) => device.device_id === req.headers.device_id
      );

      /* The below code is checking if the `deviceIndex` is not equal to -1 and if the `user`'s `otp`
     (one-time password) is equal to the provided `otp`. If both conditions are true, the code
     proceeds to update the `jwt_token` of the `device_info` object at the specified `deviceIndex`
     to null. It then generates a new token using `tokenUtils.generateToken()` function, and updates
     the `device_token`, `device_type`, and `jwt_token` of the `deviceInfo` object that matches the
     `device_id` in */
      if (deviceIndex !== -1 && user.otp === otp) {
        user.device_info[deviceIndex].jwt_token = null;
        const token = tokenUtils.generateToken(user._id.toString());

        const deviceInfo = user.device_info.find(
          (info) => info.device_id === req.headers.device_id
        );

        deviceInfo.device_token = req.body.device_token;
        deviceInfo.device_type = req.body.device_type;
        deviceInfo.jwt_token = token;

        await deviceInfo.save({ suppressWarning: true });

        user.markModified("device_info");
        user.otp = -1;
        await user.save();
        return res.status(200).send({
          status: 200,
          data: {},
          token: token,
          message: "OTP verified Successfully",
        });
      } else {
        /* The  code is generating a token using the `tokenUtils.generateToken` function. It is
       passing the `user._id` value as a parameter to the function and converting it to a string
       before generating the token. The generated token is then assigned to the `token` variable. */
        const token = tokenUtils.generateToken(user._id.toString());

        user.device_info.push({
          device_id: req.headers.device_id,
          device_token: req.body.device_token,
          device_type: req.body.device_type,
          jwt_token: token,
        });

        await user.save();
        return res.status(200).send({
          status: 200,
          data: {},
          token: token,
          message: "OTP verify success",
        });
      }
    }
  } catch (err) {
    err.statusCode = 500;
    next(err);
  }
};

//==================================================== forgetPass =======================================================//

/**
 * The function `forgetPass` is handles the logic for resetting a user's
 * password.
 */

const forgetPass = async (req, res, next) => {
  try {
    const { password, confirmNewPassword, confirmPassword } = req.body;

    const user = await userProfileModel.findOne({
      email: req.checkIfExist.email,
    });

    if (!user) {
      return res
        .status(404)
        .json({ status: 404, data: {}, message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(400)
        .json({ status: 400, data: {}, message: "Invalid old password" });
    }

    const hashedPassword = await bcrypt.hash(confirmNewPassword, 10);
    user.password = hashedPassword;
    user.confirmPassword = null;
    await user.save();
    return HttpResponse.apiResponse(
      res,
      user,
      HttpResponse.HTTP_OK,
      "Password reset successfully"
    );
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

//=================================================== newPassword ========================================================//

/**
 * The  function handles the logic for resetting a user's
 * password in a JavaScript application.
 */

const newPassword = async (req, res, next) => {
  try {
    const { newPassword, confirmNewPassword } = req.body;
    if (!newPassword) {
      return HttpResponse.apiResponse(
        res,
        {},
        HttpResponse.HTTP_UNPROCESSABLE_ENTITY,
        "Please enter a new password"
      );
    }
    const user = await userProfileModel.findOne({
      email: req.checkIfExist.email,
    });

    if (!user) {
      return res
        .status(404)
        .json({ status: 404, data: {}, message: "User not found" });
    }
    if (newPassword === confirmNewPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.confirmPassword = null;
      user.otp = -1;
      const deviceIndex = user.device_info.findIndex(
        (device) => device.device_id === req.headers.device_id
      );

      if (deviceIndex === -1) {
        // Device not found
        return res
          .status(404)
          .json({ status: 404, data: {}, message: "Device not found" });
      }

      // Access the jwt_token using the deviceIndex
      const jwtToken = user.device_info[deviceIndex].jwt_token;
      await user.save();
      return res.status(200).send({
        status: 200,
        data: {
          user,
        },
        token: jwtToken,
        message: "Password reset successfully",
      });
    } else {
      return HttpResponse.apiResponse(
        res,
        user,
        HttpResponse.HTTP_UNPROCESSABLE_ENTITY,
        "Password does not match"
      );
    }
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

//=========================================== updateProfile =============================================================//

/**
 * The `updateProfile` function updates a user's profile information and handles the uploading of
 * profile images and documents.
 * @returns a JSON response with the following properties:
 * - status: 200 (indicating a successful request)
 * - data: an object containing the updated user profile and insurance data (if available)
 * - message: "Profile Updated success"
 */

const updateProfile = async (req, res, next) => {
  try {
    const updateData = req.body;
    if (updateData) {
      const updatedUser = await userProfileModel.findByIdAndUpdate(
        req.checkIfExist._id,
        updateData,
        {
          new: true,
        }
      );

      if (req.files && req.files.profileImage) {
        updatedUser.userProfile = req.files.profileImage[0].filename;
      }
      await updatedUser.save();
      const findUserPayment = await InsurancePayment.findOne({
        user: req.checkIfExist._id,
      });

      if (findUserPayment) {
        // Existing user payment found
        if (req.files && req.files.documents) {
          const documents = req.files.documents.map(
            (file) => `/uploads/${file.filename}`
          );
          findUserPayment.documents = documents;
          await findUserPayment.save();
        }
      } else {
        // No user payment found, create a new one
        if (req.files && req.files.documents) {
          const documents = req.files.documents.map(
            (file) => `/uploads/${file.filename}`
          );
          const insurancePayment = new InsurancePayment({
            user: req.checkIfExist._id,
            documents,
          });
          await insurancePayment.save();
        }
      }
      let insuranceData = await InsurancePayment.findOne({
        user: req.checkIfExist._id,
      });
      console.log(insuranceData);
      if (!insuranceData) {
        insuranceData = null;
      }
      return res.status(200).json({
        status: 200,
        data: { user: updatedUser, insuranceData: insuranceData },
        message: "Profile Updated success",
      });
    }
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err.message);
  }
};

//===================================================== getUser ===========================================================//

/**
 * The getUser function retrieves a user's profile and insurance payment data and returns it as an API
 * response.
 */

const getUser = async (req, res, next) => {
  try {
    let user = await userProfileModel.findById({
      _id: req.checkIfExist._id,
      device_id: req.headers.device_id,
    });
    let insuranceData = await InsurancePayment.findOne({
      user: req.checkIfExist._id,
    });
    console.log(insuranceData);
    if (!insuranceData) {
      insuranceData = null;
    }
    return HttpResponse.apiResponse(
      res,
      { user, insuranceData },
      HttpResponse.HTTP_OK,
      "get user success"
    );
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

//=================================================== userNotifications =======================================================//

/**
 * The userNotifications function retrieves booking requests based on the provided status and updates
 * any expired requests to a new status.
 * @returns a JSON response with the following properties:
 * - status: The HTTP status code (200 for success)
 * - data: An array of booking objects that match the specified criteria
 * - message: A string indicating the type of booking requests (based on the status value)
 */

const userNotifications = async (req, res) => {
  try {
    let { status } = req.query;

    if (!status || status == 0 || status == 1) {
      status = [0, 1]; // Assign default value as an array of both 0 (pending) and 1 (accepted)
    } else if (status == 2 || status == 4) {
      status = [2, 4]; // Convert the single status value to an array of Numbers (2 and 3)
    } else if (status == 3 || status == 5 || status == 6) {
      status = [3, 5, 6]; // Convert the single status value to an array of Number (3)
    }
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    // Find booking requests with status 1 and updatedAt less than ten minutes ago
    const expiredbookings = await bookingModel.find({
      status: 1,
      updatedAt: { $lt: tenMinutesAgo },
    });

    // Update the status of expired booking requests to 6
    const updatePromises = expiredbookings.map(async (booking) => {
      booking.status = 6;
      await booking.save();
    });

    await Promise.all(updatePromises);
    const bookings = await bookingModel
      .find({
        userId: req.checkIfExist._id.toString(),
        status: { $in: status },
      })
      .populate("doctorId", "name userProfile specialization imageUrl")
      .sort({ updatedAt: -1 }); // Sort by createdAt field in descending order

    // Reverse the array to display the latest booking at the top

    return res.json({
      status: 200,
      data: bookings,
      message: `${status} booking requests`,
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

//=================================================== payment =========================================================//

/**
 * The function `payment` checks if a user has uploaded their insurance payment and if it has been
 * verified by an admin.
 */

const payment = async (req, res) => {
  try {
    const insurancePayment = await InsurancePayment.findOne({
      user: req.checkIfExist._id,
    });
    console.log(insurancePayment);

    if (insurancePayment == null) {
      return res
        .status(400)
        .json({ status: 400, message: "please upload your insurance" });
    }
    /* The below code is checking if the `insurancePayment` object exists and if the `adminVerify`
    property of the `insurancePayment` object is truthy. If both conditions are true, it will return
    a JSON response with a status code of 200 and a message of "success". If either condition is
    false, it will return a JSON response with a status code of 400 and a message of "Please wait
    for admin to verify your payment". */

    if (insurancePayment && insurancePayment.adminVerify) {
      return res.status(200).json({ status: 200, message: "success" });
    } else {
      return res.status(400).json({
        status: 400,
        message: "Please wait for  admin to verify your payment",
      });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

//============================================= bookingInsurancePayment ===========================================================//

/**
 * The function `bookingInsurancePayment` handles the payment process for booking insurance, including
 * checking if the booking is cancelled, verifying if the user has uploaded insurance, and updating the
 * booking status and creating a transaction record if the insurance payment is verified by the admin.
 */

const bookingInsurancePayment = async (req, res) => {
  try {
    const bookingId = req.body.bookingId;
    const checkBooking = await bookingModel.findOne({ _id: bookingId });
    if (checkBooking.status === 6) {
      return res
        .status(400)
        .json({ status: 400, message: "Your Booking Has Been Cancelled" });
    }
    const insurancePayment = await InsurancePayment.findOne({
      user: req.checkIfExist._id,
    });

    if (insurancePayment === null) {
      return res
        .status(400)
        .json({ status: 400, message: "please upload your insurance" });
    }
    /* The below code is checking if the `insurancePayment.adminVerify` variable is `true`. If it is
    `true`, then it performs the following actions: */
    if (insurancePayment.adminVerify === true) {
      console.log(req.body.bookingId);

      /* The below code is updating a booking document in a MongoDB database. */
      const booking = await bookingModel.updateOne(
        { _id: bookingId },
        { $set: { status: 2 } }
      );

      /* The below code is creating a new transaction record in a transactionModel collection. It first
      retrieves a booking record from the bookingModel collection using the provided bookingId.
      Then, it creates a new transaction record with the following properties: bookingId (set to the
      provided bookingId), amount (set to the price of the retrieved booking), status (set to
      "succeeded"), and paymentType (set to "insurance"). */

      const booking1 = await bookingModel.findOne({ _id: bookingId });
      const transaction = new transactionModel({
        bookingId: bookingId,
        amount: booking1.price,
        status: "succeeded",
        paymentType: "insurance",
      });

      await transaction.save();

      return res.status(200).json({
        status: 200,
        data: booking1,
        message: "success",
      });
    } else {
      return res.status(400).json({
        status: 400,
        message: "Please wait for  admin to verify your payment",
      });
    }
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

//=================================================== getInsurance =======================================================//

/**
 * The function `getInsurance` retrieves insurance payment data for a user and returns it as a
 * response, or returns an error message if the data is not found or if there is an internal server
 * error.
 */

const getInsurance = async (req, res) => {
  try {
    const insurancePayment = await InsurancePayment.findOne({
      user: req.checkIfExist._id,
    });

    if (insurancePayment) {
      return res.status(200).json({
        status: 200,
        message: "Success",
        data: insurancePayment,
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "Insurance data not found for the user",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

//================================================ endBookingUser =============================================================//

/**
 * The function `endBookingUser` is updates the status and endTime of a
 * booking, calculates the increment amount based on the booking price, and updates the balance of the
 * provider and assignTo (if present) based on the increment amount.
 * @returns a JSON response with the following properties:
 * - status: The status code of the response (200 for success, 404 for not found, 500 for server error)
 * - data: The booking object that was updated or found
 * - message: A message indicating the result of the operation ("Booking not found", "Booking ended
 * successfully", or an error message)
 */

const endBookingUser = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await bookingModel.findOneAndUpdate(
      {
        _id: bookingId,
        userId: req.checkIfExist._id,
        startTime: { $ne: null },
      },
      { status: 5, endTime: new Date() },
      { new: true }
    );

    if (!booking) {
      return res
        .status(404)
        .json({ status: 404, message: "Booking not found" });
    }
    if (booking.status == 5) {
      const booking1 = await bookingModel.findOne({
        _id: bookingId,
        status: 5,
      });

      console.log(booking1);
      const incrementAmount = (booking1.price * 0.7)/100; // Calculate 70% of the price
      console.log(incrementAmount);
      console.log(booking1.assignTo);

      if (!booking1.assignTo) {
        const findProvider = await providerModel.findByIdAndUpdate(
          booking1.doctorId,
          { $inc: { totalBalance: incrementAmount, balance: incrementAmount } }
        );

        console.log("proo", findProvider);
      } else {
        const doctorIncrementAmount = (booking1.price * 0.45)/100; // Calculate 45% of the price for doctorId
        const unlicensedProviderIncrementAmount = (booking1.price * 0.25)/100; // Calculate 25% of the price for assignTo unlicensed provider

        /* The below code is using the `findByIdAndUpdate` method to update a document in the
      `providerModel` collection in a MongoDB database and incrementing the values of `totalBalance` and `balance` by the values
        of `doctorIncrementAmount` and `incrementAmount` respectively.. */
        const findProvider = await providerModel.findByIdAndUpdate(
          booking1.doctorId,
          {
            $inc: {
              totalBalance: doctorIncrementAmount,
              balance: incrementAmount,
            },
          }
        );

        /* The below code is updating a document in the providerModel collection in a MongoDB database.
        It is finding a document with the ID specified in the booking1.assignTo variable and
        updating its totalBalance and balance fields by incrementing them by the values of the
        unlicensedProviderIncrementAmount and incrementAmount variables, respectively. */

        const findUnlicensedProvider = await providerModel.findByIdAndUpdate(
          booking1.assignTo,
          {
            $inc: {
              totalBalance: unlicensedProviderIncrementAmount,
              balance: incrementAmount,
            },
          }
        );
      }

      return res.json({
        status: 200,
        data: booking,
        message: "Booking ended successfully",
      });
    } else {
      return res.json({
        status: 200,
        data: booking,
        message: "Booking ended successfully",
      });
    }
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

//====================================================== createReview ==========================================================//

/**
 * The `createReview` function creates a review for a completed booking, updates the booking with the
 * review, and calculates the average rating for the provider.
 */
const createReview = async (req, res) => {
  try {
    const { bookingId, rating, review } = req.body;

    // Check if the booking is complete (status 5)
    const booking = await bookingModel.findOne({
      _id: bookingId,
      userId: req.checkIfExist._id,
      status: 5,
    });

    if (!booking) {
      return res.status(404).json({
        status: 404,
        message: "Booking not found or is not complete",
      });
    }

    // Create the review
    const createReview = new Rating({
      userId: req.checkIfExist._id,
      providerId: booking.doctorId,
      bookingId: bookingId,
      rating: rating,
      review: review,
    });

    await createReview.save();

    // Update the booking request with the review
    const findBooking = await bookingModel.findOne({ _id: bookingId });
    console.log(findBooking);
    if (findBooking.review == null) {
      const updatedBooking = await bookingModel.findOneAndUpdate(
        { _id: bookingId },
        {
          $set: {
            review: { rating: rating, review: review },
          },
        },
        { new: true }
      );
    } else {
      const updatedBooking = await bookingModel.findOneAndUpdate(
        { _id: bookingId },
        {
          $set: {
            "review.rating": rating,
            "review.review": review,
          },
        },
        { new: true }
      );
    }

    // Calculate and update the average rating for the provider
    await Rating.calculateAverageRating(booking.doctorId);

    return res.json({
      status: 200,
      data: createReview,
      message: "Review added successfully",
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

//========================================================================================================================//

module.exports = {
  signUp,
  loginUser,
  sendForgetOtp,
  forgetPass,
  verifyOTP,
  updateProfile,
  getUser,
  newPassword,
  userNotifications,
  payment,
  bookingInsurancePayment,
  endBookingUser,
  getInsurance,
  createReview,
};
