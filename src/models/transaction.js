const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    amount: { type: Number },
    currency: { type: String },
    status: { type: String, default: "pending" },
    paymentId: { type: String },
    paymentType: { type: String },
    bookingId: { type: String, required: true },
    authentication: { type: Object, default: null },
  },
  { timestamps: true }
);

const transaction = mongoose.model("transaction", transactionSchema);

module.exports = transaction;
