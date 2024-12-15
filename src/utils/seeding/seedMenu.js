const mongoose = require("mongoose");
const { dbConnect } = require("../../functions/dbFunctions.js");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
dotenv.config();

const dbPath = path.join(__dirname, "menu-items.json");

async function jsonData() {
  try {
    const data = await fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.log("Error reading or parsing json objects", error);
    return null;
  }
}

async function logData() {
  const jsonObjects = await jsonData();
  console.log(jsonData.menuItems);
}

logData();
