import express from "express";
import { AppError } from "../utils/appError.js";
const router = express.Router();
router.get("/health", (req, res) => {
    res.status(200).json({
    	status:'ok',
    	uptime:process.uptime(),
    	timestamp:new Date().toISOString()
    })
});

export default router;
