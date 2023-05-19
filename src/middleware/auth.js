const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const providerModel = require("../models/provider");
const revokedTokenModel = require("../models/revokedModel");
const userDeviceModel = require("../models/user_devices");

//======================================================1st Middleware===================================================================//

// const authenticate = function (req, res, next) {
//     try {
//         let token = req.headers["X-api-key"]
//         if (!token) token = req.headers["x-api-key"]
//         if (!token) return res.status(404).send({ status: false, msg: "token must be present" })
//         console.log(token)

//         let decodedToken = jwt.decode(token);
//         if (decodedToken) {
//             try {
//                 jwt.verify(token, "Z-Flix!@#%")
//                 next()
//             }
//             catch (err) {
//                 return res.status(400).send({ status: false, msg: err.message })
//             }
//         }
//         else return res.status(400).send({ status: false, msg: "token is invalid" });

//     }
//     catch (err) {
//         console.log("This is the error:", err.message)
//         return res.status(500).send({ status: false, msg: err.message })
//     }
// }    // decode the token //
//====================================2nd Middleware=====================================================================//
const authorise = async function (req, res, next) {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, "AKANDOC!@#%");
      const id = decoded.userId;
      const deviceId = req.headers.device_id;

      // Check if token exists in the database for the current provided device
      const checkIfExist = await userModel.findOne({
        _id: id,
        device_id: deviceId,
        "device_info.device_id": deviceId,
        "device_info.jwt_token": token,
      });

      if (!checkIfExist || checkIfExist.jwt_token !== null) {
        res.status(401).json({
          status: 401,
          message: "Unauthorized",
        });
        return;
      }

      req.checkIfExist = checkIfExist;
      next();
    } catch (err) {
      res.status(401).json({
        status: 401,
        message: "Not Authorized, Token Failed",
        error: err.message,
      });
    }
  } else {
    res.status(401).json({
      status: 401,
      message: "Not Authorized, Missing Token",
    });
  }
};

const authoriseProvider = async function (req, res, next) {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, "AKANDOC!@#%");
      const id = decoded.userId;
      const deviceId = req.headers.device_id;

      const user = await providerModel.findOne({
        _id: id,
        
      });
console.log("userrrrrrrrrr",user)
      if (user) {
        const deviceIndex = user.device_info.findIndex(
          (device) => device.device_id === deviceId
        );
        console.log("deviceIndex",deviceIndex)

        if (deviceIndex !== -1 && user.device_info[deviceIndex].jwt_token !== null) {
          req.user = user;
          req.token = token;
          next();
        } else {
          res.status(401).json({
            status: 401,
            message: "Not Authorized",
          });
        }
      } else {
        res.status(401).json({
          status: 401,
          message: "Not Authorized",
        });
      }
    } catch (err) {
      res.status(401).json({
        status: 401,
        message: "Not Authorized, Token Failed",
        message: err.message,
      });
    }
  } else {
    res.status(401).json({
      status: 401,
      message: "Not Authorized, Missing Token",
    });
  }
};


//=========================================================================================================================================//

module.exports = { authorise, authoriseProvider };
