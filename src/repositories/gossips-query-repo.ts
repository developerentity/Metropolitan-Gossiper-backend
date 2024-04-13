import { Types } from "mongoose";
import Gossip, { IGossipModel } from "../models/gossip-model";
import { GossipsQueryFilter } from "../models/gossips/gossip-query-filter";
import { ItemsListViewModel } from "../types/response-types";

/**
 * This is the DAL (Data Access Layer).
 * Which is responsible for Read only operations.
 */
export const gossipsQueryRepo = {
  async findGossipById(gossipId: string): Promise<IGossipModel | null> {
    return await Gossip.findById(gossipId).populate("comments");
  },
  async findGossips(queryParams: {
    authorId?: string;
    limit?: number;
    page?: number;
    sortField?: string;
    sortOrder?: string;
    titleFilter?: string;
  }): Promise<ItemsListViewModel<IGossipModel>> {
    const limit = queryParams.limit || 10;
    const page = queryParams.page || 1;
    const sortField = queryParams.sortField || "createdAt";
    const sortOrder = queryParams.sortOrder === "desc" ? -1 : 1;
    const authorId = queryParams.authorId;
    const titleFilter = queryParams.titleFilter || "";

    const filter: GossipsQueryFilter = {
      title: new RegExp(titleFilter, "i"),
    };

    if (authorId && Types.ObjectId.isValid(authorId)) {
      filter.author = authorId;
    }

    const totalGossips = await Gossip.countDocuments(filter);
    const totalPages = Math.ceil(totalGossips / limit);

    const gossips = await Gossip.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("comments");

    return {
      totalItems: totalGossips,
      totalPages: totalPages,
      currentPage: page,
      items: gossips,
    };
  },
};
