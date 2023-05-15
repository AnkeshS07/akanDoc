const jwt = require("jsonwebtoken");
const fs=require('fs');
const path=require('path')
const providerModel = require("../models/provider");
const HttpResponse = require("../response/HttpResponse");
const { sendOTP, generateOTP,sendUnAuthOTP } = require("../common/helper");
//--------------------------------------------------------------------------------------------------------------------//
const signUp = async(req, res, next)=>{
  try {
    const { name,email, password ,phone,countryCode,licensed} = req.body;
    console.log(typeof req.body.email)
   console.log(req.body)
   if(!licensed){
    return res.status(400).send({
        "status": 500,
        "data": {},
        "message": "licensed is required."
    })
   }
   if(!phone){
    return res.status(400).send({
        "status": 500,
        "data": {},
        "message": "phone is required."
    })
   }
    let OTP = generateOTP();
    let newProfile = await providerModel.create({
      name:name,
      email: email,
      password: password,
      otp: OTP,
      phone:phone,
      countryCode:countryCode,
      licensed:licensed
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

const loginUser = async (req, res,next)=> {
  try {
    const email=req.body.email
        const user=await providerModel.findOne({email:email})
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
        project: "AKANDOC",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60,
      },
      "AKANDOC!@#%"
    );

    return res.status(201).send({ status: true, token: token ,data:user});
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

//--------------------------------------------------------------------------------------------------------------------//
const sendForgetOtp = async (req, res , next) => {
  try {

    const email=req.body.email
        const user=await providerModel.findOne({email:email})
     
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
    const user = await providerModel.findOne({ email,otp });
    console.log(user)
    if(user.isVerified==false){
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
      user.save();
      return res.status(200).send(
       { status:200,
        data:user,
        token:token,
        message:"OTP verified Successfull"}
      );
  
    }else if(user.isVerified==true && user.otp==otp && otp!=-1){
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
      user.save();
      return res.status(200).send(
       { 
        status:200,
        token:token,
        data:user,
        message:"OTP verified Successfull"
      }
      );
    }
  else{
    return HttpResponse.apiResponse(
      res,
      {},
      HttpResponse.HTTP_UNPROCESSABLE_ENTITY,
      "Invalid Otp"
    );
   }
    
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

//----------------------------------------------------------------------------------------------------------------//
const forgetPass = async (req, res ,next) => {
  try {
   
    const { password, confirmNewPassword ,confirmPassword} = req.body;

    const user = await providerModel.findOne({ email: req.user.email });

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
      {},
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
//-----------------------------------------------------------------------------------------------------------------------//

const updateProfile = async (req, res, next) => {
  try {
    console.log("fillle",req.file)
    const updateData = req.body;
    const updatedUser = await providerModel.findByIdAndUpdate(
      req.user._id,
      updateData,
      {
        new: true,
      }
    );

    if (req.file) {
      updatedUser.userProfile = req.file.filename
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
    let user=await providerModel.findById({_id:req.user._id})
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
  getUser
};
