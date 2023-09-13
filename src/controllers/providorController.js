const providerModel = require("../models/provider");
const HttpResponse = require("../response/HttpResponse");
const skillModel = require("../models/skillModel");
const specializationModel = require("../models/specialization");
const qualificationModel = require("../models/qualificationModel");
const Rating = require("../models/reviewModel");
const bookingModel = require("../models/bookingModel");
const payoutModel = require("../models/payoutModel");
const bookingStartNotification =
  require("../common/notification").bookingStartNotification;
const { sendOTP, generateOTP, sendUnAuthOTP } = require("../common/helper");
const bcrypt = require("bcrypt");
const tokenUtils = require("../common/tokenUtils");
const { sendNotification } = require("../common/notification");
const saltRounds = 10;
//======================================================== signUp =========================================================//

/**
 * The `signUp` function is responsible for handling the registration process, including validating the
 * input, generating an OTP, hashing the password, creating a new user profile, adding device
 * information, sending a verification OTP, and returning a response.
 */
const signUp = async (req, res, next) => {
  try {
    const { name, email, password, phone, countryCode, licensed, location } =
      req.body;

    if (!phone) {
      return res.status(400).send({
        status: 500,
        data: {},
        message: "phone is required.",
      });
    }
    let OTP = generateOTP();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    let newProfile = await providerModel.create({
      name: name,
      email: email,
      password: hashedPassword,
      otp: OTP,
      phone: phone,
      countryCode: countryCode,
      licensed: licensed,
      location: location,
    });

    // Add device_info to the newly created user profile
    newProfile.device_info = [
      {
        device_id: req.headers.device_id,
        device_token: req.body.device_token,
        jwt_token: null,
        device_type: req.body.device_type,
      },
    ];

    await newProfile.save();

    // To send verification OTP
    sendOTP(email, OTP, "register");

    return HttpResponse.apiResponse(
      res,
      newProfile,
      HttpResponse.HTTP_CREATED,
      "Registration successful. We have sent an OTP to your registered email. Please verify."
    );
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err.message);
  }
};

//============================================== loginProvider ===============================================================//

/**
 * The `loginUser` function handles the login process for a user,
 * including checking the user's credentials, verifying the account, and generating a token for
 * authentication.
 */
const loginProvider = async (req, res, next) => {
  try {
    const email = req.body.email;

    const user = await providerModel.findOne({ email: email });
    console.log(user);
    if (!user) {
      return res.status(400).send({
        status: 400,
        data: {},
        message: "Account does not exist with this credential",
      });
    }

    const passwordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!passwordMatch) {
      return res
        .status(400)
        .send({ status: 400, message: "Incorrect password" });
    }

    if (user.isVerified !== true) {
      /* The code is generating a One-Time Password (OTP) and sending it to a specified email
    address for the purpose of authentication during a login process. */
      let OTP = generateOTP();
      sendUnAuthOTP(email, OTP, "login");
      user.otp = OTP;
      await user.save();
      return res.status(401).send({
        status: 401,
        data: {},
        message:
          "Your account is not verified. We sent a verification code to your registered email. Please verify.",
      });
    }

    /* The code is finding the device information of a user based on the device ID provided in the
   request headers. If the device information is found, it generates a token using the user's ID,
   updates the JWT token for the device in the user's device_info array, saves the user, and returns
   a response with status 200, user data, and the generated token. */

    const deviceInfo = user.device_info.find(
      (info) => info.device_id === req.headers.device_id
    );

    if (deviceInfo) {
      const token = tokenUtils.generateToken(user._id.toString());

      user.device_info.forEach(async (info) => {
        if (info.device_id === req.headers.device_id) {
          info.jwt_token = token;
        }
      });

      await user.save();

      return res.status(200).send({
        status: 200,
        data: user,
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

      return res.status(200).send({
        status: 200,
        data: user,
        token: token,
      });
    }
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

//================================================= sendForgetOtp ===========================================================//

/**
 * The function `sendForgetOtp`  sends a verification code to a user's
 * registered email for the purpose of resetting their password.
 */
const sendForgetOtp = async (req, res, next) => {
  try {
    const email = req.body.email;
    const user = await providerModel.findOne({
      email: email,
    });

    if (!user) {
      return HttpResponse.apiResponse(
        res,
        {},
        HttpResponse.HTTP_NOT_FOUND,
        "User not found"
      );
    }

    let OTP = generateOTP();
    /*  It is checking if a user exists and if so, it sends
    an OTP (One-Time Password) to the user's registered email for the "forgotPass" action. The OTP
    is also stored in the user object. */
    if (user) {
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

      await user.save();
    }

    return HttpResponse.apiResponse(
      res,
      user,
      HttpResponse.HTTP_OK,
      "We sent a verification code to your registered email. Please verify."
    );
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

//=================================================== verifyOTP ============================================================//

/**
 * The function `verifyOTP` is used to verify the OTP (One-Time Password) provided by the user and
 * update the user's verification status and device information accordingly.
 */
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await providerModel.findOne({
      email,
      otp,
    });

    if (!user) {
      return res
        .status(400)
        .send({ status: 400, data: {}, message: "invalid otp" });
    }
    if (user.isVerified === false) {
      const token = tokenUtils.generateToken(user._id.toString());
      const updateUser = await providerModel.findOne({
        email,
      });
      const index = updateUser.device_info.findIndex(
        (device) => device.device_id === req.headers.device_id
      );

      if (index !== -1) {
        updateUser.device_info[index].jwt_token = token;
      } else {
        return res
          .status(400)
          .send({ status: 400, message: "device_id not found" });
      }
      updateUser.otp = -1;
      updateUser.isVerified = true;

      await updateUser.save();
      return res.status(200).send({
        status: 200,
        data: updateUser,
        token: token,
        message: "OTP verified Successfully",
      });
    } else {
      const deviceIndex = user.device_info.findIndex(
        (device) => device.device_id === req.headers.device_id
      );

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

        /* The above code is checking if the `deviceIndex` is not equal to -1 and if the `otp` provided by
     the user matches the stored `otp`. If both conditions are true, the code proceeds to update the
     `jwt_token` of the device in the `user` object to null. It then generates a new token using
     `tokenUtils.generateToken()` and updates the `device_token`, `device_type`, and `jwt_token` of
     the `deviceInfo` object. The `deviceInfo` object is then saved, and the `device_info` property
     of the `user` */
      } else {
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
        /* The above code is handling the logic for verifying an OTP (one-time password) in a user
      authentication process. If the OTP is successfully verified, it generates a JWT (JSON Web
      Token) for the user and saves the user's device information (device ID, device token, device
      type, and JWT token) in the user's device_info array. Finally, it sends a response with a
      status code of 200, an empty data object, the generated token, and a success message. */
      }
    }
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

//================================================ forgetPass ==============================================================//

/**
 * The function `forgetPass` is an asynchronous function that handles the logic for resetting a user's
 * password.
 * @returns an HTTP response with the updated user profile if the password is successfully updated.
 */

const forgetPass = async (req, res, next) => {
  try {
    const { password, confirmNewPassword, confirmPassword } = req.body;

    const user = await providerModel.findOne({
      email: req.user.email,
    });

    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(400)
        .json({ status: 400, message: "Invalid old password" });
    }

    user.password = await bcrypt.hash(confirmNewPassword, 10);

    user.confirmPassword = null;
    await user.save();

    return HttpResponse.apiResponse(
      res,
      user,
      HttpResponse.HTTP_OK,
      "Profile Updated successfully"
    );
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

//================================================= newPassword ============================================================//

/**
 * The function `newPassword` is an asynchronous function that handles the logic for updating a user's
 * password and returning a response.
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
    const user = await providerModel.findOne({
      email: req.user.email,
    });

    if (!user) {
      return res
        .status(404)
        .json({ status: 404, data: {}, message: "User not found" });
    }

    if (newPassword === confirmNewPassword && user.password !== newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.confirmPassword = null;
      user.otp = -1;

      const deviceIndex = user.device_info.findIndex(
        (device) => device.device_id === req.headers.device_id
      );

      if (deviceIndex === -1) {
        return res
          .status(404)
          .json({ status: 404, data: {}, message: "Device not found" });
      }

      const jwtToken = user.device_info[deviceIndex].jwt_token;
      await user.save();
      return res.status(200).send({
        status: 200,
        data: {
          user,
        },
        token: jwtToken,
        message: "Profile Updated successfully",
      });

      /* The above code is checking if the new password entered by the user matches the confirmed new
  password and if the user's current password is not the same as the new password. If the conditions
  are met, the code then hashes the new password using bcrypt, updates the user's password, sets the
  confirmPassword field to null, and sets the otp field to -1. */
    } else {
      return HttpResponse.apiResponse(
        res,
        user,
        HttpResponse.HTTP_UNPROCESSABLE_ENTITY,
        "Passwords do not match"
      );
    }
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

//================================================== updateProfile ========================================================//

/**
 * The `updateProfile` function updates a user's profile information, including their specialization,
 * qualification, skills, and uploaded files, and returns the updated user object.

 * @returns The `updateProfile` function returns an API response with the updated user data, HTTP
 * status code 200 (HTTP_OK), and a success message "Updated successfully".
 */

const updateProfile = async (req, res, next) => {
  try {
    const updateData = req.body;
    const skillIds = req.body.skill;
    const specialization = await specializationModel.findById(
      updateData.specialization
    );

    updateData.location.coordinates[0] = parseFloat(
      updateData.location.coordinates[0]
    );
    updateData.location.coordinates[1] = parseFloat(
      updateData.location.coordinates[1]
    );

    const qualification = await qualificationModel.findById(
      updateData.qualification
    );
    const skills = await skillModel.find({ _id: { $in: skillIds } });

    const updatedUser = await providerModel.findByIdAndUpdate(
      req.user._id,
      updateData,
      {
        new: true,
      }
    );

    updatedUser.skills = skills;
    updatedUser.specialization = specialization;
    updatedUser.qualification = qualification;
    await updatedUser.save();
    if (req.files) {
      if (req.files.file) {
        updatedUser.userProfile = req.files.file[0].filename;
      }

      if (req.files.file2) {
        updatedUser.userDoc = req.files.file2[0].filename;
      }
    }

    await updatedUser.save();

    if (!updatedUser) {
      return HttpResponse.apiResponse(
        res,
        {},
        HttpResponse.HTTP_NOT_FOUND,
        "User not found"
      );
    }

    return HttpResponse.apiResponse(
      res,
      updatedUser,
      HttpResponse.HTTP_OK,
      "Updated successfully"
    );
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

//============================================== getProvider ============================================================//

/**
 * The function `getProvider` retrieves data about a provider, including their reviews and average
 * rating, and returns it as a response.
 * @returns an API response with the user data or provider data, depending on whether the provider has
 * reviews or not.
 */

const getProvider = async (req, res, next) => {
  try {
    const providerId = req.user._id;
    const providerData = await providerModel.findById({ _id: providerId });
    if (providerData.reviews != null) {
      const reviewCount = await Rating.countDocuments({ providerId });
      const totalRating = await Rating.aggregate([
        { $match: { providerId } },
        {
          $group: {
            _id: null,
            total: { $sum: "$rating" },
          },
        },
      ]);

      const avgRating =
        reviewCount > 0 ? totalRating[0].total / reviewCount : 0;

      const user = await providerModel.findByIdAndUpdate(
        providerId,
        {
          $set: {
            "reviews.total": reviewCount,
            "reviews.avg": avgRating,
          },
        },
        { new: true }
      );

      if (user) {
        return HttpResponse.apiResponse(
          res,
          user,
          HttpResponse.HTTP_OK,
          "Get user success"
        );
      }
    } else {
      return HttpResponse.apiResponse(
        res,
        providerData,
        HttpResponse.HTTP_OK,
        "Get user success"
      );
    }
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

//===================================================== getAllProviders ======================================================//

/**
 * The function `getAllProviders` retrieves all provider data and returns it as an API response.
 * @returns an API response with the following parameters:
 * - `res`: The response object
 * - `{ allProviders }`: An object containing all providers data
 * - `HttpResponse.HTTP_OK`: The HTTP status code for a successful request
 * - `"all providers data"`: A message indicating the purpose of the response
 */

const getAllProviders = async (req, res, next) => {
  try {
    let allProviders = await providerModel.find();
    if (allProviders) {
      return HttpResponse.apiResponse(
        res,
        { allProviders },
        HttpResponse.HTTP_OK,
        "all providers data"
      );
    } else {
      return HttpResponse.apiResponse(
        res,
        {},
        HttpResponse.HTTP_NOT_FOUND,
        "user not found"
      );
    }
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

//========================================================================================================================//

//============================================= startEndBookingProvider =====================================================//

/**
 * The function `startEndBookingProvider` updates the status, start time, and end time of a booking,
 * and sends a notification to the user based on the start and end parameters.
 * @returns a JSON response with the following properties:
 * - status: The HTTP status code (200 for success, 404 for not found, 500 for internal server error)
 * - data: The updated booking object
 * - message: A message indicating the result of the operation ("Booking status updated successfully"
 * or an error message)
 */

const startEndBookingProvider = async (req, res) => {
  try {
    const { bookingId, start, end } = req.body;
    const bookingDetails = await bookingModel.findOne({ _id: bookingId });

    const updateFields = {};
    /* The if block is checking if the variable "start" is equal to 1. If it is, it updates the
    "status" field of "updateFields" object to 4 and sets the "startTime" field to the current date
    and time. It then creates a notification message and calls the "bookingStartNotification"
    function, passing the "userId" from "bookingDetails" and the notification message as arguments. */
    if (start === 1) {
      updateFields.status = 4;
      updateFields.startTime = new Date();
      await sendNotification(bookingDetails.userId,"user","bookingStart");
    } else if (end === 2) {
      updateFields.status = 5;
      updateFields.endTime = new Date();
      await sendNotification(bookingDetails.userId, "user" ,"bookingEnd");
      const booking = await bookingModel.findByIdAndUpdate(
        { _id: bookingId, providerId: req.user._id },
        updateFields,
        { new: true }
      );
      console.log(booking);
      const bookingRequest1 = await bookingModel.findOne({
        _id: bookingId,
        status: 5,
      });

      if (!bookingRequest1.assignTo) {
        const incrementAmount = (bookingRequest1.price * 0.7)/100
        console.log(incrementAmount);

        const findProvider = await providerModel.findByIdAndUpdate(
          bookingRequest1.doctorId,
          { $inc: { totalBalance: incrementAmount, balance: incrementAmount } },
          { new: true }
        );
      } else {
        const doctorIncrementAmount = (bookingRequest1.price * 0.45)/100
        const unlicensedProviderIncrementAmount = (bookingRequest1.price * 0.25)/100;

        const findProvider = await providerModel.findByIdAndUpdate(
          bookingRequest1.doctorId,
          {
            $inc: {
              totalBalance: doctorIncrementAmount,
              balance: doctorIncrementAmount,
            },
          }
        );

        const findUnlicensedProvider = await providerModel.findByIdAndUpdate(
          bookingRequest1.assignTo,
          {
            $inc: {
              totalBalance: unlicensedProviderIncrementAmount,
              balance: unlicensedProviderIncrementAmount,
            },
          }
        );
      }
      /* The else block is handling the case when the "end" variable is equal to 2. It updates the
    status and endTime fields of a booking, sends a notification to the user, and updates the
    balances of the provider and assignTo (if present) based on the booking price. */
    }

    const booking = await bookingModel.findByIdAndUpdate(
      { _id: bookingId, providerId: req.user._id },
      updateFields,
      { new: true }
    );

    if (!booking) {
      return res
        .status(404)
        .json({ status: 404, message: "Booking not found" });
    }

    return res.json({
      status: 200,
      data: booking,
      message: "Booking status updated successfully",
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

//================================================== payout ===========================================================//

/**
 * The function `payout` handles the creation of a payout for a provider, checking if they have any
 * pending withdrawals and if the withdrawal amount is less than or equal to their balance.
 */

const payout = async (req, res) => {
  try {
    let { provider, amount } = req.body;
    provider = req.user._id;
    const check = await payoutModel.findOne({
      provider: provider,
      adminVerify: 0,
    });
    const providerBalance = await providerModel.findById({ _id: provider });
    if (check) {
      return res
        .status(400)
        .json({ status: 400, message: "please wait 1 withdrawl upcomming" });
    } else if (providerBalance.balance >= amount) {
      const payout = new payoutModel({
        provider: provider,
        amount,
        adminVerify: 0,
      });

      await payout.save();

      return res
        .status(200)
        .json({ status: 200, message: "Payout created successfully" });
    } else {
      return res.status(400).json({
        status: 400,
        message: "withdrwal amount should be less or equalTo your balance",
      });
    }
  } catch (error) {
    console.error("Error creating payout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//===================================================== getPayout ========================================================//

/**
 * The getPayout function retrieves a list of payouts for a specific provider, with pagination and
 * metadata.
 * @returns a response object with a status code, metadata, a list of payouts, and a message.
 */

const getPayout = async (req, res) => {
  try {
    const provider = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await payoutModel.countDocuments({ provider });

    const payout = await payoutModel
      .find({ provider })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate({
        path: "provider",
        select: "name imageUrl userProfile",
      });

    if (payout) {
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;

      const metadata = {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage,
      };

      return res.status(200).json({
        status: 200,
        metaData: metadata,
        list: payout,
        message: "success",
      });
    } else {
      return res.status(404).json({ status: 404, message: "Payout not found" });
    }
  } catch (error) {
    console.error("Error retrieving payout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//================================================ getProviderEarming ========================================================//

/**
 * The function `getProviderEarning` retrieves booking data for a provider, calculates modified prices
 * based on the provider's licensing status, and returns the bookings along with metadata and user
 * balance information.
 * @returns a JSON response with the following properties:
 * - status: The HTTP status code of the response (200 for success, 404 for user not found, 500 for
 * internal server error).
 * - metaData: An object containing metadata about the pagination of the bookings (page, limit, total,
 * totalPages, hasNextPage).
 * - list: An array of bookings.
 * - totalBalance: The total
 */

const getProviderEarming = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await providerModel
      .findOne({ _id: userId })
      .select("totalBalance balance licensed");
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    let query;
    if (user.licensed === false) {
      query = { assignTo: userId, status: 5 };
    } else {
      query = { doctorId: userId, status: 5 };
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await bookingModel.countDocuments(query);

    const bookings = await bookingModel
      .find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name imageUrl userProfile _id");

    if (!bookings || bookings.length === 0) {
      const response = {
        totalBalance: user.totalBalance,
        balance: user.balance,
      };

      console.log("response", response);
      return res.status(200).json({
        status: 200,
        data: response,
        message: "No bookings found for the user",
      });
    }

    bookings.forEach((booking) => {
      if (user.licensed === false) {
        const modifiedPrice = booking.price * 0.25;
        booking.price = modifiedPrice;
      } else {
        if (booking.assignTo) {
          const modifiedPrice = booking.price * 0.45;
          booking.price = modifiedPrice;
        } else {
          const modifiedPrice = booking.price * 0.7;
          booking.price = modifiedPrice;
        }
      }
    });

    /* The above code is iterating over an array called "bookings" and modifying the price of each booking
based on certain conditions. */

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;

    const metadata = {
      page,
      limit,
      total: totalCount,
      totalPages,
      hasNextPage,
    };

    return res.status(200).json({
      status: 200,
      metaData: metadata,
      list: bookings,
      totalBalance: user.totalBalance,
      balance: user.balance,
      message: "Success",
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

//========================================================================================================================//

module.exports = {
  signUp,
  loginProvider,
  sendForgetOtp,
  forgetPass,
  verifyOTP,
  updateProfile,
  getProvider,
  getAllProviders,
  newPassword,
  payout,
  startEndBookingProvider,
  getPayout,
  getProviderEarming,
};
