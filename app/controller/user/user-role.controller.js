import express from "express";

const router = express.Router();

router.get('/', (req, res, next) => {
    return res.json({message: "User-role route" });
});

export default function initUserRoleController(app) {
    app.use("/user-role", router);
}