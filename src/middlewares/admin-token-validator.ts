import { NextFunction, Request, Response } from "express";

import { HTTP_STATUSES } from "../http-statuses";
import { jwtService } from "../application/jwt-service";
import { usersRepo } from "../repositories/users-repo";

export async function adminTokenValidator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies.token;
  if (!token) {
    return res
      .status(HTTP_STATUSES.UNAUTHORIZED_401)
      .json({ error: "Unauthorized" });
  }

  try {
    const userId = await jwtService.getUserIdByToken(token);
    if (!userId) {
      return res
        .status(HTTP_STATUSES.UNAUTHORIZED_401)
        .json({ error: "Unauthorized" });
    }

    const user = await usersRepo.findUserById(userId);
    if (user?.role !== "admin") {
      return res
        .status(HTTP_STATUSES.UNAUTHORIZED_401)
        .json({ error: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch {
    return res
      .status(HTTP_STATUSES.UNAUTHORIZED_401)
      .json({ error: "Unauthorized" });
  }
}
