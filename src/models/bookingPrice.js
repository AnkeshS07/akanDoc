const mongoose = require("mongoose");

const bookingPrice = new mongoose.Schema(
  {
    price: {
      type: Number,
      default: 100,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("bookingPrice", bookingPrice);
