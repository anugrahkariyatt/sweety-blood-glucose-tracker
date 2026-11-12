import prisma from "../config/prisma.js";
import { getCache, setCache } from "../config/redis.js";

const calculateStats = (readings) => {
    const count = readings.length;

    if (count === 0) {
        return {
            highest: null,
            lowest: null,
            average: null,
            count: 0,
        };
    }

    const values = readings.map((r) => r.value);
    const highest = Math.max(...values);
    const lowest = Math.min(...values);
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = Number((total / count).toFixed(1));

    return {
        highest,
        lowest,
        average,
        count,
    };
};

export const getDailyReport = async (userId, date) => {
    const cacheKey = `reports:${userId}:daily:${date}`;
    const cached = await getCache(cacheKey);
    if (cached) {
        return cached;
    }

    const reportDate = new Date(`${date}T00:00:00.000Z`);

    const readings = await prisma.reading.findMany({
        where: {
            userId,
            date: reportDate,
        },
        orderBy: {
            slot: "asc",
        },
        select: {
            id: true,
            value: true,
            slot: true,
            date: true,
        },
    });

    const stats = calculateStats(readings);

    let result;
    if (stats.count === 0) {
        result = {
            date,
            ...stats,
            readings: [],
            message: "No readings found for this date.",
        };
    } else {
        result = {
            date,
            ...stats,
            readings,
        };
    }

    await setCache(cacheKey, result);
    return result;
};

export const getMonthToDateReport = async (userId, date) => {
    const cacheKey = `reports:${userId}:month-to-date:${date}`;
    const cached = await getCache(cacheKey);
    if (cached) {
        return cached;
    }

    const [year, month] = date.split("-");
    const startDateStr = `${year}-${month}-01`;
    const endDateStr = date;

    const startDate = new Date(`${startDateStr}T00:00:00.000Z`);
    const endDate = new Date(`${endDateStr}T00:00:00.000Z`);

    const readings = await prisma.reading.findMany({
        where: {
            userId,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        orderBy: [
            { date: "asc" },
            { slot: "asc" },
        ],
        select: {
            id: true,
            value: true,
            slot: true,
            date: true,
        },
    });

    const stats = calculateStats(readings);

    const result = {
        startDate: startDateStr,
        endDate: endDateStr,
        ...stats,
        readings,
        ...(stats.count === 0 && {
            message: "No readings found for this period.",
        }),
    };

    await setCache(cacheKey, result);
    return result;
};

export const getMonthlyReport = async (userId, date) => {
    const cacheKey = `reports:${userId}:monthly:${date}`;
    const cached = await getCache(cacheKey);
    if (cached) {
        return cached;
    }

    const [yearNum, monthNum] = date.split("-").map(Number);

    let prevYear = yearNum;
    let prevMonth = monthNum - 1;

    if (prevMonth === 0) {
        prevMonth = 12;
        prevYear -= 1;
    }

    const prevMonthStr = String(prevMonth).padStart(2, "0");

    const lastDay = new Date(Date.UTC(prevYear, prevMonth, 0)).getUTCDate();
    const lastDayStr = String(lastDay).padStart(2, "0");

    const startDateStr = `${prevYear}-${prevMonthStr}-01`;
    const endDateStr = `${prevYear}-${prevMonthStr}-${lastDayStr}`;

    const startDate = new Date(`${startDateStr}T00:00:00.000Z`);
    const endDate = new Date(`${endDateStr}T00:00:00.000Z`);

    const readings = await prisma.reading.findMany({
        where: {
            userId,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        orderBy: [
            { date: "asc" },
            { slot: "asc" },
        ],
        select: {
            id: true,
            value: true,
            slot: true,
            date: true,
        },
    });

    const stats = calculateStats(readings);

    const result = {
        startDate: startDateStr,
        endDate: endDateStr,
        ...stats,
        readings,
        ...(stats.count === 0 && {
            message: "No readings found for this period.",
        }),
    };

    await setCache(cacheKey, result);
    return result;
};
