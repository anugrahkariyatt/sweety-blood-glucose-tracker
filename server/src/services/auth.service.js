
import bcrypt from "bcrypt";
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";

export const registerUser = async (userData) => {
    const { name, email, password } = userData;

    // Check whether email already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        throw new AppError("Email already registered.", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        },
    });

    return user;
};
