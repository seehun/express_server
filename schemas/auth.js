import Joi from "joi";

export const authCreateSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});
