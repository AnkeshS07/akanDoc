const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authorise = require("../middleware/auth");
//=============================================== Bookings Request Apis ================================================================//
router.post(
  "/provider/sendNotification",
  authorise.authorise,
  bookingController.bookNow
);

router.post(
  "/auth/user/acceptOrDecline",
  authorise.authoriseProvider,
  bookingController.acceptOrDecline
);

router.get(
  "/auth/provider/getAllNotification",
  authorise.authoriseProvider,
  bookingController.getNotification
);

router.post(
  "/auth/user/searchNearByProvider",
  authorise.authorise,
  bookingController.searchNearBy
);

//==========================================================================================================================//

module.exports = router;
