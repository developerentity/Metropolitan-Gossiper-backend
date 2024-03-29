import Gossip, { IGossipModel } from "../models/gossip-model";

/**
 * This is the DAL (Data Access Layer).
 * Which is responsible for Read only operations.
 */
export const gossipQueryRepo = {
  async findGossipById(gossipId: string): Promise<IGossipModel | null> {
    return await Gossip.findById(gossipId).populate("comments");
  },
  async findAllGossips(): Promise<IGossipModel[] | null> {
    return await Gossip.find().populate("comments");
  },
};
