import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
export const signToken = id => {
    return jwt.sign({ id }, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn
    });
};
