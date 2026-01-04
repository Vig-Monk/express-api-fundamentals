import { config } from "../config/config.js";
const sendErrorDev = (err, res) => {
    res.status(err.statusCode || 500).json({
        status: err.status || "error",
        message: err.message,
        stack: err.stack,
        error: err
    });
};
const sendErrorProd = (err,res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        console.error("error", err);
        res.status(500).json({
            status: "error",
            message: "something went wrong"
        });
    }
};
export const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    if (config.env === "development") {
        sendErrorDev(err, res);
    } else {
        sendErrorProd(err, res);
    }
};
