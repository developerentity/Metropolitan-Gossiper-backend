import { Request, Response } from "express";

import { HTTP_STATUSES } from "../http-statuses";
import Logging from "../library/Logging";
import { gossipService } from "../domain/gossip-service";
import { gossipQueryRepo } from "../repositories/gossip-qury-repo";
import { gossipRepo } from "../repositories/gossip-repo";
import { RequestWithParamsAndBody } from "../types/request-types";
import { UpdateGossipModel } from "../models/gossips/update-gossip-model";
import { URIParamsGossipModel } from "../models/gossips/uri-params-gossip-model";

const createGossip = async (req: Request, res: Response) => {
  const { title, content, imageUrl } = req.body;
  const author = req.user._id;

  try {
    const createdGossip = await gossipService.createGossip(
      author,
      title,
      content,
      imageUrl
    );

    return res.status(HTTP_STATUSES.CREATED_201).json({ createdGossip });
  } catch (error) {
    Logging.error(error);
    return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({
      message: "An error occurred while trying to create the gossip.",
    });
  }
};

const readGossip = async (req: Request, res: Response) => {
  const { gossipId } = req.params;

  try {
    const gossip = await gossipQueryRepo.findGossipById(gossipId);

    if (!gossip) {
      return res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ message: "Gossip not found" });
    }

    return res.status(HTTP_STATUSES.OK_200).json({ gossip });
  } catch (error) {
    Logging.error(error);
    return res
      .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
      .json({ message: "An error occurred while trying to read the gossip." });
  }
};

const readAll = async (req: Request, res: Response) => {
  try {
    const gossips = await gossipQueryRepo.findAllGossips();
    return res.status(HTTP_STATUSES.OK_200).json({ gossips });
  } catch (error) {
    Logging.error(error);
    return res
      .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
      .json({ message: "An error occurred while trying to read gossips." });
  }
};

const updateGossip = async (
  req: RequestWithParamsAndBody<URIParamsGossipModel, UpdateGossipModel>,
  res: Response
) => {
  const author = req.user._id;
  const { gossipId } = req.params;

  try {
    const gossip = await gossipRepo.findGossipById(gossipId);

    if (!gossip) {
      return res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ message: "Gossip not found" });
    }

    if (author.toString() !== gossip.author.toString())
      return res
        .status(HTTP_STATUSES.FORBIDDEN_403)
        .json({ error: "Forbidden" });

    const updatedGossip = await gossipService.updateGossip(gossipId, req.body);

    return res
      .status(HTTP_STATUSES.CREATED_201)
      .json({ gossip: updatedGossip });
  } catch (error) {
    Logging.error(error);
    return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({
      message: "An error occurred while trying to update the gossip.",
    });
  }
};

const likeGossip = async (req: Request, res: Response) => {
  const author = req.user._id;
  const { gossipId } = req.params;

  try {
    const gossip = await gossipRepo.findGossipById(gossipId);

    if (!gossip) {
      return res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ message: "Gossip not found" });
    }

    if (gossip.likes.includes(author)) {
      return res
        .status(HTTP_STATUSES.BAD_REQUEST_400)
        .json({ message: "This gossip have already been liked" });
    }

    await gossipService.likeGossip(author, gossipId);

    return res.status(HTTP_STATUSES.OK_200).json({ message: "Liked" });
  } catch (error) {
    Logging.error(error);
    return res
      .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
      .json({ message: "An error occurred while trying to like the gossip." });
  }
};

const unlikeGossip = async (req: Request, res: Response) => {
  const author = req.user._id;
  const { gossipId } = req.params;

  try {
    const gossip = await gossipRepo.findGossipById(gossipId);
    if (!gossip) {
      return res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ message: "Gossip not found" });
    }

    if (!gossip.likes.includes(author)) {
      return res
        .status(HTTP_STATUSES.BAD_REQUEST_400)
        .json({ message: "This gossip haven't liked yet" });
    }

    await gossipService.unlikeGossip(author, gossipId);

    return res
      .status(HTTP_STATUSES.OK_200)
      .json({ message: "This gossip is no more liked" });
  } catch (error) {
    Logging.error(error);
    return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({
      message: "An error occurred while trying to unlike the gossip.",
    });
  }
};

const deleteGossip = async (req: Request, res: Response) => {
  const author = req.user._id;
  const { gossipId } = req.params;

  try {
    const gossip = await gossipRepo.findGossipById(gossipId);

    if (!gossip) {
      return res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ message: "Gossip not found" });
    }

    if (gossip.author.toString() !== author.toString()) {
      return res
        .status(HTTP_STATUSES.FORBIDDEN_403)
        .json({ message: "You are not authorized to delete this gossip" });
    }

    const deletedGossip = await gossipService.deleteGossip(gossipId);
    return res
      .status(HTTP_STATUSES.OK_200)
      .json({ message: "Gossip deleted", gossip: deletedGossip });
  } catch (error) {
    Logging.error(error);
    return res
      .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
      .json({ message: "An error occurred while trying to delete gossip." });
  }
};

export default {
  createGossip,
  readGossip,
  readAll,
  updateGossip,
  likeGossip,
  unlikeGossip,
  deleteGossip,
};
