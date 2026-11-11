
import * as authService from "../services/auth.service.js";

export const register = async (req, res) => {
    const user = await authService.registerUser(req.body);

    res.status(201).json({
        success: true,
        message: "Account created successfully.",
        data: {
            user,
        },
    });
};


export const login = async (req, res) => {
    const { user, token } = await authService.loginUser(req.body);

    res.cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        success: true,
        message: "Login successful.",
        data: {
            user,
        },
    });
};

export const logout = (req, res) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    res.status(200).json({
        success: true,
        message: "Logout successful.",
    });
};


export const getMe = async (req, res) => {
    const user = await authService.getCurrentUser(req.user.userId);

    res.status(200).json({
        success: true,
        data: {
            user,
        },
    });
};