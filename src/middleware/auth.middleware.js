import {User} from "../models/user.model.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";
import jwt from "jsonwebtoken";
export const protect = catchAsync(async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
    	console.log(req.headers.authorization)
        return next(new AppError("Youre not logged in ", 401));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user){
    	return next(new AppError('user no longer exists', 401))
    }
    req.user = user;
    next();
});
