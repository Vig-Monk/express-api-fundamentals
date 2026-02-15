import express from "express";
import { protect } from "../controllers/auth.controller.js";
import { createTask, getTasks } from "../controllers/task.controller.js";

const router = expres.Router();
router.use(protect);
router.route("/").post(createTask).get(getTasks);
export default router;
