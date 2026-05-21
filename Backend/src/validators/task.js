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
