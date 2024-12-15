const mongoose = require("mongoose");
const { dbConnect } = require("../../functions/dbFunctions.js");
const dotenv = require("dotenv");

dotenv.config();

const smoothies = [
  {
    itemName: "Melon Smoothie",
    category: "smoothie",
    imageUrl: "./menu-item-images/melon_smoothie_resized.jpg",
    description: "A refreshing smoothie made with sweet melon and yogurt.",
    isAvailable: false,
    multipleSizes: true,
    defaultPrice: null,
    sizes: {
      small: {
        price: 6,
      },
      medium: {
        price: 7,
      },
      large: {
        price: 8,
      },
    },
    dietaryInformation: {
      isVegan: false,
      isVegetarian: true,
      isGlutenFree: true,
      isDairyFree: false,
      isHalal: true,
      isKosher: true,
      isBeefFree: true,
    },
    creationDate: "2024-05-22T14:10:30.000Z",
    lastUpdateDate: "2024-05-22T14:10:30.000Z",
  },
  {
    itemName: "Mango Smoothie",
    category: "smoothie",
    imageUrl: "./menu-item-images/mango_smoothie_resized.jpg",
    description: "A tropical smoothie made with fresh mango and yogurt.",
    isAvailable: true,
    multipleSizes: true,
    defaultPrice: null,
    sizes: {
      small: {
        price: 6,
      },
      medium: {
        price: 7,
      },
      large: {
        price: 8,
      },
    },
    dietaryInformation: {
      isVegan: false,
      isVegetarian: true,
      isGlutenFree: true,
      isDairyFree: false,
      isHalal: true,
      isKosher: true,
      isBeefFree: true,
    },
    creationDate: "2024-06-20T14:10:30.000Z",
    lastUpdateDate: "2024-06-20T14:10:30.000Z",
  }
];
