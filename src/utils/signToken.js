import jwt from "jsonwebtoken"
import { config } from "../config/config.js"
export const signToken = () => {
    return jwt.sign(

        { id },
        config.jwtsecret,
        { sexpiresIn: config.jwtexpiresIn }
    )
}