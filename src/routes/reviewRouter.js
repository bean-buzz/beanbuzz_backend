const express = require("express");
const router = express.Router();

const {
  getAllReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController.js");

const {
  validateReviewInput,
  validateIdParam,
} = require("../middleware/reviewValidator.js");

// router.get('/',getAllReviews)
// router.post('/',createReview)

router.route("/").get(getAllReviews).post(validateReviewInput, createReview);

router
  .route("/:id")
  .get(validateIdParam, getReview)
  .patch(validateReviewInput, validateIdParam, updateReview)
  .delete(validateIdParam, deleteReview);

module.exports = router;
