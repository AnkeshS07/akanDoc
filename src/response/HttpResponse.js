const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");

/**
 * To send api response
 * @param {*} resp
 * @param {*} data
 * @param {*} status
 * @param {*} message
 * @returns
 */
const apiResponse = (resp, data, status, message) => {
  let response = {
    status: status,
    data: data,
    message: message,
  };
  return resp.status(status).json(response);
};
const apiResponseToken = (resp, token, status, message) => {
  let response = {
    status: status,
    token: token,
    message: message,
  };
  return resp.status(status).json(response);
};

const HTTP_CREATED = StatusCodes.CREATED;
const HTTP_OK = StatusCodes.OK;
const HTTP_UNAUTHORIZED = StatusCodes.UNAUTHORIZED;
const HTTP_FORBIDDEN = StatusCodes.FORBIDDEN;
const HTTP_NOT_FOUND = StatusCodes.NOT_FOUND;
const HTTP_METHOD_NOT_ALLOWED = StatusCodes.METHOD_NOT_ALLOWED;
const HTTP_UNPROCESSABLE_ENTITY = StatusCodes.UNPROCESSABLE_ENTITY;
const HTTP_INTERNAL_SERVER_ERROR = StatusCodes.INTERNAL_SERVER_ERROR;

module.exports = {
  apiResponseToken,
  apiResponse,
  HTTP_CREATED,
  HTTP_OK,
  HTTP_UNAUTHORIZED,
  HTTP_FORBIDDEN,
  HTTP_NOT_FOUND,
  HTTP_METHOD_NOT_ALLOWED,
  HTTP_UNPROCESSABLE_ENTITY,
  HTTP_INTERNAL_SERVER_ERROR,
};
