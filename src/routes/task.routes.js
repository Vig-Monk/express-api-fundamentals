import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
    createTask,
    deleteTask,
    updateTask,
    getTasks,
    getTask,
    getTaskStats,
    getTasksPerUser,
    getTasksPerDay
} from "../controllers/task.controller.js";
import { restrictTo } from "../middleware/restrict.middleware.js";

const router = express.Router();
router.use(protect);
router.get("/stats", protect, restrictTo("admin"), getTaskStats);
router.get(
    "/stats/tasks-per-user",
    protect,
    restrictTo("admin"),
    getTasksPerUser
);
router.get(
    "/stats/tasks-per-day",
    protect,
    restrictTo("admin"),
    getTasksPerDay
);
router.route("/").post(createTask).get(getTasks);
router.route('/:id').get(getTask).patch(updateTask).delete(deleteTask)
export default router;
