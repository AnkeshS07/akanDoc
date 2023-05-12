const jwt = require("jsonwebtoken");

const userProfileModel = require("../models/userModel");
const HttpResponse = require("../response/HttpResponse");
const { sendOTP, generateOTP,sendUnAuthOTP } = require("../common/helper");
//--------------------------------------------------------------------------------------------------------------------//
const signUp = async(req, res, next)=>{
  try {
    const { name,email, password ,phone,licenced} = req.body;
    console.log(typeof req.body.email)
   console.log(req.body)
    let OTP = generateOTP();
    let newProfile = await userProfileModel.create({
      name:name,
      email: email,
      password: password,
      otp: OTP,
      phone:phone,
      licensed:licenced
    });

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

const loginUser = async (req, res,next)=> {
  try {
    const email=req.body.email
        const user=await userProfileModel.findOne({email:email})
        if(user.password!==req.body.password){
          return res.status(400).send({status:false,msg:"Incorrect password"})
        }
       if (user.isVerified!=true) {
    
      let OTP = generateOTP();
      sendUnAuthOTP(email, OTP, "login");
       user.otp=OTP
       user.save()
      return HttpResponse.apiResponse(
        res,
        {},
        HttpResponse.HTTP_UNAUTHORIZED,
        "Your account is not verified, we sent an verification code to your registered email, please verify."
      );
    }

    let token = jwt.sign(
      {
        userId: user._id.toString(),
        project: "Z-Flix",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60,
      },
      "Z-Flix!@#%"
    );

    return res.status(201).send({ status: true, data: token });
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

//--------------------------------------------------------------------------------------------------------------------//
const sendForgetOtp = async (req, res , next) => {
  try {

    const email=req.body.email
        const user=await userProfileModel.findOne({email:email})
     
      let OTP = generateOTP();
      if(user){
        sendUnAuthOTP(email, OTP, "forgotPass");
        user.otp=OTP
        user.save()
      }
      
      return HttpResponse.apiResponse(
        res,
        {},
        HttpResponse.HTTP_OK,
        "we sent an verification code to your registered email, please verify."
      );

  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

//-----------------------------------------------------------------------------------------------------------------//

const verifyOTP = async (req, res , next) => {
  try {
    const { email, otp } = req.body;
    const user = await userProfileModel.findOne({ email });
      let token = jwt.sign(
        {
          userId: user._id.toString(),
          project: "Z-Flix",
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60,
        },
        "Z-Flix!@#%"
      );
      user.otp = -1;
      user.isVerified = true;
      user.save();
      return HttpResponse.apiResponse(
        res,
        token,
        HttpResponse.HTTP_OK,
        "OTP verified Successfull"
      );

  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

//----------------------------------------------------------------------------------------------------------------//
const forgetPass = async (req, res ,next) => {
  try {
   
    const { password, confirmNewPassword ,confirmPassword} = req.body;

    const user = await userProfileModel.findOne({ email: req.user.email });

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    if (user.password !== password) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid old password" });
    }
    user.password = confirmNewPassword;
    user.confirmPassword = null;
    await user.save();
    return res
      .status(200)
      .json({ status: true, message: "Password reset successfully" });
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};
//-----------------------------------------------------------------------------------------------------------------------//

const updateProfile = async (req, res,next) => {
  try {
   
    const updateData = req.body;

    const updatedUser = await userProfileModel.findByIdAndUpdate(
      req.user._id,
      updateData,
      {
        new: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    return res.status(200).json({ status: true, data: updatedUser });
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
};
