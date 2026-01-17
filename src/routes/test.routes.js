import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {getUser} from "../controllers/user.controller.js"
const router = express.Router();
router.get("/protect", protect, (req, res) => {
    res.status(200).json({
        status: "success",
        data:	req.user
        
    });
});
router.get("/user/:id", protect, getUser)
export default router;
