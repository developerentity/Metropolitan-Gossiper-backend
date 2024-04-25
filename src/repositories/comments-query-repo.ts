import Comment, { ICommentModel } from "../models/comment-model";
import { CommentViewModel } from "../models/comments/comment-view-model";
import { ItemsListViewModel } from "../types/response-types";

/**
 * This is the DAL (Data Access Layer).
 * Which is responsible for Read only operations.
 */

const transformToViewModel = (comment: ICommentModel): CommentViewModel => {
  return {
    id: comment._id.toHexString(),
    content: comment.content,
    author: comment.author,
    likes: comment.likes,
    gossip: comment.gossip,
    parent: comment.parent,
  };
};

export const commentsQueryRepo = {
  async findCommentsByGossip(
    gossipId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ItemsListViewModel<CommentViewModel> | null> {
    const totalComments = await Comment.countDocuments({ gossip: gossipId });
    const totalPages = Math.ceil(totalComments / limit);

    const comments = await Comment.find({ gossip: gossipId })
      .skip((page - 1) * limit)
      .limit(limit);

    const transformedComments = comments.map((c) => transformToViewModel(c));

    if (!comments) return null;

    return {
      totalItems: totalComments,
      totalPages: totalPages,
      currentPage: page,
      items: transformedComments,
    };
  },
};
