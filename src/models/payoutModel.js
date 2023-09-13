// payoutModel.js

const mongoose = require("mongoose");

const payoutSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",
      required: true,
    },
    amount: { type: Number, required: true },

    adminVerify: { type: Number, enum: [0, 1, 2], default: 0 },
  },
  { timestamps: true }
);
payoutSchema.index({ location: "2dsphere" });

const payout = mongoose.model("payout", payoutSchema);

module.exports = payout;
