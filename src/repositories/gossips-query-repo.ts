import Gossip, { IGossipModel } from "../models/gossip-model";
import { GossipsListViewModel } from "../models/gossips/gossips-view-model";

/**
 * This is the DAL (Data Access Layer).
 * Which is responsible for Read only operations.
 */
export const gossipsQueryRepo = {
  async findGossipById(gossipId: string): Promise<IGossipModel | null> {
    return await Gossip.findById(gossipId).populate("comments");
  },
  async findGossips(queryParams: {
    // author?: string;
    limit: number;
    page: number;
    sortField: string;
    sortOrder: string;
  }): Promise<GossipsListViewModel> {
    const limit = queryParams.limit || 10;
    const page = queryParams.page || 1;
    const sortField = queryParams.sortField || "createdAt";
    const sortOrder = queryParams.sortOrder === "desc" ? -1 : 1;

    const totalGossips = await Gossip.countDocuments();
    const totalPages = Math.ceil(totalGossips / limit);

    const gossips = await Gossip.find()
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
