import { Request, Response } from "express";
import User from "../models/user-model";
import Gossip, { IGossipModel } from "../models/gossip-model";
import { HTTP_STATUSES } from "../http-statuses";
import { populate } from "dotenv";

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
    await User.findByIdAndUpdate(author, {
      $push: { gossips: createdGossip._id },
    });
    return res.status(HTTP_STATUSES.CREATED_201).json({ gossip });
  } catch (error) {
    return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error });
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
    return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error });
  }
};

const readAll = async (req: Request, res: Response) => {
  try {
    const gossips = await Gossip.find().populate("comments");
    return res.status(HTTP_STATUSES.OK_200).json({ gossips });
  } catch (error) {
    return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error });
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
    return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error });
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

    await User.findByIdAndUpdate(author, { $push: { likedGossips: gossipId } });
    await Gossip.findByIdAndUpdate(gossipId, { $push: { likes: author } });

    return res.status(HTTP_STATUSES.OK_200).json({ message: "Liked" });
  } catch (error) {
    return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error });
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

    await User.findByIdAndUpdate(author, { $pull: { likedGossips: gossipId } });
    await Gossip.findByIdAndUpdate(gossipId, { $pull: { likes: author } });

    return res
      .status(HTTP_STATUSES.OK_200)
      .json({ message: "This gossip is no more liked" });
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
      return res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ message: "Gossip not found" });
    }
    if (gossip.author.toString() !== author.toString()) {
      return res
        .status(HTTP_STATUSES.FORBIDDEN_403)
        .json({ message: "You are not authorized to delete this gossip" });
    }

    await Gossip.findByIdAndDelete(gossipId);
    await User.findByIdAndUpdate(author, { $pull: { gossips: gossipId } });

    return res.status(HTTP_STATUSES.OK_200).json({ message: "Gossip deleted" });
  } catch (error) {
    return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error });
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
