import { NextFunction, Request, Response } from "express";

import { jwtService } from "../application/jwt-service";
import { HTTP_STATUSES } from "../http-statuses";
import { usersService } from "../domain/users-service";

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

  const userId = await jwtService.getUserIdByToken(token);

  if (!userId) {
    return res
      .status(HTTP_STATUSES.UNAUTHORIZED_401)
      .json({ error: "Unauthorized" });
  } else {
    try {
      const user = await usersService.findUserById(userId);
      if (user?.role !== "admin") {
        return res
          .status(HTTP_STATUSES.UNAUTHORIZED_401)
          .json({ error: "Unauthorized" });
      } else {
        req.user = user;
        next();
      }
    } catch {
      return res
        .status(HTTP_STATUSES.UNAUTHORIZED_401)
        .json({ error: "Unauthorized" });
    }
  }
}
