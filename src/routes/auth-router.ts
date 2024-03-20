import { Router, Request, Response } from "express";

import { loginValidator } from "../validators/loginValidator";
import { usersService } from "../domain/users-service";
import { HTTP_STATUSES } from "../http-statuses";
import { jwtService } from "../application/jwt-service";

export const authRouter = Router({});

authRouter.post(
  "/signin",
  loginValidator,
  async (req: Request, res: Response) => {
    const { loginOrEmail, password } = req.body;
    const user = await usersService.checkCredentials(loginOrEmail, password);
    if (user) {
      const maxAge = 3 * 60 * 60;
      const token = await jwtService.createJWT(user, maxAge);
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: maxAge * 1000,
      });
      res.status(HTTP_STATUSES.OK_200).json({
        message: "User successfully Logged in",
        user: user._id,
      });
    } else {
      return res
        .status(HTTP_STATUSES.UNAUTHORIZED_401)
        .json({ error: "Invalid credentials" });
    }
  }
);

authRouter.get("/signout", async (req, res) => {
  res.cookie("token", "", { maxAge: 0 }).sendStatus(HTTP_STATUSES.OK_200);
});
