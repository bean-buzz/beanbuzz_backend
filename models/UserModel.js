const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: false,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 3,
    trim: true,
  },
  role: {
    type: String,
    enum: ["user", "admin", "moderator"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
  preferredPaymentType: {
    type: String,
    enum: ["stripe", "cash"],
    default: "cash",
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = {
  User,
};
