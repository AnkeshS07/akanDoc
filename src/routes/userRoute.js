const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController");

const authoriseUser = require("../middleware/auth");

const upload=require('../common/upload')

const contectUsController=require('../controllers/contactUsController')

const providorController=require('../controllers/providorController')


const middleware = require("../middleware/sendMail");
const { validation } = require("../exceptions/HTTPExceptionHandler");

const { validateLogin,validate,
  registerVaidation,signUpVerifyVaidation,forgotPassOtpVaidation,
  providerRegisterValidation,verifyPassOtpValidation,forgotPass,signUpProviderVerifyVaidation,
  validateProviderLogin,forgotPassOtpProviderVaidation,verifyPassOtpProviderValidation,} = require("../validations/auth");
//-------------------------------------------------user apis------------------------------------------------------------//

router.post("/api/v1/auth/user/signup", registerVaidation, validation, userController.signUp);

router.post("/api/v1/auth/user/verify-otp",signUpVerifyVaidation,validation,userController.verifyOTP);

router.post("/api/v1/auth/user/login",validateLogin,validate, userController.loginUser);

//--------------------------------------------forgot password -----------------------------------------------------------//

router.post("/api/v1/auth/sendForgetPassOtp",forgotPassOtpVaidation,validate, userController.sendForgetOtp);

router.post("/api/v1/auth/verifyPassOtp",verifyPassOtpValidation,validate, userController.verifyOTP);

//--------------------------------------forgotPass with current pass-----------------------------------------------------//

router.put("/api/v1/auth/changePassword", authoriseUser.authorise,forgotPass,validate,userController.forgetPass);

//-----------------------------------------update profile ---------------------------------------------------------------//

router.put("/api/v1/user/update-profile",upload.uploadFile.single('file'), authoriseUser.authorise, userController.updateProfile);

router.get("/api/v1/user/get-update-profile",authoriseUser.authorise, userController.getProfileImage);

router.get("/api/v1/user/getUser",authoriseUser.authorise, userController.getUser);




//======================================provider apis===============================================================//
router.post("/api/v1/auth/provider/signup", providerRegisterValidation, validation, providorController.signUp);

router.post("/api/v1/auth/provider/verify-otp",signUpProviderVerifyVaidation,validation,providorController.verifyOTP);

router.post("/api/v1/auth/provider/login",validateProviderLogin,validation, providorController.loginUser);

//--------------------------------------------forgot password -----------------------------------------------------------//

router.post("/api/v1/auth/provider/sendForgetPassOtp",forgotPassOtpProviderVaidation,validate, providorController.sendForgetOtp);

router.post("/api/v1/auth/provider/verifyPassOtp",verifyPassOtpProviderValidation,validate, providorController.verifyOTP);

//--------------------------------------forgotPass with current pass-----------------------------------------------------//

router.put("/api/v1/auth/provider/changePassword", authoriseUser.authoriseProvider,forgotPass,validate,providorController.forgetPass);

//-----------------------------------------update profile ---------------------------------------------------------------//

router.put("/api/v1/provider/update-profile",upload.uploadFile.single('file'),authoriseUser.authoriseProvider, providorController.updateProfile);

router.get("/api/v1/provider/get-update-profile",authoriseUser.authoriseProvider, providorController.getProfileImage);

router.get("/api/v1/provider/getProvider",authoriseUser.authoriseProvider, providorController.getUser);

//-------------------------------------------contact us--------------------------------------------------------------------//
router.post("/api/v1/contactUs",authoriseUser.authorise,providerRegisterValidation,validation, contectUsController.contactUs);



//-------------------------------------------------------------------------------------------------------------------------//
module.exports = router;
