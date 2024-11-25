const cookieParser = require("cookie-parser");
const express = require("express");
const cors = require("cors");
const { default: helmet } = require("helmet");
const mongoose = require("mongoose");
const router = require("./routers/userRouter");
require("dotenv").config();
const port = process.env.PORT || 8080;

const app = express();

// middlewares
app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// connect to DB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => {
    console.log("Error: ", err);
  });

app.use("/api/auth", router);

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Server Started</title>
    </head>
    <body style="text-align: center; padding: 50px; font-family:monospace; background-color: lightblue; ">
      <h1>Server has been started successfully!</h1>
      <h3>Welcome to the server.</h3>
      <h3>All routes are prefixed with /api/auth, <strong>use postman for testing</strong> </h3>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server is running on the port http://localhost:${port}`);
});
