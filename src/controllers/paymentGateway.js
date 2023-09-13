const stripe = require("stripe")(
  "sk_test_51NMlxzBrM0U3mkt9JwWaohjH9zofh3KKB16xEzYdSgqtQwGlEiD2fLJLN0ZoF2xKrcQJQjylycbDABotNjbCQndi0024If9H66"
);
const bookingRequest = require("../models/bookingModel");
const Transaction = require("../models/transaction");
const priceModel = require("../models/bookingPrice");

//=========================================================================================================================//
/**
 * The `payment` function handles the payment process, including creating a payment intent, saving the
 * transaction details, and updating the booking status.
 */

const payment = async (req, response) => {
  try {
    const { currency, token, bookingId } = req.body;
    const checkBooking = await bookingRequest.findOne({ _id: bookingId });
    if (checkBooking.status === 6) {
      return res
        .status(400)
        .json({ status: 400, message: "Your Booking Has Been Cancelled" });
    }
    const price = await priceModel.findOne();
    let amount = price.price;

    /* This code is creating a payment intent using the Stripe API. The payment intent is used to
    handle the payment process for a specific amount and currency. */

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      payment_method_types: ["card"],
      payment_method_data: {
        type: "card",
        card: {
          token: token,
        },
      },
      description: "My First Test Charge",
      confirm: true,
      use_stripe_sdk: true,
    });

    /* This code block is checking if the payment intent status is "succeeded". If it is, it creates a
  new transaction object with the payment details such as payment ID, booking ID, amount, payment
  type, currency, and status. This transaction object is then saved in the database. */

    if (paymentIntent.status === "succeeded") {
      const transaction = new Transaction({
        paymentId: paymentIntent.id,
        bookingId: bookingId,
        amount: paymentIntent.amount,
        paymentType: "card",
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      });
      await transaction.save();

      // Update the status of the booking
      await bookingRequest.updateOne(
        { _id: bookingId },
        { $set: { status: 2 } }
      );
      return response
        .status(200)
        .json({ status: 200, data: transaction, message: "success" });
    } else if (
      paymentIntent.status === "requires_action" &&
      paymentIntent.next_action.type === "use_stripe_sdk"
    ) {
      const transaction = new Transaction({
        bookingId: bookingId,
        amount: paymentIntent.amount,
        paymentType: "card",
        currency: paymentIntent.currency,
        user: req.checkIfExist._id,
        authentication: {
          requiresAction: true,
          clientSecret: paymentIntent.client_secret,
        },
      });
      await transaction.save();

      return response
        .status(200)
        .json({ status: 200, data: transaction, message: "success" });
      /* The `else if` block is handling the case where the payment intent status is "requires_action"
    and the next action type is "use_stripe_sdk". This typically occurs when additional
    authentication is required for the payment to be processed, such as 3D Secure authentication. */
    } else {
      return response
        .status(400)
        .json({ status: 400, message: "PaymentIntent not succeeded" });
    }
  } catch (error) {
    return response.status(500).json({ status: 500, message: error.message });
  }
};

//===========================================================================================================================//
/**
 * The function `verifyPaymentIntent` is used to verify the status of a payment intent and update the
 * corresponding transaction and booking status accordingly.
 */

const verifyPaymentIntent = async (req, response) => {
  try {
    const { clientSecret, bookingId } = req.body;
    const verifyPayment = await stripe.paymentIntents.retrieve(clientSecret);

    /* This code block is executed when the status of the payment intent is "succeeded". It performs
    the following actions: */
    if (verifyPayment.status === "succeeded") {
      // Find the latest transaction for the user
      const transaction = await Transaction.findOne({
        bookingId: bookingId,
      }).sort({ createdAt: -1 });
      transaction.paymentId = verifyPayment.id;
      transaction.status = verifyPayment.status;
      await transaction.save();
      await bookingRequest.updateOne(
        { _id: bookingId },
        { $set: { status: 2 } }
      );

      return response
        .status(200)
        .json({ status: 200, data: transaction, message: "success" });
    } else if (
      /* The `else if` block is checking if the status of the payment intent is "requires_action" and
    the next action type is "use_stripe_sdk". This condition typically occurs when additional
    authentication is required for the payment to be processed, such as 3D Secure authentication. */
    
      verifyPayment.status === "requires_action" &&
      verifyPayment.next_action.type === "use_stripe_sdk"
    ) {
      return response.status(200).json({
        status: 200,
        message: "PaymentIntent requires 3D Secure authentication",
      });
    } else {
      return response
        .status(400)
        .json({ status: 400, message: "PaymentIntent not succeeded" });
    }
  } catch (error) {
    return response.status(500).json({ status: 500, message: error.message });
  }
};

//================================================================================================================================//

module.exports = { payment, verifyPaymentIntent };
