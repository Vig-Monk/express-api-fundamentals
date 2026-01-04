import dotenv from "dotenv";
import app from "./app.js";
import { config } from "./config/config.js";
const PORT = config.port;
dotenv.config();

app.listen(PORT, err => {
    console.log(`Server is running on port ${PORT}`);
});
