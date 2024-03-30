import { NextFunction, Response } from "express";

import { HTTP_STATUSES } from "../http-statuses";
import Logging from "../library/Logging";
import { RequestWithParams } from "../types/request-types";
import { URIParamsUserModel } from "../models/users/uri-params-user-model";

export const checkUserPermission = async (
  req: RequestWithParams<URIParamsUserModel>,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;

  try {
    if (req.user._id.toString() !== userId.toString()) {
      return res
        .status(HTTP_STATUSES.FORBIDDEN_403)
        .json({ message: "Forbidden" });
    }

    next();
  } catch (error) {
    Logging.error(error);
    return res
      .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
      .json({ message: "An error occurred while checking user rights." });
  }
};
