const userModel = require("../models/userModel");
const providerModel = require("../models/provider");
const sendMail = require("../common/helper").sendMail;

//================================================ resendEmailOtp ======================================================//

/**
 * The function `resendEmailOtp` that takes in a request, response, and
 * next middleware function as parameters, and it is responsible for resending an email OTP (One-Time
 * Password) for account verification.
 */

const resendEmailOtp = async (req, res, next) => {
  try {
    const userData = req.body.email;
    const findUser = await userModel.findOne({ email: userData });

    if (!userData) {
      return res
        .status(400)
        .send({ status: 400, msg: "Email cannot be empty" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000);
    /* The line `const otp = Math.floor(1000 + Math.random() * 9000);` is generating a random four-digit
       number. */

    let user = await userModel.findOne({
      email: userData,
      password: findUser.password,
      device_id: req.headers.device_id,
    });

    /* The code block is responsible for sending an email to the user with the account verification OTP
    (One-Time Password). */
    if (user) {
      let subject = "Account Verification";
      let body = `Your AkanDoc account Verification OTP is: `;

      const letterColor = generateRandomColor();
      body += `<span style="color: ${letterColor};">${otp}</span>`;

      body += `. Please don't share it with anyone for your safety.`;
      sendMail(userData, subject, body);

      user.otp = otp;
      user.save();
      console.log(user);

      return res.status(200).send({
        status: 200,
        data: { user },
        message: "OTP resend success",
      });
    } else {
      return res.status(400).send({
        status: 400,
        data: {},
        message: "Invalid details",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Data not saved.",
      status: 400,
    });
  }
};

//================================================ resendProviderEmailOtp ======================================================//

/**
 * The function `resendProviderEmailOtp` resends an email OTP
 * (One-Time Password) to a user's email address for account verification.
 */

const resendProviderEmailOtp = async (req, res, next) => {
  try {
    const userData = req.body.email;
    if (!userData) {
      return res
        .status(400)
        .send({ status: 400, message: "Email cannot be empty" });
    }
    const findUser = await providerModel.findOne({ email: userData });
    if (!findUser) {
      return res.status(400).send({ status: 400, message: "User not found" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    let user = await providerModel.findOne({ email: userData });

    if (user) {
      let subject = "Account Verification";
      let body = `Your AkanDoc account Verification OTP is: `;

      const letterColor = generateRandomColor();
      body += `<span style="color: ${letterColor};">${otp}</span>`;

      body += `. Please don't share it with anyone for your safety.`;

      sendMail(userData, subject, body);

      user.otp = otp;
      user.save();
      console.log(user);

      return res.status(200).send({
        status: 200,
        data: { user },
        message: "OTP resend success",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Data not saved.",
      status: 400,
      error: error.message,
    });
  }
};

//====================================================================================================================//

/**
 * The function generates a random dark color from a predefined list.
 * @returns The function `generateRandomColor` returns a randomly selected color from the `darkColors`
 * array.
 */

function generateRandomColor() {
  const darkColors = [
    "#1E1E1E",
    "#2C2C2C",
    "#3A3A3A",
    "#484848",
    "#565656",
    "#646464",
    "#8B0000",
    "#00008B",
    "#006400",
  ];
  const randomIndex = Math.floor(Math.random() * darkColors.length);
  return darkColors[randomIndex];
}

//===============================================================================================================//
module.exports = { resendEmailOtp, resendProviderEmailOtp };
