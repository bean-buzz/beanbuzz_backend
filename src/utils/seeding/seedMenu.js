const {dbConnect, dbClose } = require("../../functions/dbFunctions.js");
const { MenuItem } = require("../../models/MenuModel.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Defines the path to the JSON file containing sample data
const jsonFilePath = path.join(__dirname, "sampleData.json");


// Asynchronous function to read and parse menu item data from the JSON file
async function retrieveMenuItemData() {
  try {
    const data = await fs.readFileSync(jsonFilePath, "utf-8");
    const menuItemData = await JSON.parse(data).menuItems;
    return menuItemData;
  } catch (error) {
    console.log(
      "Error reading or parsing json objects when retrieving json data",
      error
    );
    return null;
  }
}

// Asynchronous function to seed menu item data into the MongoDB database
async function seedMenuData() {
  const sampleMenuItemData = await retrieveMenuItemData();
  try {
    await dbConnect();
    await MenuItem.insertMany(sampleMenuItemData);
    console.log("Sample menu items have been seeded")
    await dbClose();
  } catch (error) {
    console.log("Error seeding menu data.", error);
  }
}

seedMenuData();
