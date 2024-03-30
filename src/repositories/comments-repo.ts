import Comment, { IComment, ICommentModel } from "../models/comment-model";

/**
 * This is the DAL (Data Access Layer).
 * Which is responsible for CUD (CRUD without Read) operations.
 */
export const commentsRepo = {
  async createAndAssociateWithUserAndGossip(
    comment: IComment
  ): Promise<ICommentModel> {
    return await Comment.createAndAssociateWithUserAndGossip(comment);
  },
  async findCommentById(commentId: string): Promise<ICommentModel | null> {
    return await Comment.findById(commentId);
  },
  async likeComment(author: string, commentId: string): Promise<void> {
    await Comment.likeComment(author, commentId);
  },
  async unlikeComment(author: string, commentId: string): Promise<void> {
    await Comment.unlikeComment(author, commentId);
  },

  async deleteAndDissociateFromUserAndGossip(
    commentId: string
  ): Promise<ICommentModel | null> {
    return await Comment.deleteAndDissociateFromUserAndGossip(commentId);
  },
};
