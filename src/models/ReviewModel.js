const mongoose = require("mongoose");
const { REVIEW_STATUS } = require("../utils/reviewConstants.js");

const ReviewSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviewMessage: {
      type: String,
      default: "",
    },
    reviewStatus: {
      type: String,
      enum: Object.values(REVIEW_STATUS),
      default: REVIEW_STATUS.APPROVED,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", ReviewSchema);
