import {validator,validatorType} from '../index.js'
import joi from 'joi';

export const registerUserValidator = validator(
    joi.object().keys({
      email: joi.string().email().required().messages({
        "string.email": "Invalid email format",
        "any.required": "Email is required",
      }),
      password: joi.string().min(6).required().messages({
        "string.min": "Password must be at least 6 characters",
        "any.required": "Password is required",
      })
    }),
    validatorType.BODY
);