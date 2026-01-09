import { User } from "../models/user.model.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
export const signup = catchAsync(async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return next(new AppError("All fields are required", 400));
    }
    console.log(email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError("Email is already in use", 400));
    }
    
    const user = await User.create({
        name,
        email,
        password
    });
    res.status(202).json({
        status: "success",
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        }
    });
});
export const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return new AppError("please provide email and password ", 400);
    }
    const user = await User.findOne({ email }).select("+password ");
    if (!user || !(await user.createPassword(password, user.password))) {
        return new AppError("incorrect email or password", 400);
    }
    res.status(201).json({
        status: "success",
        message: " Login successful"
    });
});
