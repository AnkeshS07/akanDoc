const revokedTokenModel = require('../models/revokedModel');
const userModel = require('../models/userModel');
const jwt=require('jsonwebtoken');
const providerModel = require('../models/provider');
const logout = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, "AKANDOC!@#%");
    const id = decoded.userId;
    console.log("id",id)
    const deviceId = req.headers.device_id;
    const user = await userModel.findOne({ _id: id });
    console.log("aa",user)
    const deviceIndex = user.device_info.findIndex(
      (device) => device.device_id === deviceId
    );
    console.log(deviceIndex)
    if (deviceIndex === -1) {
      // Device ID not found
      return res.status(404).json({
        status: 404,
        message: "Device ID not found",
      })};
    const userToken = await userModel.findOneAndUpdate(
      { _id: id, "device_info.device_id": deviceId },
      { $set: { "device_info.$.jwt_token": null } }
    );

    if (!userToken) {
      return res.status(400).json({
        status: 400,
        data: {},
        message: "Invalid logout request",
      });
    }

    return res.status(200).json({ status: 200, data: {}, message: "Logout successful" });
  }catch (error) {
    return res.status(500).json({ status: 500, message: "An error occurred during logout",msg:error.message });
  }
};

const logoutProvider = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, "AKANDOC!@#%");
    const id = decoded.userId;
    const deviceId = req.headers.device_id;
    const user = await providerModel.findOne({ _id: id });
    const deviceIndex = user.device_info.findIndex(
      (device) => device.device_id === deviceId
    );
    console.log(deviceIndex)
    if (deviceIndex === -1) {
      // Device ID not found
      return res.status(404).json({
        status: 404,
        message: "Device ID not found",
      });
    }
    const userToken = await providerModel.findOneAndUpdate(
      { _id: id, "device_info.device_id": deviceId},
      { "device_info.$.jwt_token": null }
    );

    if (!userToken) {
      return res.status(400).json({
        status: 400,
        data: {},
        message: "Invalid logout request",
      });
    }

    return res.status(200).json({ status: 200, message: "Logout successful" });
  } catch (error) {
    return res
      .status(500)
      .json({ status: 500, message: "An error occurred during logout" });
  }
};

module.exports = { logout ,logoutProvider};
