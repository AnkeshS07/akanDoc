const router = require("express").Router();
const UsersRoutes = require("./userRoute");
const AdminRoutes = require("./adminRoute");
const ProviderRoutes = require("./providerRoute");
const BookingRoutes = require("./bookingRoute");
const EnumRoutes = require("./enumRoute");

router.use("/", UsersRoutes);
router.use("/admin/api/v1/", AdminRoutes);
router.use("/api/v1/", ProviderRoutes);
router.use("/api/v1/enum", EnumRoutes);
router.use("/api/v1/", BookingRoutes);

module.exports = router;
