const Joi = require('joi');

// Validation schema for POST /books
const createBookSchema = Joi.object({
  title: Joi.string().required(),
  author: Joi.string().required(),
  price: Joi.number().required()
});

// Validation schema for PUT /books/:id
const updateBookSchema = Joi.object({
  title: Joi.string(),
  author: Joi.string(),
  price: Joi.number()
});

// Validation schema for GET /books/:id
const getBookSchema = Joi.object({
  id: Joi.string().required()
});

module.exports = {
  createBookSchema,
  updateBookSchema,
  getBookSchema
};
