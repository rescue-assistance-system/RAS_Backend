import isArray from 'lodash/isArray.js';
import {HTTP_ERROR} from "../constants/error/constant.js";

const SYSTEM_ERROR = Object.freeze(["EACCES", "EPERM"]);

export function isSystemError(err) {
  return err && err.code && SYSTEM_ERROR.indexOf(err.code) >= 0;
}

export class HttpError extends Error {
    constructor(code, message, info) {
      super(message);
      Error.captureStackTrace(this, this.constructor);
      this.code = code;
      this.info = info;
    }
}
  
export class FieldError {
    constructor(name, code, message) {
      this.name = name;
      this.code = code;
      this.message = message;
    }
}
  
export class FormError extends HttpError {
    constructor(_errors) {
        let errors;
        let message;
        if (isArray(_errors)) {
            errors = _errors;
            message = _errors[0].message;
        } else {
            errors = [_errors];
            message = _errors.message;
        }
        // console.log(message)
        const encodeMessage = encodeURIComponent(message);
        super(HTTP_ERROR.BAD_REQUEST, encodeMessage);
        this.errors = errors;
    }
}

export function badRequest(name, code, message) {
    return new FormError(new FieldError(name, code, message));
}
  
export function notFoundRequest(name, code, message) {
    return new FormError(new FieldError(name, code, message));
}
