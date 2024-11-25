
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { doHash, doHashValidation, hmacProcess } = require("../utils/doHash");
const {
  signinSchema,
  signupSchema,
  acceptCodeSchema,
  acceptFPCodeSchema,
  changePassword,
  createPostSchema,
} = require("../middlewares/validator");
const nodemailer = require("nodemailer");

const transport = require("../middlewares/sendMail");

// signup
exports.signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { error, value } = signupSchema.validate({ email, password });
    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(401)
        .json({ success: false, msg: "user already exist" });
    }
    const hashedPassword = await doHash(password, 12);
    const newUser = new User({
      email,
      password: hashedPassword,
    });
    const result = await newUser.save();
    result.password = undefined;

    res.status(201).json({
      success: true,
      msg: "Your account has been creates successfully",
      result,
    });
  } catch (error) {
    console.log(error);
  }
};

// login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { error, value } = signinSchema.validate({ email, password });

    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const existingUser = await User.findOne({ email }).select("password");
    if (!existingUser) {
      return res
        .status(401)
        .json({ success: false, msg: "user doesn't exist" });
    }

    const result = await doHashValidation(password, existingUser.password);
    if (!result) {
      return res
        .status(401)
        .json({ success: false, msg: "Invalid Credentials" });
    }

    const token = jwt.sign(
      {
        userId: existingUser._id,
        email: existingUser.email,
        verified: existingUser.verified,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: "8h" }
    );

    res
      .cookie("Authorization", "Bearer " + token, {
        expires: new Date(Date.now() + 8 * 3600000),
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      })
      .json({
        success: true,
        token,
        message: "loggedIn Successfully ",
      });
  } catch (error) {
    console.log(error);
  }
};

// logout
exports.logout = async (req, res) => {
  res.clearCookie("Authorization").status(200).json({
    success: true,
    message: "Logged Out successfully",
  });
};

// sendVerificationCode
exports.sendVerificationCode = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, msg: "User doesn't exist" });
    }

    if (existingUser.verified) {
      return res
        .status(400)
        .json({ success: false, message: "You are already verified" });
    }

    const codeValue = Math.floor(Math.random() * 100000).toString();

    try {
      const info = await transport.sendMail({
        from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
        to: email,
        subject: "Verification Code",
        text: "This is a test email sent from a Node.js application",
        html: `<h1>${codeValue}</h1>`,
      });

      if (info.accepted.includes(email)) {
        const hashedCodeValue = hmacProcess(
          codeValue,
          process.env.HMAC_VERIFICATION_CODE_SECRET
        );

        existingUser.verificationCode = hashedCodeValue;
        existingUser.verificationCodeValidation = Date.now();
        await existingUser.save();

        return res
          .status(200)
          .json({ success: true, message: "Verification code sent!" });
      } else {
        return res.status(500).json({
          success: false,
          message: "Failed to send the verification email",
        });
      }
    } catch (emailError) {
      return res
        .status(500)
        .json({ success: false, message: "Error sending verification email" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error, please try again later",
    });
  }
};

// verifyVerificationCode
exports.verifyVerificationCode = async (req, res) => {
  const { email, providedCode } = req.body;

  try {
    const { error } = acceptCodeSchema.validate({ email, providedCode });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const codeValue = providedCode.toString();

    const existingUser = await User.findOne({ email }).select(
      "+verificationCode +verificationCodeValidation"
    );

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User does not exist.",
      });
    }

    if (existingUser.verified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified.",
      });
    }

    if (
      !existingUser.verificationCode ||
      !existingUser.verificationCodeValidation
    ) {
      return res.status(400).json({
        success: false,
        message: "Verification code is missing or invalid.",
      });
    }

    const codeExpirationTime = 5 * 60 * 1000;
    if (
      Date.now() - existingUser.verificationCodeValidation >
      codeExpirationTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired.",
      });
    }

    const hashedCodeValue = hmacProcess(
      codeValue,
      process.env.HMAC_VERIFICATION_CODE_SECRET
    );
    if (hashedCodeValue !== existingUser.verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code.",
      });
    }

    const hashedPassword = await doHash(newPassword, 12);
    existingUser.password = hashedPassword;
    existingUser.verified = true;
    existingUser.verificationCode = undefined;
    existingUser.verificationCodeValidation = undefined;

    await existingUser.save();

    return res.status(200).json({
      success: true,
      message: "Password updated and user verified successfully.",
    });
  } catch (error) {
    console.error("Error during verification:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    });
  }
};

// verifyVerificationCode
exports.verifyVerificationCode = async (req, res) => {
  const { email, providedCode } = req.body;
  try {
    const { error, value } = acceptCodeSchema.validate({ email, providedCode });

    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }

    const codeValue = providedCode.toString();
    const existingUser = await User.findOne({ email }).select(
      "+verificationCode +verificationCodeValidation"
    );
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "user doesn't exist" });
    }
    if (existingUser.verified) {
      return res
        .status(400)
        .json({ success: true, message: "you are already verified" });
    }

    if (
      !existingUser.verificationCode ||
      !existingUser.verificationCodeValidation
    ) {
      return res
        .status(400)
        .json({ success: true, message: "something is wrong with the code" });
    }

    if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) {
      return res
        .status(400)
        .json({ success: true, message: "code has been expired " });
    }
    let hashedCodeValue = hmacProcess(
      codeValue,
      process.env.HMAC_VERIFICATION_CODE_SECRET
    );

    if ((hashedCodeValue = existingUser.verificationCode)) {
      existingUser.verified = true;
      existingUser.verificationCode = undefined;
      existingUser.verificationCodeValidation = undefined;

      await existingUser.save();
      return res.status(200).json({
        success: true,
        message: "password updated",
      });
    }

    return res.status(400).json({
      success: false,
      message: "unexpected error occurred!",
    });
  } catch (error) {
    console.log(error);
  }
};

exports.changePassword = async (req, res) => {
  const { userId, verified } = req.user;
  const { oldPassword, newPassword } = req.body;

  try {
    const { error, value } = changePassword.validate({
      oldPassword,
      newPassword,
    });

    if (error) {
      return res
        .status(401)
        .json({ success: false, message: error.details[0].message });
    }
    const existingUser = await User.findOne({ _id: userId }).select(
      "+password"
    );
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "user doesn't exist" });
    }

    const result = await doHashValidation(oldPassword, existingUser.password);
    if (!result) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    const hashedPassword = await doHash(newPassword, 12);
    existingUser.password = hashedPassword;
    await existingUser.save();
    return res.status(200).json({
      success: true,
      message: "password changed successfully",
    });
  } catch (error) {
    console.log(error);
  }
};

exports.sendForgetPasswordCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User doesn't exist." });
    }

    const codeValue = Math.floor(100000 + Math.random() * 900000).toString();

    const emailAddress = existingUser.email;
    const info = await transport.sendMail({
      from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
      to: emailAddress,
      subject: "Forgot Password Code",
      html: `<h1>Your code is: ${codeValue}</h1>`,
    });

    if (info.accepted && info.accepted.includes(emailAddress)) {
      const hashedCodeValue = hmacProcess(
        codeValue,
        process.env.HMAC_VERIFICATION_CODE_SECRET
      );

      existingUser.forgotPasswordCode = hashedCodeValue;
      existingUser.forgotPasswordCodeValidation = Date.now();
      await existingUser.save();

      return res.status(200).json({
        success: true,
        message: "Code sent successfully!",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to send the code. Please try again later.",
    });
  } catch (error) {
    console.error("Error in sendForgetPasswordCode:", error.message || error);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    });
  }
};

exports.verifyForgotPasswordCode = async (req, res) => {
  const { email, providedCode, newPassword } = req.body;

  try {
    const { error } = acceptFPCodeSchema.validate({
      email,
      providedCode,
      newPassword,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const existingUser = await User.findOne({ email }).select(
      "+forgotPasswordCode +forgotPasswordCodeValidation"
    );

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User doesn't exist.",
      });
    }

    if (
      !existingUser.forgotPasswordCode ||
      !existingUser.forgotPasswordCodeValidation
    ) {
      return res.status(400).json({
        success: false,
        message: "No code found or code validation data missing.",
      });
    }

    const codeExpirationTime = 5 * 60 * 1000;
    if (
      Date.now() - existingUser.forgotPasswordCodeValidation >
      codeExpirationTime
    ) {
      return res.status(400).json({
        success: false,
        message: "The code has expired. Please request a new one.",
      });
    }

    const hashedCodeValue = hmacProcess(
      providedCode,
      process.env.HMAC_VERIFICATION_CODE_SECRET
    );
    if (hashedCodeValue !== existingUser.forgotPasswordCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid code. Please try again.",
      });
    }

    existingUser.forgotPasswordCode = undefined;
    existingUser.forgotPasswordCodeValidation = undefined;

    const hashedPassword = hashPassword(newPassword);
    existingUser.password = hashedPassword;

    await existingUser.save();

    return res.status(200).json({
      success: true,
      message: "Code verified successfully and password updated.",
    });
  } catch (error) {
    console.error("Error in verifyForgotPasswordCode:", error.message || error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    });
  }
};
