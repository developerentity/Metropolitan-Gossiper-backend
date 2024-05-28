import { RequestHandler } from "express";
import mongoose from "mongoose";

import { HTTP_STATUSES } from "../http-statuses";
import Logging from "../library/Logging";

type IdType = "userId" | "gossipId" | "commentId" | "itemId";

const checkIdValidity = (idType: IdType): RequestHandler => {
  return (req, res, next) => {
    const id = req.params[idType];

    if (!id) {
      Logging.error(`The ${idType} parameter is missing.`);
      return res
        .status(HTTP_STATUSES.BAD_REQUEST_400)
        .json({ message: `The ${idType} parameter is missing.` });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      Logging.error(`Invalid ${idType} format.`);
      return res
        .status(HTTP_STATUSES.BAD_REQUEST_400)
        .json({ message: `Invalid ${idType} format.` });
    }

    next();
  };
};

export const checkUserIdValidity = checkIdValidity("userId");
export const checkGossipIdValidity = checkIdValidity("gossipId");
export const checkCommentIdValidity = checkIdValidity("commentId");
export const checkItemIdValidity = checkIdValidity("itemId");
