import dotenv from "dotenv";
dotenv.config();
export const config = {
    env: process.env.NODE_ENV,
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
    clientUrl: process.env.CLIENT_URL
}
