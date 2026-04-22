--- Database Connection ---
src/config/database.js
connectDb function ---> calls mongoose.connect(connection-string) an async opp
on error fails fast process.exit(1)
called on server start fails fast incase of err server doesn't start