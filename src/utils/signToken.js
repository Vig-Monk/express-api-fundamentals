import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
export const signToken = id => {
    console.log(config.jwtExpiresIn);
    return jwt.sign({ id }, config.jwtsecret, {
        expiresIn: config.jwtExpiresIn
    });
};
