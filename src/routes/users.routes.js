import express from "express";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { validateUsers } from "../middleware/validateUsers.js";

const router = express.Router();
router.post(
    "/users/async",
    catchAsync(async (req, res) => {
        const { name, email } = req.body;
        if (email === "ludwig@dev") {
            throw new AppError("Async Error Test", 500);
        }
        res.json({
            status: "success",
            message: "response"
        });
    })
);
router.post("/users", validateUsers, (req, res, next) => {
    const { name, email } = req.body;
    res.status(201).json({
        status: "success",
        data: {
            name,
            email
        }
    });
});
export default router;
