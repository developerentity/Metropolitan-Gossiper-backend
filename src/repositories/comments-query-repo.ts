import Comment, { ICommentModel } from "../models/comment-model";
import { ItemsListViewModel } from "../types/response-types";

/**
 * This is the DAL (Data Access Layer).
 * Which is responsible for Read only operations.
 */
export const commentsQueryRepo = {
  async findCommentsByGossip(
    gossipId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ItemsListViewModel<ICommentModel>> {
    const totalComments = await Comment.countDocuments({ gossip: gossipId });
    const totalPages = Math.ceil(totalComments / limit);

    const comments = await Comment.find({ gossip: gossipId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      totalItems: totalComments,
      totalPages: totalPages,
      currentPage: page,
      items: comments,
    };
  },
};
