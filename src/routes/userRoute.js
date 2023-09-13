const express = require("express");
const router = express.Router();
const uploadDoc = require("../common/paymentUpload");
const userController = require("../controllers/userController");
const authoriseUser = require("../middleware/auth");
const resendMailOtp = require("../middleware/sendMail");
const contectUsController = require("../controllers/contactUsController");
const paymentController = require("../controllers/paymentGateway");
const logOutController = require("../controllers/logout");
const darkMode = require("../controllers/darkModeController");
const { validation } = require("../exceptions/HTTPExceptionHandler");
const {
  validateLogin,
  validate,
  registerVaidation,
  signUpVerifyVaidation,
  forgotPassOtpVaidation,
  verifyPassOtpValidation,
  forgotPass,
  contactUsVaidation,
} = require("../validations/auth");


//================================================user apis==============================================================//

router.post(
  "/api/v1/auth/user/signup",
  uploadDoc.array("documents", 2),
  registerVaidation,
  validate,
  userController.signUp
);

router.post(
  "/api/v1/auth/user/verify-otp",
  signUpVerifyVaidation,
  validate,
  userController.verifyOTP
);

router.post(
  "/api/v1/auth/user/login",
  validateLogin,
  validate,
  userController.loginUser
);

//==========================================forgot password ==============================================================//

router.post(
  "/api/v1/auth/sendForgetPassOtp",

  forgotPassOtpVaidation,
  validate,
  userController.sendForgetOtp
);

router.post(
  "/api/v1/auth/verifyPassOtp",
  verifyPassOtpValidation,
  validate,
  userController.verifyOTP
);

router.put(
  "/api/v1/auth/user/updateNewPassword",
  authoriseUser.authorise,
  userController.newPassword
);

//==========================================forgotPass with current pass==================================================//

router.put(
  "/api/v1/auth/changePassword",
  authoriseUser.authorise,
  forgotPass,
  validate,
  userController.forgetPass
);

//================================================update profile ============================================================//

router.put(
  "/api/v1/user/update-profile",
  uploadDoc.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "documents", maxCount: 2 },
  ]),
  authoriseUser.authorise,
  userController.updateProfile
);

router.get(
  "/api/v1/user/getUser",
  authoriseUser.authorise,
  userController.getUser
);

//==========================================get user Bookings========================================================//
router.get(
  "/api/v1/user/getUserNotifications",
  authoriseUser.authorise,
  userController.userNotifications
);
//=========================================user payment api / check verification status =============================================================//

router.get(
  "/api/v1/auth/user/admin-status",

  authoriseUser.authorise,

  userController.payment
);
router.post(
  "/api/v1/auth/user/insurancePayment",

  authoriseUser.authorise,

  userController.bookingInsurancePayment
);

//=================================================end Booking By User===================================================//

router.put(
  "/api/v1/user/endBookingUser",
  authoriseUser.authorise,
  userController.endBookingUser
);

//=============================================== get Insurance ===================================================//

router.get(
  "/api/v1/auth/user/insurance",
  authoriseUser.authorise,
  userController.getInsurance
);

//============================================Booking Payment By Card=========================================//

router.post(
  "/api/v1/auth/user/payment",
  authoriseUser.authorise,
  paymentController.payment
);

router.post(
  "/api/v1/auth/user/paymentConfirm",
  authoriseUser.authorise,
  paymentController.verifyPaymentIntent
);

//========================================Completed Booking Review Api==========================================//

router.post(
  "/api/v1/auth/user/review",
  authoriseUser.authorise,
  userController.createReview
);

//==========================================resend Mail Otp User api=============================================================//
router.post("/api/v1/auth/user/resendMailOtp", resendMailOtp.resendEmailOtp);
//==========================================ContactUs Mail Api======================================================================//
router.post(
  "/api/v1/user/contactUs",
  authoriseUser.authorise,
  contactUsVaidation,
  validation,
  contectUsController.contactUs
);
//=================================================logOut=============================================================//

router.post(
  "/api/v1/user/logout",
  authoriseUser.authorise,
  logOutController.logout
);

//=============================================darkMode===================================================================//
router.post("/api/v1/darkMode", darkMode.darkMode);
router.get("/api/v1/getDarkMode", darkMode.getDarkMode);
//==========================================================================================================================//

module.exports = router;
