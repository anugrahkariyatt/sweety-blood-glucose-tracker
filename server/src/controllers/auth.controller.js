
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
