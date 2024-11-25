const joi = require("joi");

exports.signupSchema = joi.object({
  email: joi
    .string()
    .min(7)
    .max(60)
    .required()
    .email({
      tlds: { allow: ["com", "net"] },
    }),
  password: joi.string().required(),
});

exports.signinSchema = joi.object({
  email: joi
    .string()
    .min(7)
    .max(30)
    .required()
    .email({
      tlds: { allow: ["com", "net"] },
    }),

  password: joi.string().required(),
});

exports.acceptCodeSchema = joi.object({
  email: joi
    .string()
    .min(6)
    .max(30)
    .required()
    .email({
      tlds: { allow: ["com", "net"] },
    }),
  providedCode: joi.number().required(),
  newPassword: joi.string(),
});

exports.changePassword = joi.object({
  oldPassword: joi.string().min(8).required(),
  newPassword: joi.string().min(8).required(),
});

exports.acceptFPCodeSchema = joi.object({
  email: joi
    .string()
    .min(6)
    .max(30)
    .required()
    .email({
      tlds: { allow: ["com", "net"] },
    }),
  providedCode: joi.number().required(),
  newPassword: joi.string().min(8).required(),
});
