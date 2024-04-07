import Joi from "joi";

export const articleCreateSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
});

export const articleUpdateSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required(),
});

export const articlePartialUpdateSchema = Joi.object({
  title: Joi.string(),
  content: Joi.string(),
}).min(1);
