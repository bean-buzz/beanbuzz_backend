const mongoose = require('mongoose');
const {dbConnect, dbClose } = require("../../functions/dbFunctions.js");
const Review = require("../../models/ReviewModel.js");
require("dotenv").config();

let sampleReviews = [

{
    userName:"David",
    rating: 5,
    reviewMessage: "The food was great!",
    reviewStatus: "approved",
},
{
    userName:"Sandra",
    rating: 4,
    reviewMessage: "The staff were lovely!",
    reviewStatus: "approved",
},
{
    userName:"James",
    rating: 5,
    reviewMessage: "Will definitely come here again. Family loved the food!",
    reviewStatus: "approved",
},
{
    userName:"Karen",
    rating: 5,
    reviewMessage: "I was very impressed with the service and the dishes were delicious!",
    reviewStatus: "approved",
},
{
    userName:"Tim",
    rating: 2,
    reviewMessage: "Meh!",
    reviewStatus: "declined",
},
{
    userName:"HAHAHA",
    rating: 0,
    reviewMessage: "HAHAHAHAHAHA!",
    reviewStatus: "declined",
},
{
    userName:"Tommy",
    rating: 3,
    reviewMessage: "Food was ok but i've had better",
    reviewStatus: "declined",
},

]

async function seedReviewData() {
    try {
      await dbConnect();
      await Review.insertMany(sampleReviews);
      console.log("Sample reviews have been seeded")
      await dbClose();
    } catch (error) {
      console.log("Error seeding review data.", error);
    }
  }
  
  seedReviewData();

