import express from "express";
import { protect } from "../controllers/auth.controller.js";
import {
    createTask,
    getTasks,
    getTaskStats,
    getTasksPerUser,
    getTasksPerDay
} from "../controllers/task.controller.js";
import { restrictTo } from "../middleware/restrict.middleware.js";

const router = expres.Router();
router.use(protect);
router.route("/").post(createTask).get(getTasks);
router.get("/stats", protect, restrictTo("admin"), getTaskStats);
router.get('/stats/tasks-per-user', protect, restrictTo('admin'), getTasksPerUser);
router.get('/stats/tasks-per-day', protect, restrictTo('admin'), getTasksPerDay)
export default router;
