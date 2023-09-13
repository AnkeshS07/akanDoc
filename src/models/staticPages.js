const mongoose = require("mongoose");

const staticPagesSchema = new mongoose.Schema(
  {
    term_conditions: {
      type: String,
      default: null,
    },
    privacy_policy: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

staticPagesSchema.methods.deletePage = function (condition) {
  if (condition === 0) {
    this.term_conditions = null;
  } else if (condition === 1) {
    this.privacy_policy = null;
  }
};

module.exports = mongoose.model("staticpage", staticPagesSchema);
