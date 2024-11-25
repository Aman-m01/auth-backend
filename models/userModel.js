const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    email: {
      required: [true, "email is requires"],
      unique: [true, "email must be unique"],
      trim: true,
      minLength: [5, "email must have 5 characters"],
      lowercase: true,
      type: String,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      trim: true,
      select: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      select: false,
    },
    verificationCodeValidation: {
      type: Number,
      select: false,
    },
    forgetPasswordCode: {
      type: String,
      select: false,
    },
    forgetPasswordCodeValidations: {
      type: Number,
      select: false,
    },
  },
  { tmestamps: true }
);

module.exports = mongoose.model("User", userSchema);
