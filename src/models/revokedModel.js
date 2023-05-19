const mongoose = require("mongoose");

const revokedTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
});

const RevokedTokenModel = mongoose.model("RevokedToken", revokedTokenSchema);

module.exports = RevokedTokenModel;
