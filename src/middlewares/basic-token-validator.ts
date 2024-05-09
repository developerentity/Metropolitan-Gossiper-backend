import { NextFunction, Request, Response } from "express";

import { HTTP_STATUSES } from "../http-statuses";
import { cookieOptions, jwtService } from "../application/jwt-service";
import { usersRepo } from "../repositories/users-repo";

export async function basicTokenValidator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const [type, token] = req.headers.authorization?.split(" ") ?? [];
    const currentAccessToken = type === "Bearer" ? token : undefined;

    if (!currentAccessToken)
      return res
        .status(HTTP_STATUSES.UNAUTHORIZED_401)
        .json({ message: "Access token required" });

    const userId = await jwtService.verifyAccessJWT(currentAccessToken);
    if (!userId) {
      const previousRefreshToken = req.cookies["refresh-token"];
      if (!previousRefreshToken)
        return res
          .status(HTTP_STATUSES.UNAUTHORIZED_401)
          .json({ error: "Refresh token required" });

      const userId = await jwtService.verifyRefreshJWT(previousRefreshToken);
      if (!userId) {
        return res
          .status(HTTP_STATUSES.FORBIDDEN_403)
          .json({ error: "Invalid refresh token" });
      }

      const userData = await usersRepo.findUserById(userId);
      if (!userData) {
        return res
          .status(HTTP_STATUSES.BAD_REQUEST_400)
          .json({ error: "User data by ID not fount" });
      }

      req.user = userData;
      next();
    }

    const userData = await usersRepo.findUserById(userId);
    if (!userData) {
      return res
        .status(HTTP_STATUSES.BAD_REQUEST_400)
        .json({ error: "User data by ID not fount" });
    }

    req.user = userData;
    next();
  } catch {
    return res
      .status(HTTP_STATUSES.UNAUTHORIZED_401)
      .json({ error: "An error occurred while checking tokens" });
  }
}
