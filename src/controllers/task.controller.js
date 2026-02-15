import Task from "../models/task.model.js";
import { catchAsync } from "../utils/catchAsync.js";
export const createTask = catchAsync(async (req, res, next) => {
    const task = await Task.create({
        title: req.body.title,
        description: req.body.description,
        user: req.user.id
    });
    res.status(201).json({
        status: "success",
        data: {
            task
        }
    });
});
export const getTasks = catchAsync(async (req, res, next) => {
    const filter = {
        user: req.user.id
    };
    //filtering
    if (req.query.completed !== undefined) {
        filter.completed = req.query.completed === "true";
    }
    //sorting
    const sortBy = req.query.sort || "-createdAt";
    //pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;
    //field limiting
    const fields = req.query.fields
        ? req.fields.fields.split(",").join(" ")
        : "-__v";
    const tasks = await Task.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(fields);
    res.status(200).json({
        status: "success",
        results: tasks.length,
        data: {
            tasks
        }
    });
});
