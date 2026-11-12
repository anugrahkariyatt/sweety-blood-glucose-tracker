import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import { invalidateUserReportCache } from "../config/redis.js";
const SLOT_LABELS = {
    MORNING: "Morning",
    AFTER_BREAKFAST: "After breakfast",
    AFTER_LUNCH: "After lunch",
    AFTER_DINNER: "After dinner",
};


export const createReading = async (userId, data) => {
    const { date, slot, value } = data;

    const readingDate = new Date(`${date}T00:00:00.000Z`);

    const existingReading = await prisma.reading.findFirst({
        where: {
            userId,
            date: readingDate,
            slot,
        },
    });
    const dailyCount = await prisma.reading.count({
        where: {
            userId,
            date: readingDate,
        },
    });

    if (dailyCount >= 4) {
        throw new AppError(
            "You can add only 4 readings per day.",
            400
        );
    }

    if (existingReading) {
        const slotLabel = SLOT_LABELS[slot];
        const article = slot === "MORNING" ? "a" : "an";

        throw new AppError(
            `You already have ${article} ${slotLabel} reading for this date.`,
            409
        );
    }


    const created = await prisma.reading.create({
        data: {
            date: readingDate,
            slot,
            value,
            userId,
        },
    });

    await invalidateUserReportCache(userId);

    return created;
};


export const getReadings = async (userId, options = {}) => {
    const { page, limit } = options;

    const where = { userId };
    const orderBy = [
        { date: "desc" },
        { slot: "asc" },
    ];

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [totalCount, data] = await Promise.all([
        prisma.reading.count({ where }),
        prisma.reading.findMany({
            where,
            orderBy,
            skip,
            take: limitNum,
        }),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    return {
        data,
        pagination: {
            page: pageNum,
            limit: limitNum,
            totalCount,
            totalPages,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1,
        },
    };
};

export const getReadingById = async (userId, readingId) => {
    return await prisma.reading.findFirst({
        where: {
            id: readingId,
            userId,
        },
    });
};



export const updateReading = async (userId, readingId, data) => {
    const { date, slot, value } = data;

    const existingReading = await prisma.reading.findFirst({
        where: {
            id: readingId,
            userId,
        },
    });

    if (!existingReading) {
        return null;
    }

    const targetDate = date ? new Date(`${date}T00:00:00.000Z`) : existingReading.date;
    const targetSlot = slot || existingReading.slot;

    if (date !== undefined || slot !== undefined) {
        const duplicateSlot = await prisma.reading.findFirst({
            where: {
                userId,
                date: targetDate,
                slot: targetSlot,
                NOT: { id: readingId },
            },
        });

        if (duplicateSlot) {
            const slotLabel = SLOT_LABELS[targetSlot];
            const article = targetSlot === "MORNING" ? "a" : "an";
            throw new AppError(
                `You already have ${article} ${slotLabel} reading for this date.`,
                409
            );
        }
    }

    const updated = await prisma.reading.update({
        where: {
            id: readingId,
        },
        data: {
            ...(date !== undefined && {
                date: targetDate,
            }),
            ...(slot !== undefined && { slot }),
            ...(value !== undefined && { value }),
        },
    });

    await invalidateUserReportCache(userId);

    return updated;
};

export const deleteReading = async (userId, readingId) => {
    const existingReading = await prisma.reading.findFirst({
        where: {
            id: readingId,
            userId,
        },
    });

    if (!existingReading) {
        return null;
    }

    const deleted = await prisma.reading.delete({
        where: {
            id: readingId,
        },
    });

    await invalidateUserReportCache(userId);

    return deleted;
};