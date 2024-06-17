import { DeleteResult } from "mongodb";
import Comment, { IComment, ICommentModel } from "../models/comment-model";
import { UpdateWriteOpResult } from "mongoose";

/**
 * This is the DAL (Data Access Layer).
 * Which is responsible for CUD (CRUD without Read) operations.
 */
export const commentsRepo = {
  // need to fix (split in services)
  async createAndAssociateWithUserAndGossip(
    comment: IComment
  ): Promise<ICommentModel> {
    return await Comment.createAndAssociateWithUserAndGossip(comment);
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

  // clean methods
  async findCommentById(commentId: string): Promise<ICommentModel | null> {
    return await Comment.findById(commentId);
  },
  async deleteOne(commentId: string): Promise<DeleteResult | null> {
    return await Comment.findByIdAndDelete(commentId);
  },
  async removeAllCommentsByTheUser(userId: string): Promise<DeleteResult> {
    return await Comment.deleteMany({ author: userId });
  },
  async removeAllCommentsByTheGossip(gossipId: string): Promise<DeleteResult> {
    return await Comment.deleteMany({ gossip: gossipId });
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
