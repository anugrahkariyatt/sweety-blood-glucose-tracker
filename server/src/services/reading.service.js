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