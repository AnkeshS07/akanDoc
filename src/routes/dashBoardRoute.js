const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController");

const authoriseUser = require("../middleware/auth");

const upload = require("../common/upload");

const resendMailOtp = require("../middleware/sendMail");

const contectUsController = require("../controllers/contactUsController");

const providorController = require("../controllers/providorController");

const logOutController = require("../controllers/logout");

const darkMode = require("../controllers/darkModeController");

const BookingRequestController = require("../controllers/notificationController");

//-------------------------------------------------user apis------------------------------------------------------------//

router.get("/api/dashboard/users", userController.loginUser);
router.get(
  "/api/dashboard/service-providers",
  providorController.getAllProviders
);
router.post(
    "/api/dashboard/specializations",
    providorController.getAllProviders
  );
//--------------------------------------------forgot password -----------------------------------------------------------//

//-------------------------------------------------------------------------------------------------------------------------//
module.exports = router;
