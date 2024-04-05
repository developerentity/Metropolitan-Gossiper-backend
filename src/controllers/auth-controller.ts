import { Request, Response } from "express";

import Logging from "../library/Logging";
import { usersService } from "../domain/users-service";
import { jwtService } from "../application/jwt-service";
import { HTTP_STATUSES } from "../http-statuses";
import { MAX_TOKEN_AGE } from "../config";
import { usersRepo } from "../repositories/users-repo";

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
  const { loginOrEmail, password } = req.body;

  try {
    const user = await usersService.checkCredentials(loginOrEmail, password);

    if (!user) {
      return res
        .status(HTTP_STATUSES.UNAUTHORIZED_401)
        .json({ error: "Invalid credentials" });
    }

    const accessToken = await jwtService.generateAccessJWT(user._id);
    const refreshToken = await jwtService.generateRefreshJWT(user._id);

    return res
      .cookie("refresh-token", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: +MAX_TOKEN_AGE! * 1000,
      })
      .header("Authorization", accessToken)
      .status(HTTP_STATUSES.OK_200)
      .json({ message: "User successfully Logged in" });
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

const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies["refresh-token"];
  if (!refreshToken) {
    return res
      .status(HTTP_STATUSES.UNAUTHORIZED_401)
      .send("Access Denied. No refresh token provided.");
  }

  try {
    const decoded = await jwtService.verifyRefreshJWT(refreshToken);
    const accessToken = await jwtService.generateAccessJWT(decoded);

    return res
      .header("Authorization", accessToken)
      .sendStatus(HTTP_STATUSES.OK_200);
  } catch (error) {
    Logging.error(error);
    return res.status(HTTP_STATUSES.FORBIDDEN_403).json({
      message: "An error occurred while refreshing a token of the user.",
    });
  }
};

export default {
  getAuthData,
  signin,
  signout,
  refresh,
};
