import { DeleteResult } from "mongodb";
import Gossip, { IGossip, IGossipModel } from "../models/gossip-model";
import { UpdateWriteOpResult } from "mongoose";

/**
 * This is the DAL (Data Access Layer).
 * Which is responsible for CUD (CRUD without Read) operations.
 */
export const gossipsRepo = {
  // need to fix (split in services)
  async createAndAssociateWithUser(gossip: IGossip): Promise<IGossipModel> {
    return await Gossip.createAndAssociateWithUser(gossip);
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

  // clean methods
  async updateGossip(
    gossipId: string,
    updateOps: Partial<IGossip>
  ): Promise<IGossipModel | null> {
    const result = await Gossip.findByIdAndUpdate(gossipId, updateOps, {
      new: true,
    });
    return result;
  },
  async findGossipById(gossipId: string): Promise<IGossipModel | null> {
    return await Gossip.findById(gossipId);
  },
  async deleteOne(gossipId: string): Promise<DeleteResult | null> {
    return await Gossip.findByIdAndDelete(gossipId);
  },
  async removeAllGossipsByTheUser(userId: string): Promise<DeleteResult> {
    return await Gossip.deleteMany({ author: userId });
  },
  async removeCommentReference(
    commentId: string
  ): Promise<UpdateWriteOpResult> {
    return await Gossip.updateMany({}, { $pull: { comments: commentId } });
  },
  async removeUsersLikes(userId: string): Promise<UpdateWriteOpResult> {
    return await Gossip.updateMany({}, { $pull: { likes: userId } });
  },
};
