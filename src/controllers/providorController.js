const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const providerModel = require("../models/provider");
const HttpResponse = require("../response/HttpResponse");
const { sendOTP, generateOTP, sendUnAuthOTP } = require("../common/helper");
//--------------------------------------------------------------------------------------------------------------------//
const signUp = async (req, res, next) => {
  try {
    const { name, email, password, phone, countryCode, licensed, location } =
      req.body;

    if (!licensed) {
      return res.status(400).send({
        status: 500,
        data: {},
        message: "licensed is required.",
      });
    }
    if (!phone) {
      return res.status(400).send({
        status: 500,
        data: {},
        message: "phone is required.",
      });
    }
    let OTP = generateOTP();
    let newProfile = await providerModel.create({
      name: name,
      email: email,
      password: password,
      otp: OTP,
      phone: phone,
      countryCode: countryCode,
      licensed: licensed,
      location: location,
      device_info: [{
        device_id: req.headers.device_id,
        device_token: null,
        jwt_token: null,
        device_type: null
      }],
    });
    newProfile.save();
    // To send verification OTP

    sendOTP(email, OTP, "register");
    console.log(email);

    return HttpResponse.apiResponse(
      res,
      newProfile,
      HttpResponse.HTTP_CREATED,
      "Registration successful, We have sent OTP to your registered email, please verify."
    );
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

//---------------------------------------------------------------------------------------------------------------//

const loginUser = async (req, res, next) => {
  try {
    const email = req.body.email;

    const user = await providerModel.findOne({ email: email });
    console.log(user);
    if (!user) {
      return res
        .status(400)
        .send({
          status: 400,
          data: {},
          message: "Account does  not exist with this credential",
        });
    }
    if (user.password !== req.body.password) {
      return res
        .status(400)
        .send({ status: 400, message: "Incorrect password" });
    }
    if (user.isVerified != true) {
      let OTP = generateOTP();
      sendUnAuthOTP(email, OTP, "login");
      user.otp = OTP;
      user.save();
      return HttpResponse.apiResponse(
        res,
        user,
        HttpResponse.HTTP_UNAUTHORIZED,
        "Your account is not verified, we sent an verification code to your registered email, please verify."
      );
    }
    user.device_info.forEach(async(e)=> {
      if(user.device_info[0].device_id==req.headers.device_id){
        console.log("yessssssssssssssss")
        let token = jwt.sign(
          {
            userId: user._id.toString(),
            project: "AKANDOC",
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60,
          },
          "AKANDOC!@#%"
        )
        let user1 = await providerModel.findByIdAndUpdate(
          user._id,
          {
            $set: {
              "device_info.$[info].jwt_token": token
            },
          },
          { new: true, arrayFilters: [{ "info.device_id": req.headers.device_id }] }
    
        );
        return res.status(200).send({
          status: 200,
          data: user1,
          token: user1.device_info[0].jwt_token,
        });
      }

    });
 
    if (user.device_info[0].device_id !== req.headers.device_id) {
      let token = jwt.sign(
        {
          userId: user._id.toString(),
          project: "AKANDOC",
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60,
        },
        "AKANDOC!@#%"
      );
    
      let user1 = await providerModel.findByIdAndUpdate(
        user._id,
        {
          $push: {
            device_info: {
              device_id: req.headers.device_id,
              device_token: req.body.device_token,
              device_type: req.body.device_type,
              jwt_token: token,
            },
          },
        },
        { new: true }
      );
    
      return res.status(200).send({
        status: 200,
        data: user1,
        token: token,
      });
    }
  }catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

//--------------------------------------------------------------------------------------------------------------------//
const sendForgetOtp = async (req, res, next) => {
  try {
    const email = req.body.email;
    const user = await providerModel.findOne({
      email: email,
      device_id: req.headers.device_id,
    });

    let OTP = generateOTP();
    if (user) {
      sendUnAuthOTP(email, OTP, "forgotPass");
      user.otp = OTP;
      user.save();
    }
    console.log("user", user);
    return HttpResponse.apiResponse(
      res,
      user,
      HttpResponse.HTTP_OK,
      "we sent an verification code to your registered email, please verify."
    );
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

//-----------------------------------------------------------------------------------------------------------------//

const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    console.log("heaaderss",req.headers.device_id);
    const user = await providerModel.findOne({
      email,
      otp,
      "device_info.device_id": req.headers.device_id,
    });
    console.log("user", user);
    if (!user) {
      return res
        .status(400)
        .send({ status: 400, data: {}, message: "No User Found" });
    }
    if (user.isVerified === false) {
      let token = jwt.sign(
        {
          userId: user._id.toString(),
          project: "AKANDOC",
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60,
        },
        "AKANDOC!@#%"
      );
      user.otp = -1;
      user.isVerified = true;
      user.device_info = [{
        device_id: req.headers.device_id,
        device_token: null,
        jwt_token: token,
        device_type: null,
      }];
      await user.save();
      return res.status(200).send({
        status: 200,
        data: user,
        token: token,
        message: "OTP verified Successfully",
      });
    } else if (
      user.isVerified === true &&
      user.otp === otp &&
      otp !== -1 &&
      user.device_info[0].device_id === req.headers.device_id
    ) {
      let token = jwt.sign(
        {
          userId: user._id.toString(),
          project: "AkANDOC",
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60,
        },
        "AKANDOC!@#%"
      );
      user.otp = -1;
      user.isVerified = true;
      user.device_info[0].jwt_token = token;
      await user.save();
      return res.status(200).send({
        status: 200,
        token: token,
        data: user,
        message: "OTP verified Successfully",
      });
    } else {
      return res.status(422).send({
        status: 422,
        data: {},
        message: "Invalid OTP",
      });
    }
  } catch (err) {
    err.statusCode = 500;
    next(err);
  }
};

//----------------------------------------------------------------------------------------------------------------//
const forgetPass = async (req, res, next) => {
  try {
    const { password, confirmNewPassword, confirmPassword } = req.body;

    const user = await providerModel.findOne({
      email: req.user.email,
      device_id: req.headers.device_id,
    });

    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    if (user.password !== password) {
      return res
        .status(400)
        .json({ status: 400, message: "Invalid old password" });
    }
    user.password = confirmNewPassword;
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
//-----------------------------------------------------------------------------------------------------------------------//
const newPassword = async (req, res, next) => {
  try {
    const { newPassword, confirmNewPassword } = req.body;
    if (!newPassword) {
      return HttpResponse.apiResponse(
        res,
        {},
        HttpResponse.HTTP_UNPROCESSABLE_ENTITY,
        "Plase enter new password"
      );
    }
    const user = await providerModel.findOne({
      email: req.user.email,
      device_id: req.headers.device_id,
    });

    if (!user) {
      return res
        .status(404)
        .json({ status: 404, data: {}, message: "User not found" });
    }
    if (newPassword === confirmNewPassword && user.password != newPassword) {
      user.password = newPassword;
      user.confirmPassword = null;
      user.otp = -1;
      await user.save();
      return HttpResponse.apiResponse(
        res,
        user,
        HttpResponse.HTTP_OK,
        "Password reset successfully"
      );
    } else {
      return HttpResponse.apiResponse(
        res,
        {},
        HttpResponse.HTTP_UNPROCESSABLE_ENTITY,
        "Password does not match or same as current password"
      );
    }

    // return res
    //   .status(200)
    //   .json({ status: true, message: "Password reset successfully" });
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};
//-----------------------------------------------------------------------------------------------------------------------//
const updateProfile = async (req, res, next) => {
  try {
    const updateData = req.body;

    const updatedUser = await providerModel.findByIdAndUpdate(
      req.user._id,
      updateData,
      {
        new: true,
      }
    );
    console.log(updateData);
    if (req.file) {
      updatedUser.userProfile = req.file.filename;
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
      "updated successfully"
    );
  } catch (err) {
    // Handle errors
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

const getProfileImage = async (req, res, next) => {
  try {
    let file = req.query.file;
    let filePath = path.join(__dirname, "../../uploads", file);

    console.log("File path:", filePath);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return HttpResponse.apiResponse(
          res,
          {},
          HttpResponse.HTTP_NOT_FOUND,
          "file not found"
        );
      }

      res.status(200).download(filePath);
    });
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

const getProvider = async (req, res, next) => {
  try {
    let user = await providerModel.findById({
      _id: req.user._id,
      device_id: req.headers.device_id,
    });
    if (user) {
      return HttpResponse.apiResponse(
        res,
        user,
        HttpResponse.HTTP_OK,
        "get user success"
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

const getAllProviders = async (req, res, next) => {
  try {
    let allProviders = await providerModel.find();
    if (allProviders) {
      return HttpResponse.apiResponse(
        res,
        { allProviders },
        HttpResponse.HTTP_OK,
        "get provider success"
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

const getEnums = async (req, res) => {
  try {
    const qualificationEnums = ["mbbs", "phd", "pgi"];
    const specializationEnums = [
      "Specialization1",
      "Specialization2",
      "Specialization3",
    ];

    return res.status(200).json({
      status: 200,
      data: {
        qualification: qualificationEnums,
        specialization: specializationEnums,
      },
      message: "get data successfully",
    });
  } catch (error) {
    console.error("Error retrieving enums:", error);
    return res
      .status(400)
      .json({
        status: 400,
        message: "An error occurred while retrieving enums",
      });
  }
};

module.exports = {
  signUp,
  loginUser,
  sendForgetOtp,
  forgetPass,
  verifyOTP,
  updateProfile,
  getProfileImage,
  getProvider,
  getAllProviders,
  newPassword,
  getEnums,
};
