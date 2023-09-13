const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const providerModel = require("../models/provider");
const { MongoClient, ObjectId } = require("mongodb");

//=======================================user Auth=====================================================================//

/**
 * The `authorise` function is a middleware function that checks if a user is authorized
 * by verifying their token and device information.
 */

const authorise = async function (req, res, next) {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const id = decoded.userId;
      const deviceId = req.headers.device_id;

      const checkIfExist = await userModel.findById(id);

      if (!checkIfExist || checkIfExist === null) {
        return res.status(401).json({
          status: 401,
          message: "Unauthorized",
        });
      }

      /* This code is checking if the user's device exists and is authorized. It does this by iterating
     over the `device_info` array of the `checkIfExist` user object and checking if any device has a
     matching `device_id` and a non-null `jwt_token`. */

      const deviceExistsAndAuthorized = checkIfExist.device_info.some(
        (device) => device.device_id === deviceId && device.jwt_token
      );

      if (deviceExistsAndAuthorized) {
        req.checkIfExist = checkIfExist;
        req.token = token;
        next();
      } else {
        return res.status(401).json({
          status: 401,
          message: "Unauthorized Device",
        });
      }
    } else {
      return res.status(401).json({
        status: 401,
        message: "Not Authorized, Missing Token",
      });
    }
  } catch (err) {
    return res.status(401).json({
      status: 401,
      message: "Not Authorized, Token Failed",
      error: err.message,
    });
  }
};

//=======================================provider Auth=====================================================================//
/**
 * The `authoriseProvider` function is a middleware function  that checks if a user is
 * authorized based on their token and device ID.
 */

const authoriseProvider = async function (req, res, next) {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const id = decoded.userId;
      const deviceId = req.headers.device_id;

      const user = await providerModel.findOne({
        _id: id,
      });

      if (!user || user == null) {
        return res.status(401).json({
          status: 401,
          message: "Unauthorized",
        });
      }

      /* This code is checking if the user's device exists and is authorized. It does this by finding
      the index of the device in the `device_info` array of the `user` object that has a matching
      `device_id` with the `deviceId` provided in the request headers. */
      const deviceIndex = user.device_info.findIndex(
        (device) => device.device_id === deviceId
      );

      if (
        deviceIndex !== -1 &&
        user.device_info[deviceIndex].jwt_token !== null
      ) {
        req.user = user;
        req.token = token;
        next();
      } else {
        return res.status(401).json({
          status: 401,
          message: "Unauthorized device or invalid token",
        });
      }
    } catch (err) {
      res.status(401).json({
        status: 401,
        message: "Not Authorized, Token Failed",
      });
    }
  } else {
    return res.status(401).json({
      status: 401,
      message: "unauthorizedd ",
    });
  }
};

//================================================admin Auth==============================================================//

/**
 * The `authoriseAdmin` function is a middleware function in JavaScript that checks if a user is
 * authorized as an admin by verifying their token and checking if they exist in the database.
 */

const authoriseAdmin = async function (req, res, next) {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const id = decoded.adminId;

      /* This code is establishing a connection to a MongoDB database using the `MongoClient` class from
     the `mongodb` package. */

      const client = new MongoClient(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      await client.connect();
      const db = client.db();
      const user = await db.collection("admins").findOne({
        _id: new ObjectId(id),
      });

      if (!user || user == null) {
        return res.status(401).json({
          status: 401,
          message: "Unauthorized",
        });
      } else {
        req.user = user;
        req.token = token;
        next();
      }
    } else {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized",
      });
    }
  } catch (err) {
    res.status(401).json({
      status: 401,
      message: "Not Authorized, Token Failed",
      error: err.message,
    });
  }
};

//=========================================================================================================================================//

module.exports = { authorise, authoriseProvider, authoriseAdmin };
