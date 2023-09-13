const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const userController = require("../controllers/Admin/userController");
const providerController = require("../controllers/Admin/providerController");
const commonController = require("../controllers/Admin/commonController");
const contactUsController = require("../controllers/contactUsController");
const upload = require("../common/upload");
const {
  validate,
  registerVaidation,
  providerRegisterValidation,
} = require("../validations/auth");

//=============================================Admin Login========================================================================//
router.post("/admin/login", adminController.adminLogin);

//=======================================User CRUD=================================================================//

router.get("/users", userController.getAllUser);

router.post("/users", registerVaidation, validate, userController.saveUser);

router.get("/users/:id", userController.getUser);

router.patch(
  "/users/:id",
  upload.uploadFile.single("file"),
  userController.updateUser
);

//========================================Provider CRUD=============================================================//

router.get("/providers", providerController.getAllProvider);

router.post(
  "/providers",
  providerRegisterValidation,
  validate,
  providerController.saveProvider
);

router.get("/providers/:id", providerController.getProvider);

router.patch(
  "/providers/:id",
  upload.uploadFile.single("file"),
  providerController.updateProvider
);

//=========================================Get/Update All booking And Payments======================================//
router.get("/bookings", adminController.getBookings);

router.get("/payments", adminController.getAllPaymentRequests);

router.put("/payments/:id", adminController.rejectUserInsurance);

//============================================dashboard api===========================================================//
router.get("/get-count", commonController.getAllCount);

//=================================================static pages====================================================//

router.post("/static-pages", adminController.createStaticPage);

router.get("/static-pages", adminController.getStaticPage);

router.put("/static-pages/:id", adminController.updateStaticPage);

router.delete("/static-pages/:id", adminController.deleteStaticPage);

router.get("/cms", adminController.getTermCondition);

//======================================= Manage booking price and all transactions =================================//
router.post("/bookingPrice", adminController.postBookingPrice);

router.get("/transactions", adminController.getTransaction);

//=========================================Manage payout/withdrawls=============================================================//
router.get("/payout", adminController.getPayout);

router.put("/payout/:id", adminController.withdrawlRequest);

//=========================================Get all contact us mails===============================================================//
router.get("/get-mails", contactUsController.getAllMails);

//=========================================get booking price============================================================================//
router.get("/get-bookinng-price",adminController.getBookingPrice)

//============================================================================================================================//
module.exports = router;
