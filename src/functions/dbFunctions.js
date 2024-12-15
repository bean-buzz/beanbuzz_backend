const mongoose = require("mongoose");

/**
 * Connects to the MongoDB database.
 *
 * This function checks if the `DATABASE_URL` environment variable is set. If it is, it uses that URL to connect
 * to the MongoDB instance (ideal for production environments). If `DATABASE_URL` is not set, it defaults to
 * a local MongoDB instance (`mongodb://127.0.0.1:27017`) with a database name based on the project’s `package.json`
 * name.
 *
 * The function uses Mongoose to connect asynchronously and logs a success message once the connection is established.
 *
 * @returns {Promise<void>} - A promise that resolves once the database connection is successfully established.
 */
async function dbConnect() {
  let databaseURL =
    process.env.DATABASE_URL ||
    `mongodb://127.0.0.1:27017/${process.env.npm_package_name}`;
  try {
  await mongoose.connect(databaseURL);
  console.log("Connected to database at " + databaseURL);
  } catch (error) {
    console.log(`dbConnect failed! error: \n ${JSON.stringify(error)}`)
  }
}

module.exports = {
  dbConnect,
};
