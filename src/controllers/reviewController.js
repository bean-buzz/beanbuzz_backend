const Review = require("../models/ReviewModel.js");
const { StatusCodes } = require("http-status-codes");

const getAllReviews = async (req, res) => {
  const { search, reviewStatus, sort } = req.query;

  const queryObject = {
    createdBy: req.userName,
  };

  if (search) {
    queryObject.$or = [{ userName: { $regex: search, $options: "i" } }];
  }

  if (reviewStatus && reviewStatus !== "all") {
    queryObject.reviewStatus = reviewStatus;
  }

  const sortOptions = {
    newest: "-createdAt",
    oldest: "createdAt",
  };

  const sortKey = sortOptions[sort] || sortOptions.newest;

  // Setup pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const reviews = await Review.find(queryObject)
    .sort(sortKey)
    .skip(skip)
    .limit(limit);

  const totalReviews = await Review.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalReviews / limit);

  res
    .status(StatusCodes.OK)
    .json({ totalReviews, numOfPages, currentPage: page, reviews });
};

const createReview = async (req, res) => {
  req.body.createdBy = req.userName;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

const getReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req, res) => {
  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res
    .status(StatusCodes.OK)
    .json({ msg: "review modified", review: updatedReview });
};

const deleteReview = async (req, res) => {
  const removedReview = await Review.findByIdAndDelete(req.params.id);
  res
    .status(StatusCodes.OK)
    .json({ msg: "review deleted", review: removedReview });
};

module.exports = {
  getAllReviews,
  createReview,
  getReview,
  updateReview,
  deleteReview,
};
