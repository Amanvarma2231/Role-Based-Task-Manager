// src/validators/auth.js
const Joi = require('joi');

exports.validateRegistration = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 100 characters',
        'any.required': 'Name is required'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters',
        'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
        'any.required': 'Password is required'
      })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message
    });
  }

  next();
};

exports.validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message
    });
  }

  next();
};

// src/validators/task.js
const Joi = require('joi');

exports.validateTask = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string()
      .min(3)
      .max(255)
      .required(),
    description: Joi.string()
      .max(5000)
      .allow('', null),
    status: Joi.string()
      .valid('todo', 'in_progress', 'review', 'done'),
    priority: Joi.string()
      .valid('low', 'medium', 'high', 'urgent'),
    dueDate: Joi.date()
      .iso()
      .min('now'),
    tags: Joi.array()
      .items(Joi.string().max(50))
      .max(10),
    assignedTo: Joi.string()
      .uuid()
      .allow(null)
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message
    });
  }

  next();
};