import prisma from "../config/prisma.js";


export const createReading = async (userId, data) => {
    const { date, slot, value } = data;

    return await prisma.reading.create({
        data: {
            date: new Date(`${date}T00:00:00.000Z`),
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
