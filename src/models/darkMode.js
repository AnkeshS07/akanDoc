const mongoose = require("mongoose");

const darkModeSchema = new mongoose.Schema(
  {
    darkMode: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("darkMode", darkModeSchema);
