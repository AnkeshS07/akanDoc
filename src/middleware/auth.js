const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

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
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log(token)
      const decoded = jwt.verify(token, "Z-Flix!@#%");
      const id = decoded.userId;
      console.log("iddddddd", id);
      const user = await userModel.findById(id);
      console.log(user);
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(401).json({
          sucess: false,
          message: "Not Authorized, Token Failed",
        });
      }
    } catch (err) {
      res.status(401).json({
        sucess: false,
        message: "Not Authorized, Token Failed",
        message: err.message,
      });
    }
  }

  if (!token) {
    res.status(401).json({
      sucess: false,
      massage: "Not Authorized To Access This Route",
    });
  }
};
//=========================================================================================================================================//

module.exports = { authorise };

