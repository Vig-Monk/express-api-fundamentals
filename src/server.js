
import { connectDB } from "./config/database.js";
import app from "./app.js";
import { config } from "./config/config.js";
const PORT = config.port;
const startServer = async () => {
    await connectDB();

    app.listen(PORT, err => {
        console.log(`Server is running on port ${PORT}`);
    });
};
startServer();
