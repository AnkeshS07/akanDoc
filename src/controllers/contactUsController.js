const ContactUs = require("../models/contactUs");
const SibApiV3Sdk = require("sib-api-v3-sdk");
const HttpResponse = require("../response/HttpResponse");
//============================================================================================================================//

/**
 * The `sendMail` function sends an email using the Sendinblue API with the specified recipient,
 * subject, and body.
 * @param toEmail - The email address of the recipient to whom the email will be sent.
 * @param subject - The subject of the email. It is a string that represents the subject line of the
 * email.
 * @param body - The body parameter is the content of the email that you want to send. It can be a
 * string containing any text or HTML content that you want to include in the email.
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

//===========================================================================================================================//

/**
 * The contactUs function saves a contact form submission to the database, sends an email notification,
 * and returns a success response.
 * @param next - The `next` parameter is a function that is used to pass control to the next middleware
 * function in the request-response cycle. It is typically used to handle errors or to move on to the
 * next middleware function in the chain.
 * @returns an API response with an empty object as the data, an HTTP status code of 200 (HTTP_OK), and
 * a success message of "Mail sent successfully".
 */

const contactUs = async (req, res, next) => {
  try {
    const { email, subject, message } = req.body;

    const contact = new ContactUs({
      email,
      subject,
      message,
      user: req.checkIfExist._id,
    });
    await contact.save();

    sendMail("ankeshsharma420@gmail.com", `${subject}`, message);

    return HttpResponse.apiResponse(
      res,
      {},
      HttpResponse.HTTP_OK,
      "Mail sent successfully"
    );
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

//====================================================================================================================//

/**
 * The function `providerContactUs` saves a contact form submission to the database and sends an email
 * using the SendinBlue API.
 */

const providerContactUs = async (req, res, next) => {
  try {
    const { email, subject, message } = req.body;

    const contact = new ContactUs({
      email,
      subject,
      message,
      provider: req.user._id,
    });
    await contact.save();

    // Send the email using SendinBlue API
    sendMail("ankeshsharma420@gmail.com", `${subject}`, message);

    return HttpResponse.apiResponse(
      res,
      {},
      HttpResponse.HTTP_OK,
      "Mail sent successfully"
    );
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

//=====================================================================================================================//

/**
 * The function `getAllMails` retrieves emails from both providers and users and returns them in the
 * response.
 */

const getAllMails = async (req, res, next) => {
  try {
    const getMailsProviders = await ContactUs.find({
      provider: { $exists: true },
    }).populate("provider", "name userProfile imageUrl");
 
    const getMailsUsers = await ContactUs.find({
      user: { $exists: true },
    }).populate("user", "name userProfile imageUrl");

    return HttpResponse.apiResponse(
      res,
      { providers: getMailsProviders, users: getMailsUsers },
      HttpResponse.HTTP_OK,
      "User and provider emails fetched successfully"
    );
  } catch (err) {
    err.statusCode = HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
    next(err);
  }
};

//===================================================================================================================//

module.exports = { contactUs, providerContactUs, getAllMails };
