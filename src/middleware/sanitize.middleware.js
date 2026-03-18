export const sanitize = (req, res, next) => {
    const strip = (obj) => {
        if (!obj || typeof obj !== "object") return;

        for (const key of Object.keys(obj)) {
            if (key.startsWith("$") || key.includes(".")) {
                delete obj[key];
            } else {
                strip(obj[key]);
            }
        }
    };

    strip(req.body);
    strip(req.params);
    strip(req.query);

    next();
};