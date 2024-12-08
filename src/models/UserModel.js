const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
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
      validate: {
        // Validates email format
        validator: function (v) {
          return validator.isEmail(v);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    phoneNumber: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return validator.isMobilePhone(v, "any");
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
      validate: {
        // At least 1 uppercase letter, 1 number
        validator: function (v) {
          return /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(v);
        },
        message:
          "Password must be at least 8 characters long and contain at least one uppercase letter and one number.",
      },
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    preferredPaymentType: {
      type: String,
      enum: ["stripe", "cash"],
      default: "cash",
    },
  },
  { timestamps: true }
);

// Hash the password before saving
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    // Don't hash an already hashed password
    if (!this.password.startsWith("$2b$")) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
  next();
});

// Create an ascending index on both email and phonenumber fields
// Easier to query when it's needed
UserSchema.index({ email: 1 });
UserSchema.index({ phoneNumber: 1 });

const User = mongoose.model("User", UserSchema);

module.exports = {
  User,
};
