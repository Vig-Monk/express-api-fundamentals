import {AppError}from'../utils/appError.js'
export const validateUsers = function (req, res, next) {
    const { name, email } = req.body;
    if (!name || !email) {
        throw new AppError("name and email are required", 400);
    }
    if (typeof name !== "string") {
        throw new AppError("The name must be a string", 400);
    }
    if (!email.includes("@")) {
        throw new AppError("Invalid e-mail", 400);
    }
    next();
};
