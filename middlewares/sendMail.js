require("dotenv").config();
const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
    pass: process.env.NODE_CODE_SENDING_EMAIL_PASSWORD,
  },
  secure: false,
});

transport
  .verify()
  .then(() => {
    console.log("SMTP server is ready to send emails.");
  })
  .catch((error) => {
    console.error("Error verifying SMTP configuration:", error);
  });

module.exports = transport;
