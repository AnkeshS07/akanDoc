const HttpResponse = require("../response/HttpResponse");
const { check, validationResult } = require("express-validator");

/**
 * Exception handler
 * @param {*} err
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
const handler = (err, req, res, next) => {
  let statusCode = err.statusCode || HttpResponse.HTTP_INTERNAL_SERVER_ERROR;
  let message = err.message || "Internal Server Error";

  switch (statusCode) {
    case HttpResponse.HTTP_UNAUTHORIZED:
      message = "Unauthenticated";
      break;

    case HttpResponse.HTTP_FORBIDDEN:
      message = "Forbidden";
      break;

    case HttpResponse.HTTP_NOT_FOUND:
      message = "Not found";
      break;

    case HttpResponse.HTTP_METHOD_NOT_ALLOWED:
      message = "Method Not Allowed";
      break;

    case HttpResponse.HTTP_UNPROCESSABLE_ENTITY:
      message = "Unprocessable entity";
      break;

    case HttpResponse.HTTP_INTERNAL_SERVER_ERROR:
      message = message;
      break;
    default:
      message = "Internal Server Error";
      break;
  }

  return HttpResponse.apiResponse(res, {}, statusCode, message);
};

/**
 * Validation handler
 * @param {*} err
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
// const validation = (req, res, next) => {
//   console.log('test');

//   let errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     let message = errors.array()[0].msg || "Unprocessable entity.";

//     return HttpResponse.apiResponse(
//       res,
//       errors.array(),
//       HttpResponse.HTTP_UNPROCESSABLE_ENTITY,
//       message
//     );
//   }
//   next();
// };
const validation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorObject = {};
    errors.array().forEach((error) => {
      errorObject[error.param] = error.msg;
    });

    const message = 'Unprocessable entity.';
    return HttpResponse.apiResponse(
      res,
      errorObject,
      HttpResponse.HTTP_UNPROCESSABLE_ENTITY,
      message
    );
  }

  next();
};

module.exports = {
  handler,
  validation,
};
