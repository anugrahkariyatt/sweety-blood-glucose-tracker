import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

const protect = (req, res, next) => {
    const token = req.cookies.accessToken;

    if (!token) {
        return next(new AppError("You are not logged in. Please log in.", 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            userId: decoded.userId,
        };

        next();
    } catch (error) {
        return next(new AppError("Invalid or expired token. Please log in again.", 401));
    }
};

export default protect;