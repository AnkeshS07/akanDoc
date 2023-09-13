const Admin = require("../models/adminModel");
const InsurancePayment = require("../models/insurancePayment");
const BookingPrice = require("../models/bookingPrice");
const transaction = require("../models/transaction");
const bookingModel = require("../models/bookingModel");
const payoutModel = require("../models/payoutModel");
const StaticPage = require("../models/staticPages");
const providerModel = require("../models/provider");
const tokenUtils = require("../common/tokenUtils");
const { sendNotification } = require("../common/notification");

//============================================= adminLogin =========================================================//
/**
 * checking if the provided email and password match an existing admin user in the database and
 * returning a token if successful.
 * @returns a JSON response with the status code, data, and message. If the existingAdmin is found, it
 * returns a 200 status code with the admin data and token. If the existingAdmin is not found, it
 * returns a 422 status code with an error message. If there is an error during the execution of the
 * function, it returns a 500 status code with the error
 */

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingAdmin = await Admin.findOne({ email, password });
    if (existingAdmin) {
      const token = tokenUtils.generateToken(existingAdmin._id.toString());
      let data = { user: existingAdmin, token: token };
      res
        .status(200)
        .json({ status: 200, data: data, message: "Admin login successful" });
    } else {
      return res
        .status(422)
        .send({ status: 422, message: "Invalid admin login details" });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

//================================================= getAllPaymentRequests =====================================================//
/**
 * The function `getAllPaymentRequests` retrieves insurance payment requests based on the provided
 * query parameters.
 */

const getAllPaymentRequests = async (req, res) => {
  try {
    let { page, limit, status } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    const filter = {};
    if (status) {
      filter["class.status"] = parseInt(status);
    }

    const skip = (page - 1) * limit;

    const totalCount = await InsurancePayment.countDocuments(filter);

    const paymentRequests = await InsurancePayment.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("user", "name userProfile _id");

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      status: 200,
      page,
      limit,
      total: totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      list: paymentRequests,
      message: "Insurance payment requests retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

//============================================== getBookings ========================================================//
/**
 * The `getBookings` function retrieves bookings based on the provided query parameters and
 * returns them along with pagination metadata.
 * @returns The function `getbookings` returns a JSON response with the following properties:
 * - `status`: The HTTP status code (200 for success).
 * - `metaData`: An object containing metadata about the pagination of the bookings. It includes
 * the current page, limit per page, total number of bookings, total number of pages, and a
 * boolean indicating whether there is a next page.
 */

const getBookings = async (req, res) => {
  try {
    const query = {};
    const status = parseInt(req.query.status);

    if (!isNaN(status)) {
      query.status = status;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const countPromise = bookingModel.countDocuments(query).exec();
    const providersPromise = bookingModel
      .find(query)
      .skip(skip)
      .limit(limit)
      .populate("userId", "name userProfile _id")
      .populate("doctorId", "name userProfile _id")
      .exec();

    Promise.all([countPromise, providersPromise]).then(([total, providers]) => {
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const metaData = {
        page: page,
        limit: limit,
        total: total,
        totalPages: totalPages,
        hasNextPage: hasNextPage,
      };

      res.json({
        status: 200,
        metaData: metaData,
        list: providers,
        message: "Notifications retrieved successfully",
      });
    });
  } catch (error) {
    return res
      .status(500)
      .send({ status: 500, message: "Invalid request", error: error.message });
  }
};

//================================================ rejectUserPayment ==========================================================//

/**
 * The function `rejectUserInsurance` updates the verification status of a payment and sends a rejection
 * booking to the user if the verification is false.
 * @returns a JSON response with the following properties:
 * - status: 200 (indicating a successful request)
 * - data: the updated payment object
 * - message: "Payment verification updated successfully"
 */

const rejectUserInsurance = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const adminVerify = req.body.adminVerify;

    const payment = await InsurancePayment.findOne({ _id: paymentId }).populate(
      "user",
      "name userProfile imageUrl"
    );

    const userId = payment.user;
    payment.adminVerify = adminVerify;
    payment.verification = adminVerify.toString();
    await payment.save();

    if (!payment) {
      return res
        .status(404)
        .json({ status: 404, message: "Payment not found" });
    }

    if (payment.adminVerify == false) {
      const message = {
        notification: {
          title: "Payment Rejected",
          body: "Your payment has been rejected by the admin for some reason. Thank you.",
        },
      };

      const userNotificationResult =
        await sendNotification(userId, "user","InsuranceReject");
      console.log("User Notification Result:", userNotificationResult);
    }

    return res.json({
      status: 200,
      data: payment,
      message: "Payment verification updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error", message: error.message });
  }
};

//============================================= createStaticPage ===================================================//
/**
 * The function `createStaticPage` creates a new static page with the provided terms and conditions and
 * privacy policy, saves it to the database, and returns the saved page as a response.
 */

const createStaticPage = async (req, res) => {
  try {
    const { term_conditions, privacy_policy } = req.body;

    const newStaticPage = new StaticPage({
      term_conditions: term_conditions,
      privacy_policy: privacy_policy,
    });

    const savedPage = await newStaticPage.save();

    res.status(201).json({
      status: 201,
      data: savedPage,
      message: "Static page created successfully",
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

//================================================ getStaticPage ======================================================//

/**
 * The function `getStaticPage` retrieves a static page from a database and returns it along with a URL
 * and a success message.
 */

const getStaticPage = async (req, res) => {
  try {
    const staticPage = await StaticPage.findOne({});
    let url = "https://akandoc-backend.alcax.com/admin/api/v1/cms";
    if (!staticPage) {
      return res.status(404).json({
        status: 404,
        message: "Static page not found",
      });
    }

    return res.status(200).json({
      status: 200,
      data: staticPage,
      url: url,
      message: "Static page retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

//=============================================== getTermCondition =====================================================//

/**
 * The function `getTermCondition` retrieves the term conditions data from a static page and returns it
 * as a JSON response.
 * @returns The function `getTermCondition` returns a JSON response with the status code, data, and
 * message. If the term conditions data is found, it returns a 200 status code with the data and a
 * success message. If the term conditions data is not found, it returns a 404 status code with an
 * error message. If there is an error during the execution of the function.
 */

const getTermCondition = async (req, res) => {
  try {
    const termConditionsData = await StaticPage.findOne({});

    if (!termConditionsData) {
      return res.status(404).json({
        status: 404,
        message: "Term conditions not found",
      });
    }

    return res.status(200).json({
      status: 200,
      data: termConditionsData,
      message: "cms retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

//================================================= updateStaticPage =====================================================//

/**
 * The function `updateStaticPage` updates the term_conditions or privacy_policy of a static page and
 * returns the updated static page.
 */

const updateStaticPage = async (req, res) => {
  try {
    const pageId = req.params.id;
    const { term_conditions, privacy_policy } = req.body;

    const staticPage = await StaticPage.findById(pageId);

    if (!staticPage) {
      return res.status(404).json({
        status: 404,
        message: "Static page not found",
      });
    }
    if (term_conditions) {
      staticPage.term_conditions = term_conditions;
      await staticPage.save();
      return res
        .status(200)
        .json({ status: 200, data: staticPage, message: "success" });
    } else {
      staticPage.privacy_policy = privacy_policy;
      await staticPage.save();
      return res
        .status(200)
        .json({ status: 200, data: staticPage, message: "success" });
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

//======================================================= deleteStaticPage ===================================================//

/**
 * The function `deleteStaticPage` deletes a static page based on the provided ID and condition, and
 * returns a response with the deleted page data if successful.
 * @returns a JSON response with the status code, data, and message.
 */

const deleteStaticPage = async (req, res) => {
  try {
    const staticPageId = req.params.id;
    const condition = req.body.condition;

    const staticPage = await StaticPage.findById(staticPageId);

    if (!staticPage) {
      return res.status(404).json({ message: "Static page not found" });
    }

    staticPage.deletePage(condition);
    await staticPage.save();

    return res.status(200).json({
      status: 200,
      data: staticPage,
      message: "Static page deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//====================================================== postBookingPrice =====================================================//

/**
 * The function `postBookingPrice` creates a new booking price record and returns the created record in
 * the response.
 */

const postBookingPrice = async (req, res) => {
  try {
    const { price } = req.body;

    const newBookingPrice = new BookingPrice({ price });
    const createdBookingPrice = await newBookingPrice.save();

    res.status(201).json({
      status: 201,
      data: createdBookingPrice,
      message: "Booking price created successfully",
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};

//==========================================get booking Price==================================================================//
/**
 * The function `getBookingPrice` retrieves a booking price from the database and sends it as a
 * response.
 * @param req - The `req` parameter is the request object that contains information about the HTTP
 * request made by the client. It includes details such as the request method, headers, query
 * parameters, and body.
 * @param res - The `res` parameter is the response object that is used to send the response back to
 * the client. It contains methods and properties that allow you to control the response, such as
 * setting the status code, sending JSON data, or sending an error message.
 */

const getBookingPrice = async (req, res) => {
  try {

    const getBookingPrice = await BookingPrice.findOne()

    res.status(200).json({
      status: 200,
      data: getBookingPrice,
      message: "Booking price created successfully",
    });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
};
//================================================ getTransaction =======================================================//

/**
 * The function `getTransaction` retrieves transactions based on a given status and returns them in
 * descending order of their update time.
 */

const getTransaction = async (req, res) => {
  try {
    const status = req.query.status || undefined;
    const filter = status ? { status: status } : {};
    const transactions = await transaction.find(filter).sort({ updatedAt: -1 });

    res.json({ status: 200, data: transactions, message: "success" });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//================================================= getPayout ==========================================================//
/**
 * The getPayout function retrieves payout data based on the provided status and returns it as a
 * response.
 */

const getPayout = async (req, res) => {
  try {
    const status = req.query.status || { $in: [0, 1, 2] };
    const payout = await payoutModel
      .find({ adminVerify: status })
      .populate("provider", "totalBalance balance _id name email")
      .sort({ createdAt: -1 });

    if (payout) {
      return res
        .status(200)
        .json({ status: 200, data: payout, message: "success" });
    } else {
      return res.status(404).json({ status: 404, message: "Payout not found" });
    }
  } catch (error) {
    console.error("Error retrieving payout:", error);
    res.status(500).json({ message: error.message });
  }
};

//=================================================== withdrawlRequest =========================================================//

/**
 * The `withdrawlRequest` function handles the verification of a payout request, updating the payout's
 * verification status and deducting the payout amount from the provider's balance if the verification
 * is successful.
 * @returns a JSON response with the status code, data, and message.
 */

const withdrawlRequest = async (req, res) => {
  try {
    const payoutId = req.params.id;
    const { adminVerify } = req.body;

    let payout = await payoutModel.findById(payoutId);
    console.log(payout);

    if (!payout) {
      return res.status(404).json({ status: 404, message: "Payout not found" });
    } else if (payout.adminVerify == 1) {
      return res
        .status(400)
        .json({ status: 400, message: "Payout already success" });
    } else if (payout.adminVerify == 2) {
      return res
        .status(400)
        .json({ status: 400, message: "Payout already rejected" });
    }

    payout.adminVerify = adminVerify;

    if (adminVerify == 1) {
      const provider = await providerModel.findOneAndUpdate(
        { _id: payout.provider },
        { $inc: { balance: -payout.amount } },
        { new: true }
      );
      console.log(payout.amount);
      console.log(provider);

      if (!provider) {
        return res
          .status(404)
          .json({ status: 404, message: "Provider not found" });
      }
    }

    await payout.save();

    return res.status(200).json({
      status: 200,
      data: payout,
      message: "Payout verification status updated successfully",
    });
  } catch (error) {
    console.error("Error updating payout verification status:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

//=======================================================================================================================//

module.exports = {
  adminLogin,
  getAllPaymentRequests,
  getBookings,
  rejectUserInsurance,
  createStaticPage,
  getStaticPage,
  updateStaticPage,
  deleteStaticPage,
  postBookingPrice,
  getBookingPrice,
  getTransaction,
  getPayout,
  withdrawlRequest,
  getTermCondition,
};
