import Gossip, { IGossip, IGossipModel } from "../models/gossip-model";

/**
 * This is the DAL (Data Access Layer).
 * Which is responsible for CUD (CRUD without Read) operations.
 */
export const gossipsRepo = {
  async findGossipById(gossipId: string): Promise<IGossipModel | null> {
    return await Gossip.findById(gossipId);
  },
  async updateGossip(
    gossipId: string,
    updateOps: Partial<IGossip>
  ): Promise<IGossipModel | null> {
    const result = await Gossip.findByIdAndUpdate(gossipId, updateOps, {
      new: true,
    });
    return result;
  },
  async createAndAssociateWithUser(gossip: IGossip): Promise<IGossipModel> {
    return await Gossip.createAndAssociateWithUser(gossip);
  },
  async deleteAndDissociateFromUser(
    gossipId: string
  ): Promise<IGossipModel | null> {
    return await Gossip.deleteAndDissociateFromUser(gossipId);
  },
  async likeGossip(author: string, gossipId: string): Promise<string[] | null> {
    return await Gossip.likeGossip(author, gossipId);
  },
  async unlikeGossip(
    author: string,
    gossipId: string
  ): Promise<string[] | null> {
    return await Gossip.unlikeGossip(author, gossipId);
  },
};
