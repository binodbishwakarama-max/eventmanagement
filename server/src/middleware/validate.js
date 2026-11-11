import { ApiError } from '../utils/ApiError.js';

export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return next(new ApiError(400, 'Validation failed', errors));
  }
  if (source === 'query') {
    req.validatedQuery = result.data;
    req.query = result.data;
  } else {
    req[source] = result.data;
  }
  next();
};
