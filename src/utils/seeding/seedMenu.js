const mongoose = require("mongoose");
const { dbConnect, dbClose } = require("../../functions/dbFunctions.js");
const { MenuItem } = require("../../models/MenuModel.js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const jsonFilePath = path.join(__dirname, "menu-items.json");

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
// // The seedMenuData function works when i hard code the url. But doesn't work when i import dbConnect and use that. Need to look into this
// async function dbConnectHardCoded() {
//   let databaseURL = `mongodb://127.0.0.1:27017/beanbuzz_backend`;
//   try {
//     await mongoose.connect(databaseURL);
//     console.log("Connected to database at " + databaseURL);
//   } catch (error) {
//     console.log(`dbConnect failed! error: \n ${JSON.stringify(error)}`);
//   }
// }

// function not working as intended. Can't connect to database
async function seedMenuData() {
  const sampleMenuItemData = await retrieveMenuItemData();
  try {
    // doesn't seem to work with dbConnect(); Last part of url is undefined
    await dbConnect();
    await MenuItem.insertMany(sampleMenuItemData);
    await dbClose();
  } catch (error) {
    console.log("Error seeding menu data.", error);
  }
}

seedMenuData();
