const mongoose = require("mongoose");
const { MenuItem } = require("../../models/MenuModel.js");
const { dbConnect, dbClose } = require("../../functions/dbFunctions.js");

async function deleteMenu() {
  try {
    await dbConnect();
    await MenuItem.deleteMany({});
    console.log("Menu items in menuitems collection has been deleted");
    await dbClose();
  } catch (error) {
    console.log(
      "Error! Couldn't clear menu items in menuitems collection",
      error
    );
  }
}

deleteMenu();
