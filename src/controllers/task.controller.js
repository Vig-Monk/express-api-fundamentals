import Task from "../models/task.model.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError} from "../utils/appError.js"
export const createTask = catchAsync(async (req, res, next) => {
	req.body.user = req.user.id
    const task = await Task.create(req.body);
    res.status(201).json({
        status: "success",
        data: {
            task
        }
    });
});
export const getTask = catchAsync(async (req, res, next) => {
const filter = { _id: req.params.id };
if (req.user.role !== 'admin') filter.user = req.user.id;
const task = await Task.findOne(filter);
if (!task) return next(new AppError('Task not found', 404));
res.status(200).json({ status: 'success', data: { task } });
});
export const getTasks = catchAsync(async (req, res, next) => {
    const filter = {};
    if (req.user.role !== "admin") {
        filter.user = req.user.id;
    }
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
        ? req.query.fields.split(",").join(" ")
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
export const updateTask = catchAsync(async (req, res, next) => {

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!task) {
    return next(new AppError("Task not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      task
    }
  });

});
export const deleteTask = catchAsync(async (req, res, next) => {

  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id
  });

  if (!task) {
    return next(new AppError("Task not found", 404));
  }

  res.status(204).json({
    status: "success",
    data: null
  });

});
export const getTaskStats = catchAsync(async (req, res, next) => {
    const stats = await Task.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            }
        },
        {
            $group: {
                _id: "$completed",
                totalTasks: { $sum: 1 }
            }
        }
    ]);
    res.status(200).json({
        status: "success",
        data: {
            stats
        }
    });
});
export const getTasksPerUser = catchAsync(async (req, res, next) => {
    const stats = await Task.aggregate([
        {
            $group: {
                _id: "$user",
                totalTasks: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $project: {
                _id: 0,
                userId: "$_id",
                totalTasks: 1,
                user: {
                    $arrayElemAt: ["$user", 0]
                }
            }
        }
    ]);
    res.status(200).json({
        status: "success",
        data: {
            stats
        }
    });
});
export const getTasksPerDay = catchAsync(async (req,res,next) => {
    const stats = await Task.aggregate([
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                    day: { $dayOfMonth: "$createdAt" }
                },
                totalTasks: { $sum: 1 }
            }
        },
        {
            $sort: {
                "_id.year": 1,
                "_id.month": 1,
                "_id.day": 1
            }
        },
        {
        	$project:{
        		_id:0,
        		date:{
        			$dateFromParts:{
        				year:"$_id.year",
        				month:"$_id.month",
        				day:"$_id.day"
        			}
        		},
        		totalTasks:1
        	}
        }
    ]);
    res.status(200).json({
    	status:'success',
    	data:{
    		stats
    	}
    })
});
