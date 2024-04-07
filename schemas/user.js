import Joi from "joi";

export const userCreateSchema = Joi.object({
  email: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
});

export const userResponseSchema = Joi.object({
  id: Joi.string().required(),
  email: Joi.string().required(),
  username: Joi.string().required(),
});

export const userPartialUpdateSchema = Joi.object({
  email: Joi.string(),
  username: Joi.string(),
  password: Joi.string(),
  passwordValidation: Joi.string().required(),
}).min(2);
