import { Request, Response } from "express";

import { HTTP_STATUSES } from "../http-statuses";
import Logging from "../library/Logging";
import User from "../models/user-model";
import Gossip, { IGossip, IGossipModel } from "../models/gossip-model";

const createGossip = async (req: Request, res: Response) => {
  const { title, content, imageUrl } = req.body;
  const author = req.user._id;

  try {
    const gossip: IGossip = {
      title,
      content,
      imageUrl: imageUrl || "",
      author,
      comments: [],
      likes: [],
    };

    const createdGossip = await Gossip.createAndAssociateWithUser(gossip);

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
    const gossip = await Gossip.findById(gossipId).populate("comments");
    return gossip
      ? res.status(HTTP_STATUSES.OK_200).json({ gossip })
      : res
          .status(HTTP_STATUSES.NOT_FOUND_404)
          .json({ message: "Gossip not found" });
  } catch (error) {
    Logging.error(error);
    return res
      .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
      .json({ message: "An error occurred while trying to read the gossip." });
  }
};

const readAll = async (req: Request, res: Response) => {
  try {
    const gossips = await Gossip.find().populate("comments");
    return res.status(HTTP_STATUSES.OK_200).json({ gossips });
  } catch (error) {
    Logging.error(error);
    return res
      .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
      .json({ message: "An error occurred while trying to read gossips." });
  }
};

const updateGossip = async (req: Request, res: Response) => {
  const author = req.user._id;
  const { gossipId } = req.params;

  try {
    const gossip = await Gossip.findById(gossipId);

    if (!gossip) {
      return res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ message: "Gossip not found" });
    }

    if (author.toString() !== gossip.author.toString())
      return res
        .status(HTTP_STATUSES.FORBIDDEN_403)
        .json({ error: "Forbidden" });

    gossip.set(req.body);
    const updatedGossip = await gossip.save();

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
    const gossip = await Gossip.findById(gossipId);

    if (!gossip) {
      return res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ message: "Gossip not found" });
    }

    if (author.toString() !== gossip.author.toString())
      return res
        .status(HTTP_STATUSES.FORBIDDEN_403)
        .json({ error: "Forbidden" });

    if (gossip.likes.includes(author)) {
      return res
        .status(HTTP_STATUSES.BAD_REQUEST_400)
        .json({ message: "This gossip have already been liked" });
    }

    await Gossip.likeGossip(author, gossipId);

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
    const gossip = await Gossip.findById(gossipId);

    if (!gossip) {
      return res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ message: "Gossip not found" });
    }

    if (author.toString() !== gossip.author.toString())
      return res
        .status(HTTP_STATUSES.FORBIDDEN_403)
        .json({ error: "Forbidden" });

    if (!gossip.likes.includes(author)) {
      return res
        .status(HTTP_STATUSES.BAD_REQUEST_400)
        .json({ message: "This gossip haven't liked yet" });
    }

    await Gossip.unlikeGossip(author, gossipId);

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
    const gossip: IGossipModel | null = await Gossip.findById(gossipId);

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

    const deletedGossip = await Gossip.deleteAndDissociateFromUser(gossipId);
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
