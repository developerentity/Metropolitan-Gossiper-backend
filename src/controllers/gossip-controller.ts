import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import Gossip from "../models/gossip-model";
import { HTTP_STATUSES } from "../http-statuses";

const createGossip = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name } = req.body;

  const gossip = new Gossip({
    _id: new mongoose.Types.ObjectId(),
    name,
  });

  try {
    const createdGossip = await gossip.save();
    return res.status(HTTP_STATUSES.CREATED_201).json({ gossip });
  } catch (error) {
    return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error });
  }
};

const readGossip = async (req: Request, res: Response, next: NextFunction) => {
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

const readAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const gossips = await Gossip.find();
    return res.status(HTTP_STATUSES.OK_200).json({ gossips });
  } catch (error) {
    return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error });
  }
};

const updateGossip = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const gossipId = req.params.gossipId;
    const gossip = await Gossip.findById(gossipId);

    if (gossip) {
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

const deleteGossip = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const gossipId = req.params.gossipId;

  try {
    const deletableGossip = await Gossip.findByIdAndDelete(gossipId);
    if (deletableGossip) {
      res
        .status(HTTP_STATUSES.CREATED_201)
        .json({ deletableGossip, message: "Deleted" });
    } else {
      res.status(HTTP_STATUSES.NOT_FOUND_404).json({ message: "not found" });
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
