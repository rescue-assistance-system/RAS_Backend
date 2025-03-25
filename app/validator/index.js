import { FIELD_ERROR } from "../constants/error/constant.js";

export const validator = (schema, property) => {
    return (req, res, next) => {
      const {error, value} = schema.validate(req[property]);
      const valid = error == null;
  
      if (valid) {
        // Update body
        req.body = value;
        return next();
      }
  
      const {details} = error;
      if (details && details.length) {
        const errors = [];
        for (let i = 0; i < details.length; i += 1) {
          const name = details[i].context.key;
          const code = details[i].message
            .replace(/"/g, "")
            .replace(/ /g, "_")
            .toUpperCase();
          const message = details[i].message.replace(/"/g, "");
          errors.push({name, code, message});
        }
        return res.status(400).json(errors);
      }
      return res
        .status(500)
        .json(new HttpError(FIELD_ERROR.INTERNAL_SERVER_ERROR, "validator_wrong"));
    };
};
  
export const validatorType = Object.freeze({
    BODY: "body",
    PARAMS: "params",
    QUERY: "query"
});