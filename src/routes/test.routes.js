import express from "express";
import { protect } from "../middleware/auth.middleware.js";
const router = express.Router();
router.get("/protect", protect, (req, res) => {
    res.status(200).json({
        status: "success",
        data:	req.user
        
    });
});
export default router;
