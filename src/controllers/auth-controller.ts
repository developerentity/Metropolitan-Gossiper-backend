import { Request, Response } from "express";

import Logging from "../library/Logging";
import { usersService } from "../domain/users-service";
import { jwtService } from "../application/jwt-service";
import { HTTP_STATUSES } from "../http-statuses";
import { MAX_TOKEN_AGE } from "../config";

const signin = async (req: Request, res: Response) => {
  const { loginOrEmail, password } = req.body;

  try {
    const user = await usersService.checkCredentials(loginOrEmail, password);

    if (!user) {
      return res
        .status(HTTP_STATUSES.UNAUTHORIZED_401)
        .json({ error: "Invalid credentials" });
    }

    const token = await jwtService.createJWT(user, +MAX_TOKEN_AGE!);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: +MAX_TOKEN_AGE! * 1000,
    });

    return res.status(HTTP_STATUSES.OK_200).json({
      message: "User successfully Logged in",
      user: user._id,
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

export default {
  signin,
  signout,
};
