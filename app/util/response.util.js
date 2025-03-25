import { FormError, isSystemError } from '../config/error.js';

const SYSTEM_ERROR = Object.freeze(["EACCES", "EPERM"]);

export const successResponse = (res, result = null) => {
    return res.status(200).json(result);
};

export const errorResponse = (res, err) => {
    if (err instanceof FormError) {
        err.errors.code = err.errors.code.message || err.errors.code; // If the code is an object type then just get message (Ex: INVALID)
        res.status(err.code || 400).json(err.errors);
    } else if (!isSystemError(err)) {
        res.statusMessage = err.message;
        res.status(err.code || 500).json({error: err.message});
    }
};