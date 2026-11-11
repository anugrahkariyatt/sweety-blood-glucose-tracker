
import * as readingService from "../services/reading.service.js";
import AppError from "../utils/AppError.js";

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

export const getReadings = async (req, res, next) => {
    try {
        const readings = await readingService.getReadings(
            req.user.userId
        );

        res.status(200).json({
            success: true,
            count: readings.length,
            data: readings,
        });
    } catch (error) {
        next(error);
    }
};


export const getReadingById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const reading = await readingService.getReadingById(
            req.user.userId,
            id
        );

        if (!reading) {
            return next(new AppError("Reading not found.", 404));
        }

        res.status(200).json({
            success: true,
            data: reading,
        });
    } catch (error) {
        next(error);
    }
};