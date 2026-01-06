import dotenv from "dotenv";
dotenv.config();
export const config = {
    env: process.env.NODE_ENV,
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGO_URI
};
