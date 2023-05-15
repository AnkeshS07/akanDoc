const { body, query, validationResult } = require("express-validator");

const userProfileModel = require("../models/userModel");
const providerModel=require('../models/provider')
const registerVaidation = [
  body("email", "Please enter a valid email")
    .not()
    .isEmpty()
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: true })
    .custom(async (value) => {
      const user = await userProfileModel.find({ email: value });
      if (user.length > 0) {
        throw new Error("E-mail already in use");
      }
    }),
    body("phone", "Please enter a valid phone")
    .not()
    .isEmpty()
    .custom(async (value) => {
      const user = await userProfileModel.find({ phone: value });
      if (user.length > 0) {
        throw new Error("phone already in use");
      }
    }),
  body("password").not().isEmpty(),
  body("confirmPassword").custom((value, { req }) => {
    return value === req.body.password;
  }),
  body("countryCode")
    .not()
    .isEmpty()
    .custom(async (value) => {
      console.log(value);
      if (!value) {
        throw new Error("The Country code field is empty");
      }
    }),

  body("name")
    .not()
    .isEmpty()
    .isLength({ min: 2 })
    .withMessage("Please enter a valid name"),
];

const validateLogin = [
  body("email")
    .trim()
    .not()
    .isEmpty()
    .normalizeEmail({ gmail_remove_dots: true })
    .withMessage("please input E-mail Address")
    .custom(async (value) => {
      const user = await userProfileModel.find({ email: value });
      if (user.length <= 0) {
        throw new Error("Please Register Your E-mail Address");
      }
    }),
  body("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("please type valid Password"),
];

const signUpVerifyVaidation = [
  body("email")
    .trim()
    .not()
    .isEmpty()
    .normalizeEmail({ gmail_remove_dots: true })
    .withMessage("please input E-mail Address")
    .custom(async (value) => {
      const user = await userProfileModel.find({ email: value });
      if (user.length <= 0) {
        throw new Error("Please Register Your E-mail Address");
      }
    }),
  body("otp")
    .not()
    .isEmpty()
    .custom(async (value, { req }) => {
      const user = await userProfileModel.find({ otp: value });

      if (user.length === 0 || String(value) !== String(user[0].otp)) {
        throw new Error("Please enter a valid OTP");
      }
    }),
];

const forgotPassOtpVaidation = [
  body("email", "Please enter a valid email")
    .not()
    .isEmpty()
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: true })
    .custom(async (value, { req }) => {
      const user = await userProfileModel.find({ email: value });

      if (!user) {
        throw new Error("Please enter a valid registered E-Mail Address");
      }
    }),
];

const verifyPassOtpValidation = [
  body("email", "Please enter a valid email")
    .not()
    .isEmpty()
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: true })
    .custom(async (value, { req }) => {
      const user = await userProfileModel.find({ email: value });

      if (!user) {
        throw new Error("Please enter a valid registered E-Mail Address");
      }
    }),
  body("otp")
    .not()
    .isEmpty()
    .withMessage("Please enter the OTP")
    .isLength({ min: 4, max: 4 })
    .withMessage("OTP must be a 4-digit number")
    .custom(async (value, { req }) => {
      const user = await userProfileModel.find({ otp: value });

      if (user.length === 0 || String(value) !== String(user[0].otp)) {
        throw new Error("Please enter a valid OTP");
      }
    }),
];

const forgotPass = [
  body("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter a valid password"),
  body("confirmPassword")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter a valid confirm password"),
  body("confirmNewPassword")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Please enter a valid confirm new password")
    .custom((value, { req }) => {
      if (value !== req.body.confirmPassword) {
        throw new Error("New password and confirm new password do not match");
      }
      return true;
    }),
];

const contactUsVaidation = [
  body("email")
    .trim()
    .not()
    .isEmpty()
    .normalizeEmail({ gmail_remove_dots: true })
    .withMessage("please input E-mail Address")
    .custom(async (value) => {
      const user = await userProfileModel.find({ email: value });
      if (user.length <= 0) {
        throw new Error("Please Register Your E-mail Address");
      }
    }),
  body("otp")
    .not()
    .isEmpty()
    .custom(async (value, { req }) => {
      const user = await userProfileModel.find({ otp: value });

      if (user.length === 0 || String(value) !== String(user[0].otp)) {
        throw new Error("Please enter a valid OTP");
      }
    }),
];

const providerRegisterValidation = [
  body("email", "Please enter a valid email")
    .not()
    .isEmpty()
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: true })
    .custom(async (value) => {
      const user = await providerModel.find({ email: value });
      if (user.length > 0) {
        throw new Error("E-mail already in use");
      }
    }),
    body("phone", "Please enter a valid phone")
    .not()
    .isEmpty()
    .custom(async (value) => {
      const user = await providerModel.find({ phone: value });
      if (user.length > 0) {
        throw new Error("phone already in use");
      }
    }),
  body("password").not().isEmpty(),
  body("confirmPassword").custom((value, { req }) => {
    return value === req.body.password;
  }),
  
  body("licensed")
    .not()
    .isEmpty()
    .isBoolean()
    .withMessage("The Country code field is empty"),

  body("name")
    .not()
    .isEmpty()
    .isLength({ min: 2 })
    .withMessage("Please enter a valid name"),
  
  body("phone")
    .not()
    .isEmpty()
    .withMessage("Please enter phone number"),
];
const signUpProviderVerifyVaidation = [
  body("email")
    .trim()
    .not()
    .isEmpty()
    .normalizeEmail({ gmail_remove_dots: true })
    .withMessage("please input E-mail Address")
    .custom(async (value) => {
      const user = await providerModel.find({ email: value });
      if (user.length <= 0) {
        throw new Error("Please Register Your E-mail Address");
      }
    }),
  body("otp")
    .not()
    .isEmpty()
    .custom(async (value, { req }) => {
      const user = await providerModel.find({ otp: value });

      if (user.length === 0 || String(value) !== String(user[0].otp)) {
        throw new Error("Please enter a valid OTP");
      }
    }),
];
const validateProviderLogin = [
  body("email")
    .trim()
    .not()
    .isEmpty()
    .normalizeEmail({ gmail_remove_dots: true })
    .withMessage("please input E-mail Address")
    .custom(async (value) => {
      const user = await providerModel.find({ email: value });
      if (user.length <= 0) {
        throw new Error("Please Register Your E-mail Address");
      }
    }),
  body("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("please type valid Password"),
];
const forgotPassOtpProviderVaidation = [
  body("email", "Please enter a valid email")
    .not()
    .isEmpty()
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: true })
    .custom(async (value, { req }) => {
      const user = await providerModel.find({ email: value });

      if (!user) {
        throw new Error("Please enter a valid registered E-Mail Address");
      }
    }),
];
const verifyPassOtpProviderValidation = [
  body("email", "Please enter a valid email")
    .not()
    .isEmpty()
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: true })
    .custom(async (value, { req }) => {
      const user = await providerModel.find({ email: value });

      if (!user) {
        throw new Error("Please enter a valid registered E-Mail Address");
      }
    }),
  body("otp")
    .not()
    .isEmpty()
    .withMessage("Please enter the OTP")
    .isLength({ min: 4, max: 4 })
    .withMessage("OTP must be a 4-digit number")
    .custom(async (value, { req }) => {
      console.log(value)

      const user = await providerModel.find({ otp: value });
      console.log(user)
      if (user.length === 0 || String(value) !== String(user[0].otp)) {
        throw new Error("Please enter a valid OTP");
      }
    }),
];

const validate = function (req, res, next) {
  const error = validationResult(req).array();
  if (!error.length) return next();
  res.status(400).send({ status: 400, msg: error[0].msg });
};

module.exports = {
  registerVaidation,
  validateLogin,
  validate,
  signUpVerifyVaidation,
  forgotPassOtpVaidation,
  verifyPassOtpValidation,
  forgotPass,
  contactUsVaidation,
  providerRegisterValidation,
  signUpProviderVerifyVaidation,
  validateProviderLogin,
  forgotPassOtpProviderVaidation,
  verifyPassOtpProviderValidation
};
