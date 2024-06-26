import { Request, Response } from "express";

import { HTTP_STATUSES } from "../http-statuses";
import Logging from "../library/Logging";
import { gossipsService } from "../domain/gossips-service";
import { gossipsRepo } from "../repositories/gossips-repo";
import {
  RequestWithParamsAndBody,
  RequestWithQuery,
} from "../types/request-types";
import { UpdateGossipModel } from "../models/gossips/update-gossip-model";
import { URIParamsGossipModel } from "../models/gossips/uri-params-gossip-model";
import { QueryGossipModel } from "../models/gossips/query-gossip-model";
import { ErrorResponse, ItemsListViewModel } from "../types/response-types";
import { GossipViewModel } from "../models/gossips/gossip-view-model";

const createGossip = async (req: Request, res: Response) => {
  const { title, content } = req.body;
  const file = req.file;
  const author = req.user._id;

  try {
    const createdGossip = await gossipsService.createGossip(
      author,
      title,
      content,
      file
    );

    return res.status(HTTP_STATUSES.CREATED_201).json(createdGossip);
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
    const gossip = await gossipsService.readGossipById(gossipId);

    if (!gossip) {
      return res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ message: "Gossip not found" });
    }

    return res.status(HTTP_STATUSES.OK_200).json(gossip);
  } catch (error) {
    Logging.error(error);
    return res
      .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
      .json({ message: "An error occurred while trying to read the gossip." });
  }
};

const readAll = async (
  req: RequestWithQuery<QueryGossipModel>,
  res: Response<ItemsListViewModel<GossipViewModel> | ErrorResponse>
) => {
  try {
    const foundGossips: ItemsListViewModel<GossipViewModel> =
      await gossipsService.readGossips({
        limit: +req.query.pageSize,
        page: +req.query.pageNumber,
        sortField: req.query.sortField,
        sortOrder: req.query.sortOrder,
        authorId: req.query.authorId,
        titleFilter: req.query.titleFilter,
      });

    return res.status(HTTP_STATUSES.OK_200).json(foundGossips);
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
  const { gossipId } = req.params;
  const { content } = req.body;
  const file = req.file;
  const author = req.user._id;

  try {
    const gossip = await gossipsRepo.findGossipById(gossipId);

    if (!gossip) {
      return res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ message: "Gossip not found" });
    }

    if (author.toString() !== gossip.author.toString())
      return res
        .status(HTTP_STATUSES.FORBIDDEN_403)
        .json({ error: "Forbidden" });
    const updatedGossip = await gossipsService.updateGossip(gossip, {
      content,
      file,
    });

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

const deleteGossip = async (req: Request, res: Response) => {
  const author = req.user._id;
  const { gossipId } = req.params;

  try {
    const gossip = await gossipsRepo.findGossipById(gossipId);

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

    const result = await gossipsService.deleteGossipAndRelatedData(gossipId);
    if (!result)
      return res
        .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
        .json({ message: "An item or some of related data wasn't deleted" });

    return res
      .status(HTTP_STATUSES.OK_200)
      .json({ message: "Gossip deleted", gossip: result });
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
  deleteGossip,
};
