import { catchAsync } from "../utils/catchAsync.js";
import { User } from "../models/user.model.js";
import { AppError } from "../utils/appError.js";
export const getUser = catchAsync(async (req, res, next) => {
    const requestedUserId = req.params.id;
    const requestedUser = req.user;
    if (
        requestedUser.role !== "admin" &&
        requestedUser.id !== requestedUserId
    ) {
        return next(
            new AppError(
                "You do not have permission to access this resource",
                403
            )
        );
    }
    const user = await User.findById(requestedUserId);
    if (!requestedUserId) {
        return next(new AppError("User does not exist", 401));
    }
    res.status(201).json({
        status: "success",
        data: {
            user
        }
    });
});
