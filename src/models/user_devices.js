const mongoose = require("mongoose");

const userDeviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
           },
  device_id: { //header
    type: String,
    required: true,
    unique: true,
  },
  device_token: {
    type: String,
    required: true,
    unique: true,
  },
  jwt_token: {
    type: String,
    required: true,
    unique: true,
  },
});

const userDeviceModel = mongoose.model("user_device", userDeviceSchema);

module.exports = userDeviceModel;
