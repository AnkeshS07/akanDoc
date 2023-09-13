const express = require("express");
const router = express.Router();
const authoriseUser = require("../middleware/auth");
const upload = require("../common/upload");
const resendMailOtp = require("../middleware/sendMail");
const contectUsController = require("../controllers/contactUsController");
const providorController = require("../controllers/providorController");
const logOutController = require("../controllers/logout");
const { validation } = require("../exceptions/HTTPExceptionHandler");
const {
  validate,
  providerRegisterValidation,
  forgotPass,
  signUpProviderVerifyVaidation,
  validateProviderLogin,
  forgotPassOtpProviderVaidation,
  verifyPassOtpProviderValidation,
  providerContactUsVaidation,
} = require("../validations/auth");

//======================================provider apis===============================================================//
router.post(
  "/auth/provider/signup",
  providerRegisterValidation,
  validate,
  providorController.signUp
);

router.post(
  "/auth/provider/verify-otp",
  signUpProviderVerifyVaidation,
  validation,
  providorController.verifyOTP
);

router.post(
  "/auth/provider/login",
  validateProviderLogin,
  validate,
  providorController.loginProvider
);

//============================================== forgot password ======================================================//

router.post(
  "/auth/provider/sendForgetPassOtp",
  forgotPassOtpProviderVaidation,
  validate,
  providorController.sendForgetOtp
);

router.post(
  "/auth/provider/verifyPassOtp",
  verifyPassOtpProviderValidation,
  validate,
  providorController.verifyOTP
);

router.put(
  "/auth/provider/updateNewPassword",
  authoriseUser.authoriseProvider,
  providorController.newPassword
);

//=======================================forgotPass with current pass=====================================================//

router.put(
  "/auth/provider/changePassword",
  authoriseUser.authoriseProvider,
  forgotPass,
  validate,
  providorController.forgetPass
);

//=============================================update profile ============================================================//

router.put(
  "/provider/update-profile",
  upload.uploadFile.fields([{ name: "file" }, { name: "file2" }]),
  authoriseUser.authoriseProvider,
  providorController.updateProfile
);

//================================================get provider/get All providers===========================================//
router.get(
  "/provider/getProvider",
  authoriseUser.authoriseProvider,
  providorController.getProvider
);

router.get("/provider/getAllProviders", providorController.getAllProviders);

//==============================================resend otp ==========================================================//
router.post(
  "/auth/provider/resendMailOtp",
  resendMailOtp.resendProviderEmailOtp
);

//===========================================COntactUs Api=========================================================//
router.post(
  "/provider/contactUs",
  authoriseUser.authoriseProvider,
  providerContactUsVaidation,
  validation,
  contectUsController.providerContactUs
);

//=================================================Start/End Booking Api===============================================//
router.put(
  "/provider/startEndBookingByProvider",
  authoriseUser.authoriseProvider,
  providorController.startEndBookingProvider
);

//==============================================Payout/Withdrawl  Apis==================================================//
router.post(
  "/provider/payout",
  authoriseUser.authoriseProvider,
  providorController.payout
);
router.get(
  "/provider/payout",
  authoriseUser.authoriseProvider,
  providorController.getPayout
);

//=================================================get Earning===========================================================//

router.get(
  "/provider/earning",
  authoriseUser.authoriseProvider,
  providorController.getProviderEarming
);

//==============================================LOgOut Provider========================================================//
router.post(
  "/provider/logout",
  authoriseUser.authoriseProvider,
  logOutController.logoutProvider
);

//======================================================================================================================//
module.exports = router;
