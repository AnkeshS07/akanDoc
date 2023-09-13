const mongoose = require("mongoose");

const insurancePaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },

  documents: {
    type: [
      {
        type: String,
        required: true,
      },
    ],
  },
  paymentType: {
    type: String,
    enum: ["insurance", "card"],
    default: "insurance",
  },
  adminVerify: {
    type: Boolean,
    default: false,
  },
  verification: {
    type: String,
    enum: ["true", "false"],
    default: "false",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const InsurancePayment = mongoose.model(
  "InsurancePayment",
  insurancePaymentSchema
);

module.exports = InsurancePayment;
