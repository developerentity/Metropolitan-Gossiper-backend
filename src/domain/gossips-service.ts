import { IGossip, IGossipModel } from "../models/gossip-model";
import { gossipsRepo } from "../repositories/gossips-repo";

/**
 *  This is a BLL (Business Logic Layer).
 *  Which most commonly responsible for CUD operations (CRUD without Read).
 */
export const gossipsService = {
  async createGossip(
    author: string,
    title: string,
    content: string,
    imageUrl?: string
  ): Promise<IGossipModel | null> {
    const gossip: IGossip = {
      title,
      content,
      imageUrl: imageUrl || "",
      author,
      comments: [],
      likes: [],
    };

    return gossipsRepo.createAndAssociateWithUser(gossip);
  },
  async updateGossip(
    id: string,
    updateOps: { content: string; imageUrl?: string }
  ): Promise<IGossipModel | null> {
    const processedOps = {
      content: updateOps.content,
      imageUrl: updateOps.imageUrl,
    };
    return gossipsRepo.updateGossip(id, processedOps);
  },
  async likeGossip(author: string, gossipId: string): Promise<void> {
    return gossipsRepo.likeGossip(author, gossipId);
  },
  async unlikeGossip(author: string, gossipId: string): Promise<void> {
    return gossipsRepo.unlikeGossip(author, gossipId);
  },
  async deleteGossip(gossipId: string): Promise<IGossipModel | null> {
    return gossipsRepo.deleteAndDissociateFromUser(gossipId);
  },
};
