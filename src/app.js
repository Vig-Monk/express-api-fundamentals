import express from "express";
import {config }from "./config/config.js"
import hpp from "hpp";
import cors from "cors";
import { sanitize } from "./middleware/sanitize.middleware.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import healthRoutes from "./routes/health.routes.js";
import usersRoutes from "./routes/users.routes.js";
import testRoutes from "./routes/test.routes.js";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/task.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { AppError } from "./utils/appError.js";

const app = express();

const limiter = rateLimit({
limit: 100,
windowMs: 60 * 60 * 1000,
message: "Too many requests from this ip, please try again later."
});

const allowedOrigins = [
"http://localhost:5173",
"https://ludwigs-tasky.vercel.app"
];

app.use(cors({
origin: function (origin, callback) {

if (!origin) return callback(null, true);

if (allowedOrigins.includes(origin)) {
return callback(null, true);
} else {
return callback(new Error("Not allowed by CORS"));
}
},
credentials: true
}));

//Helmet — security headers early
app.use(helmet());

//Body parsers — BOTH json AND urlencoded, before hpp
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// hpp — needs body to already be parsed
app.use(hpp({
whitelist: ["sort", "fields", "page", "limit", "completed"]
}));

app.use(sanitize);

// Rate limiter
app.use("/api", limiter);

// Routes last

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", testRoutes);
app.use("/api/v1", healthRoutes);
app.use("/api/v1", usersRoutes);
app.use("/api/v1/tasks", taskRoutes);

// ✅ 404 Handler
app.use((req, res, next) => {
next(new AppError(`cannot find ${req.originalUrl} on this server`, 404));
});

// ✅ Global Error Handler
app.use(errorHandler);

export default app;