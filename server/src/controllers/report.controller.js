import * as reportService from "../services/report.service.js";

export const getDailyReport = async (req, res, next) => {
    try {
        const { date } = req.query;

        const report = await reportService.getDailyReport(
            req.user.userId,
            date
        );

        res.status(200).json({
            success: true,
            data: report,
        });
    } catch (error) {
        next(error);
    }
};

export const getMonthToDateReport = async (req, res, next) => {
    try {
        const { date } = req.query;

        const report = await reportService.getMonthToDateReport(
            req.user.userId,
            date
        );

        res.status(200).json({
            success: true,
            data: report,
        });
    } catch (error) {
        next(error);
    }
};

export const getMonthlyReport = async (req, res, next) => {
    try {
        const { date } = req.query;

        const report = await reportService.getMonthlyReport(
            req.user.userId,
            date
        );

        res.status(200).json({
            success: true,
            data: report,
        });
    } catch (error) {
        next(error);
    }
};
