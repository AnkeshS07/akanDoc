const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController");

const authoriseUser = require("../middleware/auth");

const middleware = require("../middleware/sendMail");
const { validation } = require("../exceptions/HTTPExceptionHandler");

const { validateLogin,validate,
  registerVaidation,signUpVerifyVaidation,forgotPassOtpVaidation,verifyPassOtpValidation,forgotPass} = require("../validations/auth");
//-------------------------------------------------user apis------------------------------------------------------------//

router.post("/api/v1/auth/user/signup", registerVaidation, validation, userController.signUp);

router.post("/api/v1/auth/user/verify-otp",signUpVerifyVaidation,validate,userController.verifyOTP);

router.post("/api/v1/auth/user/login",validateLogin,validate, userController.loginUser);

//--------------------------------------------forgot password -----------------------------------------------------------//

router.post("/api/v1/auth/sendForgetPassOtp",forgotPassOtpVaidation,validate, userController.sendForgetOtp);

router.post("/api/v1/auth/verifyPassOtp",verifyPassOtpValidation,validate, userController.verifyOTP);

//--------------------------------------forgotPass with current pass-----------------------------------------------------//

router.put("/api/v1/auth/forgetPassword", authoriseUser.authorise,forgotPass,validate,userController.forgetPass);

//-----------------------------------------update profile ---------------------------------------------------------------//

router.put("/auth/user/update-profile", authoriseUser.authorise, userController.updateProfile);

//-------------------------------------------------------------------------------------------------------------------------//
module.exports = router;
