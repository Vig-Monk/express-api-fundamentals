import { User } from "../models/user.model.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { signToken } from "../utils/signToken.js"

export const signup = catchAsync(async (req, res, next) => {

    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    });
    const token = signToken(user._id)
    user.password = undefined
    res.status(202).json({
        status: "success",
        token,
        data: {
            user
        }
    });
});
export const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return new AppError("please provide email and password ", 400);
    }
    const user = await User.findOne({ email }).select("+password ");
    if (!user || !(await user.correctPassword(password, user.password))) {
        return new AppError("incorrect email or password", 400);
    }
    res.status(201).json({
        status: "success",
        message: " Login successful"
    });
});
