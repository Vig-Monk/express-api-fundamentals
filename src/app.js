import express from "express";
import healthRoutes from "./routes/health.routes.js";
import usersRoutes from "./routes/users.routes.js";
import testRoutes from "./routes/test.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { AppError } from "./utils/appError.js";
const app = express();
app.use(express.json());
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", testRoutes);
app.use("/api", healthRoutes);
app.use("/api", usersRoutes);
app.use((req, res, next) => {
    next(new AppError(`cannot find ${req.originalUrl} on this server`, 404));
});
app.use(errorHandler);
export default app;
