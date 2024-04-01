import { NextFunction, Request, Response } from "express";
import { HTTP_STATUSES } from "../http-statuses";
import { jwtService } from "../application/jwt-service";
import { MAX_TOKEN_AGE } from "../config";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  const refreshToken = req.cookies["refresh-token"];
  try {
    if (!accessToken && !refreshToken) {
      return res
        .status(HTTP_STATUSES.UNAUTHORIZED_401)
        .send("Access Denied. No token provided.");
    }

    if (!accessToken) {
      throw new Error();
    }

    const decoded = await jwtService.verifyAccessJWT(accessToken);
    req.user = decoded;
    next();
  } catch (error) {
    if (!refreshToken) {
      return res
        .status(HTTP_STATUSES.UNAUTHORIZED_401)
        .send("Access Denied. No refresh token provided.");
    }

    try {
      const decoded = await jwtService.verifyRefreshJWT(refreshToken);
      const accessToken = await jwtService.generateAccessJWT(decoded);

      res
        .status(HTTP_STATUSES.OK_200)
        .cookie("refresh-token", refreshToken, {
          httpOnly: true,
          sameSite: "strict",
          maxAge: +MAX_TOKEN_AGE! * 1000,
        })
        .header("Authorization", accessToken)
        .send(decoded);
    } catch (error) {
      return res.status(HTTP_STATUSES.BAD_REQUEST_400).send("Invalid Token.");
    }
  }
};
