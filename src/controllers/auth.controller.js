import { User } from "../models/user.model.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { signToken } from "../utils/signToken.js";

export const signup = catchAsync(async (req, res, next) => {
const { name, email, password} = req.body;
if (!name||!email||!password){
return next(new AppError("Name, email and password are required", 400))
}
if (typeof password !== 'string' || password.length < 8){
return next(new AppError("Password must be atleast 8 characters"))
}
const user = await User.create({
name,
email,
password

});
const token = signToken(user._id);
user.password = undefined;
res.status(201).json({
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
return next(new AppError("please provide email and password ", 400));
}
const user = await User.findOne({ email }).select("+password ");
if (!user || !(await user.correctPassword(password, user.password))) {
return next(new AppError("incorrect email or password", 400));
}
const token = signToken(user._id);
user.password = undefined
res.status(200).json({
status: "success",
token,
data: {
user
}
});
});