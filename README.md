# Authentication System Backend

This project is a Node.js-based backend for an authentication system. It provides endpoints for user authentication tasks such as signing up, logging in, verifying users, and handling forgotten passwords. This backend uses a REST API structure.

---

## Features

- **User Registration**: Sign up new users.
- **User Login**: Authenticate existing users.
- **User Logout**: Invalidate user sessions.
- **Email Verification**: Send and verify verification codes for email confirmation.
- **Password Management**: Change passwords and handle forgotten passwords.

---

## Dependencies:

- `bcryptjs`
- `cookie-parser `
- `cors`
- `dotenv`
- `express`
- `helmet`
- `joi`
- `jsonwebtoken`
- `mongoose`
- `nodemailer`

---

## Installation

1. Clone the repository:

   ```bash
   git clone <repository_url>
   cd auth-backend

   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables: Create a .env file in the root directory and add the following, example:
   ```bash
   PORT = 8000
   MONGO_URL =  mongoDB_url
   TOKEN_SECRET = token_Secret
   HMAC_VERIFICATION_CODE_SECRET = HMAC_secret
   NODE_CODE_SENDING_EMAIL_ADDRESS = email.......
   NODE_CODE_SENDING_EMAIL_PASSWORD = app_password(gmail)
   ```
4. start the developement server
   ```bash
   npm run dev
   ```

---

</br>

## **Authentication Routes**

- **Base URL**: All routes are prefixed with `/api/auth`.

| Route                                | Method | Description                                   |
| ------------------------------------ | ------ | --------------------------------------------- |
| `/api/auth/signup`                   | POST   | Register a new user                           |
| `/api/auth/login`                    | POST   | Log in with user credentials                  |
| `/api/auth/logout`                   | POST   | Log out the user                              |
| `/api/auth/sendVerificationCode`     | PATCH  | Send a verification code to the user's email  |
| `/api/auth/verifyVerificationCode`   | PATCH  | Verify the user's verification code           |
| `/api/auth/changePassword`           | PATCH  | Change the user's password                    |
| `/api/auth/sendForgetPasswordCode`   | PATCH  | Send a code to reset the user's password      |
| `/api/auth/verifyForgotPasswordCode` | PATCH  | Verify the code and reset the user's password |

---
