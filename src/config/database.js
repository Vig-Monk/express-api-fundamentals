import mongoose from "mongoose";
import { config } from "./config.js";
export const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        console.log(config.jwtExpiresIn)
        console.log("mongodb connected✅");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
