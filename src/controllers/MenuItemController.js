const express = require("express");

const { MenuItem } = require("../models/MenuModel");
const {
  validateUserAuth,
  roleValidator,
} = require("../middleware/validateUser");

const router = express.Router();

// GET - /menu
// Retrieve the entire menu
router.get("/", async (request, response) => {
  try {
    const menu = await MenuItem.find();
    response.status(200).json(menu);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

// GET - /menu/:categoryName
// Retrieve all items in a specific category
router.get("/:categoryName", async (request, response) => {
  try {
    const { categoryName } = request.params;

    // Query the database for items with the specified category name
    const items = await MenuItem.find({ category: categoryName });

    // If no items are found, return a 404 response
    if (items.length === 0) {
      return response
        .status(404)
        .json({ message: `No items found for the category: ${categoryName}.` });
    }

    response.status(200).json(items);
  } catch (error) {
    // Handle errors and send a 500 response
    response.status(500).json({ error: error.message });
  }
});

// GET - /menu/item/:itemId
// Retrieve details of a specific menu item
router.get("/item/:itemId", async (request, response) => {
  try {
    const { itemId } = request.params;
    const menuItem = await MenuItem.findById(itemId);

    if (!menuItem) {
      return response.status(404).json({ message: "Menu item not found." });
    }

    response.status(200).json(menuItem);
  } catch (error) {
    // Handle errors and send a 500 response
    response.status(500).json({ error: error.message });
  }
});

// POST - /menu/item
// Add a new menu item (Admin only)
router.post(
  "/item",
  validateUserAuth,
  roleValidator("admin"),
  async (request, response) => {
    try {
      const newItem = new MenuItem(request.body);
      const savedItem = await newItem.save();
      response.status(201).json(savedItem);
    } catch (error) {
      // Handle errors and send a 500 response
      response.status(500).json({ error: error.message });
    }
  }
);

// PUT - /menu/item/:itemId
// Update a specific menu item (Admin only)
router.put(
  "/item/:itemId",
  validateUserAuth,
  roleValidator("admin"),
  async (request, response) => {
    try {
      const { itemId } = request.params;

      // Find and update the menu item by ID
      const updatedItem = await MenuItem.findByIdAndUpdate(
        itemId,
        request.body,
        {
          // Return the updated document
          new: true,
          // Make sure schema validators are applied
          runValidators: true,
        }
      );

      // If the menu item is not found
      if (!updatedItem) {
        return response.status(404).json({ message: "Menu item not found." });
      }

      // Return the updated menu item
      response.status(200).json(updatedItem);
    } catch (error) {
      // Handle any errors during the update
      response.status(500).json({
        message: "Failed to update the menu item.",

        // TODO: Remove error message in production
        error: error.message,
      });
    }
  }
);

// DELETE - /menu/item/:itemId
// Delete a specific menu item (Admin only)
router.delete(
  "/item/:itemId",
  validateUserAuth,
  roleValidator("admin"),
  async (request, response) => {
    try {
      const { itemId } = request.params;
      const deletedItem = await MenuItem.findByIdAndDelete(itemId);
      if (!deletedItem) {
        return response.status(404).json({ message: "Menu item not found." });
      }
      response.status(200).json({ message: "Menu item deleted successfully." });
    } catch (error) {
      response.status(500).json({
        message: "Oops! Something went wrong on the server.",

        // TODO: Remove for production
        error: error.message,
      });
    }
  }
);

module.exports = router;
