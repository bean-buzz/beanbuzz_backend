const { body, param, validationResult } = require("express-validator");
const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} = require("../errors/customErrors.js");
const { REVIEW_STATUS } = require("../utils/reviewConstants.js");
const mongoose = require("mongoose");
const Review = require("../models/ReviewModel.js");

const withValidationErrors = (validateValues) => {
  return [
    validateValues,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);

        const firstMessage = errorMessages[0];
        console.log(Object.getPrototypeOf(firstMessage));
        if (errorMessages[0].startsWith("no review")) {
          throw new NotFoundError(errorMessages);
        }
        if (errorMessages[0].startsWith("not authorized")) {
          throw new UnauthorizedError("not authorized to access this route");
        }
        throw new BadRequestError(errorMessages);
      }
      next();
    },
  ];
};

const validateReviewInput = withValidationErrors([
  body("userName").notEmpty().withMessage("userName is required"),
  body("rating").notEmpty().withMessage("rating is required"),
  body("reviewMessage").notEmpty().withMessage("reviewMessage is required"),
  body("reviewStatus")
    .isIn(Object.values(REVIEW_STATUS))
    .withMessage("invalid reviewStatus value"),
]);

const validateIdParam = withValidationErrors([
  param("id").custom(async (value, { req }) => {
    const isValidMongoId = mongoose.Types.ObjectId.isValid(value);
    if (!isValidMongoId) throw new BadRequestError("invalid MongoDB id");
    const review = await Review.findById(value);
    if (!review) throw new NotFoundError(`no review with id ${value}`);
  }),
]);

module.exports = {
  validateReviewInput,
  validateIdParam,
};
