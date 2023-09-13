const userProfileModel = require("../../models/userModel");
const providerModel = require("../../models/provider");;
const bookingRequest=require('../../models/bookingModel')
const HttpResponse = require("../../response/HttpResponse");

//================================================DashBoard Api==================================================================//


/**
 * The function `getAllCount` retrieves various counts from different models and returns the data in an
 * API response.
 */

const getAllCount = async (req, res, next) => {
  try {
    let user_total = await userProfileModel.count();
    let provider_total = await providerModel.count();
    // Assuming 'licensed' is a boolean field in both models
    const licensed_provider_total = await providerModel.count({ licensed: true });
    const unlicensed_provider_total = await providerModel.count({ licensed: false });
    const bookings_total= await bookingRequest.count()
    const upcoming_bookings_total = await bookingRequest.countDocuments({ status: 2 });
    const complete_bookings_total = await bookingRequest.countDocuments({ status: 5 });

    let data = {
      "user_total": user_total,
      "provider_total": provider_total,
      "licensed_provider_total": licensed_provider_total,
      "unlicensed_provider_total": unlicensed_provider_total,
      "bookings_total":bookings_total,
      "upcoming_bookings_total":upcoming_bookings_total,
      "complete_bookings_total":complete_bookings_total
    };


    return HttpResponse.apiResponse(
      res,
      data,
      HttpResponse.HTTP_OK,
      "get count success"
    );
   
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};


module.exports = {
    getAllCount,
   
};
