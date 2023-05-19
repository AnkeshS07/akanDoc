const jwt = require("jsonwebtoken");
const fs=require('fs');
const path=require('path')
const userProfileModel = require("../models/userModel");
const HttpResponse = require("../response/HttpResponse");
const { sendOTP, generateOTP,sendUnAuthOTP } = require("../common/helper");
const revokedTokenModel = require('../models/revokedModel');
//--------------------------------------------------------------------------------------------------------------------//
const signUp = async(req, res, next)=>{
  try {
    const { name,email, password ,phone,countryCode} = req.body;
    console.log(typeof req.body.email)
   console.log(req.body)
    let OTP = generateOTP();
    let newProfile = await userProfileModel.create({
      name:name,
      email: email,
    
      password: password,
      otp: OTP,
      phone:phone,
      countryCode:countryCode,
      device_info: [{
        device_id: req.headers.device_id,
        device_token: null,
        jwt_token: null,
        device_type: null
      }],
    });
    newProfile.save()
    // To send verification OTP

    sendOTP(email, OTP, "register");
    console.log(email)

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
    const user = await userProfileModel.findOne({ email: email });

    if (!user) {
      return res.status(400).send({
        status: 400,
        data: {},
        message: "Account does not exist with this credential",
      });
    }

    if (user.password !== req.body.password) {
      return res.status(400).send({ status: 400,data:{}, message: "Incorrect password" });
    }

    if (user.isVerified != true) {
      let OTP = generateOTP();
      sendUnAuthOTP(email, OTP, "login");
      user.otp = OTP;
      await user.save();

      return res.status(401).send({
        status: 401,
        data:{},
        message:
          "Your account is not verified, we sent a verification code to your registered email, please verify.",
      });
    }

    const matchingDeviceInfo = user.device_info.find(
      (info) => info.device_id === req.headers.device_id
    );

    if (matchingDeviceInfo) {
      let token = jwt.sign(
        {
          userId: user._id.toString(),
          project: "AKANDOC",
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60,
        },
        "AKANDOC!@#%"
      );

      matchingDeviceInfo.jwt_token = token;
      await user.save();

      return res.status(200).send({
        status: 200,
        data: user,
        token: matchingDeviceInfo.jwt_token,
        message:"login success"
      });
    }

    let token = jwt.sign(
      {
        userId: user._id.toString(),
        project: "AKANDOC",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60,
      },
      "AKANDOC!@#%"
    );

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
      message:"login Success"
    });
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};
;

//--------------------------------------------------------------------------------------------------------------------//
const sendForgetOtp = async (req, res , next) => {
  try {

    const email=req.body.email
        const user=await userProfileModel.findOne({email:email,device_id:req.headers.device_id})
         console.log("user",user)
      let OTP = generateOTP();
      if(user){
        sendUnAuthOTP(email, OTP, "forgotPass");
        user.otp=OTP
        user.save()
      
      
      return HttpResponse.apiResponse(
        res,
        user,
        HttpResponse.HTTP_OK,
        "we sent an verification code to your registered email, please verify."
      );
      }else{
          
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

//-----------------------------------------------------------------------------------------------------------------//

const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await userProfileModel.findOne({ email, otp });
    console.log("userrrrrrrrrrrr", user);
    if (!user) {
      return res.status(404).send({ status: 404, data: {}, message: "User Not Found" });
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
      user.device_info = [
        {
          device_id: req.headers.device_id,
          device_token: req.body.device_token,
          jwt_token: token,
          device_type: req.body.device_type,
        },
      ];
      user.save();
      console.log("user");

      return res.status(200).send({
        status: 200,
        data: user,
        token: token,
        message: "OTP verified Successfully",
      });
    } else {
      const deviceIndex = user.device_info.findIndex((device) => device.device_id === req.headers.device_id);
      if (deviceIndex !== -1 && user.otp === otp) {
        user.device_info[deviceIndex].jwt_token = null;
        user.markModified('device_info');
        await user.save();
        return res.status(200).send({
          status: 200,
          data: {},
          message: "OTP verified Successfully",
        });
      } else {
        return res.status(404).send({
          status: 404,
          data: {},
          message: "User not found or invalid OTP",
        });
      }
    }
  } catch (err) {
    err.statusCode = 500;
    next(err);
  }
};


//----------------------------------------------------------------------------------------------------------------//
const forgetPass = async (req, res ,next) => {
  try {
   
    const { password, confirmNewPassword ,confirmPassword} = req.body;

    const user = await userProfileModel.findOne({ email: req.checkIfExist.email});

    if (!user) {
      return res.status(404).json({ status: 404,data:{}, message: "User not found" });
    }

    if (user.password !== password) {
      return res
        .status(400)
        .json({ status: 400, data:{},message: "Invalid old password" });
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
    // return res
    //   .status(200)
    //   .json({ status: true, message: "Password reset successfully" });
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};
//--------------------------------------------------update new pass--------------------------------------------------------//
const newPassword = async (req, res ,next) => {
  try {
   
    const { newPassword ,confirmNewPassword} = req.body;
  if(!newPassword){
    return HttpResponse.apiResponse(
      res,
      {},
      HttpResponse.HTTP_UNPROCESSABLE_ENTITY,
      "Plase enter new password"
    );
  }
    const user = await userProfileModel.findOne({ email: req.checkIfExist.email});

    if (!user) {
      return res.status(404).json({ status: 404,data:{}, message: "User not found" });
    }
   if(newPassword===confirmNewPassword){
    user.password = newPassword;
    user.confirmPassword = null;
    user.otp=null
    await user.save();
    return HttpResponse.apiResponse(
      res,
      {},
      HttpResponse.HTTP_OK,
      "Password reset successfully"
    );
   }else{
    return HttpResponse.apiResponse(
      res,
      user,
      HttpResponse.HTTP_UNPROCESSABLE_ENTITY,
      "Password does not match"
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
    console.log("fillle",req.file)
    const updateData = req.body;
    // const user=await userProfileModel.findOne({email:req.checkIfExist.email,device_id:req.headers.device_id})
    if(updateData){
      const updatedUser = await userProfileModel.findByIdAndUpdate(
        req.checkIfExist._id,
        updateData,
        {
          new: true,
        }
      );
  
      if (req.file) {
        updatedUser.userProfile = req.file.filename
      }
  
      await updatedUser.save();
      //return res.status(200).send({status:200,data:{updatedUser},token:updatedUser.jwt_token,message:" "updated successfully""})
      return HttpResponse.apiResponse(
        res,
        updatedUser,
        HttpResponse.HTTP_OK,
        "updated successfully"
      );
    }
  
    
    
  } catch (err) {
    // Handle errors
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err.message);
  }
};

const getProfileImage = async (req, res, next) => {
  try {
    let file = req.query.file;
    let filePath = path.join(__dirname, '../../uploads', file);

    console.log('File path:', filePath);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
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


const getUser = async (req, res, next) => {
  try {
    let user=await userProfileModel.findById({_id:req.checkIfExist._id,device_id:req.headers.device_id})
    if(user){
      return HttpResponse.apiResponse(
        res,
        user,
        HttpResponse.HTTP_OK,
        "get user success"
      );
      
    }else{
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


module.exports = {
  signUp,
  loginUser,
  sendForgetOtp,
  forgetPass,
  verifyOTP,
  updateProfile,
  getProfileImage,
  getUser,
  newPassword
};
