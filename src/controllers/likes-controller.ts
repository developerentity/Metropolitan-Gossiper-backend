import { Request, Response } from "express";

import { HTTP_STATUSES } from "../http-statuses";
import Logging from "../library/Logging";
import { commentsRepo } from "../repositories/comments-repo";
import { gossipsRepo } from "../repositories/gossips-repo";
import { ErrorResponse } from "../types/response-types";
import { commentsService } from "../domain/comments-service";
import { gossipsService } from "../domain/gossips-service";

const getItemLikes = async (
  req: Request,
  res: Response<string[] | ErrorResponse>
) => {
  const { mongoId } = req.params;
  const { itemType } = req.query;

  try {
    let itemData;

    if (itemType === "Comment") {
      itemData = await commentsRepo.findCommentById(mongoId);
    } else if (itemType === "Gossip") {
      itemData = await gossipsRepo.findGossipById(mongoId);
    } else {
      return res
        .status(HTTP_STATUSES.BAD_REQUEST_400)
        .json({ message: `Wrong item type` });
    }

    if (!itemData) {
      return res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ message: `${itemType} not found` });
    }
    return res.status(HTTP_STATUSES.OK_200).json(itemData.likes || []);
  } catch (error) {
    Logging.error(error);
    return res
      .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
      .json({ message: "An error occurred while trying to get item's likes" });
  }
};

const likeItem = async (req: Request, res: Response) => {
  const author = req.user._id;
  const { mongoId } = req.params;
  const { itemType } = req.query;

  try {
    let likesList;

    if (itemType === "Comment") {
      likesList = await commentsService.likeComment(author, mongoId);
    } else if (itemType === "Gossip") {
      likesList = await gossipsService.likeGossip(author, mongoId);
    } else {
      return res
        .status(HTTP_STATUSES.BAD_REQUEST_400)
        .json({ message: `Wrong item type` });
    }

    if (!likesList) {
      return res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ message: `${itemType} not found` });
    }

    return res.status(HTTP_STATUSES.OK_200).json(likesList);
  } catch (error) {
    Logging.error(error);
    return res
      .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
      .json({ message: "An error occurred while trying to like the item." });
  }
};

const unlikeItem = async (req: Request, res: Response) => {
  const author = req.user._id;
  const { mongoId } = req.params;
  const { itemType } = req.query;

  try {
    let likesList;

    if (itemType === "Comment") {
      likesList = await commentsService.unlikeComment(author, mongoId);
    } else if (itemType === "Gossip") {
      likesList = await gossipsService.unlikeGossip(author, mongoId);
    } else {
      return res
        .status(HTTP_STATUSES.BAD_REQUEST_400)
        .json({ message: `Wrong item type` });
    }

    if (!likesList) {
      return res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ message: `${itemType} not found` });
    }

    return res.status(HTTP_STATUSES.OK_200).json(likesList);
  } catch (error) {
    Logging.error(error);
    return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({
      message: "An error occurred while trying to unlike the item.",
    });
  }
};

export default {
  getItemLikes,
  likeItem,
  unlikeItem,
};
