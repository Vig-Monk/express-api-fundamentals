import mongoose from "mongoose";
import { config } from "./config.js";
export const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        console.log("mpngodb connected✅");
    } catch (err) {
        console.error("Mongo has failed", err.message);
        process.exit(1);
    }
};
