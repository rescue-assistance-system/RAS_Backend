import express from "express";

const router = express.Router();

router.get('/', (req, res, next) => {
    return res.json({message: "User-family route"});
});

export default function initUserFamilyController(app) {
    app.use("/user-family", router);
}