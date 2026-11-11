import AppError from "../utils/AppError.js";

const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const message = result.error.issues
        .map((issue) => issue.message)
        .join(", ");

      return next(new AppError(message, 400));
    }

    if (source === "body") {
      req.body = result.data;
    } else {
      // In Express 5, req.query is a getter-only property on prototype.
      // We define an own-property on req to safely assign the validated data.
      Object.defineProperty(req, source, {
        value: result.data,
        writable: true,
        enumerable: true,
        configurable: true,
      });
    }

    next();
  };
};

export default validate;
