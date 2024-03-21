import { Request, Response } from "express";
import User from "../models/user-model";
import Gossip, { IGossipModel } from "../models/gossip-model";
import { HTTP_STATUSES } from "../http-statuses";
import Logging from "../library/Logging";

const createGossip = async (req: Request, res: Response) => {
  const { title, content, imageUrl } = req.body;
  const author = req.user._id;

  if (!author)
    return res
      .status(HTTP_STATUSES.UNAUTHORIZED_401)
      .json({ error: "Unauthorized" });

  const gossip = new Gossip({
    title,
    content,
    imageUrl: imageUrl,
    author,
  });

  try {
    const createdGossip = await gossip.save();
    const gossipAuthor = await User.findByIdAndUpdate(author, {
      $push: { gossips: createdGossip._id },
    });
    return res.status(HTTP_STATUSES.CREATED_201).json({ gossip });
  } catch (error) {
    return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error });
  }
};

const readGossip = async (req: Request, res: Response) => {
  const gossipId = req.params.gossipId;

  try {
    const gossip = await Gossip.findById(gossipId);
    return gossip
      ? res.status(HTTP_STATUSES.OK_200).json({ gossip })
      : res.status(HTTP_STATUSES.NOT_FOUND_404).json({ message: "not found" });
  } catch (error) {
    return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error });
  }
};

const readAll = async (req: Request, res: Response) => {
  try {
    const gossips = await Gossip.find();
    return res.status(HTTP_STATUSES.OK_200).json({ gossips });
  } catch (error) {
    return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error });
  }
};

const updateGossip = async (req: Request, res: Response) => {
  try {
    const author = req.user?._id;
    const gossipId = req.params.gossipId;
    const gossip = await Gossip.findById(gossipId);

    if (gossip) {
      if (author.toString() !== gossip.author.toString())
        return res
          .status(HTTP_STATUSES.FORBIDDEN_403)
          .json({ error: "Forbidden" });

      gossip.set(req.body);
      const updatedGossip = await gossip.save();
      return res
        .status(HTTP_STATUSES.CREATED_201)
        .json({ gossip: updatedGossip });
    } else {
      return res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ message: "not found" });
    }
  } catch (error) {
    return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error });
  }
};

const deleteGossip = async (req: Request, res: Response) => {
  const author = req.user._id;
  const { gossipId } = req.params;

  try {
    const gossip: IGossipModel | null = await Gossip.findById(gossipId);

    if (!gossip) {
      res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ message: "Gossip not found" });
    } else {
      Logging.warn(gossip.author.toString() )
      Logging.warn(author.toString())
      if (gossip.author.toString() !== author.toString()) {
        return res
          .status(HTTP_STATUSES.FORBIDDEN_403)
          .json({ message: "You are not authorized to delete this gossip" });
      }

      const deletedGossip = await Gossip.findByIdAndDelete(gossipId);
      const gossipAuthor = await User.findByIdAndUpdate(author, {
        $pull: { gossips: gossipId },
      });

      res
        .status(HTTP_STATUSES.OK_200)
        .json({ message: "Gossip deleted" });
    }
  } catch (error) {
    res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error });
  }
};

export default {
  createGossip,
  readGossip,
  readAll,
  updateGossip,
  deleteGossip,
};
