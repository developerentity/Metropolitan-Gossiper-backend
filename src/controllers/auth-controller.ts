import { Request, Response } from "express";
import { usersService } from "../domain/users-service";
import { jwtService } from "../application/jwt-service";
import { HTTP_STATUSES } from "../http-statuses";

const MAX_TOKEN_AGE = 3 * 60 * 60;

const signup = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const user = await usersService.createUser(username, email, password);
  if (user) {
    const token = jwtService.createJWT(user, MAX_TOKEN_AGE);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: MAX_TOKEN_AGE * 1000,
    });
    return res.status(HTTP_STATUSES.CREATED_201).json({
      message: "User successfully Registered and Logged in",
      user: user._id,
    });
  } else {
    return res.status(HTTP_STATUSES.UNPROCESSABLE_CONTENT_422).json({
      message: "Register failed",
    });
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

    const token = await jwtService.createJWT(user, MAX_TOKEN_AGE);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: MAX_TOKEN_AGE * 1000,
    });

    return res.status(HTTP_STATUSES.OK_200).json({
      message: "User successfully Logged in",
      user: user._id,
    });
  } catch (error) {
    return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error });
  }
};

const signout = async (req: Request, res: Response) => {
  res.cookie("token", "", { maxAge: 0 }).sendStatus(HTTP_STATUSES.OK_200);
};

export default {
  signup,
  signin,
  signout,
};
