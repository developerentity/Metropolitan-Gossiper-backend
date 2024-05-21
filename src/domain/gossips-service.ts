import { IGossip, IGossipModel } from "../models/gossip-model";
import { gossipsRepo } from "../repositories/gossips-repo";
import { s3Manager } from "../utils/s3-manager";

/**
 *  This is a BLL (Business Logic Layer).
 *  Which most commonly responsible for CUD operations (CRUD without Read).
 */
export const gossipsService = {
  async createGossip(
    author: string,
    title: string,
    content: string,
    file?: { size: number; buffer: Buffer; mimetype: string }
  ): Promise<IGossipModel | null> {
    let imageName = undefined;
    if (file) imageName = await s3Manager.create(file);

    const gossip: IGossip = {
      title,
      content,
      imageName,
      author,
      comments: [],
      likes: [],
    };

    return gossipsRepo.createAndAssociateWithUser(gossip);
  },
  async updateGossip(
    gossip: IGossipModel,
    updateOps: {
      content: string;
      file?: { size: number; buffer: Buffer; mimetype: string };
    }
  ): Promise<IGossipModel | null> {
    const oldImageName = gossip.imageName;
    let imageName: string | undefined | null = undefined;

    if (updateOps.file && updateOps.file.size !== 0) {
      imageName = await s3Manager.create(updateOps.file);

      if (oldImageName) await s3Manager.delete(oldImageName);
    }

    const processedOps: Partial<IGossip> = {
      content: updateOps.content,
      imageName,
    };

    return gossipsRepo.updateGossip(gossip._id, processedOps);
  },
  async likeGossip(author: string, gossipId: string): Promise<void> {
    return gossipsRepo.likeGossip(author, gossipId);
  },
  async unlikeGossip(author: string, gossipId: string): Promise<void> {
    return gossipsRepo.unlikeGossip(author, gossipId);
  },
  async deleteGossip(gossipId: string): Promise<IGossipModel | null> {
    const gossip = await gossipsRepo.findGossipById(gossipId);
    if (!gossip) return null;
    if (gossip.imageName) await s3Manager.delete(gossip.imageName);
    return gossipsRepo.deleteAndDissociateFromUser(gossipId);
  },
};
