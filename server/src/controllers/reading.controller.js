
import * as readingService from "../services/reading.service.js";


export const createReading = async (req, res, next) => {
    try {
        const reading = await readingService.createReading(
            req.user.userId,
            req.body
        );

        res.status(201).json({
            success: true,
            message: "Reading created successfully.",
            data: reading,
        });
    } catch (error) {
        next(error);
    }
};