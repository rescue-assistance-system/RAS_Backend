import express from "express";

const router = express.Router();

router.get('/', (req, res, next) => {
    return res.json({message: "User-profile route" });
});

export default function initUserProfileController(app) {
    app.use("/user-profile", router);
}