import { Request, Response } from "express";

import Logging from "../library/Logging";
import { usersService } from "../domain/users-service";
import { jwtService } from "../application/jwt-service";
import { HTTP_STATUSES } from "../http-statuses";
import { usersRepo } from "../repositories/users-repo";
import { EXPIRES_TOKEN } from "../config";

const getAuthData = async (req: Request, res: Response) => {
  const userId = req.user._id;

  try {
    const userData = await usersRepo.findUserById(userId);

    if (!userData) {
      return res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ error: "User not found" });
    }

    return res.status(HTTP_STATUSES.OK_200).json(userData);
  } catch (error) {
    Logging.error(error);
    return res
      .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
      .json({ message: "An error occurred while fetching user data." });
  }
};

const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await usersService.checkCredentials(email, password);

    if (!user) {
      return res
        .status(HTTP_STATUSES.UNAUTHORIZED_401)
        .json({ error: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = await jwtService.generateTokens(
      user.id
    );

    return res.status(HTTP_STATUSES.OK_200).json({
      user,
      backendTokens: {
        accessToken,
        refreshToken,
        expiresIn: new Date().setTime(new Date().getTime() + +EXPIRES_TOKEN!),
      },
    });
  } catch (error) {
    Logging.error(error);
    return res
      .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
      .json({ message: "An error occurred while logging the user." });
  }
};

const signout = async (req: Request, res: Response) => {
  res.cookie("token", "", { maxAge: 0 }).sendStatus(HTTP_STATUSES.OK_200);
};

const refreshToken = async (req: Request, res: Response) => {
  const [type, token] = req.headers.authorization?.split(" ") ?? [];
  const previousRefreshToken = type === "Refresh" ? token : undefined;

  if (!previousRefreshToken) {
    return res
      .status(HTTP_STATUSES.UNAUTHORIZED_401)
      .send("Access Denied. No refresh token provided.");
  }

  try {
    const userId = await jwtService.verifyRefreshJWT(previousRefreshToken);
    const user = await usersRepo.findUserById(userId);
    const { accessToken, refreshToken } = await jwtService.generateTokens(
      userId
    );

    return res.status(HTTP_STATUSES.OK_200).json({
      user,
      backendTokens: {
        accessToken,
        refreshToken,
        expiresIn: new Date().setTime(new Date().getTime() + +EXPIRES_TOKEN!),
      },
    });
  } catch (error) {
    return res.status(HTTP_STATUSES.FORBIDDEN_403).json({
      message: "An error occurred while refreshing a token of the user.",
    });
  }
};

export default {
  getAuthData,
  signin,
  signout,
  refreshToken,
};
