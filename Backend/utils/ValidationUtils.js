const Joi = require('joi');

const validateSignup = (data) => {
  const schema = Joi.object({
    username: Joi.string()
      .min(3)
      .max(30)
      .required()
      .pattern(new RegExp('^[a-zA-Z0-9_]+$'))
      .messages({
        'string.pattern.base': 'Username can only contain letters, numbers and underscores',
        'string.empty': 'Username is required',
        'string.min': 'Username must be at least 3 characters',
        'string.max': 'Username cannot be longer than 30 characters'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'string.empty': 'Email is required'
      }),
    password: Joi.string()
      .min(8)
      .required()
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase, one lowercase, one number and one special character',
        'string.min': 'Password must be at least 8 characters',
        'string.empty': 'Password is required'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
        'string.empty': 'Please confirm your password'
      }),
    first_name: Joi.string()
      .required()
      .messages({
        'string.empty': 'First name is required'
      }),
    last_name: Joi.string()
      .required()
      .messages({
        'string.empty': 'Last name is required'
      }),
    phone: Joi.string()
      .pattern(new RegExp('^\\d+$'))
      .required()
      .messages({
        'string.pattern.base': 'Phone number must contain only digits',
        'string.empty': 'Phone number is required'
      }),
    country_code: Joi.string()
      .required()
  });

  return schema.validate(data, { abortEarly: false });
};

module.exports = {
  validateSignup
};