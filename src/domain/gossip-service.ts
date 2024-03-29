import { IGossip, IGossipModel } from "../models/gossip-model";
import { gossipRepo } from "../repositories/gossip-repo";

/**
 *  This is a BLL (Business Logic Layer).
 *  Which most commonly responsible for CUD operations (CRUD without Read).
 */
export const gossipService = {
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

    return gossipRepo.createAndAssociateWithUser(gossip);
  },
  async updateGossip(
    id: string,
    updateOps: { content: string; imageUrl?: string }
  ): Promise<IGossipModel | null> {
    const processedOps = {
      content: updateOps.content,
      imageUrl: updateOps.imageUrl,
    };
    return gossipRepo.updateGossip(id, processedOps);
  },
  async likeGossip(author: string, gossipId: string): Promise<void> {
    return gossipRepo.likeGossip(author, gossipId);
  },
  async unlikeGossip(author: string, gossipId: string): Promise<void> {
    return gossipRepo.unlikeGossip(author, gossipId);
  },
  async deleteGossip(gossipId: string): Promise<IGossipModel | null> {
    return gossipRepo.deleteAndDissociateFromUser(gossipId);
  },
};
