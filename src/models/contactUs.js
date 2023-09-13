const mongoose = require("mongoose");

const contantUsSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: "Invalid email format",
      },
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "provider",
      required: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("contactUs", contantUsSchema);
