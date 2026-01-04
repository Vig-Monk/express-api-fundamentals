import express from "express";
import { AppError } from "../utils/appError.js";
const router = express.Router();
router.get("/health", (req, res) => {
    throw new AppError("Health check Failed", 404);
});

export default router;
