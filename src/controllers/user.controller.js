import { catchAsync } from "../utils/catchAsync.js";
import { User } from "../models/user.model.js";
import { AppError } from "../utils/appError.js";

export const getUser = catchAsync(async (req, res, next) => {
    const requestedUserId = req.params.id;
    const requestingUser  = req.user;

    const user = await User.findById(requestedUserId);

    // 404 — not found (was incorrectly 401 before, which confused auth checks)
    if (!user) {
        return next(new AppError("User not found", 404));
    }

    // Non-admin users can only view their own profile
    if (
        requestingUser.role !== "admin" &&
        requestingUser.id !== requestedUserId
    ) {
        return next(
            new AppError("You do not have permission to access this resource", 403)
        );
    }

    res.status(200).json({
        status: "success",
        data: { user }
    });
});
