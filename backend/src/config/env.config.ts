import * as Joi from 'joi';

export const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3001),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().default('mvp-secret-key-change-in-production'),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
});
