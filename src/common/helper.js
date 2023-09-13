const SibApiV3Sdk = require("sib-api-v3-sdk");
/**
 * To generate OTP
 * @returns Integer
 */
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

/**
 * To send otp to user
 * @param {*} toEmail
 * @param {*} OTP
 * @param {*} type
 */
//======================================================= sendOTP =================================================================//
/**
 * The `sendOTP` function sends an email with a specific subject and body based on the type of OTP
 * requested.
 * @param toEmail - The email address to which the OTP (One-Time Password) will be sent.
 * @param OTP - The OTP parameter stands for "One-Time Password". It is a unique code that is generated
 * and sent to the user's email address for verification or authentication purposes.
 * @param [type=register] - The `type` parameter is used to determine the purpose of the OTP (One-Time
 * Password) email. It can have three possible values:
 */
const sendOTP = (toEmail, OTP, type = "register") => {
  let subject = "";
  let body = "";
  let otpColor = "#FF0000";

  switch (type) {
    case "login":
    case "register":
      subject = "Account Verification";
      body = `Your akanDoc account Verifcation OTP is: <span style="color: ${otpColor};">${OTP}</span>. Please don't share it with anyone for your safety.`;
      break;

    case "forgotPass":
      subject = "Forgot Password";
      body = `Your akanDoc forgot password OTP is: <span style="color: ${otpColor};">${OTP}</span>. Please don't share it with anyone for your safety.`;
      break;

    default:
      break;
  }

  sendMail(toEmail, subject, body);
};

//========================================= sendUnAuthOTP =================================================================//
/**
 * The `sendUnAuthOTP` function sends an email with a specific subject and body based on the type of
 * OTP request.
 * @param toEmail - The email address where the OTP (One-Time Password) will be sent.
 * @param OTP - The OTP parameter is a string that represents the One-Time Password that will be sent
 * to the user's email for verification or authentication purposes.
 * @param [type=login] - The `type` parameter in the `sendUnAuthOTP` function is used to determine the
 * purpose of the OTP (One-Time Password) email being sent. It can have the following values:
 */
const sendUnAuthOTP = (toEmail, OTP, type = "login") => {
  let subject = "";
  let body = "";
  let otpColor = "#FF0000";

  switch (type) {
    case "login":
    case "register":
      subject = "Account Verification";
      body = `Your AkanDoc account Verification OTP is: <span style="color: ${otpColor};">${OTP}</span>. Please don't share it with anyone for your safety.`;
      break;

    case "forgotPass":
      subject = "Forgot Password";
      body = `Your AkanDoc forgot password OTP is: <span style="color: ${otpColor};">${OTP}</span>. Please don't share it with anyone for your safety.`;
      break;

    case "updatePhone":
      subject = "Update Phone";
      body = `Your AkanDoc update Phone OTP is: <span style="color: ${otpColor};">${OTP}</span>. Please don't share it with anyone for your safety.`;
      break;

    default:
      break;
  }

  sendMail(toEmail, subject, body);
};

//======================================================sendPassForgotOTP===========================================================//

/**
 * The function `sendPassForgotOTP` sends an email with a specific subject and body based on the type
 * of OTP (One-Time Password) requested.
 * @param toEmail - The email address where the OTP (One-Time Password) will be sent.
 * @param OTP - The OTP parameter stands for "One-Time Password". It is a unique code that is generated
 * and sent to the user's email address for verification or password reset purposes.
 * @param [type=forgot] - The `type` parameter is an optional parameter that specifies the type of
 * email being sent. It can have two possible values:
 */
const sendPassForgotOTP = (toEmail, OTP, type = "forgot") => {
  let subject = "";
  let body = "";
  let otpColor = "#FF0000";

  switch (type) {
    case "forgot":
      subject = "Account Verification";
      body = `Your AkanDoc account Verification OTP is: <span style="color: ${otpColor};">${OTP}</span>. Please don't share it with anyone for your safety.`;
      break;

    case "forgotPass":
      subject = "Forgot Password";
      body = `Your AkanDoc forgot password OTP is: <span style="color: ${otpColor};">${OTP}</span>. Please don't share it with anyone for your safety.`;
      break;

    default:
      break;
  }

  sendMail(toEmail, subject, body);
};

//====================================================send Mail Using blueLab=================================================//
/**
 * To send email
 * @param {*} toEmail
 * @param {*} subject
 * @param {*} body
 */

/**
 * The `sendMail` function sends an email using the Sendinblue API with the specified recipient,
 * subject, and body.
 * @param toEmail - The email address of the recipient.
 * @param subject - The subject of the email. It is a string that represents the subject line of the
 * email.
 * @param body - The body parameter is the content of the email that you want to send. It can be a
 * string containing any text or HTML markup that you want to include in the email.
 */
const sendMail = (toEmail, subject, body) => {
  let defaultClient = SibApiV3Sdk.ApiClient.instance;
  let apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey =
    "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";
  let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = `
    <html>
      <body>
        <h3>${body}</h3>
      </body>
    </html>`;
  sendSmtpEmail.sender = {
    name: "Akan doc",
    email: "Koolex007@gmail.com",
  };
  sendSmtpEmail.to = [{ email: toEmail }];

  apiInstance.sendTransacEmail(sendSmtpEmail).then(
    (data) => {
      console.log(
        "API called successfully. Returned data: " + JSON.stringify(data)
      );
    },
    function (error) {
      console.error(error);
    }
  );
};

//=====================================================================================================================//
module.exports = {
  sendOTP,
  sendMail,
  generateOTP,
  sendUnAuthOTP,
  sendPassForgotOTP,
};
