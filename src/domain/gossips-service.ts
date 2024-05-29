import { IGossip, IGossipModel } from "../models/gossip-model";
import { GossipViewModel } from "../models/gossips/gossip-view-model";
import { gossipsQueryRepo } from "../repositories/gossips-query-repo";
import { gossipsRepo } from "../repositories/gossips-repo";
import { ItemsListViewModel } from "../types/response-types";
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
  async likeGossip(author: string, gossipId: string): Promise<string[] | null> {
    return gossipsRepo.likeGossip(author, gossipId);
  },
  async unlikeGossip(
    author: string,
    gossipId: string
  ): Promise<string[] | null> {
    return gossipsRepo.unlikeGossip(author, gossipId);
  },
  async deleteGossip(gossipId: string): Promise<IGossipModel | null> {
    const gossip = await gossipsRepo.findGossipById(gossipId);
    if (!gossip) return null;
    if (gossip.imageName) await s3Manager.delete(gossip.imageName);
    return gossipsRepo.deleteAndDissociateFromUser(gossipId);
  },
  async readGossipById(gossipId: string): Promise<GossipViewModel | null> {
    const gossip = await gossipsQueryRepo.findGossipById(gossipId);
    return gossip ? await this._transformToViewModel(gossip) : null;
  },
  async readGossips(queryParams: {
    authorId?: string;
    limit?: number;
    page?: number;
    sortField?: string;
    sortOrder?: string;
    titleFilter?: string;
  }): Promise<ItemsListViewModel<GossipViewModel>> {
    const gossips = await gossipsQueryRepo.findGossips(queryParams);
    return {
      totalItems: gossips.totalItems,
      totalPages: gossips.totalPages,
      currentPage: gossips.currentPage,
      items: await Promise.all(
        gossips.items.map((gossip: any) => this._transformToViewModel(gossip))
      ),
    };
  },
  async _transformToViewModel(gossip: IGossipModel): Promise<GossipViewModel> {
    const imageUrl = gossip.imageName
      ? await s3Manager.read(gossip.imageName)
      : null;

    return {
      id: gossip._id.toHexString(),
      title: gossip.title,
      content: gossip.content,
      comments: gossip.comments,
      imageUrl,
      author: gossip.author,
      likes: gossip.likes,
      createdAt: gossip.createdAt,
      updatedAt: gossip.updatedAt,
    };
  },
};
