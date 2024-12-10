const mongoose = require("mongoose");

// Allow different sizes for menu items
const SizeSchema = new mongoose.Schema({
  price: { type: Number, required: true },
});

// Allow dietary info to be separate for easier accessibility
const DietaryInfoSchema = new mongoose.Schema({
  isVegan: { type: Boolean, required: true },
  isVegetarian: { type: Boolean, required: true },
  isGlutenFree: { type: Boolean, required: true },
  isDairyFree: { type: Boolean, required: true },
  isHalal: { type: Boolean, required: true },
  isKosher: { type: Boolean, required: true },
  isBeefFree: { type: Boolean, required: true },
});

// The menu item, a collection of all item attributes and additional schemas
const MenuItemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    description: { type: String, required: true },
    isAvailable: { type: Boolean, required: true },
    multipleSizes: { type: Boolean, required: true, default: false },
    defaultPrice: { type: Number, default: null },
    sizes: {
      small: { type: SizeSchema, required: false },
      medium: { type: SizeSchema, required: false },
      large: { type: SizeSchema, required: false },
    },
    dietaryInformation: { type: DietaryInfoSchema, required: true },
  },
  { timestamps: true }
);

const MenuItem = mongoose.model("MenuItem", MenuItemSchema);

module.exports = {
  MenuItem,
};
