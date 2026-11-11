import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
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


    return await prisma.reading.create({
        data: {
            date: readingDate,
            slot,
            value,
            userId,
        },
    });
};


export const getReadings = async (userId) => {
    return await prisma.reading.findMany({
        where: {
            userId,
        },
        orderBy: {
            date: "desc",
        },
    });
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

    return await prisma.reading.update({
        where: {
            id: readingId,
        },
        data: {
            ...(date !== undefined && {
                date: new Date(`${date}T00:00:00.000Z`),
            }),
            ...(slot !== undefined && { slot }),
            ...(value !== undefined && { value }),
        },
    });
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

    return await prisma.reading.delete({
        where: {
            id: readingId,
        },
    });
};