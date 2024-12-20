const { User } = require("../../models/UserModel.js");
const { dbConnect, dbClose } = require("../../functions/dbFunctions.js");

// Async function that deletes all documents in the menuitems collection
async function deleteUsers() {
  try {
    await dbConnect();
    await User.deleteMany({});
    console.log("Users in user collection have been deleted");
    await dbClose();
  } catch (error) {
    console.log(
      "Error! Couldn't delete users in user collection",
      error
    );
  }
}

deleteUsers();

