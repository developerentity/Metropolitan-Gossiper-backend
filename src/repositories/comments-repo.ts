import { DeleteResult } from "mongodb";
import Comment, { IComment, ICommentModel } from "../models/comment-model";
import { UpdateWriteOpResult } from "mongoose";

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
  async likeComment(
    author: string,
    commentId: string
  ): Promise<string[] | null> {
    return await Comment.likeComment(author, commentId);
  },
  async unlikeComment(
    author: string,
    commentId: string
  ): Promise<string[] | null> {
    return await Comment.unlikeComment(author, commentId);
  },
  async deleteAndDissociateFromUserAndGossip(
    commentId: string
  ): Promise<ICommentModel | null> {
    return await Comment.deleteAndDissociateFromUserAndGossip(commentId);
  },
  async removeAllCommentsByTheUser(userId: string): Promise<DeleteResult> {
    return await Comment.deleteMany({ author: userId });
  },
  async removeAllCommentsOnUsersGossips(
    gossipIds: string[]
  ): Promise<DeleteResult> {
    return await Comment.deleteMany({ gossip: { $in: gossipIds } });
  },
  async removeUsersLikes(userId: string): Promise<UpdateWriteOpResult> {
    return await Comment.updateMany({}, { $pull: { likes: userId } });
  },
};
