const revokedTokenModel = require('../models/revokedModel');
const userModel = require('../models/userModel');
const jwt=require('jsonwebtoken');
const providerModel = require('../models/provider');
const logout = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, "AKANDOC!@#%");
    const id = decoded.userId;
    const deviceId = req.headers.device_id;
    const userToken= await userModel.findOne({user_id:id, device_id: deviceId})
    console.log(userToken)
    if(userToken.jwt_token==null){
      return res.status(400).send({status:400,data:{},message:"invalid logout request"})
    }
    const userData = await userModel.findOneAndUpdate({user_id:id, device_id: deviceId},{jwt_token:null})
    
    console.log(userData,"userData")
    if(!userData){
     return res.status(400).send({status:400,data:{},message:"No User Found"})
      // return errror exception
    }

    return res.status(200).json({status:200,data:{}, message: 'Logout successful' });
  } catch (error) {
    return res.status(500).json({status:500, message: 'An error occurred during logout' });
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
      { _id: id, "device_info.device_id": deviceId, "device_info.$.jwt_token": { $ne: null } },
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
