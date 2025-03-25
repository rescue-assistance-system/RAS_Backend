import express from "express";

import {
    loginUser, 
    registerUser, 
    logoutUser 
} from "../../service/user/user.service.js";
import { successResponse } from "../../util/response.util.js";
import {registerUserValidator} from "../../validator/user/user.validator.js";

const router = express.Router();

router.post('/login', (req, res, next) => {
    return loginUser(req.body, res)
      .then(t => {successResponse(res, t)})
      .catch(next);
});

router.get('/logout', (req, res, next) => {
    return logoutUser(req, res)
      .then(t => {successResponse(res, t)})
      .catch(next);
});

router.post('/register', 
    registerUserValidator,
    (req, res, next) => {
    return registerUser(req.body)
      .then(t => {successResponse(res, t)})
      .catch(next);
});

export default function initUserController(app) {
    app.use("/user", router);
}