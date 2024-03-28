import { NextFunction, Request, Response } from "express";

import { jwtService } from "../application/jwt-service";
import { HTTP_STATUSES } from "../http-statuses";
import { usersService } from "../domain/users-service";
import { usersRepo } from "../repositories/users-repo";

export async function basicTokenValidator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies.token;
  try {
    if (!token) {
      return res
        .status(HTTP_STATUSES.UNAUTHORIZED_401)
        .json({ error: "Unauthorized" });
    }

    const userId = await jwtService.getUserIdByToken(token);
    if (!userId) {
      return res
        .status(HTTP_STATUSES.UNAUTHORIZED_401)
        .json({ error: "Unauthorized" });
    }

    const userData = await usersRepo.findUserById(userId);
    if (!userData) {
      return res
        .status(HTTP_STATUSES.UNAUTHORIZED_401)
        .json({ error: "Unauthorized" });
    }

    req.user = userData;
    next();
  } catch {
    return res
      .status(HTTP_STATUSES.UNAUTHORIZED_401)
      .json({ error: "Unauthorized" });
  }
}
