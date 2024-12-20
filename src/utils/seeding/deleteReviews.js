const Review = require("../../models/ReviewModel.js");
const { dbConnect, dbClose } = require("../../functions/dbFunctions.js");

// Async function that deletes all documents in the menuitems collection
async function deleteReviews() {
  try {
    await dbConnect();
    await Review.deleteMany({});
    console.log("Reviews in review collection have been deleted");
    await dbClose();
  } catch (error) {
    console.log(
      "Error! Couldn't delete reviews in review collection",
      error
    );
  }
}

deleteReviews();

module.exports = {
    deleteReviews,
}