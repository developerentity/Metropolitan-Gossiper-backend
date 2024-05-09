import { Types } from "mongoose";
import Gossip, { IGossipModel } from "../models/gossip-model";
import { GossipsQueryFilter } from "../models/gossips/gossip-query-filter";
import { ItemsListViewModel } from "../types/response-types";
import { GossipViewModel } from "../models/gossips/gossip-view-model";

/**
 * This is the DAL (Data Access Layer).
 * Which is responsible for Read only operations.
 */

const transformToViewModel = (gossip: IGossipModel): GossipViewModel => {
  return {
    id: gossip._id.toHexString(),
    title: gossip.title,
    content: gossip.content,
    comments: gossip.comments,
    imageUrl: gossip.imageUrl,
    author: gossip.author,
    likes: gossip.likes,
  };
};

export const gossipsQueryRepo = {
  async findGossipById(gossipId: string): Promise<GossipViewModel | null> {
    const res = await Gossip.findById(gossipId).populate("comments");
    return res ? transformToViewModel(res) : null;
  },
  async findGossips(queryParams: {
    authorId?: string;
    limit?: number;
    page?: number;
    sortField?: string;
    sortOrder?: string;
    titleFilter?: string;
  }): Promise<ItemsListViewModel<GossipViewModel>> {
    const limit = queryParams.limit || 10;
    const page = queryParams.page || 1;
    const sortField = queryParams.sortField || "createdAt";
    const sortOrder = queryParams.sortOrder === "asc" ? 1 : -1;
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

    const transformedGossips = gossips.map((g) => transformToViewModel(g));

    return {
      totalItems: totalGossips,
      totalPages: totalPages,
      currentPage: page,
      items: transformedGossips,
    };
  },
};
