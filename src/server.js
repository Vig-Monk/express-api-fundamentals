import app from "./app.js";
const PORT = 3000;

app.listen(PORT, "127.0.0.1", err => {
    console.log(`Server is running on port ${PORT}`);
});
