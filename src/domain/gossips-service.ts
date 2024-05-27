import { IComment } from "../models/comment-model";
import { IGossip, IGossipModel } from "../models/gossip-model";
import { commentsRepo } from "../repositories/comments-repo";
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
  async likeItem(author: string, itemId: string): Promise<boolean> {
    const result = await this._defineLikedItemType(itemId);
    if (!result) return false;
    if (result.item.likes.includes(author)) return false;

    switch (result.itemType) {
      case "Gossip":
        gossipsRepo.likeGossip(author, itemId);
        return true;
      case "Comment":
        commentsRepo.likeComment(author, itemId);
        return true;
      default:
        return false;
    }
  },
  async unlikeItem(author: string, itemId: string): Promise<boolean> {
    const result = await this._defineLikedItemType(itemId);
    if (!result) return false;
    if (!result.item.likes.includes(author)) return false;

    switch (result.itemType) {
      case "Gossip":
        gossipsRepo.unlikeGossip(author, itemId);
        return true;
      case "Comment":
        commentsRepo.unlikeComment(author, itemId);
        return true;
      default:
        return false;
    }
  },
  async getItemLikes(itemId: string): Promise<string[] | null> {
    const result = await this._defineLikedItemType(itemId);
    if (!result) return null;
    return result.item.likes;
  },
  async deleteGossip(gossipId: string): Promise<IGossipModel | null> {
    const gossip = await gossipsRepo.findGossipById(gossipId);
    if (!gossip) return null;
    if (gossip.imageName) await s3Manager.delete(gossip.imageName);
    return gossipsRepo.deleteAndDissociateFromUser(gossipId);
  },
  async _defineLikedItemType(itemId: string): Promise<{
    itemType: "Gossip" | "Comment";
    item: IGossip | IComment;
  } | null> {
    const [gossip, comment] = await Promise.all([
      gossipsRepo.findGossipById(itemId),
      commentsRepo.findCommentById(itemId),
    ]);

    const item = gossip || comment;
    const itemType = gossip ? "Gossip" : "Comment";

    if (!item) return null;
    return { itemType, item };
  },
};
